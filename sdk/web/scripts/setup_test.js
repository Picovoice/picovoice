const fs = require('fs');
const { join } = require('path');

const modelFiles = [
  {
    sourceDirectory: join(
      __dirname,
      '..',
      '..',
      '..',
      'resources',
      'porcupine',
      'lib',
      'common'
    ),
    file: 'porcupine_params.pv',
  },
  {
    sourceDirectory: join(
      __dirname,
      '..',
      '..',
      '..',
      'resources',
      'porcupine',
      'resources',
      'keyword_files',
      'wasm'
    ),
    file: 'picovoice_wasm.ppn',
  },
  {
    sourceDirectory: join(
      __dirname,
      '..',
      '..',
      '..',
      'resources',
      'rhino',
      'lib',
      'common'
    ),
    file: 'rhino_params.pv',
  },
  {
    sourceDirectory: join(
      __dirname,
      '..',
      '..',
      '..',
      'resources',
      'rhino',
      'resources',
      'contexts',
      'wasm'
    ),
    file: 'coffee_maker_wasm.rhn',
  },
];

console.log('Copying the test files...');

const outputDirectory = join(__dirname, '..', 'test');

try {
  fs.mkdirSync(outputDirectory, { recursive: true });
  modelFiles.forEach(({ sourceDirectory, file }) => {
    fs.copyFileSync(join(sourceDirectory, file), join(outputDirectory, file));
  });
} catch (error) {
  console.error(error);
}

console.log('... Done!');
