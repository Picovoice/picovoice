//
// Copyright 2020-2022 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
// file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//
"use strict";

import Picovoice from "../src/picovoice";
import type { RhinoInference } from "@picovoice/rhino-node"
import { BuiltinKeyword, getBuiltinKeywordPath } from "@picovoice/porcupine-node"

import * as fs from "fs";
import { getInt16Frames, checkWaveFile } from "../src/wave_util";
import { WaveFile } from "wavefile";

import { PicovoiceInvalidArgumentError, PicovoiceInvalidStateError } from "../src/errors";
import { getPlatform } from "../src/platforms";

const PORCUPINE_KEYWORD = getBuiltinKeywordPath(BuiltinKeyword.PORCUPINE);
const PICOVOICE_KEYWORD = getBuiltinKeywordPath(BuiltinKeyword.PICOVOICE);

const WAV_PATH_PICOVOICE_COFFEE =
  "../../resources/audio_samples/picovoice-coffee.wav";
const WAV_PATH_HEUSCHRECKE_BELUCHTUNG_DE =
  "../../resources/audio_samples/heuschrecke-beleuchtung_de.wav";
const WAV_PATH_MANZANA_LUZ_ES =
  "../../resources/audio_samples/manzana-luz_es.wav";
const WAV_PATH_MON_INTELLIGENT_FR =
  "../../resources/audio_samples/mon-intelligent_fr.wav";

const platform = getPlatform();

const contextPathCoffeeMaker =
  `../../resources/rhino/resources/contexts/${platform}/coffee_maker_${platform}.rhn`;
const contextPathBeleuchtungDe =
  `../../resources/rhino/resources/contexts_de/${platform}/beleuchtung_${platform}.rhn`;
const contextPathInteligenteEs =
  `../../resources/rhino/resources/contexts_es/${platform}/iluminación_inteligente_${platform}.rhn`;
const contextPathIntelligentFr =
  `../../resources/rhino/resources/contexts_fr/${platform}/éclairage_intelligent_${platform}.rhn`;

const keywordPathHeuschreckeDe = 
  `../../resources/porcupine/resources/keyword_files_de/${platform}/heuschrecke_${platform}.ppn`
const keywordPathManzanaEs = 
  `../../resources/porcupine/resources/keyword_files_es/${platform}/manzana_${platform}.ppn`
  const keywordPathMonchouchouFr = 
  `../../resources/porcupine/resources/keyword_files_fr/${platform}/mon chouchou_${platform}.ppn`  

const MODEL_PATH_PP_DE = "../../resources/porcupine/lib/common/porcupine_params_de.pv";
const MODEL_PATH_PP_ES = "../../resources/porcupine/lib/common/porcupine_params_es.pv";
const MODEL_PATH_PP_FR = "../../resources/porcupine/lib/common/porcupine_params_fr.pv";

const MODEL_PATH_RH_DE = "../../resources/rhino/lib/common/rhino_params_de.pv";
const MODEL_PATH_RH_ES = "../../resources/rhino/lib/common/rhino_params_es.pv";
const MODEL_PATH_RH_FR = "../../resources/rhino/lib/common/rhino_params_fr.pv";

const ACCESS_KEY = process.argv.filter((x) => x.startsWith('--access_key='))[0].split('--access_key=')[1];

function processWaveFile(handle: Picovoice, waveFilePath: string) {
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
    function keywordCallback(keyword: number) {
      expect(keyword).toEqual(0);
    }
    function inferenceCallback(inference: RhinoInference) {
      expect(inference["isUnderstood"]).toBe(true);
      expect(inference["intent"]).toEqual("orderBeverage");
      expect(inference.slots?.beverage).toEqual("coffee");
      done();
    }

    let handle = new Picovoice(
      ACCESS_KEY,
      PICOVOICE_KEYWORD,
      keywordCallback,
      contextPathCoffeeMaker,
      inferenceCallback
    );

    processWaveFile(handle, WAV_PATH_PICOVOICE_COFFEE);

    handle.release();
  });
});

describe("intent detection in DE (Beleuchtung)", () => {
  test("successful keyword and follow-on command", (done) => {
    function keywordCallback(keyword: number) {
      expect(keyword).toEqual(0);
    }
    function inferenceCallback(inference: RhinoInference) {
      expect(inference["isUnderstood"]).toBe(true);
      expect(inference["intent"]).toEqual("changeState");
      expect(inference.slots?.state).toEqual("aus");
      done();
    }

    let handle = new Picovoice(
      ACCESS_KEY,
      keywordPathHeuschreckeDe,
      keywordCallback,
      contextPathBeleuchtungDe,
      inferenceCallback,
      0.5,
      0.5,
      1.0,
      true,
      MODEL_PATH_PP_DE,
      MODEL_PATH_RH_DE
    );

    processWaveFile(handle, WAV_PATH_HEUSCHRECKE_BELUCHTUNG_DE);

    handle.release();
  });
});

