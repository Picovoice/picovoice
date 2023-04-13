const fs = require('fs');
const { join } = require('path');

console.log('Copying the porcupine and rhino models...');

const outputDirectory = join(__dirname, '..', 'test');
const fixturesDirectory = join(__dirname, '..', 'cypress', 'fixtures');

const engines = [
  {
    "name": "porcupine",
    "dir": "keyword_files"
  },
  {
    "name": "rhino",
    "dir": "contexts"
  }
];

const sourceDirectory = join(
  __dirname,
  "..",
  "..",
  "..",
  "resources",
);

const testDataSource = join(
  sourceDirectory,
  '.test',
  'test_data.json'
);

try {
  fs.mkdirSync(outputDirectory, { recursive: true });
  fs.copyFileSync(testDataSource, join(outputDirectory, 'test_data.json'));

  fs.mkdirSync(join(fixturesDirectory, 'audio_samples'), { recursive: true });
  fs.readdirSync(join(sourceDirectory, 'audio_samples')).forEach(file => {
    fs.copyFileSync(join(sourceDirectory, 'audio_samples', file), join(fixturesDirectory, 'audio_samples', file));
  });

  for (const engine of engines) {
    const paramsSourceDirectory = join(
      sourceDirectory,
      engine.name,
      'lib',
      'common'
    );

    const engineSourceDirectory = join(
      sourceDirectory,
      engine.name,
      'resources'
    )

    fs.mkdirSync(join(outputDirectory, engine.name), { recursive: true });
    fs.readdirSync(paramsSourceDirectory).forEach(file => {
      fs.copyFileSync(join(paramsSourceDirectory, file), join(outputDirectory, engine.name, file));
    });

    fs.mkdirSync(join(outputDirectory, engine.dir), { recursive: true });
    fs.readdirSync(engineSourceDirectory).forEach(folder => {
      if (folder.includes(engine.dir)) {
        fs.readdirSync(join(engineSourceDirectory, folder, 'wasm')).forEach(file => {
          fs.copyFileSync(
            join(engineSourceDirectory, folder, 'wasm', file),
            join(outputDirectory, engine.dir, file.replace("ā", "a").replace("ō", "o")));
        });
      }
    });
  }
} catch (error) {
  console.error(error);
}

console.log('... Done!');
