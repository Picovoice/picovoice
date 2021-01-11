//
// Copyright 2020 Picovoice Inc.
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

/**
 * Picovoice constructor
 *
 * @param keywordPath Absolute path to Porcupine's keyword model file.
 * @param wakeWordCallback User-defined callback invoked upon detection of the wake phrase.
 * The callback accepts no input arguments.
 * @param contextPath Absolute path to file containing context parameters. A context represents the set of
 * expressions(spoken commands), intents, and intent arguments(slots) within a domain of interest.
 * @param inferenceCallback User-defined callback invoked upon completion of intent inference. The callback
 * accepts a single JSON that is populated with the following items:
 * (1) `isUnderstood`: if isFinalized, whether Rhino understood what it heard based on the context
 * (2) `intent`: if isUnderstood, name of intent that were inferred
 * (3) `slots`: if isUnderstood, dictionary of slot keys and values that were inferred
 * @param porcupineModelPath Absolute path to the file containing Porcupine's model parameters.
 * @param porcupineSensitivity Wake word detection sensitivity. It should be a number within [0, 1]. A higher
 * sensitivity results in fewer misses at the cost of increasing the false alarm rate.
 * @param rhinoModelPath Absolute path to the file containing Rhino's model parameters.
 * @param Inference sensitivity. It should be a number within [0, 1]. A higher sensitivity value
 * results in fewer misses at the cost of(potentially) increasing the erroneous inference rate.
 * @returns an instance of the Picovoice end-to-end platform.
 */
class PicovoiceManager {
  private _voiceProcessor: VoiceProcessor;
  private _picovoice: Picovoice | null;
  private _bufferListener?: EventSubscription;
  private _bufferEmitter: NativeEventEmitter;

  static async create(
    keywordPath: string,
    wakeWordCallback: WakeWordCallback,
    contextPath: string,
    inferenceCallback: InferenceCallback,
    porcupineSensitivity: number = 0.5,
    rhinoSensitivity: number = 0.5,
    porcupineModelPath?: string,
    rhinoModelPath?: string
  ) {
    let picovoice = await Picovoice.create(
      keywordPath,
      wakeWordCallback,
      contextPath,
      inferenceCallback,
      porcupineSensitivity,
      rhinoSensitivity,
      porcupineModelPath,
      rhinoModelPath
    );
    return new PicovoiceManager(picovoice);
  }

  constructor(picovoice: Picovoice) {
    this._picovoice = picovoice;
    this._voiceProcessor = VoiceProcessor.getVoiceProcessor(
      picovoice.frameLength,
      picovoice.sampleRate
    );
    this._bufferEmitter = new NativeEventEmitter(BufferEmitter);

    const bufferProcess = async (buffer: number[]) => {
      if (this._picovoice === null) return;

      try {
        await this._picovoice.process(buffer);
      } catch (e) {
        console.error(e);
      }
    };

    this._bufferListener = this._bufferEmitter.addListener(
      BufferEmitter.BUFFER_EMITTER_KEY,
      async (buffer: number[]) => {
        await bufferProcess(buffer);
      }
    );
  }

  /**
   * Opens audio input stream and sends audio frames to Picovoice
   */
  async start() {
    return this._voiceProcessor.start();
  }

  /**
   * Closes audio stream
   */
  async stop() {
    return this._voiceProcessor.stop();
  }

  /**
   * Releases resources and listeners
   */
  delete() {
    this._bufferListener?.remove();
    if (this._picovoice != null) {
      this._picovoice.delete();
      this._picovoice = null;
    }
  }
}

export default PicovoiceManager;
