const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const testData = require("../../../resources/.test/test_data.json");

const availableLanguages = testData["tests"]["parameters"].map(
  x => x["language"]
);

const args = process.argv.slice(2, -1);
const language = process.argv.slice(-1)[0];

if (!availableLanguages.includes(language)) {
  console.error(
    `Choose the language you would like to run the demo in with "yarn start [language]".\nAvailable languages are ${availableLanguages.join(
      ", "
    )}`
  );
  process.exit(1);
}

const createOrEmptyDir = dir => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(f => {
      fs.unlinkSync(path.join(dir, f));
    });
  } else {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const version = process.env.npm_package_version;
const suffix = language === "en" ? "" : `_${language}`;
const rootDir = path.join(__dirname, "..", "..", "..");
const ppnDir = path.join(rootDir, "resources", "porcupine");
const rhnDir = path.join(rootDir, "resources", "rhino");

const wakeword = testData["tests"]["parameters"].find(
  x => x["language"] === language
)["wakeword"];
const wakeWordFileName = `${wakeword}_wasm.ppn`;
const wakeWordDir = path.join(
  ppnDir,
  "resources",
  `keyword_files${suffix}`,
  "wasm"
);

const libDirectory = path.join(__dirname, "..", "src", "lib");
let outputDirectory = path.join(__dirname, "..", "public", "wakewords");
createOrEmptyDir(outputDirectory);

try {
  fs.copyFileSync(
    path.join(wakeWordDir, wakeWordFileName),
    path.join(outputDirectory, wakeWordFileName)
  );
} catch (error) {
  console.error(error);
  process.exit(1);
}

fs.writeFileSync(
  path.join(libDirectory, "porcupineWakeWord.js"),
  `const porcupineWakeWord = {
  label: "${wakeWordFileName.replace("_wasm.ppn", "").replace("_", " ")}",
  publicPath: "wakewords/${wakeWordFileName}",
  customWritePath: "${version}_${wakeWordFileName}",
};

export default porcupineWakeWord;
`
);

const context = testData["tests"]["parameters"].find(
  x => x["language"] === language
)["context_name"];
const contextFileName = `${context}_wasm.rhn`;
const contextDir = path.join(rhnDir, "resources", `contexts${suffix}`, "wasm");

outputDirectory = path.join(__dirname, "..", "public", "contexts");
createOrEmptyDir(outputDirectory);

try {
  fs.copyFileSync(
    path.join(contextDir, contextFileName),
    path.join(outputDirectory, contextFileName)
  );
} catch (error) {
  console.error(error);
  process.exit(1);
}

fs.writeFileSync(
  path.join(libDirectory, "rhinoContext.js"),
  `const rhinoContext = {
  publicPath: "contexts/${contextFileName}",
  customWritePath: "${version}_${contextFileName}",
};

export default rhinoContext;
`
);

outputDirectory = path.join(__dirname, "..", "public", "models");
createOrEmptyDir(outputDirectory);

const ppnModelDir = path.join(ppnDir, "lib", "common");
const ppnModelName = `porcupine_params${suffix}.pv`;
fs.copyFileSync(
  path.join(ppnModelDir, ppnModelName),
  path.join(outputDirectory, ppnModelName)
);

const rhnModelDir = path.join(rhnDir, "lib", "common");
const rhnModelName = `rhino_params${suffix}.pv`;
fs.copyFileSync(
  path.join(rhnModelDir, rhnModelName),
  path.join(outputDirectory, rhnModelName)
);

fs.writeFileSync(
  path.join(libDirectory, "picovoiceModels.js"),
  `const porcupineModel = {
  publicPath: "models/${ppnModelName}",
  customWritePath: "${version}_${ppnModelName}",
};

const rhinoModel = {
  publicPath: "models/${rhnModelName}",
  customWritePath: "${version}_${rhnModelName}",
};

export { porcupineModel, rhinoModel };
`
);

const command = (process.platform === "win32") ? "npx.cmd" : "npx";

child_process.execSync(`${command} vite ${args.join(" ")}`, {
  shell: true,
  stdio: 'inherit'
});
