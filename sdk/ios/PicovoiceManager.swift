//
//  Copyright 2018-2020 Picovoice Inc.
//  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
//  file accompanying this source.
//  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
//  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
//  specific language governing permissions and limitations under the License.
//

import AVFoundation
import pv_picovoice

public enum PicovoiceManagerError: Error {
    case invalidArgument
    case io
    case outOfMemory
    case recordingDenied
}

public struct Inference {
    let isUnderstood: Bool
    let intent: String
    let slots: Dictionary<String, String>
    
    public init(isUnderstood: Bool, intent: String, slots: Dictionary<String, String>) {
        self.isUnderstood = isUnderstood
        self.intent = intent
        self.slots = slots
    }
}

class PicovoiceManager {
    private var porcupine: OpaquePointer? = nil
    private var rhino: OpaquePointer? = nil
    private var audioInputEngine: AudioInputEngine?
    private var isWakeWordDetected: Bool = false
    private var porcupineModelPath: String
    private var keywordPath: String
    private var porcupineSensitivity: Float32
    private var onWakeWordDetection: (() -> Void)?
    private var rhinoModelPath: String
    private var contextPath: String
    private var rhinoSensitivity: Float32
    private var onInference: ((Inference) -> Void)?
    
    public init(
        porcupineModelPath: String,
        keywordPath: String,
        porcupineSensitivity: Float32,
        onWakeWordDetection: (() -> Void)?,
        rhinoModelPath: String,
        contextPath: String,
        rhinoSensitivity: Float32,
        onInference: ((Inference) -> Void)?) {
        
        self.porcupineModelPath = porcupineModelPath
        self.keywordPath = keywordPath
        self.porcupineSensitivity = porcupineSensitivity
        self.onWakeWordDetection = onWakeWordDetection
        self.rhinoModelPath = rhinoModelPath
        self.contextPath = contextPath
        self.rhinoSensitivity  = rhinoSensitivity
        self.onInference = onInference
    }
    
    public func start() throws {
        if self.porcupine != nil {
            return
        }
        
        var status = pv_porcupine_init(
            self.porcupineModelPath,
            1,
            [UnsafePointer(strdup(self.keywordPath))],
            [self.porcupineSensitivity],
            &self.porcupine)
        try checkStatus(status)
        
        status = pv_rhino_init(self.rhinoModelPath, self.contextPath, self.rhinoSensitivity, &self.rhino)
        try checkStatus(status)
        
        self.audioInputEngine = AudioInputEngine()
        
        self.audioInputEngine!.audioInput = { [weak self] audio in
            guard let `self` = self else {
                return
            }
            
            if !self.isWakeWordDetected {
                var keywordIndex: Int32 = -1
                pv_porcupine_process(self.porcupine, audio, &keywordIndex)
                
                self.isWakeWordDetected = keywordIndex == 0
                
                if self.isWakeWordDetected {
                    self.onWakeWordDetection?()
                }
            } else {
                var isFinalized: Bool = false
                pv_rhino_process(self.rhino, audio, &isFinalized)
                
                if isFinalized {
                    self.isWakeWordDetected = false
                    
                    var isUnderstood: Bool = false
                    var intent = ""
                    var slots = [String: String]()
                    
                    pv_rhino_is_understood(self.rhino, &isUnderstood)
                    
                    if isUnderstood {
                        var cIntent: UnsafePointer<Int8>?
                        var numSlots: Int32 = 0
                        var cSlotKeys: UnsafeMutablePointer<UnsafePointer<Int8>?>?
                        var cSlotValues: UnsafeMutablePointer<UnsafePointer<Int8>?>?
                        pv_rhino_get_intent(self.rhino, &cIntent, &numSlots, &cSlotKeys, &cSlotValues)
                        
                        if isUnderstood {
                            intent = String(cString: cIntent!)
                            for i in 0...(numSlots - 1) {
                                let slot = String(cString: cSlotKeys!.advanced(by: Int(i)).pointee!)
                                let value = String(cString: cSlotValues!.advanced(by: Int(i)).pointee!)
                                slots[slot] = value
                            }
                            
                            pv_rhino_free_slots_and_values(self.rhino, cSlotKeys, cSlotValues)
                        }
                    }
                    
                    pv_rhino_reset(self.rhino)
                    
                    self.onInference?(Inference(isUnderstood: isUnderstood, intent: intent, slots: slots))
                }
                
            }
        }
    }
    
    public func stop() {
        self.audioInputEngine?.stop()
        
        pv_porcupine_delete(self.porcupine)
        self.porcupine = nil
        
        pv_rhino_delete(self.rhino)
        self.rhino = nil
    }
    
    private func checkStatus(_ status: pv_status_t) throws {
        switch status {
        case PV_STATUS_IO_ERROR:
            throw PicovoiceManagerError.io
        case PV_STATUS_OUT_OF_MEMORY:
            throw PicovoiceManagerError.outOfMemory
        case PV_STATUS_INVALID_ARGUMENT:
            throw PicovoiceManagerError.invalidArgument
        default:
            return
        }
    }
}

private class AudioInputEngine {
    private let numBuffers = 3
    private var audioQueue: AudioQueueRef?
    
    var audioInput: ((UnsafePointer<Int16>) -> Void)?
    
    func start() throws {
        var format = AudioStreamBasicDescription(
            mSampleRate: Float64(pv_sample_rate()),
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
        
        let bufferSize = UInt32(pv_rhino_frame_length()) * 2
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
        AudioQueueStop(audioQueue, true)
        AudioQueueDispose(audioQueue, true)
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
