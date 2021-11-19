//
//  Copyright 2021 Picovoice Inc.
//  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
//  file accompanying this source.
//  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
//  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
//  specific language governing permissions and limitations under the License.
//

import AVFoundation
import Porcupine
import Rhino

public enum PicovoiceError: Error {
    case PicovoiceError(_ message:String)
    case PicovoiceMemoryError(_ message:String)
    case PicovoiceIOError(_ message:String)
    case PicovoiceInvalidArgumentError(_ message:String)
    case PicovoiceStopIterationError(_ message:String)
    case PicovoiceKeyError(_ message:String)
    case PicovoiceInvalidStateError(_ message:String)
    case PicovoiceRuntimeError(_ message:String)
    case PicovoiceActivationError(_ message:String)
    case PicovoiceActivationLimitError(_ message:String)
    case PicovoiceActivationThrottledError(_ message:String)
    case PicovoiceActivationRefusedError(_ message:String)
}

/// Low-level iOS binding for Picovoice end-to-end platform.
/// Client passes in audio data and is notified upon detection of the wake word or completion of in voice command inference.
public class Picovoice {
    private var porcupine: Porcupine?
    private var rhino: Rhino?

    private var onWakeWordDetection: (() -> Void)
    private var onInference: ((Inference) -> Void)

    public static let frameLength = Porcupine.frameLength
    public static let sampleRate = Porcupine.sampleRate
    public static let porcupineVersion = Porcupine.version
    public static let rhinoVersion = Rhino.version
    public static let picovoiceVersion = "2.0.0"
    public var contextInfo:String? = ""
    
    private var isWakeWordDetected: Bool = false
    
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
    /// - Throws: PicovoiceError
    public init (
        accessKey: String,
        keywordPath: String,
        onWakeWordDetection: @escaping (() -> Void),
        contextPath: String,
        onInference: @escaping ((Inference) -> Void),
        porcupineModelPath: String? = nil,
        porcupineSensitivity: Float32 = 0.5,
        rhinoModelPath: String? = nil,
        rhinoSensitivity: Float32 = 0.5,
        requireEndpoint: Bool = true) throws {
        
        self.onWakeWordDetection = onWakeWordDetection
        self.onInference = onInference
        
        do {
            try porcupine = Porcupine(
                accessKey: accessKey,
                keywordPath: keywordPath,
                modelPath: porcupineModelPath,
                sensitivity: porcupineSensitivity)

            try rhino = Rhino(
                accessKey: accessKey,
                contextPath: contextPath,
                modelPath: rhinoModelPath,
                sensitivity: rhinoSensitivity,
                requireEndpoint: requireEndpoint)
                
            contextInfo = rhino?.contextInfo
        }
        catch {
            throw mapToPicovoiceError(error)
        }
    }

    deinit {
        delete()
    }

    /// Releases native resources that were allocated to Picovoice
    public func delete(){
        if porcupine != nil {
            porcupine!.delete()
            porcupine = nil
        }

        if rhino != nil {
            rhino!.delete()
            rhino = nil
        }
    }

    /// Process a frame of audio with the platform
    ///
    /// - Parameters:
    ///   - pcm: An array of 16-bit pcm samples
    /// - Throws: PicovoiceError
    public func process(pcm:[Int16]) throws {
        if pcm.count != Picovoice.frameLength {
            throw PicovoiceError.PicovoiceInvalidArgumentError("Invalid frame length - expected \(Picovoice.frameLength), received \(pcm.count)")
        }
        
        if porcupine == nil || rhino == nil {
            throw PicovoiceError.PicovoiceInvalidStateError("Cannot process frame - resources have been released.")
        }

        do {
            if !isWakeWordDetected {
                isWakeWordDetected = try porcupine!.process(pcm:pcm) == 0
                if isWakeWordDetected {
                    self.onWakeWordDetection()
                }
            }
            else{
                if try rhino!.process(pcm:pcm) {
                    self.onInference(try rhino!.getInference())
                    isWakeWordDetected = false
                }
            }
        } catch {
            throw mapToPicovoiceError(error)
        }
    }
    
    private func mapToPicovoiceError(_ error: Error) -> PicovoiceError {
        switch error {
        case PorcupineError.PorcupineOutOfMemoryError(let message), RhinoError.RhinoMemoryError(let message):
            return PicovoiceError.PicovoiceMemoryError(message)
        case PorcupineError.PorcupineIOError(let message), RhinoError.RhinoIOError(let message):
            return PicovoiceError.PicovoiceIOError(message)
        case PorcupineError.PorcupineInvalidArgumentError(let message), RhinoError.RhinoInvalidArgumentError(let message):
            return PicovoiceError.PicovoiceInvalidArgumentError(message)
        case PorcupineError.PorcupineStopIterationError(let message), RhinoError.RhinoStopIterationError(let message):
            return PicovoiceError.PicovoiceStopIterationError(message)
        case PorcupineError.PorcupineKeyError(let message), RhinoError.RhinoKeyError(let message):
            return PicovoiceError.PicovoiceKeyError(message)
        case PorcupineError.PorcupineInvalidStateError(let message), RhinoError.RhinoInvalidStateError(let message):
            return PicovoiceError.PicovoiceInvalidStateError(message)
        case PorcupineError.PorcupineRuntimeError(let message), RhinoError.RhinoRuntimeError(let message):
            return PicovoiceError.PicovoiceRuntimeError(message)
        case PorcupineError.PorcupineActivationError(let message), RhinoError.RhinoActivationError(let message):
            return PicovoiceError.PicovoiceActivationError(message)
        case PorcupineError.PorcupineActivationLimitError(let message), RhinoError.RhinoActivationLimitError(let message):
            return PicovoiceError.PicovoiceActivationLimitError(message)
        case PorcupineError.PorcupineActivationThrottledError(let message), RhinoError.RhinoActivationThrottledError(let message):
            return PicovoiceError.PicovoiceActivationThrottledError(message)
        case PorcupineError.PorcupineActivationRefusedError(let message), RhinoError.RhinoActivationRefusedError(let message):
            return PicovoiceError.PicovoiceActivationRefusedError(message)
        case PorcupineError.PorcupineInternalError(let message), RhinoError.RhinoError(let message):
            return PicovoiceError.PicovoiceError(message)
        default:
            return PicovoiceError.PicovoiceError("\(error)")
        }
    }
}
