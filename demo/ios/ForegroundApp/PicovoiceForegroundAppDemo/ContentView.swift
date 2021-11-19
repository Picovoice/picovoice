//
//  Copyright 2018-2021 Picovoice Inc.
//  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
//  file accompanying this source.
//  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
//  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
//  specific language governing permissions and limitations under the License.
//

import SwiftUI
import Picovoice

struct ContentView: View {
    
    let ACCESS_KEY = "${YOUR_ACCESS_KEY_HERE}"
    
    let keywordPath = Bundle.main.path(forResource: "picovoice_ios", ofType: "ppn")
    let contextPath = Bundle.main.path(forResource: "smart_lighting_ios", ofType: "rhn")
    
    @State var textTimer: Timer?
    
    @State var picovoiceManager: PicovoiceManager!
    @State var buttonLabel = "START"
    @State var result: String = ""
    @State var errorMessage: String = ""
    
    var body: some View {
        
            VStack{
                Spacer()
                Spacer()
                Text("\(result)")
                    .foregroundColor(Color.black)
                    .padding()
                
                Text(errorMessage)
                    .padding()
                    .background(Color.red)
                    .foregroundColor(Color.white)
                    .frame(minWidth: 0, maxWidth: UIScreen.main.bounds.width - 50)
                    .font(.body)
                    .opacity(errorMessage.isEmpty ? 0 : 1)
                    .cornerRadius(.infinity)
                Spacer()
                
                Text("Press the Start button and say \"Picovoice, turn off the lights\".")
                    .padding()
                    .foregroundColor(Color.black)
                    .multilineTextAlignment(.center)
                
                Button(action: {
                    if self.buttonLabel == "START" {
                        self.textTimer?.invalidate()
                        self.result = ""
                        
                        do {
                            self.picovoiceManager = PicovoiceManager(
                                accessKey: self.ACCESS_KEY,
                                keywordPath: self.keywordPath!,
                                onWakeWordDetection: {
                                    result = "Wake Word Detected!\nListening for command..."
                                },
                                contextPath: self.contextPath!,
                                onInference: { x in
                                    DispatchQueue.main.async {
                                        result = "{\n"
                                        self.result += "    \"isUnderstood\" : \"" + x.isUnderstood.description + "\",\n"
                                        if x.isUnderstood {
                                            self.result += "    \"intent : \"" + x.intent + "\",\n"
                                            if !x.slots.isEmpty {
                                                result += "    \"slots\" : {\n"
                                                for (k, v) in x.slots {
                                                    self.result += "        \"" + k + "\" : \"" + v + "\",\n"
                                                }
                                                result += "    }\n"
                                            }
                                        }
                                        result += "}\n"
                                    }
                                    
                                    self.textTimer = Timer.scheduledTimer(withTimeInterval: 1.75, repeats: false) { timer in
                                        if buttonLabel == "STOP" {
                                            result = "Listening for Wake Word.."
                                        }
                                    }
                                })

                            try self.picovoiceManager.start()
                            
                            self.buttonLabel = "STOP"
                            self.result = "Listening for Wake Word..."
                        } catch PicovoiceError.PicovoiceInvalidArgumentError (let message){
                            errorMessage = "\(message)\nEnsure your AccessKey '\(ACCESS_KEY)' is valid"
                        } catch PicovoiceError.PicovoiceActivationError {
                            errorMessage = "ACCESS_KEY activation error"
                        } catch PicovoiceError.PicovoiceActivationRefusedError {
                            errorMessage = "ACCESS_KEY activation refused"
                        } catch PicovoiceError.PicovoiceActivationLimitError {
                            errorMessage = "ACCESS_KEY reached its limit"
                        } catch PicovoiceError.PicovoiceActivationThrottledError  {
                            errorMessage = "ACCESS_KEY is throttled"
                        } catch {
                            errorMessage = "\(error)"
                        }
                        
                    } else {
                        self.picovoiceManager.stop()
                        self.buttonLabel = "START"
                        self.result = ""
                        self.textTimer?.invalidate()
                    }
                }) {
                    Text("\(buttonLabel)")
                        .padding()
                        .background(errorMessage.isEmpty ? Color.blue : Color.gray)
                        .foregroundColor(Color.white)
                        .font(.largeTitle)
                }.disabled(!errorMessage.isEmpty)
            }
            .padding()
            .frame(minWidth: 0, maxWidth: .infinity, minHeight: 0, maxHeight: .infinity)
            .background(Color.white)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
