import "./App.css";
import { useState } from "react";

import VoiceWidget from "./VoiceWidget";

function App() {
  const [show, setShow] = useState(true);
  return (
    <div className="App">
      <h1>
        Picovoice SDK for Web + React Hook ("usePicovoice" from
        @picovoice/picovoice-react)
      </h1>
      <button onClick={() => setShow(!show)}>
        Toggle VoiceWidget {show ? "OFF" : "ON"}
      </button>
      <br />
      <br />
      {show && <VoiceWidget />}
    </div>
  );
}

export default App;
