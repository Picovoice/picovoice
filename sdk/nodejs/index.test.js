//
// Copyright 2020-2021 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
// file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//
"use strict";

const Picovoice = require("./index.js");
const fs = require("fs");
const { getInt16Frames, checkWaveFile } = require("./wave_util");
const WaveFile = require("wavefile").WaveFile;

const { PvArgumentError, PvStateError } = require("./errors");
const { getPlatform, getSystemLibraryPath } = require("./platforms");

const PICOVOICE_PORCUPINE_KEYWORD = 11;

const WAV_PATH_PICOVOICE_COFFEE =
  "../../resources/audio_samples/picovoice-coffee.wav";

const platform = getPlatform();

const contextPathCoffeeMaker = `../../resources/rhino/resources/contexts/${platform}/coffee_maker_${platform}.rhn`;

const ACCESS_KEY = process.argv.filter((x) => x.startsWith('--access_key='))[0].split('--access_key=')[1];

function processWaveFile(handle, waveFilePath) {
  const waveBuffer = fs.readFileSync(waveFilePath);
  const waveAudioFile = new WaveFile(waveBuffer);

  if (!checkWaveFile(waveAudioFile, handle.sampleRate)) {
    console.error(
      "Audio file did not meet requirements. Wave file must be 16KHz, 16-bit, linear PCM (mono)."
    );
    return null;
  }

  const frames = getInt16Frames(waveAudioFile, handle.frameLength);

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    handle.process(frame);
  }
}

describe("intent detection (coffee maker)", () => {
  test("successful keyword and follow-on command", (done) => {
    function keywordCallback(keyword) {
      expect(keyword).toEqual(0);
    }
    function inferenceCallback(inference) {
      expect(inference["isUnderstood"]).toBe(true);
      expect(inference["intent"]).toEqual("orderBeverage");
      expect(inference["slots"]["beverage"]).toEqual("coffee");
      done();
    }

    let handle = new Picovoice(
      ACCESS_KEY,
      PICOVOICE_PORCUPINE_KEYWORD,
      keywordCallback,
      contextPathCoffeeMaker,
      inferenceCallback
    );

    processWaveFile(handle, WAV_PATH_PICOVOICE_COFFEE);

    handle.release();
  });
});

describe("argument checking", () => {
  test("callbacks must be functions", () => {
    expect(() => {
      let handle = new Picovoice(
        ACCESS_KEY,
        PICOVOICE_PORCUPINE_KEYWORD,
        123,
        contextPathCoffeeMaker,
        () => {}
      );
    }).toThrow(PvArgumentError);
  });

  test("callbacks must be functions II", () => {
    expect(() => {
      let handle = new Picovoice(
        ACCESS_KEY,
        PICOVOICE_PORCUPINE_KEYWORD,
        undefined,
        contextPathCoffeeMaker,
        undefined
      );
    }).toThrow(PvArgumentError);
  });

  test("missing keyword argument", () => {
    expect(() => {
      let handle = new Picovoice(
        ACCESS_KEY,
        undefined,
        PICOVOICE_PORCUPINE_KEYWORD,
        () => {},
        contextPathCoffeeMaker,
        () => {}
      );
    }).toThrow(PvArgumentError);
  });

  test("no arguments", () => {
    expect(() => {
      let handle = new Picovoice();
    }).toThrow(PvArgumentError);
  });

  test("one arguments", () => {
    expect(() => {
      let handle = new Picovoice(ACCESS_KEY, PICOVOICE_PORCUPINE_KEYWORD);
    }).toThrow(PvArgumentError);
  });

  test("three arguments", () => {
    expect(() => {
      let handle = new Picovoice(
        ACCESS_KEY,
        PICOVOICE_PORCUPINE_KEYWORD,
        () => {},
        contextPathCoffeeMaker
      );
    }).toThrow(PvArgumentError);
  });
});

describe("state", () => {
  test("contextInfo from Rhino", () => {
    let handle = new Picovoice(
      ACCESS_KEY,
      PICOVOICE_PORCUPINE_KEYWORD,
      () => {},
      contextPathCoffeeMaker,
      () => {}
    );
    handle.release();
    expect(() => {
      handle.process(new Int16Array(512));
    }).toThrow(PvStateError);
  });
});

describe("getter functions", () => {
  test("contextInfo from Rhino", () => {
    let handle = new Picovoice(
      ACCESS_KEY,
      PICOVOICE_PORCUPINE_KEYWORD,
      () => {},
      contextPathCoffeeMaker,
      () => {}
    );

    let contextInfo = handle.contextInfo;

    expect(contextInfo).toMatch(
      /(\[brew, can I get, can I have, I want, get me, give me, I'd like, make me, may I have, I'll have, I'll take, I'll get\])/i
    );
    expect(contextInfo).not.toMatch(
      /(the third one burned down, fell over, and sank into the swamp)/i
    );

    handle.release();
  });

  test("version strings", () => {
    let handle = new Picovoice(
      ACCESS_KEY,
      PICOVOICE_PORCUPINE_KEYWORD,
      () => {},
      contextPathCoffeeMaker,
      () => {}
    );

    expect(handle.porcupineVersion).toEqual("2.0.0");
    expect(handle.rhinoVersion).toEqual("2.0.0");
    expect(handle.version).toEqual("2.0.0");

    handle.release();
  });
});
