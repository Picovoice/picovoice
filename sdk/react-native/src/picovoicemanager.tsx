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
