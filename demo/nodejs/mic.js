#! /usr/bin/env node
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
"use strict";

const fs = require("fs");
const path = require("path");
const { program } = require("commander");
const { Picovoice } = require("@picovoice/picovoice-node");
const { PicovoiceInvalidArgumentError } = require("@picovoice/picovoice-node/dist/errors");
const { PvRecorder } = require("@picovoice/pvrecorder-node");

const {
  BuiltinKeyword,
  getBuiltinKeywordPath
} = require("@picovoice/porcupine-node");

program
  .option(
    "-a, --access_key <string>",
    "AccessKey obtain from the Picovoice Console (https://console.picovoice.ai/)"
  )
  .option(
    "-k, --keyword_file_path <string>",
    "absolute path(s) to porcupine keyword files (.ppn extension)"
  )
  .option(
    "-b, --keyword <string>",
    `built in keyword(s) (${Object.keys(BuiltinKeyword)})`
  )
  .option(
    "-c, --context_file_path <string>",
    `absolute path to rhino context (.rhn extension)`
  )
  .option(
    "-s, --sensitivity <number>",
    "sensitivity value between 0 and 1",
    parseFloat,
    0.5
  )
  .option(
    "-d, --endpoint_duration_sec <bool>",
    "Endpoint duration in seconds. " +
    "An endpoint is a chunk of silence at the end of an utterance that marks the end of spoken command. " +
    "It should be a positive number within [0.5, 5]. " +
    "A lower endpoint duration reduces delay and improves responsiveness. " +
    "A higher endpoint duration assures Rhino doesn't return inference pre-emptively " +
    "in case the user pauses before finishing the request." ,
    parseFloat,
    1.0
  )
  .option(
    "-e, --requires_endpoint <bool>",
    "If set to `false`, Rhino does not require an endpoint (chunk of silence) before finishing inference.",
    "true"
  )
  .option(
    "--porcupine_library_file_path <string>",
    "absolute path to porcupine dynamic library"
  )
  .option(
    "--porcupine_model_file_path <string>",
    "absolute path to porcupine model"
  )
  .option(
    "--rhino_library_file_path <string>",
    "absolute path to rhino dynamic library"
  )
  .option("--rhino_model_file_path <string>", "absolute path to rhino model")
  .option(
    "-i, --audio_device_index <number>",
    "index of audio device to use to record audio",
    Number,
    -1
  )
  .option("-d, --show_audio_devices", "show the list of available devices");

if (process.argv.length < 3) {
  program.help();
}

program.parse(process.argv);

let isInterrupted = false;

async function micDemo() {
  let accessKey = program["access_key"];
  let keywordFilePath = program["keyword_file_path"];
  let keyword = program["keyword"];
  let contextPath = program["context_file_path"];
  let sensitivity = program["sensitivity"];
  let endpointDurationSec = program["endpoint_duration_sec"];
  let requiresEndpoint = program["requires_endpoint"].toLowerCase() !== 'false';
  let porcupineLibraryFilePath = program["porcupine_library_file_path"];
  let porcupineModelFilePath = program["porcupine_model_file_path"];
  let rhinoLibraryFilePath = program["rhino_library_file_path"];
  let rhinoModelFilePath = program["rhino_model_file_path"];
  let audioDeviceIndex = program["audio_device_index"];
  let showAudioDevices = program["show_audio_devices"];

  let keywordPathsDefined = keywordFilePath !== undefined;
  let builtinKeywordsDefined = keyword !== undefined;
  let showAudioDevicesDefined = showAudioDevices !== undefined;
  let friendlyKeywordName;

  if (showAudioDevicesDefined) {
    const devices = PvRecorder.getAvailableDevices();
    for (let i = 0; i < devices.length; i++) {
      console.log(`index: ${i}, device name: ${devices[i]}`);
    }
    process.exit();
  }

  if (
    (keywordPathsDefined && builtinKeywordsDefined) ||
    (!keywordPathsDefined && !builtinKeywordsDefined)
  ) {
    console.error(
      "One of --keyword_file_path or --keywords is required: Specify a built-in --keyword (e.g. 'GRASSHOPPER'), or a --keyword_file_path to a .ppn file"
    );
    return;
  }

  let keywordArgument;
  if (builtinKeywordsDefined) {
    let keywordString = keyword.trim().toUpperCase();
    if (keywordString in BuiltinKeyword) {
      keywordArgument = getBuiltinKeywordPath(BuiltinKeyword[keywordString])
      friendlyKeywordName = keywordString;
    } else {
      console.error(
        `Keyword argument '${keywordString}' is not in the list of built-in keywords (${Object.keys(BuiltinKeyword)})`
      );
      return;
    }
  } else {
    keywordArgument = keywordFilePath;
    friendlyKeywordName = keywordFilePath
      .split(/[\\|\/]/)
      .pop()
      .split("_")[0];
  }

  if (isNaN(sensitivity) || sensitivity < 0 || sensitivity > 1) {
    console.error("--sensitivity must be a number in the range [0,1]");
    return;
  }

  if (isNaN(endpointDurationSec) || endpointDurationSec < 0.5 || endpointDurationSec > 5.0) {
    console.error("--endpointDurationSec must be a number in the range [0.5, 5.0]");
    return;
  }

  if (!fs.existsSync(contextPath)) {
    throw new PicovoiceInvalidArgumentError(
      `File not found at 'contextPath': ${contextPath}`
    );
  }

  let contextFilename = path.basename(contextPath);

  let keywordCallback = function (keyword) {
    console.log(`Wake word '${friendlyKeywordName}' detected.`);
    console.log(
      `Listening for speech within the context of '${contextFilename}'. Please speak your phrase into the microphone. `
    );
  };

  let inferenceCallback = function (inference) {
    console.log();
    console.log("Inference:");
    console.log(JSON.stringify(inference, null, 4));
    console.log();
    console.log();
    console.log(`Listening for wake word '${friendlyKeywordName}'`);
  };

  let handle = new Picovoice(
    accessKey,
    keywordArgument,
    keywordCallback,
    contextPath,
    inferenceCallback,
    sensitivity,
    sensitivity,
    endpointDurationSec,
    requiresEndpoint,
    porcupineModelFilePath,
    rhinoModelFilePath,
    porcupineLibraryFilePath,
    rhinoLibraryFilePath
  );

  const frameLength = handle.frameLength;

  const recorder = new PvRecorder(frameLength, audioDeviceIndex);
  recorder.start();

  console.log(`Using device: ${recorder.getSelectedDevice()}...`);
  console.log("Context info:");
  console.log("-------------");
  console.log(handle.contextInfo);
  console.log("Press ctrl+c to exit.");

  while (!isInterrupted) {
    const pcm = await recorder.read();
    handle.process(pcm);
  }

  console.log("Stopping...");
  recorder.release();
}

// setup interrupt
process.on("SIGINT", function () {
  isInterrupted = true;
});

(async function () {
  try {
    await micDemo();
  } catch (e) {
    console.error(e.toString());
  }
})();
