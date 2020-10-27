/*
    Copyright 2018-2020 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

// Callbacks are fired when the WASM has initialized. When both Porcupine and Rhino are ready, we signal the main thread that it can
// initialize the engines and start using them, via the "pv-init" status message.
let ppnReady = false;
let rhnReady = false;

const ppnReadyCallback = () => {
  ppnReady = true;
  ready();
};
const PorcupineOptions = { callback: ppnReadyCallback };

const rhnReadyCallback = () => {
  rhnReady = true;
  ready();
};
const RhinoOptions = { callback: rhnReadyCallback };

function ready() {
  if (ppnReady && rhnReady) {
    postMessage({ status: "pv-init" });
  }
}

importScripts("pv_porcupine.js");
importScripts("porcupine.js");

importScripts("pv_rhino.js");
importScripts("rhino.js");

onmessage = function (e) {
  switch (e.data.command) {
    case "init":
      init(e.data.keywordIDs, e.data.sensitivities, e.data.context);
      break;
    case "process":
      process(e.data.inputFrame);
      break;
    case "pause":
      paused = true;
      break;
    case "resume":
      paused = false;
      break;
    case "release":
      release();
      break;
  }
};

let isWakeWordDetected;
let paused;

let keywords;
let sensitivities;
let context;

let porcupine = null;
let rhino = null;

function init(_keywordIDs, _sensitivities, _context) {
  isWakeWordDetected = false;
  paused = false;

  let keywordIDArray = Object.values(_keywordIDs);
  keywords = Object.keys(_keywordIDs);
  sensitivities = _sensitivities;
  porcupine = Porcupine.create(keywordIDArray, _sensitivities);

  context = _context;
  rhino = Rhino.create(context);
}

function process(inputFrame) {
  if (porcupine !== null && rhino !== null && !paused) {
    if (!isWakeWordDetected) {
      let keywordIndex = porcupine.process(inputFrame);
      if (keywordIndex !== -1) {
        postMessage({
          keyword: keywords[keywordIndex],
        });
        isWakeWordDetected = true;
      }
    } else {
      let result = rhino.process(inputFrame);
      if ("isUnderstood" in result) {
        postMessage(result);
        isWakeWordDetected = false;
      }
    }
  }
}

function release() {
  if (porcupine !== null) {
    porcupine.release();
  }

  porcupine = null;

  if (rhino != null) {
    rhino.release();
  }

  rhino = null;
  close();
}
