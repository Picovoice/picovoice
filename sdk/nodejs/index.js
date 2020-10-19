//
// Copyright 2020 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
// file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//
"use strict";

const Porcupine = require("@picovoice/porcupine-node");
const Rhino = require("@picovoice/rhino-node");

/**
 * Wraps the Picovoice Porcupine and Rhino engines.
 *
 * Performs the calls to the Rhino dynamic library via FFI. Does some basic parameter validation to prevent
 * errors occurring in the library layer. Provides clearer error messages in native JavaScript.
 */
class Picovoice {
  /**
   * Creates an instance of Rhino with a specific context.
   *
   * @param {string} keywordPath,
   * @param {function} wakeWordCallBack,
   * @param {string} contextPath,
   * @param {function} inferenceCallback,
   * @param {number} porcupineSensitivity = 0.5,
   * @param {number} rhinoSensitivity = 0.5,
   * @param {string} porcupineModelPath,
   * @param {string} porcupineLibraryPath,
   * @param {string} rhinoModelPath,
   * @param {string} rhinoLibraryPath,
   */
  constructor(
    keywordPath,
    wakeWordCallback,
    contextPath,
    inferenceCallback,
    porcupineSensitivity = 0.5,
    rhinoSensitivity = 0.5,
    porcupineModelPath,
    porcupineLibraryPath,
    rhinoModelPath,
    rhinoLibraryPath
  ) {
    if (!(wakeWordCallback instanceof Function)) {
      console.error("Parameter 'wakeWordCallback' is not a function");
    }

    this.wakeWordCallBack = wakeWordCallback;

    if (!(inferenceCallback instanceof Function)) {
      console.error("Parameter 'inferenceCallback' is not a function");
    }

    this.inferenceCallback = inferenceCallback;

    this.porcupine = new Porcupine(
      [keywordPath],
      [porcupineSensitivity],
      porcupineModelPath,
      porcupineLibraryPath
    );

    this.rhino = new Rhino(
      contextPath,
      rhinoSensitivity,
      rhinoModelPath,
      rhinoLibraryPath
    );

    this._frameLength = 512;
    this._sampleRate = 16000;
    this._version = "1.0.0";

    this.isWakeWordDetected = false;
  }

  /**
   * @returns number of audio samples per frame (i.e. the length of the array provided to the process function)
   * @see {@link process}
   */
  get frameLength() {
    return this._frameLength;
  }

  /**
   * @returns the audio sampling rate accepted by Rhino
   */
  get sampleRate() {
    return this._sampleRate;
  }

  /**
   * @returns the version of the Rhino engine
   */
  get version() {
    return this._version;
  }

  /**
   * Process a frame of pcm audio.
   *
   * @param {Array} frame 16-bit integers of 16kHz linear PCM mono audio.
   * The specific array length is obtained from Rhino via the frameLength field.
   * @returns {boolean} true when Rhino has concluded processing audio and determined the intent (or that the intent was not understood), false otherwise.
   */
  process(frame) {
    if (!this.isWakeWordDetected) {
      const keywordIndex = this.porcupine.process(frame);

      if (keywordIndex !== -1) {
        this.isWakeWordDetected = true;
        this.wakeWordCallBack(keywordIndex);
      }
    } else {
      const isFinalized = this.rhino.process(frame);

      if (isFinalized) {
        this.isWakeWordDetected = false;
        this.inferenceCallback(this.rhino.getInference());
      }
    }
  }

  release() {
    if (this.porcupine !== null) {
      this.porcupine.release();
      this.porcupine = null;
    }
    if (this.rhino !== null) {
      this.rhino.release();
      this.rhino = null;
    }
  }
}

// constructor(keywords, sensitivities, manualModelPath, manualLibraryPath) {

module.exports = Picovoice;

// self,
// keyword_path,
// wake_word_callback,
// context_path,
// inference_callback,
// porcupine_library_path=None,
// porcupine_model_path=None,
// porcupine_sensitivity=0.5,
// rhino_library_path=None,
// rhino_model_path=None,
// rhino_sensitivity=0.5):
