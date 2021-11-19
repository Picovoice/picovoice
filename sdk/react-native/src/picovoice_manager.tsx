//
// Copyright 2020-2021 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
// file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//

import {
  VoiceProcessor,
  BufferEmitter,
} from '@picovoice/react-native-voice-processor';
import { Picovoice, WakeWordCallback, InferenceCallback } from './picovoice';

import { EventSubscription, NativeEventEmitter } from 'react-native';
import type * as PicovoiceExceptions from './picovoice_exceptions';

export type ProcessErrorCallback = (error: PicovoiceExceptions.PicovoiceException) => void;

/**
 * Picovoice constructor
 *
 * @param accessKey AccessKey obtained from Picovoice Console (https://console.picovoice.ai/.
 * @param keywordPath Absolute path to Porcupine's keyword model file.
 * @param wakeWordCallback User-defined callback invoked upon detection of the wake phrase.
 * The callback accepts no input arguments.
 * @param contextPath Absolute path to file containing context parameters. A context represents the set of
 * expressions(spoken commands), intents, and intent arguments(slots) within a domain of interest.
 * @param inferenceCallback User-defined callback invoked upon completion of intent inference. The callback
 * accepts a RhinoInference instasnce that is populated with the following items:
 * (1) `isUnderstood`: whether Rhino understood what it heard based on the context
 * (2) `intent`: if isUnderstood, name of intent that were inferred
 * (3) `slots`: if isUnderstood, dictionary of slot keys and values that were inferred
 * @param processErrorCallback Reports errors that are encountered while the engine is processing audio.
 * @param porcupineModelPath Absolute path to the file containing Porcupine's model parameters.
 * @param porcupineSensitivity Wake word detection sensitivity. It should be a number within [0, 1]. A higher
 * sensitivity results in fewer misses at the cost of increasing the false alarm rate.
 * @param rhinoModelPath Absolute path to the file containing Rhino's model parameters.
 * @param rhinoSensitivity It should be a number within [0, 1]. A higher sensitivity value
 * results in fewer misses at the cost of(potentially) increasing the erroneous inference rate.
 * @param requireEndpoint If true, Rhino requires an endpoint (chunk of silence) before finishing inference.
 * @returns an instance of the Picovoice end-to-end platform.
 */
class PicovoiceManager {
  private _voiceProcessor?: VoiceProcessor;
  private _picovoice?: Picovoice;

  private _accessKey: string;
  private _keywordPath: string;
  private _wakeWordCallback: WakeWordCallback;
  private _contextPath: string;
  private _inferenceCallback: InferenceCallback;
  private _processErrorCallback?: ProcessErrorCallback;
  private _porcupineSensitivity: number = 0.5;
  private _rhinoSensitivity: number = 0.5;
  private _porcupineModelPath?: string;
  private _rhinoModelPath?: string;
  private _requireEndpoint: boolean = true;


  private _bufferListener?: EventSubscription;
  private _bufferEmitter?: NativeEventEmitter;

  static create(
    accessKey: string,
    keywordPath: string,
    wakeWordCallback: WakeWordCallback,
    contextPath: string,
    inferenceCallback: InferenceCallback,
    processErrorCallback?: ProcessErrorCallback,
    porcupineSensitivity: number = 0.5,
    rhinoSensitivity: number = 0.5,
    porcupineModelPath?: string,
    rhinoModelPath?: string,
    requireEndpoint: boolean = true
  ) {    
    return new PicovoiceManager(
      accessKey,
      keywordPath, 
      wakeWordCallback, 
      contextPath, 
      inferenceCallback, 
      processErrorCallback,
      porcupineSensitivity, 
      rhinoSensitivity, 
      porcupineModelPath, 
      rhinoModelPath,
      requireEndpoint);
  }

  private constructor(
    accessKey: string,
    keywordPath: string,
    wakeWordCallback: WakeWordCallback,
    contextPath: string,
    inferenceCallback: InferenceCallback,
    processErrorCallback?: ProcessErrorCallback,
    porcupineSensitivity: number = 0.5,
    rhinoSensitivity: number = 0.5,
    porcupineModelPath?: string,
    rhinoModelPath?: string,
    requireEndpoint: boolean = true) {
      this._accessKey = accessKey;
      this._keywordPath = keywordPath;
      this._wakeWordCallback = wakeWordCallback;
      this._contextPath = contextPath;
      this._inferenceCallback = inferenceCallback;
      this._processErrorCallback = processErrorCallback;
      this._porcupineSensitivity = porcupineSensitivity;
      this._rhinoSensitivity = rhinoSensitivity;
      this._porcupineModelPath = porcupineModelPath;
      this._rhinoModelPath = rhinoModelPath;
      this._requireEndpoint = requireEndpoint;
  }

  /**
   * Opens audio input stream and sends audio frames to Picovoice
   */
  async start() {
    if(this._picovoice !== undefined){
      return;
    }

    this._picovoice = await Picovoice.create(
      this._accessKey,
      this._keywordPath,
      this._wakeWordCallback,
      this._contextPath,
      this._inferenceCallback,
      this._porcupineSensitivity,
      this._rhinoSensitivity,
      this._porcupineModelPath,
      this._rhinoModelPath,
      this._requireEndpoint)

    if(this._voiceProcessor === undefined) {
      this._voiceProcessor = VoiceProcessor.getVoiceProcessor(
        this._picovoice.frameLength,
        this._picovoice.sampleRate
      );
      this._bufferEmitter = new NativeEventEmitter(BufferEmitter);
    }

    const bufferProcess = async (buffer: number[]) => {
      if (this._picovoice === undefined) return;      
      try {
        await this._picovoice.process(buffer);
      } catch (e) {
        if (this._processErrorCallback !== undefined &&
            this._processErrorCallback !== null &&
            typeof(this._processErrorCallback) === 'function') {
            this._processErrorCallback(e as PicovoiceExceptions.PicovoiceException);
        } else {
          console.error(e);
        }
      }
    };

    this._bufferListener = this._bufferEmitter?.addListener(
      BufferEmitter.BUFFER_EMITTER_KEY,
      async (buffer: number[]) => {
        await bufferProcess(buffer);
      }
    );
    
    return this._voiceProcessor.start();
  }

  /**
   * Closes audio stream
   */
  async stop() {    
    this._bufferListener?.remove();
    this._picovoice?.delete();
    this._picovoice = undefined;
    return this._voiceProcessor?.stop();
  }
}

export default PicovoiceManager;
