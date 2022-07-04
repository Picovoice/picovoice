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

class PicovoiceLanguageTests: BaseTest {

    static var testData: [[Any]] = [
        ["en", "picovoice", "coffee_maker", "picovoice-coffee", "orderBeverage", ["size": "large", "beverage": "coffee"]],
        ["es", "manzana", "iluminación_inteligente", "manzana-luz_es", "changeColor", ["location": "habitación", "color": "rosado"]],
        ["de", "heuschrecke", "beleuchtung", "heuschrecke-beleuchtung_de", "changeState", ["state": "aus"]],
        ["fr", "mon chouchou", "éclairage_intelligent", "mon-intelligent_fr", "changeColor", ["color": "violet"]],
        ["it", "cameriere", "illuminazione", "cameriere-luce_it", "spegnereLuce", ["luogo": "bagno"]],
        ["ja", "ninja", "sumāto_shōmei", "ninja-sumāto-shōmei_ja", "色変更", ["色": "オレンジ"]],
        ["ko", "koppulso", "seumateu_jomyeong", "koppulso-seumateu-jomyeong_ko", "changeColor", ["color": "파란색"]],
        ["pt", "abacaxi", "luz_inteligente", "abaxi-luz_pt", "ligueLuz", ["lugar": "cozinha"]],
    ]

    var language: String = ""
    var porcupineModelPath: String = ""
    var rhinoModelPath: String = ""
    var keywordPath: String = ""
    var contextPath: String = ""
    var testAudioPath: URL? = URL(string: "")
    var expectedIntent: String = ""
    var expectedSlots: [String: String] = [:]

    override class var defaultTestSuite: XCTestSuite {
        get {
            let xcTestSuite = XCTestSuite(name: NSStringFromClass(self))
            let bundle = Bundle(for: self)

            for testCase in testData {
                let suffix = (testCase[0]) as! String == "en" ? "" : "_\(testCase[0])"
                for invocation in testInvocations {
                    let newTestCase = PicovoiceLanguageTests(invocation: invocation)

                    newTestCase.language = testCase[0] as! String
                    newTestCase.porcupineModelPath = bundle.path(forResource: "porcupine_params\(suffix)", ofType: "pv")!
                    newTestCase.rhinoModelPath = bundle.path(forResource: "rhino_params\(suffix)", ofType: "pv")!
                    newTestCase.keywordPath = bundle.path(forResource: "\(testCase[1])_ios", ofType: "ppn")!
                    newTestCase.contextPath = bundle.path(forResource: "\(testCase[2])_ios", ofType: "rhn")!
                    newTestCase.testAudioPath = bundle.url(forResource: "\(testCase[3])", withExtension: "wav")!
                    newTestCase.expectedIntent = testCase[4] as! String
                    newTestCase.expectedSlots = testCase[5] as! [String: String]
                    xcTestSuite.addTest(newTestCase)
                }
            }

            return xcTestSuite
        }
    }

    func testWrapper() throws {
        try XCTContext.runActivity(named: "(\(language))") { _ in
            let p = try! Picovoice(
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
