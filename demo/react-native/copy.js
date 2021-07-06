//
// Copyright 2020 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
// file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//
'use strict';

const fs = require('fs');
const mkdirp = require('mkdirp');

// copy Android resources
mkdirp.sync('./android/picovoice-rn-demo-app/src/main/res/raw');
fs.copyFileSync(
  '../../resources/porcupine/resources/keyword_files/android/porcupine_android.ppn',
  './android/picovoice-rn-demo-app/src/main/res/raw/porcupine_android.ppn',
);
fs.copyFileSync(
  '../../resources/rhino/resources/contexts/android/smart_lighting_android.rhn',
  './android/picovoice-rn-demo-app/src/main/res/raw/smart_lighting_android.rhn',
);

// copy iOS resources
mkdirp.sync('./ios/resources');
fs.copyFileSync(
  '../../resources/rhino/resources/contexts/ios/smart_lighting_ios.rhn',
  './ios/resources/smart_lighting_ios.rhn',
);
