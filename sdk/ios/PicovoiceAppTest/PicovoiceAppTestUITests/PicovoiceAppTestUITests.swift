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
import Rhino

class PicovoiceAppTestUITests: BaseTest {

    func testInitSuccessSimple() throws {
        let bundle = Bundle(for: type(of: self))
        let keywordPath = bundle.path(
            forResource: "picovoice_ios",
            ofType: "ppn",
            inDirectory: "test_resources/keyword_files/en")!
        let contextPath = bundle.path(
            forResource: "coffee_maker_ios",
            ofType: "rhn",
            inDirectory: "test_resources/context_files/en")!
        let p = try Picovoice(
            accessKey: accessKey,
            keywordPath: keywordPath,
            onWakeWordDetection: wakeWordCallback,
            contextPath: contextPath,
            onInference: inferenceCallback)

        XCTAssert(Picovoice.picovoiceVersion != "")
        XCTAssert(Picovoice.frameLength > 0)
        XCTAssert(Picovoice.sampleRate > 0)
        XCTAssert(p.contextInfo != "")
        p.delete()
    }

    func testInitSuccessCustomModelPaths() throws {
        let bundle = Bundle(for: type(of: self))
        let keywordPath = bundle.path(
            forResource: "picovoice_ios",
            ofType: "ppn",
            inDirectory: "test_resources/keyword_files/en")!
        let contextPath = bundle.path(
            forResource: "coffee_maker_ios",
            ofType: "rhn",
            inDirectory: "test_resources/context_files/en")!
        let porcupineModelPath = bundle.path(
            forResource: "porcupine_params",
            ofType: "pv",
            inDirectory: "test_resources/model_files/")!
        let rhinoModelPath = bundle.path(
            forResource: "rhino_params",
            ofType: "pv",
            inDirectory: "test_resources/model_files/")!
        let p = try Picovoice(
            accessKey: accessKey,
            keywordPath: keywordPath,
            onWakeWordDetection: wakeWordCallback,
            contextPath: contextPath,
            onInference: inferenceCallback,
            porcupineModelPath: porcupineModelPath,
            rhinoModelPath: rhinoModelPath)

        XCTAssert(p.contextInfo != "")
        p.delete()
    }

    func testInitSuccessCustomSensitivities() throws {
        let bundle = Bundle(for: type(of: self))
        let keywordPath = bundle.path(
            forResource: "picovoice_ios",
            ofType: "ppn",
            inDirectory: "test_resources/keyword_files/en")!
        let contextPath = bundle.path(
            forResource: "coffee_maker_ios",
            ofType: "rhn",
            inDirectory: "test_resources/context_files/en")!
        let p = try Picovoice(
            accessKey: accessKey,
            keywordPath: keywordPath,
            onWakeWordDetection: wakeWordCallback,
            contextPath: contextPath,
            onInference: inferenceCallback,
            porcupineSensitivity: 0.7,
            rhinoSensitivity: 0.35)

        XCTAssert(p.contextInfo != "")
        p.delete()
    }

    func testInitFailWithMismatchedPorcupineLanguage() throws {
        let bundle = Bundle(for: type(of: self))
        let keywordPath = bundle.path(
            forResource: "heuschrecke_ios",
            ofType: "ppn",
            inDirectory: "test_resources/keyword_files/de")!
        let contextPath = bundle.path(
            forResource: "coffee_maker_ios",
            ofType: "rhn",
            inDirectory: "test_resources/context_files/en")!

        var didFail = false
        do {
            _ = try Picovoice(
                accessKey: accessKey,
                keywordPath: keywordPath,
                onWakeWordDetection: wakeWordCallback,
                contextPath: contextPath,
                onInference: inferenceCallback)
        } catch {
            didFail = true
        }

        XCTAssert(didFail)
    }

