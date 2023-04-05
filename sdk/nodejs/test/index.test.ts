//
// Copyright 2020-2023 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
// file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//
'use strict';

import Picovoice from '../src/picovoice';
import type { RhinoInference } from '@picovoice/rhino-node';

import * as fs from 'fs';
import { checkWaveFile, getInt16Frames } from '../src/wave_util';
import { WaveFile } from 'wavefile';

import {
  PicovoiceInvalidArgumentError,
  PicovoiceInvalidStateError,
} from '../src/errors';
import {
  getAudioFileByLanguage,
  getContextPathsByLanguage,
  getKeywordPathsByLanguage,
  getPorcupineModelPathByLanguage,
  getRhinoModelPathByLanguage,
  getTestParameters,
} from './test_utils';

const TEST_PARAMETERS = getTestParameters();

const ACCESS_KEY = process.argv
  .filter(x => x.startsWith('--access_key='))[0]
  .split('--access_key=')[1];

function processWaveFile(handle: Picovoice, waveFilePath: string): void {
  const waveBuffer = fs.readFileSync(waveFilePath);
  const waveAudioFile = new WaveFile(waveBuffer);

  if (!checkWaveFile(waveAudioFile, handle.sampleRate)) {
    // eslint-disable-next-line no-console
    console.error(
      'Audio file did not meet requirements. Wave file must be 16KHz, 16-bit, linear PCM (mono).'
    );
    return;
  }

  const frames = getInt16Frames(waveAudioFile, handle.frameLength);

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    handle.process(frame);
  }
}

describe('intent detection', () => {
  it.each(TEST_PARAMETERS)(
    'testing intent detection for %p with %p and %p',
    (
      language: string,
      keyword: string,
      context: string,
      filename: string,
      intent: string,
      slots: Record<string, string>
    ) => {
      function keywordCallback(keyword: number) {
        expect(keyword).toEqual(0);
      }

      function inferenceCallback(inference: RhinoInference) {
        expect(inference.isUnderstood).toBe(true);
        expect(inference.intent).toEqual(intent);
        expect(inference.slots).toEqual(slots);
      }

      let handle = new Picovoice(
        ACCESS_KEY,
        getKeywordPathsByLanguage(language, keyword),
        keywordCallback,
        getContextPathsByLanguage(language, context),
        inferenceCallback,
        0.5,
        0.5,
        1.0,
        true,
        getPorcupineModelPathByLanguage(language),
        getRhinoModelPathByLanguage(language)
      );

      processWaveFile(handle, getAudioFileByLanguage(language, filename));

      handle.release();
    }
  );
});

describe('argument checking', () => {
  test('callbacks must be functions', () => {
    expect(() => {
      new Picovoice(
        ACCESS_KEY,
        getKeywordPathsByLanguage('en', 'porcupine'),
        // @ts-expect-error
        123,
        getContextPathsByLanguage('en', 'coffee_maker'),
        () => {}
      );
    }).toThrow(PicovoiceInvalidArgumentError);
  });

  test('callbacks must be functions II', () => {
    expect(() => {
      new Picovoice(
        ACCESS_KEY,
        getKeywordPathsByLanguage('en', 'porcupine'),
        // @ts-expect-error
        undefined,
        getContextPathsByLanguage('en', 'coffee_maker'),
        undefined
      );
    }).toThrow(PicovoiceInvalidArgumentError);
  });

  test('no arguments', () => {
    expect(() => {
      // @ts-expect-error
      new Picovoice();
    }).toThrow(PicovoiceInvalidArgumentError);
  });

  test('one arguments', () => {
    expect(() => {
      // @ts-expect-error
      new Picovoice(ACCESS_KEY, getKeywordPathsByLanguage('en', 'porcupine'));
    }).toThrow(PicovoiceInvalidArgumentError);
  });

  test('three arguments', () => {
    expect(() => {
      // @ts-expect-error
      new Picovoice(
        ACCESS_KEY,
        getKeywordPathsByLanguage('en', 'porcupine'),
        () => {},
        getContextPathsByLanguage('en', 'coffee_maker')
      );
    }).toThrow(PicovoiceInvalidArgumentError);
  });
});

describe('state', () => {
  test('contextInfo from Rhino', () => {
    let handle = new Picovoice(
      ACCESS_KEY,
      getKeywordPathsByLanguage('en', 'porcupine'),
      () => {},
      getContextPathsByLanguage('en', 'coffee_maker'),
      () => {}
    );
    handle.release();
    expect(() => {
      handle.process(new Int16Array(512));
    }).toThrow(PicovoiceInvalidStateError);
  });
});

describe('getter functions', () => {
  test('contextInfo from Rhino', () => {
    let handle = new Picovoice(
      ACCESS_KEY,
      getKeywordPathsByLanguage('en', 'porcupine'),
      () => {},
      getContextPathsByLanguage('en', 'coffee_maker'),
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

  test('version strings', () => {
    let handle = new Picovoice(
      ACCESS_KEY,
      getKeywordPathsByLanguage('en', 'porcupine'),
      () => {},
      getContextPathsByLanguage('en', 'coffee_maker'),
      () => {}
    );

    expect(handle.porcupineVersion).toEqual('2.2.0');
    expect(handle.rhinoVersion).toEqual('2.2.0');
    expect(handle.version).toEqual('2.2.0');

    handle.release();
  });
});
