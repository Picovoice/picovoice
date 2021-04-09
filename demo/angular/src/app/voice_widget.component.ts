import { Component } from "@angular/core"
import { Subscription } from "rxjs"

import { PicovoiceService } from "@picovoice/picovoice-web-angular"
import { PicovoiceServiceArgs, RhinoInference } from "@picovoice/picovoice-web-angular/lib/picovoice_types"
import { ALARM_CLOCK_64 } from "./rhino_context"

@Component({
  selector: 'voice-widget',
  templateUrl: './voice_widget.component.html',
  styleUrls: ['./voice_widget.component.scss']
})
export class VoiceWidget {
  private keywordDetection: Subscription
  private inferenceDetection: Subscription
  private listeningDetection: Subscription
  private errorDetection: Subscription
  private isErrorDetection: Subscription

  title: "voice-widget"
  isChunkLoaded: boolean = false
  isLoaded: boolean = false
  isError: boolean = false
  error: Error | string | null = null
  isListening: boolean | null = null
  isTalking: boolean = false
  errorMessage: string
  detections: string[] = []
  inference: RhinoInference | null = null
  picovoiceServiceArgs: PicovoiceServiceArgs = {
    rhinoContext: {
      base64:
        ALARM_CLOCK_64
    },
    porcupineKeyword: {
      builtin: "Picovoice",
    }
  }
  contextInfo: string | null

  constructor(private picovoiceService: PicovoiceService) {
    // Subscribe to Porcupine keyword detections
    // Store each detection so we can display it in an HTML list
    this.keywordDetection = picovoiceService.keyword$.subscribe(
      keyword => {
        this.detections = [...this.detections, keyword]
        this.inference = null
        console.log(keyword)
      })

    // Subscribe to Rhino inference detections for follow-on commands
    this.inferenceDetection = picovoiceService.inference$.subscribe(
      inference => {
        this.inference = inference
        console.log(inference)
      })

    // Subscribe to listening, isError, and error message
    this.listeningDetection = picovoiceService.listening$.subscribe(
      listening => {
        this.isListening = listening
      })
    this.errorDetection = picovoiceService.error$.subscribe(
      error => {
        this.error = error
      })
    this.isErrorDetection = picovoiceService.isError$.subscribe(
      isError => {
        this.isError = isError
      })
  }

  async ngOnInit() {
    // Dynamically load Picovoice worker chunk with specific language model (large ~4-6MB chunk)
    const picovoiceFactoryEn = (await import('@picovoice/picovoice-web-en-worker')).PicovoiceWorkerFactory
    this.isChunkLoaded = true
    console.info("Picovoice EN is loaded.")
    // Initialize Picovoice Service
    try {
      await this.picovoiceService.init(picovoiceFactoryEn, this.picovoiceServiceArgs)
      console.info("Picovoice is ready!")
      this.isLoaded = true;
      this.contextInfo = this.picovoiceService.contextInfo
    }
    catch (error) {
      console.error(error)
      this.isError = true;
      this.errorMessage = error.toString();
    }
  }

  ngOnDestroy() {
    this.keywordDetection.unsubscribe()
    this.inferenceDetection.unsubscribe()
    this.listeningDetection.unsubscribe()
    this.errorDetection.unsubscribe()
    this.isErrorDetection.unsubscribe()
    this.picovoiceService.release()
  }

  public pause() {
    this.picovoiceService.pause();
  }

  public resume() {
    this.picovoiceService.resume();
  }

  public start() {
    this.picovoiceService.start();
  }
}
