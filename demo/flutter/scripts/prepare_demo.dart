import "package:path/path.dart";

import "dart:convert";
import "dart:io";

final String pvResPath =
    join(dirname(Platform.script.path), "..", "..", "..", "resources");
final String ppnResPath = join(pvResPath, "porcupine", "resources");
final String rhnResPath = join(pvResPath, "rhino", "resources");
final String ppnLibPath = join(pvResPath, "porcupine", "lib");
final String rhnLibPath = join(pvResPath, "rhino", "lib");
final String testDataPath = join(pvResPath, ".test", "test_data.json");

final String assetsPath = join(dirname(Platform.script.path), "..", "assets");
final String keywordsPath = join(assetsPath, "keywords");
final String contextsPath = join(assetsPath, "contexts");
final String modelsPath = join(assetsPath, "models");

Future<Map> readJsonFile(String filePath) async {
  var input = await File(filePath).readAsString();
  var map = jsonDecode(input);
  return map;
}

void main(List<String> arguments) async {
  var testData = await readJsonFile(testDataPath);
  List<String> availableLanguages = List<String>.from(
      testData["tests"]["parameters"].map((x) => x["language"]).toList());

  if (arguments.isEmpty) {
    print(
        "Choose the language you would like to run the demo in with 'dart scripts/prepare_demo.dart [language]'.\n"
        "Available languages are ${availableLanguages.join(", ")}.");
    exit(1);
  }

  String language = arguments[0];
  String suffix = (language == "en") ? "" : "_$language";
  if (!availableLanguages.contains(language)) {
    print("'$language' is not an available demo language.\n"
        "Available languages are ${availableLanguages.join(", ")}.");
    exit(1);
  }

  String wakeWordName = testData["tests"]["parameters"]
      .firstWhere((x) => x["language"] == language)["wakeword"];
  var androidKeywordsDirSrc =
      Directory(join(ppnResPath, "keyword_files$suffix", "android"));
  var iosKeywordsDirSrc =
      Directory(join(ppnResPath, "keyword_files$suffix", "ios"));

  var androidKeywordsDirDst = Directory(join(keywordsPath, 'android'));
  if (androidKeywordsDirDst.existsSync()) {
    androidKeywordsDirDst.deleteSync(recursive: true);
  }
  androidKeywordsDirDst.createSync(recursive: true);

  var iosKeywordsDirDst = Directory(join(keywordsPath, 'ios'));
  if (iosKeywordsDirDst.existsSync()) {
    iosKeywordsDirDst.deleteSync(recursive: true);
  }
  iosKeywordsDirDst.createSync(recursive: true);

  File androidKeywordSrc =
      File(join(androidKeywordsDirSrc.path, "${wakeWordName}_android.ppn"));
  androidKeywordSrc.copySync(
      join(androidKeywordsDirDst.path, basename(androidKeywordSrc.path)));

  File iosKeywordSrc =
      File(join(iosKeywordsDirSrc.path, "${wakeWordName}_ios.ppn"));
  iosKeywordSrc
      .copySync(join(iosKeywordsDirDst.path, basename(iosKeywordSrc.path)));

  String contextName = testData["tests"]["parameters"]
      .firstWhere((x) => x["language"] == language)["context_name"];

  var androidContextsDirSrc =
      Directory(join(rhnResPath, "contexts$suffix", "android"));
  var iosContextsDirSrc = Directory(join(rhnResPath, "contexts$suffix", "ios"));

  var androidContextsDirDst = Directory(join(contextsPath, 'android'));
  if (androidContextsDirDst.existsSync()) {
    androidContextsDirDst.deleteSync(recursive: true);
  }
  androidContextsDirDst.createSync(recursive: true);

  var iosContextsDirDst = Directory(join(contextsPath, 'ios'));
  if (iosContextsDirDst.existsSync()) {
    iosContextsDirDst.deleteSync(recursive: true);
  }
  iosContextsDirDst.createSync(recursive: true);

  var modelDir = Directory(modelsPath);
  if (modelDir.existsSync()) {
    modelDir.deleteSync(recursive: true);
  }
  modelDir.createSync(recursive: true);

  File androidContextSrc =
      File(join(androidContextsDirSrc.path, "${contextName}_android.rhn"));
  androidContextSrc.copySync(
      join(androidContextsDirDst.path, basename(androidContextSrc.path)));

  File iosContextSrc =
      File(join(iosContextsDirSrc.path, "${contextName}_ios.rhn"));
  iosContextSrc
      .copySync(join(iosContextsDirDst.path, basename(iosContextSrc.path)));

  if (language != "en") {
    File ppnModel =
        File(join(ppnLibPath, "common", "porcupine_params$suffix.pv"));
    ppnModel.copySync(join(modelDir.path, basename(ppnModel.path)));

    File rhnModel = File(join(rhnLibPath, "common", "rhino_params$suffix.pv"));
    rhnModel.copySync(join(modelDir.path, basename(rhnModel.path)));
  }

  var params = <String, String>{};
  params["language"] = language;
  params["wakeWord"] = wakeWordName;
  params["context"] = contextName;

  var encoded = json.encode(params);
  File f = File(join(assetsPath, "params.json"));
  f.writeAsStringSync(encoded);

  print("Demo is ready to run!");
}
