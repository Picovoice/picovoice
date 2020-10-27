/*
    Copyright 2018-2020 Picovoice Inc.
    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.
    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

PicovoiceManager = (function () {
  let picovoiceWorker;
  let ppnReady = false;
  let rhnReady = false;
  let downsamplingScript;
  let initCallback;
  let keywordDetectionCallback;
  let inferenceCallback;
  let errorCallback;
  let keywordsID;
  let keywordSensitivities;
  let context;

  let start = function (
    _keywordsID,
    _keywordSensitivities,
    _keywordDetectionCallback,
    _context,
    _inferenceCallback,
    _errorCallback,
    _initCallback,
    _picovoiceWorkerScript,
    _downsamplingScript
  ) {
    ppnReady = false;
    rhnReady = false;
    picovoiceWorker = new Worker(_picovoiceWorkerScript);

    keywordsID = _keywordsID;
    keywordSensitivities = _keywordSensitivities;
    context = _context;
    downsamplingScript = _downsamplingScript;
    errorCallback = _errorCallback;
    initCallback = _initCallback;
    keywordDetectionCallback = _keywordDetectionCallback;
    inferenceCallback = _inferenceCallback;

    picovoiceWorker.onmessage = function (messageEvent) {
      if (messageEvent.data.status === "pv-init") {
        picovoiceWorker.postMessage({
          command: "init",
          keywordIDs: keywordsID,
          sensitivities: keywordSensitivities,
          context: context,
        });
        WebVoiceProcessor.start([this], downsamplingScript, errorCallback);
        initCallback();
      } else {
        if (messageEvent.data.keyword !== undefined) {
          keywordDetectionCallback(messageEvent.data.keyword);
        }
        if (messageEvent.data.isUnderstood !== undefined) {
          inferenceCallback(messageEvent.data);
        }
      }
    }.bind(this);
  };

  let refresh = function (
    _initCallback,
    _keywordDetectionCallback,
    _inferenceCallback
  ) {
    initCallback = _initCallback;
    keywordDetectionCallback = _keywordDetectionCallback;
    inferenceCallback = _inferenceCallback;
  };

  let stop = function () {
    WebVoiceProcessor.stop();
    picovoiceWorker.postMessage({ command: "release" });
    picovoiceWorker = null;
  };

  let processFrame = function (frame) {
    picovoiceWorker.postMessage({ command: "process", inputFrame: frame });
  };

  return {
    start: start,
    refresh: refresh,
    processFrame: processFrame,
    stop: stop,
  };
})();
