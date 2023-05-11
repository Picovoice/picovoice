//
//  Copyright 2021 Picovoice Inc.
//  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
//  file accompanying this source.
//  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
//  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
//  specific language governing permissions and limitations under the License.
//

public class PicovoiceError: LocalizedError {
    private let message: String

    public init (_ message: String) {
        self.message = message
    }

    public var errorDescription: String? {
        return message
    }

    public var name: String {
        get {
            return String(describing: type(of: self))
        }
    }
}

public class PicovoiceMemoryError: PicovoiceError {}

public class PicovoiceIOError: PicovoiceError {}

public class PicovoiceInvalidArgumentError: PicovoiceError {}

public class PicovoiceStopIterationError: PicovoiceError {}

public class PicovoiceKeyError: PicovoiceError {}

public class PicovoiceInvalidStateError: PicovoiceError {}

public class PicovoiceRuntimeError: PicovoiceError {}

public class PicovoiceActivationError: PicovoiceError {}

public class PicovoiceActivationLimitError: PicovoiceError {}

public class PicovoiceActivationThrottledError: PicovoiceError {}

public class PicovoiceActivationRefusedError: PicovoiceError {}
