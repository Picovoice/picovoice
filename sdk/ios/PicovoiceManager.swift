//
//  Copyright 2018-2023 Picovoice Inc.
//  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
//  file accompanying this source.
//  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
//  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
//  specific language governing permissions and limitations under the License.
//

import ios_voice_processor
import Rhino
import Porcupine

/// High-level iOS binding for Picovoice end-to-end platform. It handles recording audio
/// from microphone, processes it in real-time using Picovoice, and notifies the
/// client upon detection of the wake word or completion of in voice command inference.
public class PicovoiceManager {
    private var picovoice: Picovoice

    private var frameListener: VoiceProcessorFrameListener?
    private var errorListener: VoiceProcessorErrorListener?

    public var contextInfo: String {
        get {
            return self.picovoice.contextInfo
        }
    }

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
    ///   - processErrorCallback: A callback that is invoked if there is an error while processing audio.
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
            requireEndpoint: Bool = true,
            processErrorCallback: ((Error) -> Void)? = nil) {

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
                endpointDurationSec: self.endpointDurationSec,
                requireEndpoint: self.requireEndpoint)

        self.errorListener = VoiceProcessorErrorListener({ error in
            guard let callback = processErrorCallback else {
                print("\(error.errorDescription)")
                return
            }

            callback(PicovoiceError(error.errorDescription))
        })

        self.frameListener = VoiceProcessorFrameListener({ frame in
            guard let picovoice = self.picovoice else {
                return
            }

            do {
                try picovoice.process(pcm: frame)
            } catch {
                guard let callback = processErrorCallback else {
                    print("\(error)")
                    return
                }

                callback(error)
            }
        })
    }

    deinit {
        self.picovoice.delete()
    }

    ///  Starts recording audio from the microphone and Picovoice processing loop.
    ///
    /// - Throws: PicovoiceError if unable to start recording
    public func start() throws {
        VoiceProcessor.instance.addErrorListener(errorListener!)
        VoiceProcessor.instance.addFrameListener(frameListener!)

        do {
            try VoiceProcessor.instance.start(
                    frameLength: Porcupine.frameLength,
                    sampleRate: Porcupine.sampleRate
            )
        } catch {
            throw PicovoiceError(error.localizedDescription)
        }
    }

    /// Stop audio recording and processing loop
    ///
    /// - Throws: PicovoiceError if unable to stop recording
    public func stop() throws {
        VoiceProcessor.instance.removeErrorListener(errorListener!)
        VoiceProcessor.instance.removeFrameListener(frameListener!)

        if VoiceProcessor.instance.numFrameListeners == 0 {
            do {
                try VoiceProcessor.instance.stop()
            } catch {
                throw PicovoiceError(error.localizedDescription)
            }
        }

        self.picovoice.reset()
    }
}
