#! /usr/bin/env node
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

const fs = require("fs");
const { program } = require("commander");
const Picovoice = require("@picovoice/picovoice-node");
const { PvArgumentError } = require("@picovoice/picovoice-node/errors");
const { getPlatform } = require("@picovoice/picovoice-node/platforms");

const {
  BUILTIN_KEYWORDS_STRINGS,
  BUILTIN_KEYWORDS_STRING_TO_ENUM,
} = require("@picovoice/porcupine-node/builtin_keywords");

const PLATFORM_RECORDER_MAP = new Map();
PLATFORM_RECORDER_MAP.set("linux", "arecord");
PLATFORM_RECORDER_MAP.set("mac", "sox");
PLATFORM_RECORDER_MAP.set("raspberry-pi", "arecord");
PLATFORM_RECORDER_MAP.set("windows", "sox");

const recorder = require("node-record-lpcm16");

program
  .option(
    "-k, --keyword_file_path <string>",
    "absolute path(s) to porcupine keyword files (.ppn extension)"
  )
  .option(
    "-b, --keyword <string>",
    `built in keyword(s) (${Array.from(BUILTIN_KEYWORDS_STRINGS)})`
  )
  .requiredOption(
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
  .option("--rhino_model_file_path <string>", "absolute path to rhino model");

if (process.argv.length < 3) {
  program.help();
}

program.parse(process.argv);

function chunkArray(array, size) {
  return Array.from({ length: Math.ceil(array.length / size) }, (v, index) =>
    array.slice(index * size, index * size + size)
  );
}

function micDemo() {
  let keywordFilePath = program["keyword_file_path"];
  let keyword = program["keyword"];
  let contextPath = program["context_file_path"];
  let sensitivity = program["sensitivity"];
  let porcupineLibraryFilePath = program["porcupine_library_file_path"];
  let porcupineModelFilePath = program["porcupine_model_file_path"];
  let rhinoLibraryFilePath = program["rhino_library_file_path"];
  let rhinoModelFilePath = program["rhino_model_file_path"];

  let keywordPathsDefined = keywordFilePath !== undefined;
  let builtinKeywordsDefined = keyword !== undefined;

  let friendlyKeywordName;

  if (
    (keywordPathsDefined && builtinKeywordsDefined) ||
    (!keywordPathsDefined && !builtinKeywordsDefined)
  ) {
    console.error(
      "One of --keyword_file_paths or --keywords is required: Specify a built-in --keyword (e.g. 'GRASSHOPPER'), or a --keyword_file_path to a .ppn file"
    );
    return;
  }

  let keywordArgument;
  if (builtinKeywordsDefined) {
    let keywordString = keyword.trim().toLowerCase();
    if (BUILTIN_KEYWORDS_STRINGS.has(keywordString)) {
      keywordArgument = BUILTIN_KEYWORDS_STRING_TO_ENUM.get(keywordString);
      friendlyKeywordName = keywordString;
    } else {
      console.error(
        `Keyword argument '${keywordString}' is not in the list of built-in keywords (${Array.from(
          BUILTIN_KEYWORDS_STRINGS
        )})`
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

  if (!fs.existsSync(contextPath)) {
    throw new PvArgumentError(
      `File not found at 'contextPath': ${contextPath}`
    );
  }

  let contextName = contextPath
    .split(/[\\|\/]/)
    .pop()
    .split("_")[0];

  let keywordCallback = function (keyword) {
    console.log(`Wake word '${friendlyKeywordName}' detected`);
    console.log(
      `Listening for speech within the context of '${contextName}'. Please speak your phrase into the microphone. `
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

  console.log(keywordArgument);

  let handle = new Picovoice(
    keywordArgument,
    keywordCallback,
    contextPath,
    inferenceCallback,
    sensitivity,
    sensitivity,
    porcupineModelFilePath,
    porcupineLibraryFilePath,
    rhinoModelFilePath,
    rhinoLibraryFilePath
  );

  console.log("Context info:");
  console.log("-------------");
  console.log(handle.contextInfo);

  let platform;
  try {
    platform = getPlatform();
  } catch (error) {
    console.error();
    ("The Picovoice SDK for NodeJS does not support this platform. Supported platforms include macOS (x86_64), Windows (x86_64), Linux (x86_64), and Raspberry Pi (1-4)");
    console.error(error);
  }

  let recorderType = PLATFORM_RECORDER_MAP.get(platform);
  console.log(
    `Platform: '${platform}'; attempting to use '${recorderType}' to access microphone ...`
  );

  const frameLength = handle.frameLength;
  const sampleRate = handle.sampleRate;

  const recording = recorder.record({
    sampleRate: sampleRate,
    channels: 1,
    audioType: "raw",
    recorder: recorderType,
  });

  var frameAccumulator = [];

  recording.stream().on("error", (data) => {
    // Error event is triggered when stream is closed on Ubuntu
    // Swallow the error since it is harmless for this demo.
  });

  recording.stream().on("data", (data) => {
    // Two bytes per Int16 from the data buffer
    let newFrames16 = new Array(data.length / 2);
    for (let i = 0; i < data.length; i += 2) {
      newFrames16[i / 2] = data.readInt16LE(i);
    }

    // Split the incoming PCM integer data into arrays of size Picovoice.frameLength. If there's insufficient frames, or a remainder,
    // store it in 'frameAccumulator' for the next iteration, so that we don't miss any audio data
    frameAccumulator = frameAccumulator.concat(newFrames16);
    let frames = chunkArray(frameAccumulator, frameLength);

    if (frames[frames.length - 1].length !== frameLength) {
      // store remainder from divisions of frameLength
      frameAccumulator = frames.pop();
    } else {
      frameAccumulator = [];
    }

    for (let frame of frames) {
      handle.process(frame);
    }
  });
  console.log(`Listening for wake word '${friendlyKeywordName}'`);
}

micDemo();
