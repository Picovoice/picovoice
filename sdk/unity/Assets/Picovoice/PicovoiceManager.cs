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

using System.IO;
using System.Collections;
using System.Collections.Generic;
using System;
using System.Linq;

using UnityEngine;
using UnityEngine.UI;


namespace Pv.Unity
{

    public class PicovoiceManager
    {
        private VoiceProcessor _voiceProcessor;
        private Picovoice _picovoice;
        private Action<Exception> _errorCallback;
        
        /// <summary>
        /// PicovoiceManager constructor
        /// </summary>
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
        /// </returns>
        /// <param name="errorCallback">Callback that triggers is the engine experiences a problem while processing audio.</param>
        /// <returns>An instance of PicovoiceManager.</returns>                             
        public static PicovoiceManager Create(string keywordPath, Action<int> wakeWordCallback,
                                              string contextPath, Action<Inference> inferenceCallback,
                                              string porcupineModelPath = null, float porcupineSensitivity = 0.5f,
                                              string rhinoModelPath = null, float rhinoSensitivity = 0.5f,
                                              Action<Exception> errorCallback = null)
        {
            Picovoice picovoice = Picovoice.Create(keywordPath, wakeWordCallback,
                                                   contextPath, inferenceCallback,
                                                   porcupineModelPath, porcupineSensitivity,
                                                   rhinoModelPath, rhinoSensitivity);
            return new PicovoiceManager(picovoice, errorCallback);
        }

        // private constructor
        private PicovoiceManager(Picovoice picovoice, Action<Exception> errorCallback = null)
        {
            _picovoice = picovoice;
            _errorCallback = errorCallback;

            _voiceProcessor = VoiceProcessor.Instance;
            _voiceProcessor.OnFrameCaptured += OnFrameCaptured;
        }

        /// <summary>
        /// Action to catch audio frames as voice processor produces them
        /// </summary>        
        /// <param name="pcm">Frame of pcm audio</param>        
        private void OnFrameCaptured(short[] pcm)
        {
            try
            {
                _picovoice.Process(pcm);
            }
            catch (Exception ex)
            {
                if (_errorCallback != null)
                    _errorCallback(ex);
                else
                    Debug.LogError(ex.ToString());
            }
        }

        /// <summary>
        /// Checks to see whether PicovoiceManager is capturing audio or not
        /// </summary>
        /// <returns>whether PicovoiceManager is capturing audio or not</returns>
        public bool IsRecording => _voiceProcessor.IsRecording;

        /// <summary>
        /// Checks to see whether there are any audio capture devices available
        /// </summary>
        /// <returns>whether there are any audio capture devices available</returns>
        public bool IsAudioDeviceAvailable() 
        {
            _voiceProcessor.UpdateDevices();
            return _voiceProcessor.CurrentDeviceIndex >= 0;
        }

        /// <summary>
        /// Starts audio capture and Picovoice processing
        /// </summary>
        public void Start()
        {
            if (_picovoice == null || _voiceProcessor == null)
            {
                throw new ObjectDisposedException("Picovoice", "Cannot start PicovoiceManager - resources have already been released");
            }

            _voiceProcessor.StartRecording(_picovoice.SampleRate, _picovoice.FrameLength);
        }

        /// <summary>
        /// Stops audio capture and Picovoice processing
        /// </summary>
        public void Stop()
        {
            if (_picovoice == null || _voiceProcessor == null)
            {
                throw new ObjectDisposedException("Picovoice", "Cannot start PicovoiceManager - resources have already been released");
            }
            _voiceProcessor.StopRecording();
        }

        /// <summary>
        /// Free resources that were allocated to Porcupine and the voice processor
        /// </summary>
        public void Delete()
        {
            if (_voiceProcessor != null)
            {
                if (_voiceProcessor.IsRecording)
                {
                    _voiceProcessor.StopRecording();
                }

                _voiceProcessor.OnFrameCaptured -= OnFrameCaptured;
                _voiceProcessor = null;
            }

            if (_picovoice != null)
            {
                _picovoice.Dispose();
                _picovoice = null;
            }
        }
    }
}