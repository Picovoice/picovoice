'use strict';

const fs = require('fs');
const mkdirp = require('mkdirp');

// copy Android resources
mkdirp.sync('./android/picovoice-rn-clock-app/src/main/assets');
fs.copyFileSync(
  '../../resources/porcupine/resources/keyword_files/android/pico clock_android.ppn',
  './android/picovoice-rn-clock-app/src/main/assets/pico_clock_android.ppn',
);
fs.copyFileSync(
  '../../resources/rhino/resources/contexts/android/clock_android.rhn',
  './android/picovoice-rn-clock-app/src/main/assets/clock_android.rhn',
);

// copy iOS resources
fs.copyFileSync(
  '../../resources/porcupine/resources/keyword_files/ios/pico clock_ios.ppn',
  './ios/pico_clock_ios.ppn',
);
fs.copyFileSync(
  '../../resources/rhino/resources/contexts/ios/clock_ios.rhn',
  './ios/clock_ios.rhn',
);
