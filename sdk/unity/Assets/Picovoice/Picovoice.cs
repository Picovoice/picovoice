//
// Copyright 2021 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
// file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//

using System;
using System.Collections.Generic;

namespace Pv.Unity
{
    public class Picovoice : IDisposable
    {
        private Porcupine _porcupine;
        private Rhino _rhino;
        private Action _wakeWordCallback;
        private Action<Inference> _inferenceCallback;

        private bool _isWakeWordDetected;

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
        public string Version => "2.0.0";

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
        /// Picovoice constructor
        /// </summary>
        /// <param name="accessKey">AccessKey obtained from Picovoice Console (https://console.picovoice.ai/).</param>
        /// <param name="keywordPath">Absolute path to Porcupine's keyword model file.</param>
        /// <param name="wakeWordCallback">
        /// User-defined callback invoked upon detection of the wake phrase.
        /// The callback accepts no input arguments.
        /// </param>
        /// <param name="contextPath">
        /// Absolute path to file containing context parameters. A context represents the set of
        /// expressions(spoken commands), intents, and intent arguments(slots) within a domain of interest.
        /// </param>
        /// <param name="inferenceCallback">
        /// User-defined callback invoked upon completion of intent inference. The callback
        /// accepts a single input argument of type `Map<String, dynamic>` that is populated with the following items:
        /// (1) IsUnderstood: whether Rhino understood what it heard based on the context
        /// (2) Intent: if isUnderstood, name of intent that were inferred
        /// (3) Slots: if isUnderstood, dictionary of slot keys and values that were inferred
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
        /// </returns>
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
            try
            {
                Porcupine porcupine = Porcupine.FromKeywordPaths(accessKey,
                    keywordPaths: new List<string> { keywordPath },
                    modelPath: porcupineModelPath,
                    sensitivities: new List<float> { porcupineSensitivity });

                Rhino rhino = Rhino.Create(accessKey,
                    contextPath: contextPath,
                    modelPath: rhinoModelPath,
                    sensitivity: rhinoSensitivity,
                    endpointDurationSec: endpointDurationSec,
                    requireEndpoint: requireEndpoint);

                if (wakeWordCallback == null)
                {
                    throw new PicovoiceInvalidArgumentException("'wakeWordCallback' must be set.");
                }

                if (inferenceCallback == null)
                {
                    throw new PicovoiceInvalidArgumentException("'inferenceCallback' must be set.");
                }

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
        /// Processes a frame of the incoming audio stream. Upon detection of wake word and completion of follow-on command
        /// inference invokes user-defined callbacks.
        /// </summary>
        /// <param name="pcm">
        /// A frame of audio samples. The number of samples per frame can be found by calling `.FrameLength`.
        /// The incoming audio needs to have a sample rate equal to `.SampleRate` and be 16-bit linearly-encoded.
        /// Picovoice operates on single-channel audio.
        /// </param>
        public void Process(short[] pcm)
        {
            if (pcm.Length != FrameLength)
            {
                throw new PicovoiceInvalidArgumentException(string.Format("Input audio frame size ({0}) was not the size specified by Picovoice engine ({1}). ", pcm.Length, FrameLength) +
                    "Use picovoice.FrameLength to get the correct size.");
            }

            if (_porcupine == null || _rhino == null)
            {
                throw new PicovoiceInvalidStateException("Cannot process frame - resources have been released.");
            }

            if (!_isWakeWordDetected)
            {
                int keywordIndex = _porcupine.Process(pcm);
                if (keywordIndex >= 0)
                {
                    _isWakeWordDetected = true;
                    _wakeWordCallback.Invoke();
                }
            }
            else
            {
                bool isFinalized = _rhino.Process(pcm);
                if (isFinalized)
                {
                    _isWakeWordDetected = false;
                    _inferenceCallback.Invoke(_rhino.GetInference());
                }
            }
        }

        /// <summary>
        /// Frees memory that was allocated for Picovoice
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
        }

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

        ~Picovoice()
        {
            Dispose();
        }
    }
}
