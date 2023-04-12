const fs = require('fs');
const { join } = require('path');

console.log('Copying the porcupine and rhino models...');

const fixturesDirectory = join(__dirname, '..', 'cypress', 'fixtures');
const staticDirectory = join(__dirname, '..', 'static');
const testDirectory = join(__dirname, '..', 'test');

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
  fs.mkdirSync(testDirectory, { recursive: true });
  fs.copyFileSync(testDataSource, join(testDirectory, 'test_data.json'));

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

    fs.mkdirSync(join(staticDirectory, engine.name), { recursive: true });
    fs.readdirSync(paramsSourceDirectory).forEach(file => {
      fs.copyFileSync(join(paramsSourceDirectory, file), join(staticDirectory, engine.name, file));
    });

    fs.mkdirSync(join(staticDirectory, engine.dir), { recursive: true });
    fs.readdirSync(engineSourceDirectory).forEach(folder => {
      if (folder.includes(engine.dir)) {
        fs.readdirSync(join(engineSourceDirectory, folder, 'wasm')).forEach(file => {
          fs.copyFileSync(join(engineSourceDirectory, folder, 'wasm', file), join(staticDirectory, engine.dir, file));
        });
      }
    });
  }
} catch (error) {
  console.error(error);
}

console.log('... Done!');
