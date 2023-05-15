const fs = require('fs');
const { join } = require('path');
const { createHash } = require('crypto');

console.log('Copying the porcupine and rhino models...');

const outputDirectory = join(__dirname, '..', 'test');
const fixturesDirectory = join(__dirname, '..', 'cypress', 'fixtures');

const engines = [
  {
    name: 'porcupine',
    dir: 'keyword_files',
  },
  {
    name: 'rhino',
    dir: 'contexts',
  },
];

const sourceDirectory = join(__dirname, '..', '..', '..', 'resources');

const testDataSource = join(sourceDirectory, '.test', 'test_data.json');

try {
  fs.mkdirSync(outputDirectory, { recursive: true });
  fs.copyFileSync(testDataSource, join(outputDirectory, 'test_data.json'));

  fs.mkdirSync(join(fixturesDirectory, 'audio_samples'), { recursive: true });
  fs.readdirSync(join(sourceDirectory, 'audio_samples')).forEach(file => {
    let src = join(sourceDirectory, 'audio_samples', file);

    // Bug in Cypress means we can't read utf-8 file names, so we have to hash them
    let encodedAudioName = createHash('md5')
      .update(file.replace('.wav', ''))
      .digest('hex');
    let dst = join(
      fixturesDirectory,
      'audio_samples',
      `${encodedAudioName}.wav`
    );
    fs.copyFileSync(src, dst);
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
    );

    fs.mkdirSync(join(outputDirectory, engine.name), { recursive: true });
    fs.readdirSync(paramsSourceDirectory).forEach(file => {
      fs.copyFileSync(
        join(paramsSourceDirectory, file),
        join(outputDirectory, engine.name, file)
      );
    });

    fs.mkdirSync(join(outputDirectory, engine.dir), { recursive: true });
    fs.readdirSync(engineSourceDirectory).forEach(folder => {
      if (folder.includes(engine.dir)) {
        fs.readdirSync(join(engineSourceDirectory, folder, 'wasm')).forEach(
          file => {
            let src = join(engineSourceDirectory, folder, 'wasm', file);
            if (folder === engine.dir) {
              let dst = join(outputDirectory, engine.dir, file);
              fs.copyFileSync(src, dst);
            } else {
              let fileParts = file.split('_wasm');

              // Bug in Cypress means we can't read utf-8 file names, so we have to hash them
              let encodedFileName = createHash('md5')
                .update(fileParts[0])
                .digest('hex');
              let dst = join(
                outputDirectory,
                engine.dir,
                `${encodedFileName}_wasm${fileParts[1]}`
              );
              fs.copyFileSync(src, dst);
            }
          }
        );
      }
    });
  }
} catch (error) {
  console.error(error);
}

console.log('... Done!');
