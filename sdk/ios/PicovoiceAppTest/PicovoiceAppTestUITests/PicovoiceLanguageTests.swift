//
//  Copyright 2022-2023 Picovoice Inc.
//  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
//  file accompanying this source.
//  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
//  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
//  specific language governing permissions and limitations under the License.
//

import AVFoundation
import XCTest

import Picovoice

struct TestData: Decodable {
    var tests: TestDataTests
}

struct TestDataTests: Decodable {
    var parameters: [TestDataParametersTest]
}

struct TestDataParametersTest: Decodable {
    var language: String
    var wakeword: String
    var context_name: String
    var audio_file: String
    var inference: TestDataInference
}

struct TestDataInference: Decodable {
    var intent: String
    var slots: [String: String]
}

class PicovoiceLanguageTests: BaseTest {
    func testWrapper() throws {
        let bundle = Bundle(for: type(of: self))

        let testDataJsonUrl = bundle.url(
            forResource: "test_data",
            withExtension: "json",
            subdirectory: "test_resources")!
        let testDataJsonData = try Data(contentsOf: testDataJsonUrl)
        let testData = try JSONDecoder().decode(TestData.self, from: testDataJsonData)

        for testCase in testData.tests.parameters {
            let suffix = testCase.language == "en" ? "" : "_\(testCase.language)"

            let language: String = testCase.language
            let porcupineModelPath: String = bundle.path(
                forResource: "porcupine_params\(suffix)",
                ofType: "pv",
                inDirectory: "test_resources/model_files")!
            let rhinoModelPath: String = bundle.path(
                forResource: "rhino_params\(suffix)",
                ofType: "pv",
                inDirectory: "test_resources/model_files")!
            let keywordPath: String = bundle.path(
                forResource: "\(testCase.wakeword)_ios",
                ofType: "ppn",
                inDirectory: "test_resources/keyword_files/\(testCase.language)")!
            let contextPath: String = bundle.path(
                forResource: "\(testCase.context_name)_ios",
                ofType: "rhn",
                inDirectory: "test_resources/context_files/\(testCase.language)")!
            let testAudioPath: URL? = bundle.url(
                forResource: "\(testCase.audio_file)",
                withExtension: "",
                subdirectory: "test_resources/audio_samples")!
            let expectedIntent: String = testCase.inference.intent
            let expectedSlots: [String: String] = testCase.inference.slots

            try XCTContext.runActivity(named: "(\(language))") { _ in
                let p = try Picovoice(
                    accessKey: accessKey,
                    keywordPath: keywordPath,
                    onWakeWordDetection: wakeWordCallback,
                    contextPath: contextPath,
                    onInference: inferenceCallback,
                    porcupineModelPath: porcupineModelPath,
                    rhinoModelPath: rhinoModelPath)

                XCTAssert(Picovoice.picovoiceVersion != "")
                XCTAssert(Picovoice.frameLength > 0)
                XCTAssert(Picovoice.sampleRate > 0)
                XCTAssert(p.contextInfo != "")

                try processFile(picovoice: p, testAudioURL: testAudioPath!)
                XCTAssert(isWakeWordDetected)
                XCTAssert(inferenceResult != nil)
                XCTAssert(inferenceResult!.isUnderstood)
                XCTAssert(inferenceResult!.intent == expectedIntent)
                XCTAssert(inferenceResult!.slots == expectedSlots)

                isWakeWordDetected = false
                inferenceResult = nil

                // process again
                try processFile(picovoice: p, testAudioURL: testAudioPath!)
                XCTAssert(isWakeWordDetected)
                XCTAssert(inferenceResult != nil)
                XCTAssert(inferenceResult!.isUnderstood)
                XCTAssert(inferenceResult!.intent == expectedIntent)
                XCTAssert(inferenceResult!.slots == expectedSlots)

                p.delete()
            }
        }
    }
}
