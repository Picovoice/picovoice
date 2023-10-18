//
//  Copyright 2021-2023 Picovoice Inc.
//  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
//  file accompanying this source.
//  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
//  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
//  specific language governing permissions and limitations under the License.
//

import AVFoundation
import Porcupine
import Rhino

/// Low-level iOS binding for Picovoice end-to-end platform.
/// Client passes in audio data and is notified upon detection of the
/// wake word or completion of in voice command inference.
public class Picovoice {
    private var porcupine: Porcupine?
    private var rhino: Rhino?

    private var onWakeWordDetection: (() -> Void)
    private var onInference: ((Inference) -> Void)

    public static let frameLength = Porcupine.frameLength
    public static let sampleRate = Porcupine.sampleRate
    public static let porcupineVersion = Porcupine.version
    public static let rhinoVersion = Rhino.version
    public static let picovoiceVersion = "3.0.0"
    public var contextInfo: String = ""

    private var isWakeWordDetected: Bool = false

    /// Constructor.
    ///
    /// - Parameters:
    ///   - accessKey: The AccessKey obtained from Picovoice Console (https://console.picovoice.ai).
    ///   - keywordPath: Absolute paths to keyword model file.
    ///   - onWakeWordDetection: A callback that is invoked upon detection of the keyword.
    ///   - contextPath: Absolute path to file containing context parameters. A context represents
    ///   the set of expressions (spoken commands), intents, and intent arguments (slots) within a domain of interest.
    ///   - onInference: A callback that is invoked upon completion of intent inference.
    ///   - porcupineModelPath: Absolute path to file containing model parameters.
    ///   - porcupineSensitivity: Sensitivity for detecting keywords. Each value should be a number within [0, 1].
    ///   A higher sensitivity results in fewer misses at the cost of increasing the false alarm rate.
    ///   - rhinoModelPath: Absolute path to file containing model parameters.
    ///   - rhinoSensitivity: Inference sensitivity. It should be a number within [0, 1]. A higher sensitivity value
    ///   results in fewer misses at the cost of (potentially) increasing the erroneous inference rate.
    ///   - endpointDurationSec: Endpoint duration in seconds. An endpoint is a chunk of silence at the end of an
    ///   utterance that marks the end of spoken command. It should be a positive number within [0.5, 5].
    ///   A lower endpoint duration reduces delay and improves responsiveness.
    ///   A higher endpoint duration assures Rhino doesn't return inference pre-emptively
    ///   in case the user pauses before finishing the request.
    ///   - requireEndpoint: If set to `true`, Rhino requires an endpoint (a chunk of silence) after the spoken command.
    ///   If set to `false`, Rhino tries to detect silence, but if it cannot, it still will provide
    ///   inference regardless. Set to `false` only if operating in an environment with overlapping speech
    ///   (e.g. people talking in the background).
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
        endpointDurationSec: Float32 = 1.0,
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
                endpointDurationSec: endpointDurationSec,
                requireEndpoint: requireEndpoint)

            contextInfo = (rhino != nil) ? rhino!.contextInfo : ""
        } catch {
            throw mapToPicovoiceError(error)
        }
    }

    deinit {
        delete()
    }

    /// Releases native resources that were allocated to Picovoice
    public func delete() {
        porcupine?.delete()
        porcupine = nil

        rhino?.delete()
        rhino = nil
    }

    /// Process a frame of audio with the platform
    ///
    /// - Parameters:
    ///   - pcm: An array of 16-bit pcm samples
    /// - Throws: PicovoiceError
    public func process(pcm: [Int16]) throws {
        if pcm.count != Picovoice.frameLength {
            throw PicovoiceInvalidArgumentError(
                "Invalid frame length - expected \(Picovoice.frameLength), received \(pcm.count)")
        }

        guard let porcupine = self.porcupine, let rhino = self.rhino else {
            throw PicovoiceInvalidStateError("Cannot process frame - resources have been released.")
        }

        do {
            if !isWakeWordDetected {
                isWakeWordDetected = try porcupine.process(pcm: pcm) == 0
                if isWakeWordDetected {
                    self.onWakeWordDetection()
                }
            } else {
                if try rhino.process(pcm: pcm) {
                    self.onInference(try rhino.getInference())
                    isWakeWordDetected = false
                }
            }
        } catch {
            throw mapToPicovoiceError(error)
        }
    }

    /// Resets the internal state of Picovoice. It should be called before processing a new stream of audio
    /// or when Picovoice was stopped while processing a stream of audio.
    ///
    /// - Throws: PicovoiceError
    public func reset() throws {
        guard porcupine != nil, let rhino = self.rhino else {
            throw PicovoiceInvalidStateError("Cannot reset - resources have been released.")
        }

        do {
            isWakeWordDetected = false
            try rhino.reset()
        } catch {
            throw mapToPicovoiceError(error)
        }
    }

    private func mapToPicovoiceError(_ error: Error) -> PicovoiceError {
        switch error {
        case is PorcupineMemoryError, is RhinoMemoryError:
            return PicovoiceMemoryError(error.localizedDescription)
        case is PorcupineIOError, is RhinoIOError:
            return PicovoiceIOError(error.localizedDescription)
        case is PorcupineInvalidArgumentError, is RhinoInvalidArgumentError:
            return PicovoiceInvalidArgumentError(error.localizedDescription)
        case is PorcupineStopIterationError, is RhinoStopIterationError:
            return PicovoiceStopIterationError(error.localizedDescription)
        case is PorcupineKeyError, is RhinoKeyError:
            return PicovoiceKeyError(error.localizedDescription)
        case is PorcupineInvalidStateError, is RhinoInvalidStateError:
            return PicovoiceInvalidStateError(error.localizedDescription)
        case is PorcupineRuntimeError, is RhinoRuntimeError:
            return PicovoiceRuntimeError(error.localizedDescription)
        case is PorcupineActivationError, is RhinoActivationError:
            return PicovoiceActivationError(error.localizedDescription)
        case is PorcupineActivationLimitError, is RhinoActivationLimitError:
            return PicovoiceActivationLimitError(error.localizedDescription)
        case is PorcupineActivationThrottledError, is RhinoActivationThrottledError:
            return PicovoiceActivationThrottledError(error.localizedDescription)
        case is PorcupineActivationRefusedError, is RhinoActivationRefusedError:
            return PicovoiceActivationRefusedError(error.localizedDescription)
        case is PorcupineError, is RhinoError:
            return PicovoiceError(error.localizedDescription)
        default:
            return PicovoiceError("\(error)")
        }
    }
}
