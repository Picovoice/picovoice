//
// Copyright 2022-2023 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
// file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//
import * as path from 'path';
import { getPlatform } from '../src/platforms';

const ROOT_DIR = path.join(__dirname, '../../..');
const TEST_DATA_JSON = require(path.join(
  ROOT_DIR,
  'resources/.test/test_data.json'
));

function appendLanguage(s: string, language: string): string {
  if (language === 'en') {
    return s;
  }
  return s + '_' + language;
}

export function getRhinoModelPathByLanguage(language: string): string {
  return path.join(
    ROOT_DIR,
    `${appendLanguage('resources/rhino/lib/common/rhino_params', language)}.pv`
  );
}

export function getPorcupineModelPathByLanguage(language: string): string {
  return path.join(
    ROOT_DIR,
    `${appendLanguage(
      'resources/porcupine/lib/common/porcupine_params',
      language
    )}.pv`
  );
}

export function getContextPathsByLanguage(
  language: string,
  context: string
): string {
  return path.join(
    ROOT_DIR,
    appendLanguage('resources/rhino/resources/contexts', language),
    getPlatform(),
    `${context}_${getPlatform()}.rhn`
  );
}

export function getKeywordPathsByLanguage(
  language: string,
  keyword: string
): string {
  return path.join(
    ROOT_DIR,
    appendLanguage('resources/porcupine/resources/keyword_files', language),
    getPlatform(),
    `${keyword}_${getPlatform()}.ppn`
  );
}

export function getAudioFileByLanguage(
  language: string,
  audioFile: string
): string {
  return path.join(ROOT_DIR, 'resources/audio_samples', audioFile);
}

export function getTestParameters(): [
  string,
  string,
  string,
  string,
  string,
  Record<string, string>
][] {
  let parametersJson = TEST_DATA_JSON.tests.parameters;
  return parametersJson.map((x: any) => [
    x.language,
    x.wakeword,
    x.context_name,
    x.audio_file,
    x.inference.intent,
    x.inference.slots,
  ]);
}
