//
// Copyright 2021 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
// file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//

import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';

import 'package:rhino_flutter/rhino.dart';
import 'package:picovoice_flutter/picovoice_manager.dart';
import 'package:picovoice_flutter/picovoice_error.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final String accessKey =
      '{YOUR_ACCESS_KEY_HERE}'; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)

  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  bool isError = false;
  String errorMessage = "";

  bool isButtonDisabled = false;
  bool isProcessing = false;
  bool wakeWordDetected = false;
  String rhinoText = "";
  PicovoiceManager? _picovoiceManager;

  @override
  void initState() {
    super.initState();
    setState(() {
      isButtonDisabled = true;
      rhinoText = "";
    });

    initPicovoice();
  }

  Future<void> initPicovoice() async {
    String platform = Platform.isAndroid
        ? "android"
        : Platform.isIOS
            ? "ios"
            : throw PicovoiceRuntimeException(
                "This demo supports iOS and Android only.");
    String keywordPath =
        "assets/keyword_files/$platform/picovoice_$platform.ppn";
    String contextPath =
        "assets/contexts/$platform/smart_lighting_$platform.rhn";

    _picovoiceManager = PicovoiceManager.create(accessKey, keywordPath,
        wakeWordCallback, contextPath, inferenceCallback,
        processErrorCallback: errorCallback);
    setState(() {
      isButtonDisabled = false;
    });
  }

  void wakeWordCallback() {
    setState(() {
      wakeWordDetected = true;
      rhinoText = "Wake word detected!\nListening for intent...";
    });
  }

  void inferenceCallback(RhinoInference inference) {
    setState(() {
      rhinoText = prettyPrintInference(inference);
      wakeWordDetected = false;
    });

    Future.delayed(const Duration(milliseconds: 2500), () {
      if (isProcessing) {
        if (wakeWordDetected) {
          rhinoText = "Wake word detected!\nListening for intent...";
        } else {
          setState(() {
            rhinoText = "Listening for wake word...";
          });
        }
      } else {
        setState(() {
          rhinoText = "";
        });
      }
    });
  }

  void errorCallback(PicovoiceException error) {
    if (error.message != null) {
      setState(() {
        isError = true;
        errorMessage = error.message!;
        isProcessing = false;
      });
    }
  }

  String prettyPrintInference(RhinoInference inference) {
    String printText =
        "{\n    \"isUnderstood\" : \"${inference.isUnderstood}\",\n";
    if (inference.isUnderstood!) {
      printText += "    \"intent\" : \"${inference.intent}\",\n";
      if (inference.slots!.isNotEmpty) {
        printText += '    "slots" : {\n';
        Map<String, String> slots = inference.slots!;
        for (String key in slots.keys) {
          printText += "        \"$key\" : \"${slots[key]}\",\n";
        }
        printText += '    }\n';
      }
    }
    printText += '}';
    return printText;
  }

  Future<void> _startProcessing() async {
    if (isProcessing) {
      return;
    }

    setState(() {
      isButtonDisabled = true;
    });

    try {
      if (_picovoiceManager == null) {
        throw PicovoiceInvalidStateException(
            "_picovoiceManager not initialized.");
      }
      await _picovoiceManager!.start();
      setState(() {
        isProcessing = true;
        rhinoText = "Listening for wake word...";
        isButtonDisabled = false;
      });
    } on PicovoiceInvalidArgumentException catch (ex) {
      errorCallback(PicovoiceInvalidArgumentException(
          "${ex.message}\nEnsure your accessKey '$accessKey' is a valid access key."));
    } on PicovoiceActivationException {
      errorCallback(
          PicovoiceActivationException("AccessKey activation error."));
    } on PicovoiceActivationLimitException {
      errorCallback(PicovoiceActivationLimitException(
          "AccessKey reached its device limit."));
    } on PicovoiceActivationRefusedException {
      errorCallback(PicovoiceActivationRefusedException("AccessKey refused."));
    } on PicovoiceActivationThrottledException {
      errorCallback(PicovoiceActivationThrottledException(
          "AccessKey has been throttled."));
    } on PicovoiceException catch (ex) {
      errorCallback(ex);
    }
  }

  Future<void> _stopProcessing() async {
    if (!isProcessing) {
      return;
    }

    setState(() {
      isButtonDisabled = true;
    });

    if (_picovoiceManager == null) {
      throw PicovoiceInvalidStateException(
          "_picovoiceManager not initialized.");
    }
    await _picovoiceManager!.stop();
    setState(() {
      isProcessing = false;
      rhinoText = "";
      isButtonDisabled = false;
    });
  }

  Color picoBlue = Color.fromRGBO(55, 125, 255, 1);
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        key: _scaffoldKey,
        appBar: AppBar(
          title: const Text('Picovoice Demo'),
          backgroundColor: picoBlue,
        ),
        body: Column(
          children: [
            buildStartButton(context),
            buildRhinoTextArea(context),
            buildErrorMessage(context),
            footer
          ],
        ),
      ),
    );
  }

  buildStartButton(BuildContext context) {
    final ButtonStyle buttonStyle = ElevatedButton.styleFrom(
        primary: picoBlue,
        shape: CircleBorder(),
        textStyle: TextStyle(color: Colors.white));

    return Expanded(
      flex: 4,
      child: Container(
          child: SizedBox(
              width: 130,
              height: 130,
              child: ElevatedButton(
                style: buttonStyle,
                onPressed: (isButtonDisabled || isError)
                    ? null
                    : isProcessing
                        ? _stopProcessing
                        : _startProcessing,
                child: Text(isProcessing ? "Stop" : "Start",
                    style: TextStyle(fontSize: 30)),
              ))),
    );
  }

  buildRhinoTextArea(BuildContext context) {
    return Expanded(
        flex: 8,
        child: Container(
            alignment: Alignment.center,
            color: Color(0xff25187e),
            margin: EdgeInsets.all(20),
            padding: EdgeInsets.all(10),
            child: Text(
              rhinoText,
              style: TextStyle(color: Colors.white, fontSize: 20),
            )));
  }

  buildErrorMessage(BuildContext context) {
    return Expanded(
        flex: isError ? 4 : 0,
        child: Container(
            alignment: Alignment.center,
            margin: EdgeInsets.only(left: 20, right: 20, bottom: 10),
            padding: EdgeInsets.all(5),
            decoration: !isError
                ? null
                : BoxDecoration(
                    color: Colors.red, borderRadius: BorderRadius.circular(5)),
            child: !isError
                ? null
                : Text(
                    errorMessage,
                    style: TextStyle(color: Colors.white, fontSize: 18),
                  )));
  }

  Widget footer = Expanded(
      flex: 1,
      child: Container(
          alignment: Alignment.bottomCenter,
          padding: EdgeInsets.only(bottom: 20),
          child: const Text(
            "Made in Vancouver, Canada by Picovoice",
            style: TextStyle(color: Color(0xff666666)),
          )));
}
