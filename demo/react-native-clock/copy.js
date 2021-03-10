'use strict';

const fs = require('fs');
const mkdirp = require('mkdirp');

// copy Android resources
mkdirp.sync('./android/app/src/main/res/raw');
fs.copyFileSync(
  '../../resources/porcupine/resources/keyword_files/android/pico clock_android.ppn',
  './android/app/src/main/res/raw/pico_clock_android.ppn',
);
fs.copyFileSync(
  '../../resources/rhino/resources/contexts/android/clock_android.rhn',
  './android/app/src/main/res/raw/clock_android.rhn',
);

// copy iOS resources
mkdirp.sync('./ios/resources');
fs.copyFileSync(
    '../../resources/porcupine/resources/keyword_files/ios/pico clock_ios.ppn',
    './ios/resources/pico_clock_ios.ppn',
  );
fs.copyFileSync(
  '../../resources/rhino/resources/contexts/ios/clock_ios.rhn',
  './ios/resources/clock_ios.rhn',
);
