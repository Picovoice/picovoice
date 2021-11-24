//
// Copyright 2021 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
// file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//

import 'package:porcupine_flutter/porcupine_error.dart';
import 'package:rhino_flutter/rhino_error.dart';

class PicovoiceException implements Exception {
  final String? message;
  PicovoiceException([this.message]);
}

class PicovoiceMemoryException extends PicovoiceException {
  PicovoiceMemoryException(String? message) : super(message);
}

class PicovoiceIOException extends PicovoiceException {
  PicovoiceIOException(String? message) : super(message);
}

class PicovoiceInvalidArgumentException extends PicovoiceException {
  PicovoiceInvalidArgumentException(String? message) : super(message);
}

class PicovoiceStopIterationException extends PicovoiceException {
  PicovoiceStopIterationException(String? message) : super(message);
}

class PicovoiceKeyException extends PicovoiceException {
  PicovoiceKeyException(String? message) : super(message);
}

class PicovoiceInvalidStateException extends PicovoiceException {
  PicovoiceInvalidStateException(String? message) : super(message);
}

class PicovoiceRuntimeException extends PicovoiceException {
  PicovoiceRuntimeException(String? message) : super(message);
}

class PicovoiceActivationException extends PicovoiceException {
  PicovoiceActivationException(String? message) : super(message);
}

class PicovoiceActivationLimitException extends PicovoiceException {
  PicovoiceActivationLimitException(String? message) : super(message);
}

class PicovoiceActivationThrottledException extends PicovoiceException {
  PicovoiceActivationThrottledException(String? message) : super(message);
}

class PicovoiceActivationRefusedException extends PicovoiceException {
  PicovoiceActivationRefusedException(String? message) : super(message);
}

mapToPicovoiceException(Exception ex, String? message) {
  switch (ex.runtimeType) {
    case PorcupineException:
    case RhinoException:
      return PicovoiceException(message);
    case PorcupineMemoryException:
    case RhinoMemoryException:
      return PicovoiceMemoryException(message);
    case PorcupineIOException:
    case RhinoIOException:
      return PicovoiceIOException(message);
    case PorcupineInvalidArgumentException:
    case RhinoInvalidArgumentException:
      return PicovoiceInvalidArgumentException(message);
    case PorcupineStopIterationException:
    case RhinoStopIterationException:
      return PicovoiceStopIterationException(message);
    case PorcupineKeyException:
    case RhinoKeyException:
      return PicovoiceKeyException(message);
    case PorcupineInvalidStateException:
    case RhinoInvalidStateException:
      return PicovoiceInvalidStateException(message);
    case PorcupineRuntimeException:
    case RhinoRuntimeException:
      return PicovoiceRuntimeException(message);
    case PorcupineActivationException:
    case RhinoActivationException:
      return PicovoiceActivationException(message);
    case PorcupineActivationLimitException:
    case RhinoActivationLimitException:
      return PicovoiceActivationLimitException(message);
    case PorcupineActivationThrottledException:
    case RhinoActivationThrottledException:
      return PicovoiceActivationThrottledException(message);
    case PorcupineActivationRefusedException:
    case RhinoActivationRefusedException:
      return PicovoiceActivationRefusedException(message);
    default:
      return PicovoiceException(
          "unexpected exception: ${ex.runtimeType}, message: $message");
  }
}
