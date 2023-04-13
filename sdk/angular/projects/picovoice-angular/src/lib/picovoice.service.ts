/*
  Copyright 2022-2023 Picovoice Inc.

  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
  file accompanying this source.

  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
*/

import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import {
  PicovoiceOptions,
  PicovoiceWorker,
  PorcupineDetection,
  PorcupineKeyword,
  PorcupineModel,
  RhinoContext,
  RhinoInference,
  RhinoModel,
} from '@picovoice/picovoice-web';
import { WebVoiceProcessor } from '@picovoice/web-voice-processor';

@Injectable({
  providedIn: 'root',
})
export class PicovoiceService implements OnDestroy {
  public wakeWordDetection$: Subject<PorcupineDetection> = new Subject<PorcupineDetection>();
  public inference$: Subject<RhinoInference> = new Subject<RhinoInference>();

  public contextInfo$: Subject<string | null> = new Subject<string | null>();
  public isLoaded$: Subject<boolean> = new Subject<boolean>();
  public isListening$: Subject<boolean> = new Subject<boolean>();
  public error$: Subject<Error | null> = new Subject<Error | null>();

  private picovoice: PicovoiceWorker | null = null;

  constructor() {}

  public async init(
    accessKey: string,
    keyword: PorcupineKeyword,
    porcupineModel: PorcupineModel,
    context: RhinoContext,
    rhinoModel: RhinoModel,
    options: PicovoiceOptions = {}
  ): Promise<void> {
    if (options.processErrorCallback) {
      console.warn(
        'The `processErrorCallback` option is only supported in the Picovoice Web SDK. ' +
          'Use the `error` state to monitor for errors in the Angular SDK.'
      );
    }
    try {
      if (!this.picovoice) {
        this.picovoice = await PicovoiceWorker.create(
          accessKey,
          keyword,
          (detection: PorcupineDetection) =>
            this.wakeWordDetection$.next(detection),
          porcupineModel,
          context,
          (inference: RhinoInference) => this.inference$.next(inference),
          rhinoModel,
          { ...options, processErrorCallback: (error: Error) => this.error$.next(error) }
        );
        this.contextInfo$.next(this.picovoice.contextInfo);
        this.isLoaded$.next(true);
        this.error$.next(null);
      }
    } catch (error: any) {
      this.error$.next(error);
    }
  }

  public async start(): Promise<void> {
    if (this.picovoice === null) {
      this.error$.next(
        new Error('Picovoice has not been initialized or has been released')
      );
      return;
    }

    try {
      await WebVoiceProcessor.subscribe(this.picovoice);
      this.isListening$.next(true);
      this.error$.next(null);
    } catch (error: any) {
      this.error$.next(error);
      this.isListening$.next(false);
    }
  }

  public async stop(): Promise<void> {
    if (this.picovoice === null) {
      this.error$.next(
        new Error('Picovoice has not been initialized or has been released')
      );
      return;
    }

    try {
      await WebVoiceProcessor.unsubscribe(this.picovoice);
      this.isListening$.next(false);
      this.error$.next(null);
    } catch (error: any) {
      this.error$.next(error);
      this.isListening$.next(true);
    }
  }

  public async release(): Promise<void> {
    if (this.picovoice) {
      await this.stop();
      this.picovoice.terminate();
      this.picovoice = null;

      this.isLoaded$.next(false);
    }
  }

  async ngOnDestroy(): Promise<void> {
    await this.release();
  }
}
