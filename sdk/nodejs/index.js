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

const { PvArgumentError, PvStateError } = require("./errors");

/**
 * Wraps the Picovoice Porcupine and Rhino engines.
 *
 * Switches input from Porcupine to Rhino upon wake word detection, then back to Rhino upon inference conclusion.
 * Fires callbacks on wake word and inference events.
 */
class Picovoice {
  /**
   * Creates an instance of Picovoice with a specific keyword and context.
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
      throw new PvArgumentError(
        "Parameter 'wakeWordCallback' is not a function"
      );
    }

    this.wakeWordCallBack = wakeWordCallback;

    if (!(inferenceCallback instanceof Function)) {
      throw new PvArgumentError(
        "Parameter 'inferenceCallback' is not a function"
      );
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

    this._porcupineVersion = this.porcupine.version;
    this._rhinoVersion = this.rhino.version;
    this._contextInfo = this.rhino.getContextInfo();

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
   * @returns the audio sampling rate accepted by Picovoice
   */
  get sampleRate() {
    return this._sampleRate;
  }

  /**
   * @returns the version of the Picovoice SDK
   */
  get version() {
    return this._version;
  }

  /**
   * @returns the version of the Porcupine SDK
   */
  get porcupineVersion() {
    return this._porcupineVersion;
  }

  /**
   * @returns the version of the Rhino SDK
   */
  get rhinoVersion() {
    return this._rhinoVersion;
  }

  /**
   * @returns the Rhino context source YAML
   */
  get contextInfo() {
    return this._contextInfo;
  }

  /**
   * Process a frame of pcm audio.
   *
   * @param {Array} frame 16-bit integers of 16kHz linear PCM mono audio.
   * The specific array length is obtained from Rhino via the frameLength field.
   * @returns {boolean} true when Rhino has concluded processing audio and determined the intent (or that the intent was not understood), false otherwise.
   */
  process(frame) {
    if (this.porcupine === null || this.rhino === null) {
      throw new PvStateError(
        "Attempting to process but resources have been released."
      );
    }
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

  /**
   * Release the resources acquired by Picovoice (via Porcupine and Rhino engines).
   */
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

module.exports = Picovoice;
