const ncp = require("ncp");
const path = require("path");
const fs = require("fs");
const editJsonFile = require("edit-json-file");
const PORCUPINE_VERSION = "1.9.0-alpha.4";
const RHINO_VERSION = "1.6.0-alpha.0";

for (const language of ["en", "de"]) {
  for (const flavour of ["factory", "worker"]) {
    console.log(`Template: ${language} ${flavour}`);

    // Workers
    // 1. Copy language-agnostic project: i.e., the 'template' folder, to target
    // (e.g. picovoice-web-en-worker)
    const projectRootPath = path.join(__dirname, "..");
    const templateDirectory = path.join(projectRootPath, "template");
    const buildTarget = `picovoice-web-${language}-${flavour}`;
    const outputDirectory = path.join(projectRootPath, buildTarget);
    ncp(templateDirectory, outputDirectory, (err) => {
      console.log(`${language}: ncp done`);
      if (err) {
        console.error(err);
      } else {
        // 2. Copy language-specific features (Emscripten)
        const languageDirectory = path.join(projectRootPath, language);
        ncp(
          languageDirectory,
          path.join(outputDirectory, "src", "lang"),
          (err) => {
            if (err) {
              console.error(error);
            } else {
              // 3. index.ts: Rollup's entry point is different for workers/factories
              console.log(path.join(projectRootPath, flavour, "index.ts"));
              console.log(path.join(outputDirectory, "src"));
              ncp(
                path.join(projectRootPath, flavour, "index.ts"),
                path.join(outputDirectory, "src", "index.ts"),
                (err) => {
                  if (err) {
                    console.error(error);
                  } else {
                    console.log("index.ts copied");

                    // 4. Customize the package.json to have the correct names, build targets
                    // and language-specific dependenies
                    const packageJson = editJsonFile(
                      path.join(outputDirectory, "package.json")
                    );
                    packageJson.set("name", `@picovoice/${buildTarget}`);
                    packageJson.set("dependencies", {
                      [`@picovoice/porcupine-web-${language}-factory`]: `${PORCUPINE_VERSION}`,
                      [`@picovoice/rhino-web-${language}-factory`]: `${RHINO_VERSION}`,
                    });
                    packageJson.save((e) => {
                      console.log(`${buildTarget} Package JSON updated`);
                    });

                    // 5. Swap in the language-specific dependency imports in Picovoice.ts
                    const picovoiceTsPath = path.join(
                      outputDirectory,
                      "src",
                      "picovoice.ts"
                    );
                    const genericImport = fs.readFileSync(picovoiceTsPath, "utf8");
                    const languageSpecificImport = genericImport.replace(/\$lang\$/g, language);
                    fs.writeFileSync(picovoiceTsPath, languageSpecificImport);
                  }
                }
              );
            }
          }
        );
      }
    });
  }
}
