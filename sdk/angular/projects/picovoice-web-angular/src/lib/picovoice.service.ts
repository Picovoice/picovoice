import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

import { WebVoiceProcessor } from '@picovoice/web-voice-processor';
import type {
  RhinoInference,
  PicovoiceWorker,
  PicovoiceWorkerResponse,
  PicovoiceWorkerFactory,
  PicovoiceServiceArgs,
} from './picovoice_types';

@Injectable({
  providedIn: 'root',
})
export class PicovoiceService implements OnDestroy {
  public webVoiceProcessor: WebVoiceProcessor | null = null;
  public isInit = false;
  public contextInfo: string | null = null;
  public keyword$: Subject<string> = new Subject<string>();
  public inference$: Subject<RhinoInference> = new Subject<RhinoInference>();
  public isError$: Subject<boolean> = new Subject<boolean>();
  public listening$: Subject<boolean> = new Subject<boolean>();
  public error$: Subject<Error | string | null> = new Subject<
    Error | string | null
  >();
  private picovoiceWorker: PicovoiceWorker | null = null;

  constructor() { }

  public pause(): boolean {
    if (this.webVoiceProcessor !== null) {
      this.webVoiceProcessor.pause();
      this.listening$.next(false);
      return true;
    }
    return false;
  }

  public start(): boolean {
    if (this.webVoiceProcessor !== null) {
      this.webVoiceProcessor.start();
      this.listening$.next(true);
      return true;
    }
    return false;
  }

  public resume(): boolean {
    if (this.webVoiceProcessor !== null) {
      this.webVoiceProcessor.resume();
      this.listening$.next(true);
      return true;
    }
    return false;
  }

  public async release(): Promise<void> {
    if (this.picovoiceWorker !== null) {
      this.picovoiceWorker.postMessage({ command: 'release' });
      this.picovoiceWorker = null;
    }
    if (this.webVoiceProcessor !== null) {
      await this.webVoiceProcessor.release();
      this.webVoiceProcessor = null;
    }
    this.isInit = false;
  }

  public async init(
    picovoiceWorkerFactory: PicovoiceWorkerFactory,
    picovoiceServiceArgs: PicovoiceServiceArgs
  ): Promise<void> {
    if (this.isInit) {
      throw new Error('Picovoice is already initialized');
    }
    this.isInit = true;

    try {
      this.picovoiceWorker = await picovoiceWorkerFactory.create({
        ...picovoiceServiceArgs,
        start: true,
      });
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
          case 'rhn-info': {
            this.contextInfo = message.data.info
            break;
          }
        }
      };
      this.picovoiceWorker.postMessage({ command: "info" })
    } catch (error) {
      this.isInit = false;
      this.isError$.next(true);
      this.error$.next(error);
      throw error;
    }

    try {
      this.webVoiceProcessor = await WebVoiceProcessor.init({
        engines: [this.picovoiceWorker],
        start: picovoiceServiceArgs.start,
      });
      this.listening$.next(picovoiceServiceArgs.start ?? true);
    } catch (error) {
      this.picovoiceWorker.postMessage({ command: 'release' });
      this.picovoiceWorker = null;
      this.isInit = false;
      this.isError$.next(true);
      this.error$.next(error);
      throw error;
    }
  }

  async ngOnDestroy() {
    this.release();
  }
}
