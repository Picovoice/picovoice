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
    
    let keywordPath = Bundle.main.path(forResource: "picovoice_ios", ofType: "ppn")
    let contextPath = Bundle.main.path(forResource: "smart_lighting_ios", ofType: "rhn")
    
    @State var picovoiceManager: PicovoiceManager!
    @State var buttonLabel = "START"
    @State var result: String = ""
    
    var body: some View {
        ZStack {
            VStack{
                Spacer()
                
                Text("Press the Start button and say \"Picovoice, turn off the lights\".")
                    .padding()
                    .multilineTextAlignment(.center)
                
                Button(action: {
                    if self.buttonLabel == "START" {
                        self.result = ""
                        
                        do {
                            self.picovoiceManager = PicovoiceManager(
                                keywordPath: self.keywordPath!,
                                porcupineSensitivity: 0.5,
                                onWakeWordDetection: {
                                    result = "Wake Word Detected ..."
                                },
                                contextPath: self.contextPath!,
                                rhinoSensitivity: 0.0,
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
                                })

                            try self.picovoiceManager.start()
                        } catch {
                            print("\(error)")
                        }
                        
                        self.buttonLabel = "STOP"
                    } else {
                        self.picovoiceManager.stop()
                        self.buttonLabel = "START"
                        self.result = ""
                    }
                }) {
                    Text("\(buttonLabel)")
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(Color.white)
                        .font(.largeTitle)
                }
                
                Spacer()
                Spacer()
                Spacer()
            }
            VStack(alignment: .trailing) {
                Spacer()
                Spacer()
                Spacer()
                Text("\(result)")
                    .padding()
                Spacer()
            }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