    func testInitFailWithMismatchedRhinoLanguage() throws {
        let bundle = Bundle(for: type(of: self))
        let keywordPath = bundle.path(
            forResource: "picovoice_ios",
            ofType: "ppn",
            inDirectory: "test_resources/keyword_files/en")!
        let contextPath = bundle.path(
            forResource: "beleuchtung_ios",
            ofType: "rhn",
            inDirectory: "test_resources/context_files/de")!

        var didFail = false
        do {
            _ = try Picovoice(
                accessKey: accessKey,
                keywordPath: keywordPath,
                onWakeWordDetection: wakeWordCallback,
                contextPath: contextPath,
                onInference: inferenceCallback)
        } catch {
            didFail = true
        }

        XCTAssert(didFail)
    }

    func testInitFailWithInvalidKeywordPath() throws {
        let bundle = Bundle(for: type(of: self))
        let keywordPath = "bad_path/bad_path.ppn"
        let contextPath = bundle.path(
            forResource: "coffee_maker_ios",
            ofType: "rhn",
            inDirectory: "test_resources/context_files/en")!

        var didFail = false
        do {
            _ = try Picovoice(
                accessKey: accessKey,
                keywordPath: keywordPath,
                onWakeWordDetection: wakeWordCallback,
                contextPath: contextPath,
                onInference: inferenceCallback)
        } catch {
            didFail = true
        }

        XCTAssert(didFail)
    }

    func testInitFailWithInvalidContextPath() throws {
        let bundle = Bundle(for: type(of: self))
        let keywordPath = bundle.path(
            forResource: "picovoice_ios",
            ofType: "ppn",
            inDirectory: "test_resources/keyword_files/en")!
        let contextPath = "bad_path/bad_path.rhn"

        var didFail = false
        do {
            _ = try Picovoice(
                accessKey: accessKey,
                keywordPath: keywordPath,
                onWakeWordDetection: wakeWordCallback,
                contextPath: contextPath,
                onInference: inferenceCallback)
        } catch {
            didFail = true
        }

        XCTAssert(didFail)
    }

    func testInitFailWithInvalidPorcupineModelPath() throws {
        let bundle = Bundle(for: type(of: self))
        let keywordPath = bundle.path(
            forResource: "picovoice_ios",
            ofType: "ppn",
            inDirectory: "test_resources/keyword_files/en")!
        let contextPath = bundle.path(
            forResource: "coffee_maker_ios",
            ofType: "rhn",
            inDirectory: "test_resources/context_files/en")!
        let porcupineModelPath = "bad_path/bad_path.pv"

        var didFail = false
        do {
            _ = try Picovoice(
                accessKey: accessKey,
                keywordPath: keywordPath,
                onWakeWordDetection: wakeWordCallback,
                contextPath: contextPath,
                onInference: inferenceCallback,
                porcupineModelPath: porcupineModelPath)
        } catch {
            didFail = true
        }

        XCTAssert(didFail)
    }

    func testInitFailWithInvalidRhinoModelPath() throws {
        let bundle = Bundle(for: type(of: self))
        let keywordPath = bundle.path(
            forResource: "picovoice_ios",
            ofType: "ppn",
            inDirectory: "test_resources/keyword_files/en")!
        let contextPath = bundle.path(
            forResource: "coffee_maker_ios",
            ofType: "rhn",
            inDirectory: "test_resources/context_files/en")!
        let rhinoModelPath = "bad_path/bad_path.pv"

        var didFail = false
        do {
            _ = try Picovoice(
                accessKey: accessKey,
                keywordPath: keywordPath,
                onWakeWordDetection: wakeWordCallback,
                contextPath: contextPath,
                onInference: inferenceCallback,
                rhinoModelPath: rhinoModelPath)
        } catch {
            didFail = true
        }

        XCTAssert(didFail)
    }

