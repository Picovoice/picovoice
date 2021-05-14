import { useState, useEffect } from "react";
import { usePicovoice } from "@picovoice/picovoice-web-react";

import { CLOCK_EN_64 } from "./dist/rhn_contexts_base64";

export default function VoiceWidget() {
  const [isChunkLoaded, setIsChunkLoaded] = useState(false);
  const [workerChunk, setWorkerChunk] = useState({ workerFactory: null });

  useEffect(() => {
    async function loadPorcupineWorkerChunk() {
      const pvWorkerFactory = (
        await import("@picovoice/picovoice-web-en-worker")
      ).PicovoiceWorkerFactory; // <-- Dynamically import the worker
      console.log("Picovoice worker chunk is loaded.");
      return pvWorkerFactory;
    }
    if (workerChunk.workerFactory === null) {
      // <-- We only want to load once!
      loadPorcupineWorkerChunk().then((ppnWorkerFactory) => {
        setWorkerChunk({ workerFactory: ppnWorkerFactory });
        setIsChunkLoaded(true);
      });
    }
  }, [workerChunk]);

  const [keywordDetections, setKeywordDetections] = useState([]);
  const [inference, setInference] = useState(null);

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
    resume,
    pause,
    engine,
  } = usePicovoice(
    workerChunk.workerFactory, // <-- When this is null/undefined, it's ignored. Otherwise, usePicovoice will start.
    {
      porcupineKeyword: "Bumblebee",
      rhinoContext: { base64: CLOCK_EN_64 },
    },
    keywordEventHandler,
    inferenceEventHandler
  );

  return (
    <div className="voice-widget">
      <h2>VoiceWidget</h2>
      <h3>Dynamic Import Loaded: {JSON.stringify(isChunkLoaded)}</h3>
      <h3>Loaded: {JSON.stringify(isLoaded)}</h3>
      <h3>Listening: {JSON.stringify(isListening)}</h3>
      <h3>Error: {JSON.stringify(isError)}</h3>
      <h3>Engine: {JSON.stringify(engine)}</h3>
      {isError && (
        <p className="error-message">{JSON.stringify(errorMessage)}</p>
      )}
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
        onClick={() => resume()}
        disabled={!isLoaded || isListening || isError}
      >
        Resume
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
      <pre>{JSON.stringify(inference, null, 2)}</pre>
      <br />
      <br />
      <br />
      <hr />
      <h2>Context info</h2>
      <pre>{contextInfo}</pre>
    </div>
  );
}
