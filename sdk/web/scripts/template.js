import ncp from "ncp";
import { join, dirname } from "path";
import { readFile, writeFile, copyFile } from "fs/promises";
import editJsonFile from "edit-json-file";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const PORCUPINE_VERSION = "2.1.7";
const RHINO_VERSION = "2.1.8";
const CORE_VERSION = "2.1.2";

for (const language of ["en", "de", "es", "fr", "it", "ja", "ko", "pt"]) {
  for (const flavour of ["factory", "worker"]) {
    console.log(`Template: ${language} ${flavour}`);
    createProject(language, flavour);
  }
}

function createProject(language, flavour) {
  // 1. Copy language-agnostic project: i.e., the 'template' folder, to target
  // (e.g. picovoice-web-en-worker)
  const projectRootPath = join(__dirname, "..");
  const templateDirectory = join(projectRootPath, "template");
  const buildTarget = `picovoice-web-${language}-${flavour}`;
  const outputDirectory = join(projectRootPath, buildTarget);

  ncp(templateDirectory, outputDirectory, async (err) => {
    console.log(`${language}-${flavour}: template folder copied`);
    if (err) {
      console.log("ncp error:");
      console.error(err);
    } else {
      // 2. index.ts: Rollup's entry point is different for workers/factories
      const tsFrom = join(projectRootPath, flavour, "index.ts");
      const tsTo = join(outputDirectory, "src", "index.ts");
      await copyFile(tsFrom, tsTo);
      console.log(`${language}-${flavour}: index.ts copied`);

      // 3. Customize the package.json to have the correct names, build targets
      // and language-specific dependenies
      const packageJson = editJsonFile(join(outputDirectory, "package.json"));
      packageJson.set("name", `@picovoice/${buildTarget}`);
      packageJson.set("dependencies", {
        [`@picovoice/porcupine-web-${language}-factory`]: `${PORCUPINE_VERSION}`,
        [`@picovoice/rhino-web-${language}-factory`]: `${RHINO_VERSION}`,
        ['@picovoice/picovoice-web-core']: `${CORE_VERSION}`
      });
      packageJson.save((e) => {
        console.log(`${buildTarget} Package JSON updated`);
      });

      // 4. Swap in the language-specific dependency imports in Picovoice.ts
      // e.g.     import { Porcupine } from '@picovoice/porcupine-web-$lang$-factory';
      // becomes  import { Porcupine } from '@picovoice/porcupine-web-en-factory';
      const picovoiceTsPath = join(outputDirectory, "src", "picovoice.ts");
      const genericImport = await readFile(picovoiceTsPath, "utf8");
      if (genericImport === "") {
        throw new Error("Empty file: " + picovoiceTsPath);
      }
      const languageSpecificImport = genericImport.replace(
        /\$lang\$/g,
        language
      );
      await writeFile(picovoiceTsPath, languageSpecificImport);
    }
  });
}
