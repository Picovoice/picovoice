import SwiftUI
import Picovoice

struct CapsuleSelection: Codable, Identifiable{
    var title:String
    var id:String
    var isSelected:Bool
    
    init(title:String) {
        self.title = title
        self.id = title.lowercased()
        self.isSelected = false
    }
}

class ViewModel: ObservableObject {
    
    @Published var sizeSel = [CapsuleSelection(title: "Small"), CapsuleSelection(title: "Medium"), CapsuleSelection(title: "Large")]
    @Published var shotSel = [CapsuleSelection(title: "Single Shot"), CapsuleSelection(title: "Double Shot"), CapsuleSelection(title: "Triple Shot")]
    @Published var bevSel = [CapsuleSelection(title: "Americano"), CapsuleSelection(title: "Cappuccino"), CapsuleSelection(title: "Coffee"),
                     CapsuleSelection(title: "Espresso"),CapsuleSelection(title: "Latte"),CapsuleSelection(title: "Mocha")]
    
    @Published var isListening = false
    @Published var missedCommand = false
    @Published var errorMessage = ""
    
    let ACCESS_KEY = "{YOUR_ACCESS_KEY_HERE}"
    
    let contextPath = Bundle.main.path(forResource: "coffee_maker_ios", ofType: "rhn")
    let keywordPath = Bundle.main.path(forResource: "hey barista_ios", ofType: "ppn")
    var picovoiceManager:PicovoiceManager!
    
    init() {
        do {
            picovoiceManager = PicovoiceManager(
                accessKey : ACCESS_KEY,
                keywordPath: keywordPath!,
                onWakeWordDetection: {
                    DispatchQueue.main.async {
                        self.isListening = true
                        self.missedCommand = false
                        self.clearSelectedItems()
                    }
                },
                contextPath: contextPath!,
                onInference: { inference in
                    DispatchQueue.main.async {
                        if inference.isUnderstood {
                            if inference.intent == "orderBeverage" {
                                if let size = inference.slots["size"]{
                                    if let i = self.sizeSel.firstIndex(where: { $0.id == size }) {
                                        self.sizeSel[i].isSelected = true
                                    }
                                }
                                
                                if let numberOfShots = inference.slots["numberOfShots"]{
                                    if let i = self.shotSel.firstIndex(where: { $0.id == numberOfShots }) {
                                        self.shotSel[i].isSelected = true
                                    }
                                }
                                
                                if let beverage = inference.slots["beverage"]{
                                    if let i = self.bevSel.firstIndex(where: { $0.id == beverage }) {
                                        self.bevSel[i].isSelected = true
                                    }
                                }
                            }
                        }
                        else {
                            self.missedCommand = true
                        }
                        
                        self.isListening = false
                    }
                })

            try picovoiceManager.start()
        } catch let error as PicovoiceInvalidArgumentError {
            errorMessage = "\(error.localizedDescription)\nEnsure your AccessKey '\(ACCESS_KEY)' is valid"
        } catch is PicovoiceActivationError {
            errorMessage = "ACCESS_KEY activation error"
        } catch is PicovoiceActivationRefusedError {
            errorMessage = "ACCESS_KEY activation refused"
        } catch is PicovoiceActivationLimitError {
            errorMessage = "ACCESS_KEY reached its limit"
        } catch is PicovoiceActivationThrottledError  {
            errorMessage = "ACCESS_KEY is throttled"
        } catch {
            errorMessage = "\(error)"
        }
    }
    
    func clearSelectedItems() {
        for i in sizeSel.indices {
            sizeSel[i].isSelected = false
        }
        
        for i in shotSel.indices {
            shotSel[i].isSelected = false
        }
        
        for i in bevSel.indices {
            bevSel[i].isSelected = false
        }
    }
    
}
