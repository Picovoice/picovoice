/*
  Copyright 2022 Picovoice Inc.

  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
  file accompanying this source.

  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
*/

import { loadModel } from '@picovoice/web-utils';
import {
  keywordsProcess,
  PorcupineKeyword,
  PorcupineModel,
} from '@picovoice/porcupine-web';
import { RhinoContext, RhinoModel } from '@picovoice/rhino-web';
import { PicovoiceArgs } from './types';

export async function loadPicovoiceArgs(
  keyword: PorcupineKeyword,
  porcupineModel: PorcupineModel,
  context: RhinoContext,
  rhinoModel: RhinoModel
): Promise<PicovoiceArgs> {
  const [keywordPaths, keywordLabels, keywordSensitivities] = await keywordsProcess(keyword);
  let customWritePath = porcupineModel.customWritePath
    ? porcupineModel.customWritePath
    : 'porcupine_model';
  const porcupineModelPath = await loadModel({
    ...porcupineModel,
    customWritePath,
  });

  customWritePath = context.customWritePath
    ? context.customWritePath
    : 'rhino_context';
  const contextPath = await loadModel({ ...context, customWritePath });
  const { sensitivity = 0.5 } = context;
  const rhinoSensitivity = sensitivity;

  customWritePath = rhinoModel.customWritePath
    ? rhinoModel.customWritePath
    : 'rhino_model';
  const rhinoModelPath = await loadModel({ ...rhinoModel, customWritePath });

  return {
    keywordPath: keywordPaths[0],
    keywordLabel: keywordLabels[0],
    porcupineSensitivity: keywordSensitivities[0],
    porcupineModelPath: porcupineModelPath,
    contextPath: contextPath,
    rhinoSensitivity: rhinoSensitivity,
    rhinoModelPath: rhinoModelPath,
  };
}
