'use strict';

const fs = require('fs');

// copy params
fs.copyFileSync(
  '../../resources/porcupine/lib/common/porcupine_params.pv',
  './public/porcupine_params.pv',
);
fs.copyFileSync(
  '../../resources/rhino/lib/common/rhino_params.pv',
  './public/rhino_params.pv',
);

// copy context file
fs.copyFileSync(
  '../../resources/rhino/resources/contexts/wasm/clock_wasm.rhn',
  './public/clock_wasm.rhn',
);
