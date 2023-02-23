import {Platform} from 'react-native';
import fs from 'react-native-fs';
// @ts-ignore
import {decode as atob} from 'base-64';

import {Picovoice} from '@picovoice/picovoice-react-native';

const testData = require('./test_data.json');
const platform = Platform.OS;

const accessKey: string = '{TESTING_ACCESS_KEY_HERE}';

export type Result = {
  testName: string;
  success: boolean;
  errorString?: string;
};

function getPath(filePath: string) {
  if (platform === 'ios') {
    return `Assets.bundle/${filePath}`;
  }
  return filePath;
}

async function getBinaryFile(audioFilePath: string) {
  let fileBase64;
  if (platform === 'ios') {
    fileBase64 = await fs.readFile(
      `${fs.MainBundlePath}/${audioFilePath}`,
      'base64',
    );
  } else {
    fileBase64 = await fs.readFileAssets(audioFilePath, 'base64');
  }
  const fileBinary = atob(fileBase64);

  const bytes = new Uint8Array(fileBinary.length);
  for (let i = 0; i < fileBinary.length; i++) {
    bytes[i] = fileBinary.charCodeAt(i);
  }
  return bytes;
}

async function getPcmFromFile(
  audioFilePath: string,
  expectedSampleRate: number,
) {
  const headerSampleRateOffset = 24;
  const headerOffset = 44;

  const fileBytes = await getBinaryFile(audioFilePath);
  const dataView = new DataView(fileBytes.buffer);

  const fileSampleRate = dataView.getInt32(headerSampleRateOffset, true);
  if (fileSampleRate !== expectedSampleRate) {
    throw new Error(
      `Specified sample rate did not match test file: '${fileSampleRate}' != '${expectedSampleRate}'`,
    );
  }

  const pcm = [];
  for (let i = headerOffset; i < fileBytes.length; i += 2) {
    pcm.push(dataView.getInt16(i, true));
  }

  return pcm;
}

async function processAudio(picovoice: Picovoice, audioFilePath: string) {
  const pcm = await getPcmFromFile(audioFilePath, picovoice.sampleRate);
  const frameLength = picovoice.frameLength;
  for (let i = 0; i < pcm.length - frameLength; i += frameLength) {
    await picovoice.process(pcm.slice(i, i + frameLength));
  }
}

function inferencesEqual(inference: any, groundTruth: any) {
  if (inference.isUnderstood === false && groundTruth === null) {
    return true;
  }

  if (inference.intent !== groundTruth.intent) {
    return false;
  }

  for (const key of Object.keys(groundTruth.slots)) {
    if (groundTruth.slots[key] !== inference.slots[key]) {
      return false;
    }
  }

  for (const key of Object.keys(inference.slots)) {
    if (inference.slots[key] !== groundTruth.slots[key]) {
      return false;
    }
  }

  return true;
}

async function runTestcase(
  language: string,
  keywordName: string,
  contextName: string,
  audioFile: string,
  groundTruth: any,
): Promise<Result> {
  const result: Result = {testName: '', success: false};
  let picovoice = null;
  try {
    const keywordPath = getPath(
      `keyword_files/${language}/${keywordName}_${platform}.ppn`,
    );
    const contextPath = getPath(
      `context_files/${language}/${contextName}_${platform}.rhn`,
    );
    const audioFilePath = getPath(`audio_samples/${audioFile}`);
    const porcupineModelPath =
      language === 'en'
        ? getPath('model_files/porcupine_params.pv')
        : getPath(`model_files/porcupine_params_${language}.pv`);
    const rhinoModelPath =
      language === 'en'
        ? getPath('model_files/rhino_params.pv')
        : getPath(`model_files/rhino_params_${language}.pv`);

    let wakewordDetected = false;
    let inference = null;

    const wakeWordCallback = () => {
      wakewordDetected = true;
    };

    const inferenceCallback = (newInference: any) => {
      if (newInference.isFinalized) {
        inference = newInference;
      }
    };

    picovoice = await Picovoice.create(
      accessKey,
      keywordPath,
      wakeWordCallback,
      contextPath,
      inferenceCallback,
      0.5,
      0.5,
      porcupineModelPath,
      rhinoModelPath,
    );
    await processAudio(picovoice, audioFilePath);

    if (!wakewordDetected) {
      result.success = false;
      result.errorString = 'Wakeword was not detected';
    } else if (!inferencesEqual(inference, groundTruth)) {
      result.success = false;
      result.errorString = `Inference '${JSON.stringify(
        inference,
      )}' does not equal ground truth '${JSON.stringify(groundTruth)}'`;
    } else {
      result.success = true;
    }
    await picovoice.delete();
  } catch (error) {
    result.success = false;
    result.errorString = `${error}`;
  }
  return result;
}

async function parametersTest(testcases: any): Promise<Result[]> {
  const results = [];
  for (const testcase of testcases) {
    const result = await runTestcase(
      testcase.language,
      testcase.wakeword,
      testcase.context_name,
      testcase.audio_file,
      testcase.inference,
    );
    result.testName = `Test for ${testcase.language} ${testcase.wakeword} ${testcase.context_name}`;
    results.push(result);
  }
  return results;
}

export async function runPicovoiceTests(): Promise<Result[]> {
  const parameterResults = await parametersTest(testData.tests.parameters);
  return [...parameterResults];
}
