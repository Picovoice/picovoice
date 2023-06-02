//
// Copyright 2021-2023 Picovoice Inc.
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
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:rhino_flutter/rhino.dart';
import 'package:picovoice_flutter/picovoice_manager.dart';
import 'package:picovoice_flutter/picovoice_error.dart';

void main() {
  runApp(MaterialApp(home: MyApp()));
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
  String? contextInfo;
  String contextName = "";
  String wakeWordName = "";
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
    final paramsString =
        await DefaultAssetBundle.of(context).loadString('assets/params.json');
    final params = json.decode(paramsString);

    String language = params["language"];
    contextName = params["context"];
    wakeWordName = params["wakeWord"];
    String platform = Platform.isAndroid
        ? "android"
        : Platform.isIOS
            ? "ios"
            : throw PicovoiceRuntimeException(
                "This demo supports iOS and Android only.");

    String wakeWordPath =
        "assets/keywords/$platform/${wakeWordName}_$platform.ppn";
    String contextPath =
        "assets/contexts/$platform/${contextName}_$platform.rhn";
    String? porcupineModelPath =
        language != "en" ? "assets/models/porcupine_params_$language.pv" : null;
    String? rhinoModelPath =
        language != "en" ? "assets/models/rhino_params_$language.pv" : null;
    _picovoiceManager = PicovoiceManager.create(accessKey, wakeWordPath,
        wakeWordCallback, contextPath, inferenceCallback,
        porcupineModelPath: porcupineModelPath,
        rhinoModelPath: rhinoModelPath,
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
            rhinoText = "Listening for '$wakeWordName'...";
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

  Future<bool> _startPicovoice() async {
    if (_picovoiceManager == null) {
      throw PicovoiceInvalidStateException(
          "_picovoiceManager not initialized.");
    }

    try {
      await _picovoiceManager!.start();
      setState(() {
        contextInfo = _picovoiceManager!.contextInfo;
      });
      return true;
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
    return false;
  }

  Future<void> _startProcessing() async {
    if (isProcessing) {
      return;
    }

    setState(() {
      isButtonDisabled = true;
    });

    if (await _startPicovoice()) {
      setState(() {
        isProcessing = true;
        rhinoText = "Listening for '$wakeWordName'...";
        isButtonDisabled = false;
      });
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

  _showContextInfo(context) async {
    if (contextInfo == null) {
      setState(() {
        isProcessing = true;
        isButtonDisabled = true;
      });
      if (await _startPicovoice()) {
        await _stopProcessing();
      } else {
        return;
      }
    }
    showDialog(
        context: context,
        builder: (BuildContext context) {
          return Dialog(
            child: Container(
              padding: EdgeInsets.all(10),
              child: SingleChildScrollView(
                child: RichText(
                  textAlign: TextAlign.left,
                  text: TextSpan(
                      text: contextInfo, style: TextStyle(color: Colors.black)),
                ),
              ),
            ),
          );
        });
  }

  Color picoBlue = Color.fromRGBO(55, 125, 255, 1);
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      appBar: AppBar(
        title: const Text('Picovoice Demo'),
        backgroundColor: picoBlue,
      ),
      body: Column(
        children: [
          buildContextHeader(context),
          buildRhinoTextArea(context),
          buildErrorMessage(context),
          buildStartButton(context),
          footer
        ],
      ),
    );
  }

  buildContextHeader(BuildContext context) {
    final ButtonStyle buttonStyle = ElevatedButton.styleFrom(
        primary: picoBlue, textStyle: TextStyle(color: Colors.white));

    return Expanded(
        flex: 1,
        child: Row(
          children: [
            Expanded(
                child: Container(
                    margin: EdgeInsets.only(top: 5, left: 15),
                    child: Column(children: [
                      Expanded(
                          child: Container(
                              alignment: Alignment.centerLeft,
                              child: Text("Wake Word: $wakeWordName"))),
                      Expanded(
                          child: Container(
                              alignment: Alignment.centerLeft,
                              child: Text("Context: $contextName")))
                    ]))),
            Expanded(
                child: Container(
                    alignment: Alignment.centerRight,
                    margin: EdgeInsets.only(right: 10, top: 10),
                    child: ElevatedButton(
                      style: buttonStyle,
                      onPressed: (isButtonDisabled || isError)
                          ? null
                          : () {
                              _showContextInfo(context);
                            },
                      child:
                          Text("Context Info", style: TextStyle(fontSize: 15)),
                    )))
          ],
        ));
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
            margin: EdgeInsets.only(left: 20, right: 20, top: 10, bottom: 5),
            padding: EdgeInsets.all(10),
            child: Text(
              rhinoText,
              style: TextStyle(color: Colors.white, fontSize: 20),
            )));
  }

  buildErrorMessage(BuildContext context) {
    return Expanded(
        flex: isError ? 3 : 0,
        child: Container(
            alignment: Alignment.center,
            margin: EdgeInsets.only(left: 20, right: 20),
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
