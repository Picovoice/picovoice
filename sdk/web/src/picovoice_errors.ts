//
// Copyright 2023 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
// file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//

import { PorcupineErrors } from "@picovoice/porcupine-web";
import { RhinoErrors } from "@picovoice/rhino-web";

import { PvStatus } from "./types";

class PicovoiceError extends Error {
  private readonly _status: PvStatus;

  constructor(status: PvStatus, message: string) {
    super(message);
    this._status = status;
    this.name = 'PicovoiceError';
  }

  get status(): PvStatus {
    return this._status;
  }
}

class PicovoiceOutOfMemoryError extends PicovoiceError {
  constructor(message: string) {
    super(PvStatus.OUT_OF_MEMORY, message);
    this.name = 'PicovoiceOutOfMemoryError';
  }
}

class PicovoiceIOError extends PicovoiceError {
  constructor(message: string) {
    super(PvStatus.IO_ERROR, message);
    this.name = 'PicovoiceIOError';
  }
}

class PicovoiceInvalidArgumentError extends PicovoiceError {
  constructor(message: string) {
    super(PvStatus.INVALID_ARGUMENT, message);
    this.name = 'PicovoiceInvalidArgumentError';
  }
}

class PicovoiceStopIterationError extends PicovoiceError {
  constructor(message: string) {
    super(PvStatus.STOP_ITERATION, message);
    this.name = 'PicovoiceStopIterationError';
  }
}

class PicovoiceKeyError extends PicovoiceError {
  constructor(message: string) {
    super(PvStatus.KEY_ERROR, message);
    this.name = 'PicovoiceKeyError';
  }
}

class PicovoiceInvalidStateError extends PicovoiceError {
  constructor(message: string) {
    super(PvStatus.INVALID_STATE, message);
    this.name = 'PicovoiceInvalidStateError';
  }
}

class PicovoiceRuntimeError extends PicovoiceError {
  constructor(message: string) {
    super(PvStatus.RUNTIME_ERROR, message);
    this.name = 'PicovoiceRuntimeError';
  }
}

class PicovoiceActivationError extends PicovoiceError {
  constructor(message: string) {
    super(PvStatus.ACTIVATION_ERROR, message);
    this.name = 'PicovoiceActivationError';
  }
}

class PicovoiceActivationLimitReachedError extends PicovoiceError {
  constructor(message: string) {
    super(PvStatus.ACTIVATION_LIMIT_REACHED, message);
    this.name = 'PicovoiceActivationLimitReachedError';
  }
}

class PicovoiceActivationThrottledError extends PicovoiceError {
  constructor(message: string) {
    super(PvStatus.ACTIVATION_THROTTLED, message);
    this.name = 'PicovoiceActivationThrottledError';
  }
}

class PicovoiceActivationRefusedError extends PicovoiceError {
  constructor(message: string) {
    super(PvStatus.ACTIVATION_REFUSED, message);
    this.name = 'PicovoiceActivationRefusedError';
  }
}

export {
  PicovoiceError,
  PicovoiceOutOfMemoryError,
  PicovoiceIOError,
  PicovoiceInvalidArgumentError,
  PicovoiceStopIterationError,
  PicovoiceKeyError,
  PicovoiceInvalidStateError,
  PicovoiceRuntimeError,
  PicovoiceActivationError,
  PicovoiceActivationLimitReachedError,
  PicovoiceActivationThrottledError,
  PicovoiceActivationRefusedError,
};

export function pvStatusToException(
  pvStatus: PvStatus,
  errorMessage: string
): PicovoiceError {
  switch (pvStatus) {
    case PvStatus.OUT_OF_MEMORY:
      return new PicovoiceOutOfMemoryError(errorMessage);
    case PvStatus.IO_ERROR:
      return new PicovoiceIOError(errorMessage);
    case PvStatus.INVALID_ARGUMENT:
      return new PicovoiceInvalidArgumentError(errorMessage);
    case PvStatus.STOP_ITERATION:
      return new PicovoiceStopIterationError(errorMessage);
    case PvStatus.KEY_ERROR:
      return new PicovoiceKeyError(errorMessage);
    case PvStatus.INVALID_STATE:
      return new PicovoiceInvalidStateError(errorMessage);
    case PvStatus.RUNTIME_ERROR:
      return new PicovoiceRuntimeError(errorMessage);
    case PvStatus.ACTIVATION_ERROR:
      return new PicovoiceActivationError(errorMessage);
    case PvStatus.ACTIVATION_LIMIT_REACHED:
      return new PicovoiceActivationLimitReachedError(errorMessage);
    case PvStatus.ACTIVATION_THROTTLED:
      return new PicovoiceActivationThrottledError(errorMessage);
    case PvStatus.ACTIVATION_REFUSED:
      return new PicovoiceActivationRefusedError(errorMessage);
    default:
      // eslint-disable-next-line no-console
      console.warn(`Unmapped error code: ${pvStatus}`);
      return new PicovoiceError(pvStatus, errorMessage);
  }
}

export function mapToPicovoiceError(e: PorcupineErrors.PorcupineError | RhinoErrors.RhinoError): PicovoiceError {
  if (e instanceof PorcupineErrors.PorcupineOutOfMemoryError || e instanceof RhinoErrors.RhinoOutOfMemoryError) {
    return new PicovoiceOutOfMemoryError(e.message);
  } else if (e instanceof PorcupineErrors.PorcupineIOError || e instanceof RhinoErrors.RhinoIOError) {
    return new PicovoiceIOError(e.message);
  } else if (e instanceof PorcupineErrors.PorcupineInvalidArgumentError || e instanceof RhinoErrors.RhinoInvalidArgumentError) {
    return new PicovoiceInvalidArgumentError(e.message);
  } else if (e instanceof PorcupineErrors.PorcupineStopIterationError || e instanceof RhinoErrors.RhinoStopIterationError) {
    return new PicovoiceStopIterationError(e.message);
  } else if (e instanceof PorcupineErrors.PorcupineKeyError || e instanceof RhinoErrors.RhinoKeyError) {
    return new PicovoiceKeyError(e.message);
  } else if (e instanceof PorcupineErrors.PorcupineInvalidStateError || e instanceof RhinoErrors.RhinoInvalidStateError) {
    return new PicovoiceInvalidStateError(e.message);
  } else if (e instanceof PorcupineErrors.PorcupineRuntimeError || e instanceof RhinoErrors.RhinoRuntimeError) {
    return new PicovoiceRuntimeError(e.message);
  } else if (e instanceof PorcupineErrors.PorcupineActivationError || e instanceof RhinoErrors.RhinoActivationError) {
    return new PicovoiceActivationError(e.message);
  } else if (e instanceof PorcupineErrors.PorcupineActivationLimitReachedError || e instanceof RhinoErrors.RhinoActivationLimitReachedError) {
    return new PicovoiceActivationLimitReachedError(e.message);
  } else if (e instanceof PorcupineErrors.PorcupineActivationThrottledError || e instanceof RhinoErrors.RhinoActivationThrottledError) {
    return new PicovoiceActivationThrottledError(e.message);
  } else if (e instanceof PorcupineErrors.PorcupineActivationRefusedError || e instanceof RhinoErrors.RhinoActivationRefusedError) {
    return new PicovoiceActivationRefusedError(e.message);
  }
  return new PicovoiceError(PvStatus.RUNTIME_ERROR, e.message);
}
