import { useEffect, useState } from "react";
import { usePicovoice } from "@picovoice/picovoice-react";
import {
  PorcupineKeyword,
  PorcupineModel,
  RhinoContext,
  RhinoModel,
} from "@picovoice/picovoice-web";

export default function VoiceWidget() {
  const [inputValue, setInputValue] = useState("");

  const porcupineKeyword: PorcupineKeyword = {
    label: "picovoice",
    publicPath: "picovoice_wasm.ppn",
  };

  const porcupineModel: PorcupineModel = {
    publicPath: "porcupine_params.pv",
  };

  const rhinoContext: RhinoContext = {
    publicPath: "clock_wasm.rhn",
  };

  const rhinoModel: RhinoModel = {
    publicPath: "rhino_params.pv",
  };

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

  useEffect(() => {
    return () => {
      release();
    };
  }, []);

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
              porcupineKeyword,
              porcupineModel,
              rhinoContext,
              rhinoModel
            )
          }
        >
          Start Picovoice
        </button>
      </h3>
      <h3>Picovoice Loaded: {JSON.stringify(isLoaded)}</h3>
      <h3>Listening: {JSON.stringify(isListening)}</h3>
      <h3>Error: {JSON.stringify(error !== null)}</h3>
      {error !== null && (
        <p className="error-message">{JSON.stringify(error)}</p>
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

      {wakeWordDetection ? (
        <h3>Wake word detected!</h3>
      ) : (
        <h3>Listening for the wake word 'Picovoice'...</h3>
      )}

      <h3>Inference:</h3>
      {inference && <pre>{JSON.stringify(inference, null, 2)}</pre>}
      <hr />
      <h3>Context info</h3>
      <pre>{contextInfo}</pre>
    </div>
  );
}
