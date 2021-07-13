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
    case objectDisposed
    case porcupineError(Error)
    case rhinoError(Error)
    
    // wraps Porcupine and Rhino errors
    init(_ error: Error) {
        if let error = error as? PorcupineError {
            self = .porcupineError(error)
        } else {
          self = .rhinoError(error)
        }
    }
}

/// Low-level iOS binding for Picovoice end-to-end platform.
/// Client passes in audio data and is notified upon detection of the wake word or completion of in voice command inference.
public class Picovoice {
    private var porcupine: Porcupine?
    private var rhino: Rhino?

    private var onWakeWordDetection: (() -> Void)?
    private var onInference: ((Inference) -> Void)?

    public static let frameLength = Porcupine.frameLength
    public static let sampleRate = Porcupine.sampleRate
    public static let porcupineVersion = Porcupine.version
    public static let rhinoVersion = Rhino.version
    public static let picovoiceVersion = "1.1.0"
    public var contextInfo:String? = ""
    
    private var isWakeWordDetected: Bool = false
    
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
    public init (
        keywordPath: String,
        onWakeWordDetection: (() -> Void)?,
        porcupineModelPath: String? = nil,
        porcupineSensitivity: Float32 = 0.5,
        contextPath: String,
        onInference: ((Inference) -> Void)?,
        rhinoModelPath: String? = nil,
        rhinoSensitivity: Float32 = 0.5) throws {
        
        do{
            try porcupine = Porcupine(
                keywordPath: keywordPath,
                modelPath: porcupineModelPath,
                sensitivity: porcupineSensitivity)
            
        }
        catch {
            throw PicovoiceError(error)
        }

        do{
            try rhino = Rhino(
                contextPath: contextPath,
                modelPath: rhinoModelPath,
                sensitivity: rhinoSensitivity)
                
            contextInfo = rhino?.contextInfo
        }
        catch {
            throw PicovoiceError(error)
        }
        
        self.onWakeWordDetection = onWakeWordDetection
        self.onInference = onInference
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
    ///   - pcm: A pointer to a frame of 16-bit pcm
    /// - Throws: PicovoiceError
    public func process(pcm:UnsafePointer<Int16>) throws {
        if porcupine == nil || rhino == nil {
            throw PicovoiceError.objectDisposed
        }

        do {
            if !isWakeWordDetected {
                isWakeWordDetected = try porcupine!.process(pcm:pcm) == 0
                if isWakeWordDetected {
                    self.onWakeWordDetection?()
                }
            }
            else{
                if try rhino!.process(pcm:pcm) {
                    self.onInference?(try rhino!.getInference())
                    isWakeWordDetected = false
                }
            }
        } catch {
            throw PicovoiceError(error)
        }
    }

    /// Process a frame of audio with the platform
    ///
    /// - Parameters:
    ///   - pcm: An array of 16-bit pcm samples
    /// - Throws: PicovoiceError
    public func process(pcm:[Int16]) throws {
        if porcupine == nil || rhino == nil {
            throw PicovoiceError.objectDisposed
        }

        do {
            if !isWakeWordDetected {
                isWakeWordDetected = try porcupine!.process(pcm:pcm) == 0
                if isWakeWordDetected {
                    self.onWakeWordDetection?()
                }
            }
            else{
                if try rhino!.process(pcm:pcm) {
                    self.onInference?(try rhino!.getInference())
                    isWakeWordDetected = false
                }
            }
        } catch {
            throw PicovoiceError(error)
        }
    }
}
