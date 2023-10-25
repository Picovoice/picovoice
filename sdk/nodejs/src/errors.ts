//
// Copyright 2020-2023 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
// file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//
'use strict';

import PvStatus from './pv_status_t';

export class PicovoiceError extends Error {}

export class PicovoiceOutOfMemoryError extends PicovoiceError {}
export class PicovoiceIOError extends PicovoiceError {}
export class PicovoiceInvalidArgumentError extends PicovoiceError {}
export class PicovoiceStopIterationError extends PicovoiceError {}
export class PicovoiceKeyError extends PicovoiceError {}
export class PicovoiceInvalidStateError extends PicovoiceError {}
export class PicovoiceRuntimeError extends PicovoiceError {}
export class PicovoiceActivationError extends PicovoiceError {}
export class PicovoiceActivationLimitReachedError extends PicovoiceError {}
export class PicovoiceActivationThrottledError extends PicovoiceError {}
export class PicovoiceActivationRefusedError extends PicovoiceError {}

export function pvStatusToException(
  pvStatus: PvStatus,
  errorMessage: string
): void {
  switch (pvStatus) {
    case PvStatus.OUT_OF_MEMORY:
      throw new PicovoiceOutOfMemoryError(errorMessage);
    case PvStatus.IO_ERROR:
      throw new PicovoiceIOError(errorMessage);
    case PvStatus.INVALID_ARGUMENT:
      throw new PicovoiceInvalidArgumentError(errorMessage);
    case PvStatus.STOP_ITERATION:
      throw new PicovoiceStopIterationError(errorMessage);
    case PvStatus.KEY_ERROR:
      throw new PicovoiceKeyError(errorMessage);
    case PvStatus.INVALID_STATE:
      throw new PicovoiceInvalidStateError(errorMessage);
    case PvStatus.RUNTIME_ERROR:
      throw new PicovoiceRuntimeError(errorMessage);
    case PvStatus.ACTIVATION_ERROR:
      throw new PicovoiceActivationError(errorMessage);
    case PvStatus.ACTIVATION_LIMIT_REACHED:
      throw new PicovoiceActivationLimitReachedError(errorMessage);
    case PvStatus.ACTIVATION_THROTTLED:
      throw new PicovoiceActivationThrottledError(errorMessage);
    case PvStatus.ACTIVATION_REFUSED:
      throw new PicovoiceActivationRefusedError(errorMessage);
    default:
      // eslint-disable-next-line no-console
      console.warn(`Unmapped error code: ${pvStatus}`);
      throw new PicovoiceError(errorMessage);
  }
}
