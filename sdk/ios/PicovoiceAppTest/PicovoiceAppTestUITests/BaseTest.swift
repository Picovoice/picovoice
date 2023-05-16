//
//  Copyright 2022 Picovoice Inc.
//  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
//  file accompanying this source.
//  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
//  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
//  specific language governing permissions and limitations under the License.
//

import AVFoundation
import XCTest

import Picovoice
import Rhino

class BaseTest: XCTestCase {
    let accessKey: String = "{TESTING_ACCESS_KEY_HERE}"

    var isWakeWordDetected = false
    var inferenceResult: Inference?

    override func setUp() {
        super.setUp()
        continueAfterFailure = false
    }

    override func tearDown() {
        super.tearDown()
        isWakeWordDetected = false
        inferenceResult = nil
    }

    func wakeWordCallback() {
        isWakeWordDetected = true
    }

    func inferenceCallback(inference: Inference) {
        inferenceResult = inference
    }

    func processFile(picovoice: Picovoice, testAudioURL: URL) throws {
        let data = try Data(contentsOf: testAudioURL)
        let frameLengthBytes = Int(Rhino.frameLength) * 2
        var pcmBuffer = [Int16](repeating: 0, count: Int(Rhino.frameLength))
        var index = 44
        while index + frameLengthBytes < data.count {
            _ = pcmBuffer.withUnsafeMutableBytes {
                data.copyBytes(to: $0, from: index..<(index + frameLengthBytes))
            }
            try picovoice.process(pcm: pcmBuffer)

            index += frameLengthBytes
        }
    }
}
