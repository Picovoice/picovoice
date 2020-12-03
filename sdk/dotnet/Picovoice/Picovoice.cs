/*
    Copyright 2020 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

using System;
using System.Collections.Generic;
using System.IO;

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
        private readonly Porcupine _porcupine;
        private readonly Action _wakeWordCallback;        
        private readonly Rhino _rhino;
        private readonly Action<Inference> _inferenceCallback;

        private bool _isWakeWordDetected = false;

        /// <summary>
        /// Constructor
        /// </summary>
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
        /// (1) `is_understood` is a flag indicating if the spoken command is understood.
        /// (2) `intent` is the inferred intent from the voice command.If the command is not understood then it's set to `None`.
        /// (3) `slots` is a dictionary mapping slot keys to their respective values.If the command is not understood then
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
        /// <returns>An instance of the Picovoice end-to-end platform.</returns>     
        public Picovoice(string keywordPath, Action wakeWordCallback, 
                         string contextPath, Action<Inference> inferenceCallback,
                         string porcupineModelPath = null, float porcupineSensitivity = 0.5f,
                         string rhinoModelPath = null, float rhinoSensitivity = 0.5f)
        {

            if (!File.Exists(keywordPath))
            {
                throw new ArgumentException($"Couldn't find Porcupine's keyword file at '{keywordPath}'.");
            }
            
            if (!File.Exists(contextPath)) 
            {
                throw new ArgumentException($"Couldn't find Rhino's context file at '{contextPath}'.");
            }            

            if (porcupineModelPath != null && !File.Exists(porcupineModelPath)) 
            {
                throw new ArgumentException($"Couldn't find Porcupine's model file at '{porcupineModelPath}'.");
            }

            if (porcupineSensitivity < 0 || porcupineSensitivity > 1) 
            {
                throw new ArgumentException("Porcupine's sensitivity should be within [0, 1].");
            }

            if (rhinoModelPath != null && !File.Exists(rhinoModelPath))
            {
                throw new ArgumentException($"Couldn't find Rhino's model file at '{rhinoModelPath}'.");
            }

            if (rhinoSensitivity < 0 || rhinoSensitivity > 1)
            {
                throw new ArgumentException("Rhino's sensitivity should be within [0, 1].");
            }

            _wakeWordCallback = wakeWordCallback ?? throw new ArgumentNullException("wakeWordCallback");
            _inferenceCallback = inferenceCallback ?? throw new ArgumentNullException("inferenceCallback");

            _porcupine = Porcupine.Create(modelPath: porcupineModelPath,
                                          keywordPaths: new List<string> { keywordPath },
                                          sensitivities: new List<float> { porcupineSensitivity });
            
            _rhino = Rhino.Create(contextPath: contextPath,
                                  modelPath: rhinoModelPath,
                                  sensitivity: rhinoSensitivity);
            
            if (_porcupine.SampleRate != _rhino.SampleRate) 
            {
                throw new ArgumentException("Porcupine and Rhino sample rates are different.");
            }
            SampleRate = _porcupine.SampleRate;

            if (_porcupine.FrameLength != _rhino.FrameLength)
            {
                throw new ArgumentException("Porcupine and Rhino frame lengths are different.");
            }
            FrameLength = _porcupine.FrameLength;
        }

        /// <summary>
        /// Releases resources that were acquired by Picovoice.
        /// </summary>
        public void Dispose()
        {
            _porcupine?.Dispose();
            _rhino?.Dispose();

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
            if (pcm.Length != FrameLength) 
            {
                throw new ArgumentException($"Invalid frame length. expected {FrameLength} but received {pcm.Length}");
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
        /// Audio sample rate accepted by Picovoice.
        /// </summary>
        public int SampleRate { get; }

        /// <summary>
        /// Number of audio samples per frame.
        /// </summary>
        public int FrameLength { get; }

        /// <summary>
        /// Version
        /// </summary>
        public string Version => "1.1.0";

        public override string ToString()
        {
            return $"Picovoice {Version} {{Porcupine {_porcupine?.Version}, Rhino {_rhino.Version}}}";
        }        
    }
}
