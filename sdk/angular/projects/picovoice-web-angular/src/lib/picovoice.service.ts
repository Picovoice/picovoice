/*
  Copyright 2022 Picovoice Inc.

  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
  file accompanying this source.

  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
*/

import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

import { WebVoiceProcessor } from '@picovoice/web-voice-processor';
import type {
  PicovoiceWorker,
  PicovoiceWorkerResponse,
  PicovoiceWorkerFactory,
} from '@picovoice/picovoice-web-core';

import type { PorcupineKeyword } from '@picovoice/porcupine-web-core';

import type { RhinoContext, RhinoInference } from '@picovoice/rhino-web-core';
import {PicovoiceOptions, PorcupineDetection, PorcupineModel, RhinoModel} from '@picovoice/picovoice-web';

@Injectable({
  providedIn: 'root',
})
export class PicovoiceService implements OnDestroy {
  public contextInfo: string | null = null;
  public wakeWordDetection$: Subject<PorcupineDetection> = new Subject<PorcupineDetection>();
  public inference$: Subject<RhinoInference> = new Subject<RhinoInference>();
  public isLoaded: Subject<boolean> = new Subject<boolean>();
  public isListening: Subject<boolean> = new Subject<boolean>();
  public error$: Subject<Error | string | null> = new Subject<Error | string | null>();

  constructor() {}

  private wakeWordCallback(detection: PorcupineDetection): void {
    this.wakeWordDetection$.next(detection)
  }

  private inferenceCallback(inference: RhinoInference): void {
    this.inference$.next(inference)
  }

  public async init(
    accessKey: string,
    keyword: PorcupineKeyword,
    porcupineModel: PorcupineModel,
    context: RhinoContext,
    rhinoModel: RhinoModel,
    options: PicovoiceOptions = {}
  ): Promise<void> {

  }

  public async start(): Promise<void> {
    // if (this.webVoiceProcessor !== null) {
    //   await this.webVoiceProcessor.start();
    //   this.listening$.next(true);
    //   return true;
    // }
    // return false;
  }

  public async stop(): Promise<void> {
    // if (this.webVoiceProcessor !== null) {
    //   await this.webVoiceProcessor.stop();
    //   if (this.picovoiceWorker !== null) {
    //     this.picovoiceWorker.postMessage({ command: 'reset' });
    //     this.engine$.next('ppn');
    //   }
    //   this.listening$.next(false);
    //   return true;
    // }
    // return false;
  }

  public async release(): Promise<void> {
    // if (this.picovoiceWorker !== null) {
    //   this.picovoiceWorker.postMessage({ command: 'release' });
    //   this.picovoiceWorker = null;
    // }
    // if (this.webVoiceProcessor !== null) {
    //   await this.webVoiceProcessor.release();
    //   this.webVoiceProcessor = null;
    // }
    // this.isInit = false;
  }

  async ngOnDestroy() {
    this.release();
  }
}
