//
//  Copyright 2018-2021 Picovoice Inc.
//  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
//  file accompanying this source.
//  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
//  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
//  specific language governing permissions and limitations under the License.
//

import ios_voice_processor
import Rhino
import Porcupine


/// High-level iOS binding for Picovoice end-to-end platform. It handles recording audio from microphone, processes it in real-time using Picovoice, and notifies the
/// client upon detection of the wake word or completion of in voice command inference.
public class PicovoiceManager {
    private var picovoice:Picovoice?

    private var accessKey: String
    private var keywordPath: String
    private var onWakeWordDetection: (() -> Void)
    private var contextPath: String
    private var onInference: ((Inference) -> Void)
    
    private var porcupineModelPath: String?
    private var porcupineSensitivity: Float32
    private var rhinoModelPath: String?
    private var rhinoSensitivity: Float32
    private var requireEndpoint: Bool
    
    private var processErrorCallback: ((Error) -> Void)?

    /// Constructor.
    ///
    /// - Parameters:
    ///   - accessKey: The AccessKey obtained from Picovoice Console (https://console.picovoice.ai).
    ///   - keywordPath: Absolute paths to keyword model file.
    ///   - onWakeWordDetection: A callback that is invoked upon detection of the keyword.
    ///   - contextPath: Absolute path to file containing context parameters. A context represents the set of expressions (spoken commands), intents, and
    ///   intent arguments (slots) within a domain of interest.
    ///   - onInference: A callback that is invoked upon completion of intent inference.
    ///   - porcupineModelPath: Absolute path to file containing model parameters.
    ///   - porcupineSensitivity: Sensitivity for detecting keywords. Each value should be a number within [0, 1]. A higher sensitivity results in fewer misses at
    ///   the cost of increasing the false alarm rate.
    ///   - rhinoModelPath: Absolute path to file containing model parameters.
    ///   - rhinoSensitivity: Inference sensitivity. It should be a number within [0, 1]. A higher sensitivity value results in fewer misses at the cost of (potentially)
    ///   increasing the erroneous inference rate.
    ///   - requireEndpoint: If set to `true`, Rhino requires an endpoint (chunk of silence) before finishing inference.
    ///   - processErrorCallback: Invoked if an error occurs while processing frames. If missing, error will be printed to console.
    /// - Throws: PicovoiceError
    public init(
        accessKey: String,
        keywordPath: String,
        onWakeWordDetection: @escaping (() -> Void),
        contextPath: String,
        onInference: @escaping ((Inference) -> Void),
        porcupineModelPath: String? = nil,
        porcupineSensitivity: Float32 = 0.5,
        rhinoModelPath: String? = nil,
        rhinoSensitivity: Float32 = 0.5,
        requireEndpoint: Bool = true,
        processErrorCallback: ((Error) -> Void)? = nil) {
        
        self.accessKey = accessKey
        self.keywordPath = keywordPath
        self.contextPath = contextPath
        self.onWakeWordDetection = onWakeWordDetection
        self.onInference = onInference
        
        self.porcupineModelPath = porcupineModelPath
        self.porcupineSensitivity = porcupineSensitivity
        self.rhinoModelPath = rhinoModelPath
        self.rhinoSensitivity = rhinoSensitivity
        self.requireEndpoint = requireEndpoint
        self.processErrorCallback = processErrorCallback
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
        
        guard try VoiceProcessor.shared.hasPermissions() else {
            throw PicovoiceError.PicovoiceRuntimeError("PicovoiceManager requires microphone permissions.")
        }
        
        picovoice = try Picovoice(
            accessKey: self.accessKey,
            keywordPath: self.keywordPath,
            onWakeWordDetection: self.onWakeWordDetection,
            contextPath: self.contextPath,
            onInference: self.onInference,
            porcupineModelPath: self.porcupineModelPath,
            porcupineSensitivity: self.porcupineSensitivity,
            rhinoModelPath: self.rhinoModelPath,
            rhinoSensitivity: self.rhinoSensitivity,
            requireEndpoint: self.requireEndpoint)
        
        try VoiceProcessor.shared.start(
            frameLength: Picovoice.frameLength,
            sampleRate: Picovoice.sampleRate,
            audioCallback: self.audioCallback
        )
    }
    
    /// Stop audio recording and processing loop
    public func stop() {
        VoiceProcessor.shared.stop()
        self.picovoice?.delete()
        self.picovoice = nil 
    }
    
    /// Callback to run after after voice processor processes frames.
    private func audioCallback(pcm: [Int16]) {
        guard self.picovoice != nil else {
            return
        }
        
        do {
           try self.picovoice!.process(pcm: pcm)
        } catch {
            if self.processErrorCallback != nil {
                self.processErrorCallback!(error)
            } else {
                print("\(error)")
            }
        }
    }
}