describe("intent detection in ES (Iluminación Inteligente)", () => {
  test("successful keyword and follow-on command", (done) => {
    function keywordCallback(keyword: number) {
      expect(keyword).toEqual(0);
    }
    function inferenceCallback(inference: RhinoInference) {
      expect(inference["isUnderstood"]).toBe(true);
      expect(inference["intent"]).toEqual("changeColor");
      expect(inference.slots?.location).toEqual("habitación");
      expect(inference.slots?.color).toEqual("rosado");
      done();
    }

    let handle = new Picovoice(
      ACCESS_KEY,
      keywordPathManzanaEs,
      keywordCallback,
      contextPathInteligenteEs,
      inferenceCallback,
      0.5,
      0.5,
      1.0,
      true,
      MODEL_PATH_PP_ES,
      MODEL_PATH_RH_ES
    );

    processWaveFile(handle, WAV_PATH_MANZANA_LUZ_ES);

    handle.release();
  });
});

describe("intent detection in FR (Eclairage Intelligent)", () => {
  test("successful keyword and follow-on command", (done) => {
    function keywordCallback(keyword: number) {
      expect(keyword).toEqual(0);
    }
    function inferenceCallback(inference: RhinoInference) {
      expect(inference["isUnderstood"]).toBe(true);
      expect(inference["intent"]).toEqual("changeColor");
      expect(inference.slots?.color).toEqual("violet");
      done();
    }

    let handle = new Picovoice(
      ACCESS_KEY,
      keywordPathMonchouchouFr,
      keywordCallback,
      contextPathIntelligentFr,
      inferenceCallback,
      0.5,
      0.5,
      1.0,
      true,
      MODEL_PATH_PP_FR,
      MODEL_PATH_RH_FR
    );

    processWaveFile(handle, WAV_PATH_MON_INTELLIGENT_FR);

    handle.release();
  });
});

describe("argument checking", () => {
  test("callbacks must be functions", () => {
    expect(() => {
      let handle = new Picovoice(
        ACCESS_KEY,
        PORCUPINE_KEYWORD,
        // @ts-expect-error
        123,
        contextPathCoffeeMaker,
        () => {}
      );
    }).toThrow(PicovoiceInvalidArgumentError);
  });

  test("callbacks must be functions II", () => {
    expect(() => {
      let handle = new Picovoice(
        ACCESS_KEY,
        PORCUPINE_KEYWORD,
        // @ts-expect-error
        undefined,
        contextPathCoffeeMaker,
        undefined
      );
    }).toThrow(PicovoiceInvalidArgumentError);
  });

  test("missing keyword argument", () => {
    expect(() => {
      let handle = new Picovoice(
        ACCESS_KEY,
        // @ts-expect-error
        undefined,
        PORCUPINE_KEYWORD,
        () => {},
        contextPathCoffeeMaker,
        () => {}
      );
    }).toThrow(PicovoiceInvalidArgumentError);
  });

  test("no arguments", () => {
    expect(() => {
      // @ts-expect-error
      let handle = new Picovoice();
    }).toThrow(PicovoiceInvalidArgumentError);
  });

  test("one arguments", () => {
    expect(() => {
      // @ts-expect-error
      let handle = new Picovoice(ACCESS_KEY, PORCUPINE_KEYWORD);
    }).toThrow(PicovoiceInvalidArgumentError);
  });

  test("three arguments", () => {
    expect(() => {
      // @ts-expect-error
      let handle = new Picovoice(
        ACCESS_KEY,
        PORCUPINE_KEYWORD,
        () => {},
        contextPathCoffeeMaker
      );
    }).toThrow(PicovoiceInvalidArgumentError);
  });
});

describe("state", () => {
  test("contextInfo from Rhino", () => {
    let handle = new Picovoice(
      ACCESS_KEY,
      PORCUPINE_KEYWORD,
      () => {},
      contextPathCoffeeMaker,
      () => {}
    );
    handle.release();
    expect(() => {
      handle.process(new Int16Array(512));
    }).toThrow(PicovoiceInvalidStateError);
  });
});

describe("getter functions", () => {
  test("contextInfo from Rhino", () => {
    let handle = new Picovoice(
      ACCESS_KEY,
      PORCUPINE_KEYWORD,
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
      PORCUPINE_KEYWORD,
      () => {},
      contextPathCoffeeMaker,
      () => {}
    );

    expect(handle.porcupineVersion).toEqual("2.1.0");
    expect(handle.rhinoVersion).toEqual("2.1.0");
    expect(handle.version).toEqual("2.1.0");

    handle.release();
  });
});
