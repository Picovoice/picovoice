import AVFoundation
import XCTest

import Picovoice
import Rhino

class PicovoiceDemoUITests: XCTestCase {

    let accessKey: String = "{TESTING_ACCESS_KEY_HERE}"
    
    var isWakeWordDetected = false
    var inferenceResult:Inference? = nil
    
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
        self.isWakeWordDetected = true	
    }
    
    func inferenceCallback(inference:Inference) {
        self.inferenceResult = inference
    }
    
    func testInitSuccessSimple() throws {
        let bundle = Bundle(for: type(of: self))
        let keywordPath = bundle.path(forResource: "picovoice_ios", ofType: "ppn")!
        let contextPath = bundle.path(forResource: "coffee_maker_ios", ofType: "rhn")!
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
        let keywordPath = bundle.path(forResource: "picovoice_ios", ofType: "ppn")!
        let contextPath = bundle.path(forResource: "coffee_maker_ios", ofType: "rhn")!
        let porcupineModelPath = bundle.path(forResource: "porcupine_params", ofType: "pv")!
        let rhinoModelPath = bundle.path(forResource: "rhino_params", ofType: "pv")!
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
        let keywordPath = bundle.path(forResource: "picovoice_ios", ofType: "ppn")!
        let contextPath = bundle.path(forResource: "coffee_maker_ios", ofType: "rhn")!
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
    
    func testInitSuccessDE() throws {
        let bundle = Bundle(for: type(of: self))
        let keywordPath = bundle.path(forResource: "ananas_ios", ofType: "ppn")!
        let contextPath = bundle.path(forResource: "test_de_ios", ofType: "rhn")!
        let porcupineModelPath = bundle.path(forResource: "porcupine_params_de", ofType: "pv")!
        let rhinoModelPath = bundle.path(forResource: "rhino_params_de", ofType: "pv")!
        
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
    
    func testInitSuccessES() throws {
        let bundle = Bundle(for: type(of: self))
        let keywordPath = bundle.path(forResource: "emparedado_ios", ofType: "ppn")!
        let contextPath = bundle.path(forResource: "test_es_ios", ofType: "rhn")!
        let porcupineModelPath = bundle.path(forResource: "porcupine_params_es", ofType: "pv")!
        let rhinoModelPath = bundle.path(forResource: "rhino_params_es", ofType: "pv")!
        
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
    
    func testInitSuccessFR() throws {
        let bundle = Bundle(for: type(of: self))
        let keywordPath = bundle.path(forResource: "framboise_ios", ofType: "ppn")!
        let contextPath = bundle.path(forResource: "test_fr_ios", ofType: "rhn")!
        let porcupineModelPath = bundle.path(forResource: "porcupine_params_fr", ofType: "pv")!
        let rhinoModelPath = bundle.path(forResource: "rhino_params_fr", ofType: "pv")!
        
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
    
    func testInitFailWithMismatchedPorcupineLanguage() throws {
        let bundle = Bundle(for: type(of: self))
        let keywordPath = bundle.path(forResource: "ananas_ios", ofType: "ppn")!
        let contextPath = bundle.path(forResource: "coffee_maker_ios", ofType: "rhn")!
        
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
        let keywordPath = bundle.path(forResource: "picovoice_ios", ofType: "ppn")!
        let contextPath = bundle.path(forResource: "test_de_ios", ofType: "rhn")!
        
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
        let contextPath = bundle.path(forResource: "coffee_maker_ios", ofType: "rhn")!
        
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
        let keywordPath = bundle.path(forResource: "picovoice_ios", ofType: "ppn")!
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
        let keywordPath = bundle.path(forResource: "picovoice_ios", ofType: "ppn")!
        let contextPath = bundle.path(forResource: "coffee_maker_ios", ofType: "rhn")!
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
        let keywordPath = bundle.path(forResource: "picovoice_ios", ofType: "ppn")!
        let contextPath = bundle.path(forResource: "coffee_maker_ios", ofType: "rhn")!
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
        let keywordPath = bundle.path(forResource: "picovoice_ios", ofType: "ppn")!
        let contextPath = bundle.path(forResource: "coffee_maker_ios", ofType: "rhn")!
        
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
        let keywordPath = bundle.path(forResource: "picovoice_ios", ofType: "ppn")!
        let contextPath = bundle.path(forResource: "coffee_maker_ios", ofType: "rhn")!
        
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
        let keywordPath = bundle.path(forResource: "alexa_linux", ofType: "ppn")!
        let contextPath = bundle.path(forResource: "coffee_maker_ios", ofType: "rhn")!
        
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
        let keywordPath = bundle.path(forResource: "picovoice_ios", ofType: "ppn")!
        let contextPath = bundle.path(forResource: "coffee_maker_linux", ofType: "rhn")!
        
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
        let keywordPath = bundle.path(forResource: "emparedado_ios", ofType: "ppn")!
        let contextPath = bundle.path(forResource: "test_es_ios", ofType: "rhn")!
        let porcupineModelPath = bundle.path(forResource: "porcupine_params_es", ofType: "pv")!
        let rhinoModelPath = bundle.path(forResource: "rhino_params_es", ofType: "pv")!
        
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
    
    var multiUsePicovoice: Picovoice?
    
    func testProcSuccess() throws {
        let bundle = Bundle(for: type(of: self))
        if multiUsePicovoice == nil {
            let keywordPath = bundle.path(forResource: "picovoice_ios", ofType: "ppn")!
            let contextPath = bundle.path(forResource: "coffee_maker_ios", ofType: "rhn")!
            
            multiUsePicovoice = try! Picovoice(
                accessKey: accessKey,
                keywordPath: keywordPath,
                onWakeWordDetection: wakeWordCallback,
                contextPath: contextPath,
                onInference: inferenceCallback)
        }
        
        let fileURL:URL = bundle.url(forResource: "picovoice-coffee", withExtension: "wav")!
        let data = try Data(contentsOf: fileURL)
        let frameLengthBytes = Int(Rhino.frameLength) * 2
        var pcmBuffer = Array<Int16>(repeating: 0, count: Int(Rhino.frameLength))
        var index = 44
        while(index + frameLengthBytes < data.count) {
            _ = pcmBuffer.withUnsafeMutableBytes { data.copyBytes(to: $0, from: index..<(index + frameLengthBytes)) }
            try multiUsePicovoice!.process(pcm:pcmBuffer)
            
            index += frameLengthBytes
        }
        
        XCTAssert(isWakeWordDetected)
        
        XCTAssert(inferenceResult != nil)
        XCTAssert(inferenceResult!.isUnderstood)
        XCTAssert(inferenceResult!.intent == "orderBeverage")
        
        let expectedSlotValues = [
            "size": "large",
            "beverage": "coffee"
        ]
        
        XCTAssert(expectedSlotValues == inferenceResult!.slots)
    }
    
    func testProcSuccessAgain() throws {
        try testProcSuccess()
        multiUsePicovoice!.delete()
    }
}