    func testInitFailWithInvalidPorcupineSensitivity() throws {
        let bundle = Bundle(for: type(of: self))
        let keywordPath = bundle.path(
            forResource: "picovoice_ios",
            ofType: "ppn",
            inDirectory: "test_resources/keyword_files/en")!
        let contextPath = bundle.path(
            forResource: "coffee_maker_ios",
            ofType: "rhn",
            inDirectory: "test_resources/context_files/en")!

        var didFail = false
        do {
            _ = try Picovoice(
                accessKey: accessKey,
                keywordPath: keywordPath,
                onWakeWordDetection: wakeWordCallback,
                contextPath: contextPath,
                onInference: inferenceCallback,
                porcupineSensitivity: 10)
        } catch {
            didFail = true
        }

        XCTAssert(didFail)
    }

    func testInitFailWithInvalidRhinoSensitivity() throws {
        let bundle = Bundle(for: type(of: self))
        let keywordPath = bundle.path(
            forResource: "picovoice_ios",
            ofType: "ppn",
            inDirectory: "test_resources/keyword_files/en")!
        let contextPath = bundle.path(
            forResource: "coffee_maker_ios",
            ofType: "rhn",
            inDirectory: "test_resources/context_files/en")!

        var didFail = false
        do {
            _ = try Picovoice(
                accessKey: accessKey,
                keywordPath: keywordPath,
                onWakeWordDetection: wakeWordCallback,
                contextPath: contextPath,
                onInference: inferenceCallback,
                rhinoSensitivity: -1)
        } catch {
            didFail = true
        }

        XCTAssert(didFail)
    }

    func testInitFailWithWrongPorcupinePlatform() throws {
        let bundle = Bundle(for: type(of: self))
        let keywordPath = bundle.path(
            forResource: "alexa_linux",
            ofType: "ppn",
            inDirectory: "test_resources/keyword_files/en")!
        let contextPath = bundle.path(
            forResource: "coffee_maker_ios",
            ofType: "rhn",
            inDirectory: "test_resources/context_files/en")!

        var didFail = false
        do {
            _ = try Picovoice(
                accessKey: accessKey,
                keywordPath: keywordPath,
                onWakeWordDetection: wakeWordCallback,
                contextPath: contextPath,
                onInference: inferenceCallback)
        } catch {
            didFail = true
        }

        XCTAssert(didFail)
    }

    func testInitFailWithWrongRhinoPlatform() throws {
        let bundle = Bundle(for: type(of: self))
        let keywordPath = bundle.path(
            forResource: "picovoice_ios",
            ofType: "ppn",
            inDirectory: "test_resources/keyword_files/en")!
        let contextPath = bundle.path(
            forResource: "coffee_maker_linux",
            ofType: "rhn",
            inDirectory: "test_resources/context_files/en")!

        var didFail = false
        do {
            _ = try Picovoice(
                accessKey: accessKey,
                keywordPath: keywordPath,
                onWakeWordDetection: wakeWordCallback,
                contextPath: contextPath,
                onInference: inferenceCallback)
        } catch {
            didFail = true
        }

        XCTAssert(didFail)
    }

    func testInitWithNonAsciiModelName() throws {
        let bundle = Bundle(for: type(of: self))
        let keywordPath = bundle.path(
            forResource: "manzana_ios",
            ofType: "ppn",
            inDirectory: "test_resources/keyword_files/es")!
        let contextPath = bundle.path(
            forResource: "iluminación_inteligente_ios",
            ofType: "rhn",
            inDirectory: "test_resources/context_files/es")!
        let porcupineModelPath = bundle.path(
            forResource: "porcupine_params_es",
            ofType: "pv",
            inDirectory: "test_resources/model_files")!
        let rhinoModelPath = bundle.path(
            forResource: "rhino_params_es",
            ofType: "pv",
            inDirectory: "test_resources/model_files")!

        let p = try Picovoice(
            accessKey: accessKey,
            keywordPath: keywordPath,
            onWakeWordDetection: wakeWordCallback,
            contextPath: contextPath,
            onInference: inferenceCallback,
            porcupineModelPath: porcupineModelPath,
            rhinoModelPath: rhinoModelPath)

        XCTAssert(p.contextInfo != "")
        p.delete()
    }
}
