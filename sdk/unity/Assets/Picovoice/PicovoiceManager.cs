﻿//
// Copyright 2021-2023 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
// file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//

using System;

using UnityEngine;


namespace Pv.Unity
{

    public class PicovoiceManager
    {
        private Picovoice _picovoice;
        private Action<PicovoiceException> _processErrorCallback;


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
        /// </returns>
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
        /// <param name="processErrorCallback">Reports errors that are encountered while the engine is processing audio.</returns>
        public static PicovoiceManager Create(
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
            bool requireEndpoint = false,
            Action<PicovoiceException> processErrorCallback = null)
        {
            Picovoice picovoice = Picovoice.Create(
                accessKey,
                keywordPath,
                wakeWordCallback,
                contextPath,
                inferenceCallback,
                porcupineModelPath,
                porcupineSensitivity,
                rhinoModelPath,
                rhinoSensitivity,
                endpointDurationSec,
                requireEndpoint);

            return new PicovoiceManager(
                picovoice: picovoice,
                processErrorCallback: processErrorCallback);
        }


        /// <summary>
        /// PicovoiceManager constructor
        /// </summary>
        private PicovoiceManager(
            Picovoice picovoice,
            Action<PicovoiceException> processErrorCallback)
        {
            _picovoice = picovoice;
            _processErrorCallback = processErrorCallback;
        }

        /// <summary>
        /// Action to catch audio frames as voice processor produces them
        /// </summary>
        /// <param name="frame">Frame of audio</param>
        private void OnFrameCaptured(short[] frame)
        {
            if (_picovoice == null)
            {
                PicovoiceException ex = new PicovoiceInvalidStateException(
                    "Cannot capture frames - resources have been released.");
            }

            try
            {
                _picovoice.Process(frame);
            }
            catch (PicovoiceException ex)
            {
                if (_processErrorCallback != null)
                    _processErrorCallback(ex);
                else
                    Debug.LogError(ex.ToString());
            }
        }

        /// <summary>
        /// Checks to see whether PicovoiceManager is capturing audio or not
        /// </summary>
        /// <returns>whether PicovoiceManager is capturing audio or not</returns>
        public bool IsRecording => VoiceProcessor.Instance.IsRecording;

        /// <summary>
        /// Checks to see whether there are any audio capture devices available
        /// </summary>
        /// <returns>whether there are any audio capture devices available</returns>
        public bool IsAudioDeviceAvailable()
        {
            VoiceProcessor.Instance.UpdateDevices();
            return VoiceProcessor.Instance.CurrentDeviceIndex >= 0;
        }

        /// <summary>
        /// Starts audio capture and Picovoice processing
        /// </summary>
        public void Start()
        {
            if (_picovoice == null)
            {
                throw new PicovoiceInvalidStateException("Cannot start - resources have been released.");
            }

            VoiceProcessor.Instance.AddFrameListener(OnFrameCaptured);
            VoiceProcessor.Instance.StartRecording(_picovoice.FrameLength, _picovoice.SampleRate);
        }

        /// <summary>
        /// Stops audio capture and Picovoice processing
        /// </summary>
        public void Stop()
        {
            if (_picovoice == null)
            {
                throw new PicovoiceInvalidStateException("Cannot stop - resources have been released.");
            }

            VoiceProcessor.Instance.RemoveFrameListener(OnFrameCaptured);
            if (VoiceProcessor.Instance.NumFrameListeners == 0)
            {
                VoiceProcessor.Instance.StopRecording();
            }
        }

        /// <summary>
        /// Resets the internal state of Picovoice. It should be called before processing a new stream of audio 
        /// or when process was stopped while processing a stream of audio.
        /// </summary>
        public void Reset()
        {
            if (_picovoice == null)
            {
                throw new PicovoiceInvalidStateException("Cannot reset - resources have been released.");
            }

            _picovoice.Reset();
        }

        /// <summary>
        /// Frees memory that was allocated for Picovoice
        /// </summary>
        public void Dispose()
        {
            if (_picovoice != null)
            {
                _picovoice.Dispose();
                _picovoice = null;
            }
        }
    }
}
