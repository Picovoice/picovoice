import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

import WebVoiceProcessor from '@picovoice/web-voice-processor';
import type {
  RhinoInference,
  PicovoiceWorker,
  PicovoiceWorkerResponse,
  PicovoiceWorkerArgs,
  PicovoiceWorkerFactory,
} from './picovoice_types';

@Injectable({
  providedIn: 'root',
})
export class PicovoiceService implements OnDestroy {
  public webVoiceProcessor: WebVoiceProcessor;
  public isInit = false;
  public keyword$: Subject<string> = new Subject<string>();
  public inference$: Subject<RhinoInference> = new Subject<RhinoInference>();
  private picovoiceWorker: PicovoiceWorker;

  constructor() {}

  public pause(): boolean {
    if (this.webVoiceProcessor !== null) {
      this.webVoiceProcessor.pause();
      return true;
    }
    return false;
  }

  public start(): boolean {
    if (this.webVoiceProcessor !== null) {
      this.webVoiceProcessor.start();
      return true;
    }
    return false;
  }

  public resume(): boolean {
    if (this.webVoiceProcessor !== null) {
      this.webVoiceProcessor.resume();
      return true;
    }
    return false;
  }

  public async release(): Promise<void> {
    if (this.picovoiceWorker !== null) {
      this.picovoiceWorker.postMessage({ command: 'release' });
    }
    if (this.webVoiceProcessor !== null) {
      await this.webVoiceProcessor.release();
    }
    this.isInit = false;
  }

  public async init(
    picovoiceWorkerFactory: PicovoiceWorkerFactory,
    picovoiceWorkerArgs: PicovoiceWorkerArgs
  ): Promise<void> {
    if (this.isInit) {
      throw new Error('Picovoice is already initialized');
    }
    this.isInit = true;

    try {
      this.picovoiceWorker = await picovoiceWorkerFactory.create(
        picovoiceWorkerArgs
      );
      this.picovoiceWorker.onmessage = (
        message: MessageEvent<PicovoiceWorkerResponse>
      ) => {
        switch (message.data.command) {
          case 'ppn-keyword': {
            this.keyword$.next(message.data.keywordLabel);
            break;
          }
          case 'rhn-inference': {
            this.inference$.next(message.data.inference);
            break;
          }
        }
      };
    } catch (error) {
      this.isInit = false;
      throw error;
    }

    try {
      this.webVoiceProcessor = await WebVoiceProcessor.init({
        engines: [this.picovoiceWorker],
        start: picovoiceWorkerArgs.start,
      });
    } catch (error) {
      this.picovoiceWorker.postMessage({ command: 'release' });
      this.picovoiceWorker = null;
      this.isInit = false;
      throw error;
    }
  }

  async ngOnDestroy() {
    this.release();
  }
}
