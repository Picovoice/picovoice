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

  private readonly _accessKey: string;
  private readonly _keywordPath: string;
  private readonly _wakeWordCallback: WakeWordCallback;
  private readonly _contextPath: string;
  private readonly _inferenceCallback: InferenceCallback;
  private readonly _processErrorCallback?: ProcessErrorCallback;
  private readonly _porcupineSensitivity: number = 0.5;
  private readonly _rhinoSensitivity: number = 0.5;
  private readonly _porcupineModelPath?: string;
  private readonly _rhinoModelPath?: string;
  private readonly _endpointDurationSec: number = 1.0;
  private readonly _requireEndpoint: boolean = true;

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
  public static create(
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
      endpointDurationSec,
      requireEndpoint
    );
  }

  /**
   * Private constructor
   */
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
    endpointDurationSec: number = 1.0,
    requireEndpoint: boolean = true
  ) {
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
    this._endpointDurationSec = endpointDurationSec;
    this._requireEndpoint = requireEndpoint;
    this._voiceProcessor = VoiceProcessor.instance;
    this._frameListener = async (frame: number[]) => {
      if (!this._picovoice) {
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
   * Opens audio input stream and sends audio frames to Picovoice
   */
  public async start(): Promise<void> {
    if (this._picovoice) {
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
      this._endpointDurationSec,
      this._requireEndpoint
    );

    if (await this._voiceProcessor.hasRecordAudioPermission()) {
      this._voiceProcessor.addFrameListener(this._frameListener);
      this._voiceProcessor.addErrorListener(this._errorListener);
      try {
        await this._voiceProcessor.start(
          this._picovoice.frameLength,
          this._picovoice.sampleRate
        );
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

  /**
   * Closes audio stream
   */
  public async stop(): Promise<void> {
    if (!this._picovoice) {
      return;
    }

    await this._picovoice?.delete();
    this._picovoice = undefined;

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
  }

  /**
   * Only available after a call to `.start()`
   * @returns the Rhino context source YAML.
   */
  get contextInfo() {
    return this._picovoice?.contextInfo;
  }
}

export default PicovoiceManager;
