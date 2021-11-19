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

class PicovoiceException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PicovoiceException";
    }
}

class PicovoiceMemoryException extends PicovoiceException {
    constructor(message: string) {
        super(message);
        this.name = "PicovoiceMemoryException";
    }
}

class PicovoiceIOException extends PicovoiceException {
    constructor(message: string) {
        super(message);
        this.name = "PicovoiceIOException";
    }
}

class PicovoiceInvalidArgumentException extends PicovoiceException {
    constructor(message: string) {
        super(message);
        this.name = "PicovoiceInvalidArgumentException";
    }
}

class PicovoiceStopIterationException extends PicovoiceException {
    constructor(message: string) {
        super(message);
        this.name = "PicovoiceStopIterationException";
    }
}

class PicovoiceKeyException extends PicovoiceException {
    constructor(message: string) {
        super(message);
        this.name = "PicovoiceKeyException";
    }
}

class PicovoiceInvalidStateException extends PicovoiceException {
    constructor(message: string) {
        super(message);
        this.name = "PicovoiceInvalidStateException";
    }
}

class PicovoiceRuntimeException extends PicovoiceException {
    constructor(message: string) {
        super(message);
        this.name = "PicovoiceRuntimeException";
    }
}

class PicovoiceActivationException extends PicovoiceException {
    constructor(message: string) {
        super(message);
        this.name = "PicovoiceActivationException";
    }
}

class PicovoiceActivationLimitException extends PicovoiceException {
    constructor(message: string) {
        super(message);
        this.name = "PicovoiceActivationLimitException";
    }
}

class PicovoiceActivationThrottledException extends PicovoiceException {
    constructor(message: string) {
        super(message);
        this.name = "PicovoiceActivationThrottledException";
    }
}

class PicovoiceActivationRefusedException extends PicovoiceException {
    constructor(message: string) {
        super(message);
        this.name = "PicovoiceActivationRefusedException";
    }
}

export {
    PicovoiceException,
    PicovoiceMemoryException,
    PicovoiceIOException,
    PicovoiceInvalidArgumentException,
    PicovoiceStopIterationException,
    PicovoiceKeyException,
    PicovoiceInvalidStateException,
    PicovoiceRuntimeException,
    PicovoiceActivationException,
    PicovoiceActivationLimitException,
    PicovoiceActivationThrottledException,
    PicovoiceActivationRefusedException
};