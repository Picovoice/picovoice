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
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;

import 'package:path_provider/path_provider.dart';
import 'package:picovoice/picovoice_manager.dart';
import 'package:picovoice/picovoice_error.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  bool isButtonDisabled = false;
  bool isProcessing = false;
  bool wakeWordDetected = false;
  String rhinoText = "";
  String errorText = "";
  PicovoiceManager? _picovoiceManager;

  @override
  void initState() {
    super.initState();
    this.setState(() {
      isButtonDisabled = true;
      rhinoText = "";
    });

    initPicovoice();
  }

  Future<void> initPicovoice() async {
    String platform = Platform.isAndroid ? "android" : "ios";
    String keywordAsset =
        "assets/keyword_files/$platform/picovoice_$platform.ppn";
    String keywordPath = await _extractAsset(keywordAsset);
    String contextAsset =
        "assets/contexts/$platform/smart_lighting_$platform.rhn";
    String contextPath = await _extractAsset(contextAsset);

    try {
      _picovoiceManager = PicovoiceManager.create(
          keywordPath, wakeWordCallback, contextPath, inferenceCallback,
          errorCallback: errorCallback);
      this.setState(() {
        isButtonDisabled = false;
      });
    } on PvError catch (ex) {
      this.setState(() {
        errorText = "Failed to initialize Picovoice: ${ex.message}";
      });
    }
  }

  void wakeWordCallback() {
    this.setState(() {
      wakeWordDetected = true;
      rhinoText = "Wake word detected!\nListening for intent...";
    });
  }

  void inferenceCallback(Map<String, dynamic> inference) {
    this.setState(() {
      rhinoText = prettyPrintInference(inference);
      wakeWordDetected = false;
    });

    Future.delayed(const Duration(milliseconds: 2500), () {
      if (isProcessing) {
        if (wakeWordDetected) {
          rhinoText = "Wake word detected!\nListening for intent...";
        } else {
          this.setState(() {
            rhinoText = "Listening for wake word...";
          });
        }
      } else {
        this.setState(() {
          rhinoText = "";
        });
      }
    });
  }

  void errorCallback(PvError error) {
    this.setState(() {
      errorText = error.message;
    });
  }

  String prettyPrintInference(Map<String, dynamic> inference) {
    String printText =
        "{\n    \"isUnderstood\" : \"${inference['isUnderstood']}\",\n";
    if (inference['isUnderstood']) {
      printText += "    \"intent\" : \"${inference['intent']}\",\n";
      if (inference['slots'].length > 0) {
        printText += '    "slots" : {\n';
        Map<String, String> slots = inference['slots'];
        for (String key in slots.keys) {
          printText += "        \"$key\" : \"${slots[key]}\",\n";
        }
        printText += '    }\n';
      }
    }
    printText += '}';
    return printText;
  }

  Future<String> _extractAsset(String resourcePath) async {
    // extraction destination
    String resourceDirectory = (await getApplicationDocumentsDirectory()).path;
    String outputPath = '$resourceDirectory/$resourcePath';
    File outputFile = new File(outputPath);

    ByteData data = await rootBundle.load(resourcePath);
    final buffer = data.buffer;

    await outputFile.create(recursive: true);
    await outputFile.writeAsBytes(
        buffer.asUint8List(data.offsetInBytes, data.lengthInBytes));
    return outputPath;
  }

  Future<void> _startProcessing() async {
    if (isProcessing) {
      return;
    }

    this.setState(() {
      isButtonDisabled = true;
    });

    try {
      if (_picovoiceManager == null) {
        throw PvAudioException("_picovoiceManager not initialized.");
      }
      await _picovoiceManager!.start();
      this.setState(() {
        isProcessing = true;
        rhinoText = "Listening for wake word...";
        isButtonDisabled = false;
      });
    } on PvAudioException catch (ex) {
      this.setState(() {
        errorText = "Failed to start audio capture: ${ex.message}";
      });
    }
  }

  Future<void> _stopProcessing() async {
    if (!isProcessing) {
      return;
    }

    this.setState(() {
      isButtonDisabled = true;
    });

    try {
      if (_picovoiceManager == null) {
        throw PvAudioException("_picovoiceManager not initialized.");
      }
      await _picovoiceManager!.stop();
      this.setState(() {
        isProcessing = false;
        rhinoText = "";
        isButtonDisabled = false;
      });
    } on PvAudioException catch (ex) {
      this.setState(() {
        errorText = "Failed to stop audio capture: ${ex.message}";
      });
    }
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
            buildErrorTextSpot(context),
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

    return new Expanded(
      flex: 4,
      child: Container(
          child: SizedBox(
              width: 130,
              height: 130,
              child: ElevatedButton(
                style: buttonStyle,
                onPressed: isButtonDisabled
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
    return new Expanded(
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

  buildErrorTextSpot(BuildContext context) {
    return new Expanded(
        flex: 1,
        child: Container(
            alignment: Alignment.center,
            padding: EdgeInsets.only(left: 10, right: 10),
            child: Text(
              errorText,
              style: TextStyle(color: Colors.red),
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
