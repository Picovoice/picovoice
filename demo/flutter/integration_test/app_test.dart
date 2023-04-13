import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/services.dart' show rootBundle;
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

import 'package:rhino_flutter/rhino.dart';
import 'package:picovoice_flutter/picovoice.dart';
import 'package:picovoice_flutter/picovoice_error.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  final String accessKey = "{TESTING_ACCESS_KEY_HERE}";
  final String platform = Platform.isAndroid
      ? "android"
      : Platform.isIOS
          ? "ios"
          : throw ("Unsupported platform");

  Future<List<int>> loadAudioFile(String audioPath) async {
    List<int> pcm = [];
    var audioFileData = await rootBundle.load(audioPath);
    for (int i = 44; i < audioFileData.lengthInBytes; i += 2) {
      pcm.add(audioFileData.getInt16(i, Endian.little));
    }
    return pcm;
  }

  group('Picovoice Tests', () {
    late dynamic testData;

    setUp(() async {
      String testDataJson =
          await rootBundle.loadString('assets/test_resources/test_data.json');
      testData = json.decode(testDataJson);
    });

    testWidgets('Test all languages', (tester) async {
      for (int t = 0; t < testData['tests']['parameters'].length; t++) {
        String language = testData['tests']['parameters'][t]['language'];
        String wakeword = testData['tests']['parameters'][t]['wakeword'];
        String contextName = testData['tests']['parameters'][t]['context_name'];
        var expectedInference = testData['tests']['parameters'][t]['inference'];

        String keywordPath =
            "assets/test_resources/keyword_files/${wakeword}_${platform}.ppn";
        String contextPath =
            "assets/test_resources/context_files/${contextName}_${platform}.rhn";
        String porcupineModelPath =
            "assets/test_resources/model_files/porcupine_params${language != "en" ? "_${language}" : ""}.pv";
        String rhinoModelPath =
            "assets/test_resources/model_files/rhino_params${language != "en" ? "_${language}" : ""}.pv";

        bool wakewordCalled = false;
        RhinoInference? inference;

        void wakewordCallback() {
          wakewordCalled = true;
        }

        void inferenceCallback(RhinoInference newInference) {
          if (newInference.isFinalized) {
            inference = newInference;
          }
        }

        Picovoice picovoice;
        try {
          picovoice = await Picovoice.create(accessKey, keywordPath,
              wakewordCallback, contextPath, inferenceCallback,
              porcupineModelPath: porcupineModelPath,
              rhinoModelPath: rhinoModelPath);
        } on PicovoiceException catch (ex) {
          expect(ex, equals(null),
              reason: "Failed to initialize Picovoice for ${language}: ${ex}");
          return;
        }

        String audioFile = testData['tests']['parameters'][t]['audio_file'];
        String audioPath = "assets/test_resources/audio_samples/${audioFile}";
        List<int> pcm = await loadAudioFile(audioPath);

        final int frameLength = picovoice.frameLength!;
        for (int i = 0; i < (pcm.length - frameLength); i += frameLength) {
          picovoice.process(pcm.sublist(i, i + frameLength));
          await Future.delayed(Duration(milliseconds: 32));
        }

        picovoice.delete();
        expect(wakewordCalled, equals(true),
            reason:
                "Picovoice didn't call wakewordCallback for ${language} ${wakeword} ${contextName}");
        expect(inference, isNot(equals(null)),
            reason:
                "Picovoice returned wrong inference for ${language} ${wakeword} ${contextName}");
        expect(inference?.isUnderstood, equals(true),
            reason:
                "Picovoice returned wrong inference for ${language} ${wakeword} ${contextName}");
        expect(inference?.intent, equals(expectedInference['intent']),
            reason:
                "Picovoice returned wrong inference for ${language} ${wakeword} ${contextName}");
        expect(inference?.slots, equals(expectedInference['slots']),
            reason:
                "Picovoice returned wrong inference for ${language} ${wakeword} ${contextName}");
      }
    });
  });
}
