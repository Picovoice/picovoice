//
// Copyright 2020-2024 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
// file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//
'use strict';

import * as fs from 'fs';
import * as os from 'os';

import { PicovoiceRuntimeError } from '../src/errors';

const SYSTEM_LINUX = 'linux';
const SYSTEM_MAC = 'darwin';
const SYSTEM_WINDOWS = 'win32';

const X86_64 = 'x64';
const ARM_64 = 'arm64';

const PLATFORM_BEAGLEBONE = 'beaglebone';
const PLATFORM_JETSON = 'jetson';
const PLATFORM_LINUX = 'linux';
const PLATFORM_MAC = 'mac';
const PLATFORM_RASPBERRY_PI = 'raspberry-pi';
const PLATFORM_WINDOWS = 'windows';


function getCpuPart(): string {
  const cpuInfo = fs.readFileSync('/proc/cpuinfo', 'ascii');
  for (const infoLine of cpuInfo.split('\n')) {
    if (infoLine.includes('CPU part')) {
      const infoLineSplit = infoLine.split(' ');
      return infoLineSplit[infoLineSplit.length - 1].toLowerCase();
    }
  }
  throw new PicovoiceRuntimeError(`Unsupported CPU.`);
}

function getLinuxPlatform(): string {
  const cpuPart = getCpuPart();
  switch (cpuPart) {
    case '0xc07':
    case '0xd03':
    case '0xd08':
    case '0xd0b':
      return PLATFORM_RASPBERRY_PI;
    case '0xd07':
      return PLATFORM_JETSON;
    case '0xc08':
      return PLATFORM_BEAGLEBONE;
    default:
      throw new PicovoiceRuntimeError(`Unsupported CPU: '${cpuPart}'`);
  }
}

export function getPlatform(): string {
  const system = os.platform();
  const arch = os.arch();

  if (system === SYSTEM_MAC && (arch === X86_64 || arch === ARM_64)) {
    return PLATFORM_MAC;
  }

  if (system === SYSTEM_WINDOWS && arch === X86_64) {
    return PLATFORM_WINDOWS;
  }

  if (system === SYSTEM_LINUX) {
    if (arch === X86_64) {
      return PLATFORM_LINUX;
    }
    return getLinuxPlatform();
  }

  throw `System ${system}/${arch} is not supported by this library.`;
}

