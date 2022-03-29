import { useState, useEffect } from "react";
import { usePicovoice } from "@picovoice/picovoice-web-react";

import { CLOCK_EN_64 } from "./dist/rhn_contexts_base64";

export default function VoiceWidget() {
  const [workerChunk, setWorkerChunk] = useState({ workerFactory: null });
  const [isChunkLoaded, setIsChunkLoaded] = useState(false);

  const [accessKey, setAccessKey] = useState("");
  const [inputValue, setInputValue] = useState("");

  const [keywordDetections, setKeywordDetections] = useState([]);
  const [inference, setInference] = useState(null);

  useEffect(() => {
    if (workerChunk.workerFactory === null) {
      let isCanceled = false;

      const loadPicovoice = async () => {
        const pvWorkerFactory = (
          await import("@picovoice/picovoice-web-en-worker")
        ).PicovoiceWorkerFactory;
        console.log("Picovoice worker chunk is loaded.");

        if (!isCanceled) {
          setWorkerChunk({ workerFactory: pvWorkerFactory });
          setIsChunkLoaded(true);
        }
      };

      loadPicovoice();

      return () => {
        isCanceled = true;
      };
    }
  }, [workerChunk]);

  const inferenceEventHandler = (rhinoInference) => {
    console.log(rhinoInference);
    setInference(rhinoInference);
  };

  const keywordEventHandler = (porcupineKeywordLabel) => {
    console.log(porcupineKeywordLabel);
    setKeywordDetections((x) => [...x, porcupineKeywordLabel]);
    setInference("...");
  };

  const {
    contextInfo,
    isLoaded,
    isListening,
    isError,
    errorMessage,
    start,
    pause,
    stop,
    engine,
  } = usePicovoice(
    workerChunk.workerFactory, // <-- When this is null/undefined, it's ignored. Otherwise, usePicovoice will start.
    {
      accessKey,
      porcupineKeyword: "Bumblebee",
      rhinoContext: { base64: CLOCK_EN_64 },
    },
    keywordEventHandler,
    inferenceEventHandler
  );

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
            disabled={isLoaded}
          />
        </label>
        <button className="start-button" onClick={() => setAccessKey(inputValue)} disabled={isLoaded}>
          Start Picovoice
        </button>
      </h3>
      <h3>Dynamic Import Loaded: {JSON.stringify(isChunkLoaded)}</h3>
      <h3>Picovoice Loaded: {JSON.stringify(isLoaded)}</h3>
      <h3>Listening: {JSON.stringify(isListening)}</h3>
      <h3>Error: {JSON.stringify(isError)}</h3>
      {isError && accessKey && (
        <p className="error-message">{JSON.stringify(errorMessage)}</p>
      )}
      <h3>Engine: {JSON.stringify(engine)}</h3>
      <br />
      <button
        onClick={() => start()}
        disabled={!isLoaded || isListening || isError}
      >
        Start
      </button>
      <button
        onClick={() => pause()}
        disabled={!isLoaded || !isListening || isError}
      >
        Pause
      </button>
      <button
        onClick={() => stop()}
        disabled={isError || !isListening || !isLoaded}
      >
        Stop
      </button>
      <h3>Keyword Detections (Listening for "Bumblebee"):</h3>
      {keywordDetections.length > 0 && (
        <ul>
          {keywordDetections.map((label, index) => (
            <li key={index}>{label}</li>
          ))}
        </ul>
      )}
      <h3>Inference:</h3>
      {inference !== null && <pre>{JSON.stringify(inference, null, 2)}</pre>}
      <hr />
      <h3>Context info</h3>
      <pre>{contextInfo}</pre>
    </div>
  );
}
