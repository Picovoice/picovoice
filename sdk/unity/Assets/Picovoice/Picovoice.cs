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
        /// <param name="requireEndpoint">
        /// Boolean variable to indicate if Rhino should wait for a chunk of silence before finishing inference.
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
                    requireEndpoint: requireEndpoint);
            
                if (porcupine.FrameLength != rhino.FrameLength)
                {
                    throw new PicovoiceInvalidArgumentException("Porcupine and Rhino frame lengths are different");
                }

                if (porcupine.SampleRate != rhino.SampleRate) 
                {
                    throw new PicovoiceInvalidArgumentException("Porcupine and Rhino sample rate are different");
                }

                return new Picovoice(porcupine, wakeWordCallback, rhino, inferenceCallback);
            }
            catch (Exception ex)
            {
                mapToPicovoiceException(ex);
                return null;
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
        private static void mapToPicovoiceException(Exception ex)
        {
            if (ex is PorcupineActivationException || ex is RhinoActivationException) 
            {
                throw new PicovoiceActivationException(ex.Message);
            }
            else if (ex is PorcupineActivationLimitException || ex is RhinoActivationLimitException) 
            {
                throw new PicovoiceActivationLimitException(ex.Message);
            } 
            else if (ex is PorcupineActivationRefusedException || ex is RhinoActivationRefusedException)
            {
                throw new PicovoiceActivationRefusedException(ex.Message);
            } 
            else if (ex is PorcupineActivationThrottledException || ex is RhinoActivationThrottledException) 
            {
                throw new PicovoiceActivationThrottledException(ex.Message);
            } 
            else if (ex is PorcupineInvalidArgumentException || ex is RhinoInvalidArgumentException) 
            {
                throw new PicovoiceInvalidArgumentException(ex.Message);
            } 
            else if (ex is PorcupineInvalidStateException || ex is RhinoInvalidStateException)
            {
                throw new PicovoiceInvalidStateException(ex.Message);
            } 
            else if (ex is PorcupineIOException || ex is RhinoIOException)
            {
                throw new PicovoiceIOException(ex.Message);
            } 
            else if (ex is PorcupineKeyException || ex is RhinoKeyException)
            {
                throw new PicovoiceKeyException(ex.Message);
            } 
            else if (ex is PorcupineMemoryException || ex is RhinoMemoryException) 
            {
                throw new PicovoiceMemoryException(ex.Message);
            } 
            else if (ex is PorcupineRuntimeException || ex is RhinoRuntimeException)
            {
                throw new PicovoiceRuntimeException(ex.Message);
            } 
            else if (ex is PorcupineStopIterationException || ex is RhinoStopIterationException)
            {
                throw new PicovoiceStopIterationException(ex.Message);
            } 
            else if (ex is PorcupineException || ex is RhinoException)
            {
                throw new PicovoiceException(ex.Message);
            } 
            else
            {
                throw new PicovoiceException($"Unknown exception: '{ex.GetType().Name}', message: '{ex.Message}'");
            }
        }

        ~Picovoice()
        {
            Dispose();
        }
    }
}