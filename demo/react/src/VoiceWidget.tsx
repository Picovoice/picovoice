import { useState } from "react";
import { usePicovoice } from "@picovoice/picovoice-react";

import picovoiceModels from "./lib/picovoiceModels";
import porcupineWakeWord from "./lib/porcupineWakeWord";
import rhinoContext from "./lib/rhinoContext";

const [porcupineModel, rhinoModel] = picovoiceModels;

export default function VoiceWidget() {
  const [inputValue, setInputValue] = useState("");
  const contextName = rhinoContext.publicPath.split("/").pop()?.replace("_wasm.rhn", "");
  const {
    wakeWordDetection,
    inference,
    contextInfo,
    isLoaded,
    isListening,
    error,
    init,
    start,
    stop,
    release,
  } = usePicovoice();

  return (
    <div className="voice-widget">
      <h2>VoiceWidget</h2>
      <h3>
        <label>
          AccessKey obtained from{" "}
          <a href="https://console.picovoice.ai/">Picovoice Console</a>:
          <input
            type="text"
            name="accessKey"
            onChange={(value) => setInputValue(value.target.value)}
          />
        </label>
        <button
          className="start-button"
          onClick={async () =>
            await init(
              inputValue,
              porcupineWakeWord,
              porcupineModel,
              rhinoContext,
              rhinoModel
            )
          }
        >
          Init Picovoice
        </button>
      </h3>
      <h3>Picovoice Loaded: {JSON.stringify(isLoaded)}</h3>
      <h3>Listening: {JSON.stringify(isListening)}</h3>
      <h3>Error: {JSON.stringify(error !== null)}</h3>
      {error !== null && (
        <p className="error-message">{error.message}</p>
      )}
      <br />
      <button
        onClick={async () => await start()}
        disabled={error !== null || !isLoaded || isListening}
      >
        Start
      </button>
      <button
        onClick={async () => await stop()}
        disabled={error !== null || !isLoaded || !isListening}
      >
        Stop
      </button>

      <button
        onClick={async () => await release()}
        disabled={error !== null || !isLoaded || isListening}
      >
        Release
      </button>

      {isListening && (
        <>
          {wakeWordDetection ? (
            <h3>Wake word detected!</h3>
          ) : (
            <h3>Listening for the wake word '{porcupineWakeWord.label}'...</h3>
          )}
        </>
      )}
      {isListening && inference && (
        <>
          <h3>Inference:</h3>
          <pre>{JSON.stringify(inference, null, 2)}</pre>
        </>
      )}
      <hr />
      <h3>Context Name: {contextName}</h3>
      <h3>Context Info: </h3>
      <pre>{contextInfo}</pre>
    </div>
  );
}
