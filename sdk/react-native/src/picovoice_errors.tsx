//
// Copyright 2021-2023 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
// file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//

class PicovoiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PicovoiceError';
  }
}

class PicovoiceMemoryError extends PicovoiceError {
  constructor(message: string) {
    super(message);
    this.name = 'PicovoiceMemoryError';
  }
}

class PicovoiceIOError extends PicovoiceError {
  constructor(message: string) {
    super(message);
    this.name = 'PicovoiceIOError';
  }
}

class PicovoiceInvalidArgumentError extends PicovoiceError {
  constructor(message: string) {
    super(message);
    this.name = 'PicovoiceInvalidArgumentError';
  }
}

class PicovoiceStopIterationError extends PicovoiceError {
  constructor(message: string) {
    super(message);
    this.name = 'PicovoiceStopIterationError';
  }
}

class PicovoiceKeyError extends PicovoiceError {
  constructor(message: string) {
    super(message);
    this.name = 'PicovoiceKeyError';
  }
}

class PicovoiceInvalidStateError extends PicovoiceError {
  constructor(message: string) {
    super(message);
    this.name = 'PicovoiceInvalidStateError';
  }
}

class PicovoiceRuntimeError extends PicovoiceError {
  constructor(message: string) {
    super(message);
    this.name = 'PicovoiceRuntimeError';
  }
}

class PicovoiceActivationError extends PicovoiceError {
  constructor(message: string) {
    super(message);
    this.name = 'PicovoiceActivationError';
  }
}

class PicovoiceActivationLimitError extends PicovoiceError {
  constructor(message: string) {
    super(message);
    this.name = 'PicovoiceActivationLimitError';
  }
}

class PicovoiceActivationThrottledError extends PicovoiceError {
  constructor(message: string) {
    super(message);
    this.name = 'PicovoiceActivationThrottledError';
  }
}

class PicovoiceActivationRefusedError extends PicovoiceError {
  constructor(message: string) {
    super(message);
    this.name = 'PicovoiceActivationRefusedError';
  }
}

export {
  PicovoiceError,
  PicovoiceMemoryError,
  PicovoiceIOError,
  PicovoiceInvalidArgumentError,
  PicovoiceStopIterationError,
  PicovoiceKeyError,
  PicovoiceInvalidStateError,
  PicovoiceRuntimeError,
  PicovoiceActivationError,
  PicovoiceActivationLimitError,
  PicovoiceActivationThrottledError,
  PicovoiceActivationRefusedError,
};
