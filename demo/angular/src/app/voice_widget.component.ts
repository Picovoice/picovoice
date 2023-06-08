import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { PicovoiceService } from '@picovoice/picovoice-angular';
import { PorcupineDetection, RhinoInference } from '@picovoice/picovoice-web';

// @ts-ignore
import picovoiceModels from '../lib/picovoiceModels';

// @ts-ignore
import porcupineWakeWord from '../lib/porcupineWakeWord';

// @ts-ignore
import rhinoContext from '../lib/rhinoContext';

const [porcupineModel, rhinoModel] = picovoiceModels;

@Component({
  selector: 'app-voice-widget',
  templateUrl: './voice_widget.component.html',
  styleUrls: ['./voice_widget.component.scss'],
})
export class VoiceWidget implements OnDestroy {

  contextName: string = rhinoContext.publicPath
    .split("/")
    .pop()
    .replace("_wasm.rhn", "");
  wakeWordName: string = porcupineWakeWord.label;

  isLoaded = false;
  isListening = false;
  contextInfo: string | null = null;
  error: Error | null = null;
  wakeWordDetection: PorcupineDetection | null = null;
  inference: RhinoInference | null = null;
  private wakeWordDetectionSubscription: Subscription;
  private inferenceSubscription: Subscription;
  private contextInfoSubscription: Subscription;
  private isLoadedSubscription: Subscription;
  private isListeningSubscription: Subscription;
  private errorSubscription: Subscription;

  constructor(private picovoiceService: PicovoiceService) {
    this.wakeWordDetectionSubscription = picovoiceService.wakeWordDetection$.subscribe(
      (wakeWordDetection: PorcupineDetection) => {
        this.inference = null;
        this.wakeWordDetection = wakeWordDetection;
      }
    );

    this.inferenceSubscription = picovoiceService.inference$.subscribe(
      (inference: RhinoInference) => {
        this.wakeWordDetection = null;
        this.inference = inference;
      }
    );

    this.contextInfoSubscription = picovoiceService.contextInfo$.subscribe(
      (contextInfo: string | null) => {
        this.contextInfo = contextInfo;
      }
    );

    this.isLoadedSubscription = picovoiceService.isLoaded$.subscribe(
      (isLoaded: boolean) => {
        this.isLoaded = isLoaded;
      }
    );
    this.isListeningSubscription = picovoiceService.isListening$.subscribe(
      (isListening: boolean) => {
        this.isListening = isListening;
      }
    );
    this.errorSubscription = picovoiceService.error$.subscribe(
      (error: Error | null) => {
        this.error = error;
      }
    );
  }
  ngOnDestroy(): void {
    this.wakeWordDetectionSubscription.unsubscribe();
    this.inferenceSubscription.unsubscribe();
    this.contextInfoSubscription.unsubscribe();
    this.isLoadedSubscription.unsubscribe();
    this.isListeningSubscription.unsubscribe();
    this.errorSubscription.unsubscribe();
    this.picovoiceService.release();
  }

  public async stop(): Promise<void> {
    await this.picovoiceService.stop();
  }

  public async start(): Promise<void> {
    await this.picovoiceService.start();
  }

  public async initEngine(accessKey: string): Promise<void> {
    if (accessKey.length >= 0) {
      await this.picovoiceService.init(
        accessKey,
        porcupineWakeWord,
        porcupineModel,
        rhinoContext,
        rhinoModel
      );
      try {
      } catch (error: any) {
        this.error = error;
      }
    }
  }

  public async release(): Promise<void> {
    await this.picovoiceService.release();
  }
}
