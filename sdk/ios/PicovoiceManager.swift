//
//  Copyright 2018-2021 Picovoice Inc.
//  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
//  file accompanying this source.
//  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
//  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
//  specific language governing permissions and limitations under the License.
//

import AVFoundation
import Rhino
import Porcupine

public enum PicovoiceManagerError: Error {   
    case recordingDenied
}

/// High-level iOS binding for Picovoice end-to-end platform. It handles recording audio from microphone, processes it in real-time using Picovoice, and notifies the
/// client upon detection of the wake word or completion of in voice command inference.
public class PicovoiceManager {
    private var picovoice:Picovoice?
    private var audioInputEngine: AudioInputEngine?

    private var porcupineModelPath: String
    private var keywordPath: String
    private var porcupineSensitivity: Float32
    private var onWakeWordDetection: (() -> Void)?
    private var rhinoModelPath: String
    private var contextPath: String
    private var rhinoSensitivity: Float32
    private var onInference: ((Inference) -> Void)?

    /// Constructor.
    ///
    /// - Parameters:
    ///   - keywordPath: Absolute paths to keyword model file.
    ///   - onWakeWordDetection: A callback that is invoked upon detection of the keyword.
    ///   - porcupineModelPath: Absolute path to file containing model parameters.
    ///   - porcupineSensitivity: Sensitivity for detecting keywords. Each value should be a number within [0, 1]. A higher sensitivity results in fewer misses at
    ///   the cost of increasing the false alarm rate.
    ///   - contextPath: Absolute path to file containing context parameters. A context represents the set of expressions (spoken commands), intents, and
    ///   intent arguments (slots) within a domain of interest.
    ///   - onInference: A callback that is invoked upon completion of intent inference.
    ///   - rhinoModelPath: Absolute path to file containing model parameters.
    ///   - rhinoSensitivity: Inference sensitivity. It should be a number within [0, 1]. A higher sensitivity value results in fewer misses at the cost of (potentially)
    ///   increasing the erroneous inference rate.
    /// - Throws: PicovoiceError
    public init(
        keywordPath: String,
        porcupineModelPath: String = Porcupine.defaultModelPath,
        porcupineSensitivity: Float32 = 0.5,
        onWakeWordDetection: (() -> Void)?,
        contextPath: String,
        rhinoModelPath: String = Rhino.defaultModelPath,
        rhinoSensitivity: Float32 = 0.5,
        onInference: ((Inference) -> Void)?) {
        
        self.keywordPath = keywordPath
        self.porcupineModelPath = porcupineModelPath
        self.porcupineSensitivity = porcupineSensitivity
        self.onWakeWordDetection = onWakeWordDetection

        self.contextPath = contextPath
        self.rhinoModelPath = rhinoModelPath
        self.rhinoSensitivity  = rhinoSensitivity
        self.onInference = onInference
    }
    
    deinit {
        if picovoice != nil {
            stop()
        }
    }    

    ///  Starts recording audio from the microphone and Picovoice processing loop.
    ///
    /// - Throws: AVAudioSession, AVAudioEngine errors. Additionally PicovoiceManagerError if
    ///           microphone permission is not granted.
    public func start() throws {

        if picovoice != nil {
            return
        }
        let audioSession = AVAudioSession.sharedInstance()
        if audioSession.recordPermission == .denied {
            throw PicovoiceManagerError.recordingDenied
        }
        
        try audioSession.setCategory(AVAudioSession.Category.playAndRecord, options: [.mixWithOthers, .defaultToSpeaker, .allowBluetooth])
        
        picovoice = try Picovoice(
            keywordPath: self.keywordPath,
            onWakeWordDetection: self.onWakeWordDetection,
            porcupineModelPath: self.porcupineModelPath,
            porcupineSensitivity: self.porcupineSensitivity,                
            contextPath: self.contextPath,
            onInference: self.onInference,
            rhinoModelPath: self.rhinoModelPath,
            rhinoSensitivity: self.rhinoSensitivity)
        
        self.audioInputEngine = AudioInputEngine()
        
        self.audioInputEngine!.audioInput = { [weak self] audio in
            guard let `self` = self else {
                return
            }
            
            guard self.picovoice != nil else {
                return
            }
            do {
               try self.picovoice!.process(pcm:audio)
            } catch {
                print("Picovoice was unable to process frame of audio.")
            }
        }

        try self.audioInputEngine?.start()
    }
    
    /// Stop audio recording and processing loop
    public func stop() {
        self.audioInputEngine?.stop()
        self.picovoice?.delete()
        self.picovoice = nil 
    }
}

private class AudioInputEngine {
    private let numBuffers = 3
    private var audioQueue: AudioQueueRef?
    
    var audioInput: ((UnsafePointer<Int16>) -> Void)?
    
    func start() throws {
        var format = AudioStreamBasicDescription(
            mSampleRate: Float64(Picovoice.sampleRate),
            mFormatID: kAudioFormatLinearPCM,
            mFormatFlags: kLinearPCMFormatFlagIsSignedInteger | kLinearPCMFormatFlagIsPacked,
            mBytesPerPacket: 2,
            mFramesPerPacket: 1,
            mBytesPerFrame: 2,
            mChannelsPerFrame: 1,
            mBitsPerChannel: 16,
            mReserved: 0)
        let userData = UnsafeMutableRawPointer(Unmanaged.passUnretained(self).toOpaque())
        AudioQueueNewInput(&format, createAudioQueueCallback(), userData, nil, nil, 0, &audioQueue)
        
        guard let queue = audioQueue else {
            return
        }
        
        let bufferSize = UInt32(Picovoice.frameLength) * 2
        for _ in 0..<numBuffers {
            var bufferRef: AudioQueueBufferRef? = nil
            AudioQueueAllocateBuffer(queue, bufferSize, &bufferRef)
            if let buffer = bufferRef {
                AudioQueueEnqueueBuffer(queue, buffer, 0, nil)
            }
        }
        
        AudioQueueStart(queue, nil)
    }
    
    func stop() {
        guard let audioQueue = audioQueue else {
            return
        }
        AudioQueueFlush(audioQueue)
        AudioQueueStop(audioQueue, true)
        AudioQueueDispose(audioQueue, true)
        audioInput = nil
    }
    
    private func createAudioQueueCallback() -> AudioQueueInputCallback {
        return { userData, queue, bufferRef, startTimeRef, numPackets, packetDescriptions in
            
            // `self` is passed in as userData in the audio queue callback.
            guard let userData = userData else {
                return
            }
            let `self` = Unmanaged<AudioInputEngine>.fromOpaque(userData).takeUnretainedValue()
            
            let pcm = bufferRef.pointee.mAudioData.assumingMemoryBound(to: Int16.self)
            
            if let audioInput = self.audioInput {
                audioInput(pcm)
            }
            
            AudioQueueEnqueueBuffer(queue, bufferRef, 0, nil)
        }
    }
}
