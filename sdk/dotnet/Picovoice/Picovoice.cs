/*
    Copyright 2020-2023 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

using System;
using System.Collections.Generic;

namespace Pv
{
    /// <summary>
    /// .NET binding for Picovoice end-to-end platform. Picovoice enables building voice experiences similar to Alexa but
    /// runs entirely on-device(offline).
    ///
    /// Picovoice detects utterances of a customizable wake word(phrase) within an incoming stream of audio in real-time.
    /// After detection of wake word, it begins to infer the user's intent from the follow-on spoken command. Upon detection
    /// of wake word and completion of voice command, it invokes user-provided callbacks to signal these events.
    ///
    /// Picovoice processes incoming audio in consecutive frames. The number of samples per frame is
    /// `.FrameLength`. The incoming audio needs to have a sample rate equal to `.SampleRate` and be 16-bit
    /// linearly-encoded.Picovoice operates on single-channel audio. It uses Porcupine wake word engine for wake word
    /// detection and Rhino Speech-to-Intent engine for intent inference.
    /// </summary>
    public class Picovoice : IDisposable
    {
        private Porcupine _porcupine;
        private readonly Action _wakeWordCallback;
        private Rhino _rhino;
        private readonly Action<Inference> _inferenceCallback;

        private bool _isWakeWordDetected = false;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="accessKey">AccessKey obtained from Picovoice Console (https://console.picovoice.ai/).</param>
        /// <param name="keywordPath">Absolute path to Porcupine's keyword model file.</param>
        /// <param name="wakeWordCallback">
        /// User-defined callback invoked upon detection of the wake phrase. The callback accepts
        /// no input arguments.
        /// </param>
        /// <param name="contextPath">
        /// Absolute path to file containing context parameters. A context represents the set of
        /// expressions(spoken commands), intents, and intent arguments(slots) within a domain of interest.
        /// </param>
        /// <param name="inferenceCallback">
        /// User-defined callback invoked upon completion of intent inference. The callback
        /// accepts a single input argument of type `Inference` that exposes the following immutable fields:
        /// (1) `IsUnderstood` is a flag indicating if the spoken command is understood.
        /// (2) `Intent` is the inferred intent from the voice command.If the command is not understood then it's set to `None`.
        /// (3) `Slots` is a dictionary mapping slot keys to their respective values. If the command is not understood then
        /// it's set to an empty dictionary.
        /// </param>
        /// <param name="porcupineModelPath">Absolute path to the file containing Porcupine's model parameters.</param>
        /// <param name="porcupineSensitivity">
        /// Wake word detection sensitivity. It should be a number within [0, 1]. A higher
        /// sensitivity results in fewer misses at the cost of increasing the false alarm rate.
        /// </param>
        /// <param name="rhinoModelPath">Absolute path to the file containing Rhino's model parameters.</param>
        /// <param name="rhinoSensitivity">
        /// Inference sensitivity. It should be a number within [0, 1]. A higher sensitivity value
        /// results in fewer misses at the cost of(potentially) increasing the erroneous inference rate.
        /// </param>
        /// <param name="endpointDurationSec">
        /// Endpoint duration in seconds. An endpoint is a chunk of silence at the end of an
        /// utterance that marks the end of spoken command. It should be a positive number within [0.5, 5]. A lower endpoint
        /// duration reduces delay and improves responsiveness. A higher endpoint duration assures Rhino doesn't return inference
        /// pre-emptively in case the user pauses before finishing the request.
        /// </param>
        /// <param name="requireEndpoint">
        /// If set to `true`, Rhino requires an endpoint (a chunk of silence) after the spoken command.
        /// If set to `false`, Rhino tries to detect silence, but if it cannot, it still will provide inference regardless. Set
        /// to `false` only if operating in an environment with overlapping speech (e.g. people talking in the background).
        /// </param>
        /// <returns>An instance of the Picovoice end-to-end platform.</returns>
        public static Picovoice Create(
            string accessKey,
            string keywordPath,
            Action wakeWordCallback,
            string contextPath,
            Action<Inference> inferenceCallback,
            string porcupineModelPath = null,
            float porcupineSensitivity = 0.5f,
            string rhinoModelPath = null,
            float rhinoSensitivity = 0.5f,
            float endpointDurationSec = 1.0f,
            bool requireEndpoint = true)
        {
            if (wakeWordCallback == null)
            {
                throw new PicovoiceInvalidArgumentException("'wakeWordCallback' cannot be null");
            }

            if (inferenceCallback == null)
            {
                throw new PicovoiceInvalidArgumentException("'inferenceCallback' cannot be null");
            }

            try
            {
                Porcupine porcupine = Porcupine.FromKeywordPaths(
                    accessKey,
                    new List<string> { keywordPath },
                    modelPath: porcupineModelPath,
                    sensitivities: new List<float> { porcupineSensitivity });

                Rhino rhino = Rhino.Create(
                    accessKey,
                    contextPath,
                    modelPath: rhinoModelPath,
                    sensitivity: rhinoSensitivity,
                    endpointDurationSec: endpointDurationSec,
                    requireEndpoint: requireEndpoint);

                if (porcupine.FrameLength != rhino.FrameLength)
                {
                    throw new PicovoiceInvalidArgumentException($"Porcupine frame length ({porcupine.FrameLength}) and Rhino frame length ({rhino.FrameLength}) are different");
                }

                if (porcupine.SampleRate != rhino.SampleRate)
                {
                    throw new PicovoiceInvalidArgumentException($"Porcupine sample rate ({porcupine.SampleRate}) and Rhino sample rate ({rhino.SampleRate}) are different");
                }

                return new Picovoice(porcupine, wakeWordCallback, rhino, inferenceCallback);
            }
            catch (Exception ex)
            {
                throw MapToPicovoiceException(ex);
            }
        }

        // private constructor
        private Picovoice(Porcupine porcupine, Action wakeWordCallback, Rhino rhino, Action<Inference> inferenceCallback)
        {
            _porcupine = porcupine;
            _wakeWordCallback = wakeWordCallback;
            _rhino = rhino;
            _inferenceCallback = inferenceCallback;

            FrameLength = porcupine.FrameLength;
            SampleRate = porcupine.SampleRate;
            PorcupineVersion = porcupine.Version;
            RhinoVersion = rhino.Version;
            ContextInfo = rhino.ContextInfo;
        }

        /// <summary>
        /// Releases resources that were acquired by Picovoice.
        /// </summary>
        public void Dispose()
        {
            if (_porcupine != null)
            {
                _porcupine.Dispose();
                _porcupine = null;
            }

            if (_rhino != null)
            {
                _rhino.Dispose();
                _rhino = null;
            }

            // ensures finalizer doesn't trigger if already manually disposed
            GC.SuppressFinalize(this);
        }

        ~Picovoice()
        {
            Dispose();
        }

        /// <summary>
        /// Processes a frame of the incoming audio stream. Upon detection of wake word and completion of follow-on command
        /// inference invokes user-defined callbacks.
        /// </summary>
        /// <param name="pcm">
        /// A frame of audio samples. The number of samples per frame can be obtained by calling
        /// `.FrameLength`. The incoming audio needs to have a sample rate equal to `.SampleRate` and be 16-bit
        /// linearly-encoded. Picovoice operates on single-channel audio.
        /// </param>
        public void Process(short[] pcm)
        {
            if (pcm == null)
            {
                throw new PicovoiceInvalidArgumentException($"Null audio frame passed to Picovoice");
            }

            if (pcm.Length != FrameLength)
            {
                throw new PicovoiceInvalidArgumentException($"Invalid frame length - expected {FrameLength}, received {pcm.Length}");
            }

            if (_porcupine == null || _rhino == null)
            {
                throw new PicovoiceInvalidStateException("Cannot process frame - resources have been released.");
            }

            if (!_isWakeWordDetected)
            {
                _isWakeWordDetected = _porcupine.Process(pcm) == 0;
                if (_isWakeWordDetected)
                    _wakeWordCallback.Invoke();
            }
            else
            {
                bool isFinalized = _rhino.Process(pcm);
                if (isFinalized)
                {
                    _isWakeWordDetected = false;
                    Inference inference = _rhino.GetInference();
                    _inferenceCallback.Invoke(inference);
                }
            }
        }

        /// <summary>
        /// Gets the required number of audio samples per frame.
        /// </summary>
        /// <returns>Required frame length.</returns>
        public int FrameLength { get; private set; }

        /// <summary>
        /// Get the audio sample rate required by Picovoice
        /// </summary>
        /// <returns>Required sample rate.</returns>
        public int SampleRate { get; private set; }

        /// <summary>
        /// Gets the version number of the Picovoice platform
        /// </summary>
        /// <returns>Version of Picovoice</returns>
        public string Version => "2.1.0";

        /// <summary>
        /// Get the version of the Porcupine library
        /// </summary>
        /// <returns>Porcupine library version</returns>
        public string PorcupineVersion { get; private set; }

        /// <summary>
        /// Get the version of the Rhino library
        /// </summary>
        /// <returns>Rhino library version</returns>
        public string RhinoVersion { get; private set; }

        /// <summary>
        /// Gets the current Rhino context information.
        /// </summary>
        /// <returns>Context information</returns>
        public string ContextInfo { get; private set; }

        /// <summary>
        /// Maps Porcupine/Rhino Exception to Picovoice Exception
        /// </summary>
        private static PicovoiceException MapToPicovoiceException(Exception ex)
        {
            if (ex is PorcupineActivationException || ex is RhinoActivationException)
            {
                return new PicovoiceActivationException(ex.Message, ex);
            }
            else if (ex is PorcupineActivationLimitException || ex is RhinoActivationLimitException)
            {
                return new PicovoiceActivationLimitException(ex.Message, ex);
            }
            else if (ex is PorcupineActivationRefusedException || ex is RhinoActivationRefusedException)
            {
                return new PicovoiceActivationRefusedException(ex.Message, ex);
            }
            else if (ex is PorcupineActivationThrottledException || ex is RhinoActivationThrottledException)
            {
                return new PicovoiceActivationThrottledException(ex.Message, ex);
            }
            else if (ex is PorcupineInvalidArgumentException || ex is RhinoInvalidArgumentException)
            {
                return new PicovoiceInvalidArgumentException(ex.Message, ex);
            }
            else if (ex is PorcupineInvalidStateException || ex is RhinoInvalidStateException)
            {
                return new PicovoiceInvalidStateException(ex.Message, ex);
            }
            else if (ex is PorcupineIOException || ex is RhinoIOException)
            {
                return new PicovoiceIOException(ex.Message, ex);
            }
            else if (ex is PorcupineKeyException || ex is RhinoKeyException)
            {
                return new PicovoiceKeyException(ex.Message, ex);
            }
            else if (ex is PorcupineMemoryException || ex is RhinoMemoryException)
            {
                return new PicovoiceMemoryException(ex.Message, ex);
            }
            else if (ex is PorcupineRuntimeException || ex is RhinoRuntimeException)
            {
                return new PicovoiceRuntimeException(ex.Message, ex);
            }
            else if (ex is PorcupineStopIterationException || ex is RhinoStopIterationException)
            {
                return new PicovoiceStopIterationException(ex.Message, ex);
            }
            else
            {
                return new PicovoiceException(ex.Message, ex);
            }
        }
    }
}