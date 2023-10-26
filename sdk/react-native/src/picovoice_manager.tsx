//
// Copyright 2020-2023 Picovoice Inc.
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
  VoiceProcessorError,
  VoiceProcessorErrorListener,
  VoiceProcessorFrameListener,
} from '@picovoice/react-native-voice-processor';
import { Picovoice, WakeWordCallback, InferenceCallback } from './picovoice';

import * as PicovoiceErrors from './picovoice_errors';

export type ProcessErrorCallback = (
  error: PicovoiceErrors.PicovoiceError
) => void;

class PicovoiceManager {
  private _voiceProcessor: VoiceProcessor;
  private readonly _errorListener: VoiceProcessorErrorListener;
  private readonly _frameListener: VoiceProcessorFrameListener;

  private _picovoice?: Picovoice;

  private readonly _processErrorCallback?: ProcessErrorCallback;
  private _isListening: boolean = false;

  /**
   * @param accessKey AccessKey obtained from Picovoice Console (https://console.picovoice.ai/.
   * @param keywordPath Absolute path to Porcupine's keyword model file.
   * @param wakeWordCallback User-defined callback invoked upon detection of the wake phrase.
   * The callback accepts no input arguments.
   * @param contextPath Absolute path to file containing context parameters. A context represents the set of
   * expressions(spoken commands), intents, and intent arguments(slots) within a domain of interest.
   * @param inferenceCallback User-defined callback invoked upon completion of intent inference. The callback
   * accepts a RhinoInference instance that is populated with the following items:
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
   * @param endpointDurationSec Endpoint duration in seconds. An endpoint is a chunk of silence at the end of an
   * utterance that marks the end of spoken command. It should be a positive number within [0.5, 5]. A lower endpoint
   * duration reduces delay and improves responsiveness. A higher endpoint duration assures Rhino doesn't return inference
   * pre-emptively in case the user pauses before finishing the request.
   * @param requireEndpoint If set to `true`, Rhino requires an endpoint (a chunk of silence) after the spoken command.
   * If set to `false`, Rhino tries to detect silence, but if it cannot, it still will provide inference regardless. Set
   * to `false` only if operating in an environment with overlapping speech (e.g. people talking in the background).
   * @returns an instance of the Picovoice end-to-end platform.
   */
  public static async create(
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
    endpointDurationSec: number = 1.0,
    requireEndpoint: boolean = true
  ): Promise<PicovoiceManager> {
    let picovoice = await Picovoice.create(
      accessKey,
      keywordPath,
      wakeWordCallback,
      contextPath,
      inferenceCallback,
      porcupineSensitivity,
      rhinoSensitivity,
      porcupineModelPath,
      rhinoModelPath,
      endpointDurationSec,
      requireEndpoint
    );
    return new PicovoiceManager(picovoice, processErrorCallback);
  }

  /**
   * Private constructor
   */
  private constructor(
    picovoice: Picovoice,
    processErrorCallback?: ProcessErrorCallback
  ) {
    this._picovoice = picovoice;
    this._processErrorCallback = processErrorCallback;
    this._voiceProcessor = VoiceProcessor.instance;

    this._frameListener = async (frame: number[]) => {
      if (!this._picovoice || !this._isListening) {
        return;
      }

      try {
        await this._picovoice.process(frame);
      } catch (e) {
        if (this._processErrorCallback) {
          this._processErrorCallback(e as PicovoiceErrors.PicovoiceError);
        } else {
          console.error(e);
        }
      }
    };

    this._errorListener = (error: VoiceProcessorError) => {
      if (this._processErrorCallback) {
        this._processErrorCallback(
          new PicovoiceErrors.PicovoiceError(error.message)
        );
      } else {
        console.error(error);
      }
    };
  }

  /**
   * Opens audio input stream and sends audio frames to Picovoice.
   */
  public async start(): Promise<void> {
    if (!this._picovoice) {
      throw new PicovoiceErrors.PicovoiceInvalidStateError(
        'Unable to start - resources have been released.'
      );
    }

    if (!this._isListening) {
      if (await this._voiceProcessor.hasRecordAudioPermission()) {
        this._voiceProcessor.addFrameListener(this._frameListener);
        this._voiceProcessor.addErrorListener(this._errorListener);
        try {
          await this._voiceProcessor.start(
            this._picovoice.frameLength,
            this._picovoice.sampleRate
          );
          this._isListening = true;
        } catch (e: any) {
          throw new PicovoiceErrors.PicovoiceRuntimeError(
            `Failed to start audio recording: ${e.message}`
          );
        }
      } else {
        throw new PicovoiceErrors.PicovoiceRuntimeError(
          'User did not give permission to record audio.'
        );
      }
    }
  }

  /**
   * Closes audio stream and resets Picovoice
   */
  public async stop(): Promise<void> {
    if (!this._picovoice) {
      throw new PicovoiceErrors.PicovoiceInvalidStateError(
        'Unable to stop - resources have been released.'
      );
    }
    if (this._isListening) {
      this._voiceProcessor.removeErrorListener(this._errorListener);
      this._voiceProcessor.removeFrameListener(this._frameListener);
      if (this._voiceProcessor.numFrameListeners === 0) {
        try {
          await this._voiceProcessor.stop();
        } catch (e: any) {
          throw new PicovoiceErrors.PicovoiceRuntimeError(
            `Failed to stop audio recording: ${e.message}`
          );
        }
      }
      this._isListening = false;
    }

    await this._picovoice?.reset();
  }

  /**
   * Resets the internal state of PicovoiceManager. It can be called to
   * return to the wake word detection state before an inference has completed.
   */
  public async reset(): Promise<void> {
    if (!this._picovoice) {
      throw new PicovoiceErrors.PicovoiceInvalidStateError(
        'Unable to reset - resources have been released.'
      );
    }

    await this._picovoice?.reset();
  }

  /**
   * Releases native resources that were allocated to PicovoiceManager.
   */
  public async delete(): Promise<void> {
    await this._picovoice?.delete();
    this._picovoice = undefined;
  }

  /**
   * @returns the Rhino context source YAML.
   */
  public get contextInfo(): string | undefined {
    return this._picovoice?.contextInfo;
  }
}

export default PicovoiceManager;
