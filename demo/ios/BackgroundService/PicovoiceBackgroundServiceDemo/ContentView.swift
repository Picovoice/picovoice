//
//  Copyright 2021 Picovoice Inc.
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
    
    var body: some View {
        VStack {
            Text("Press the Start button and say \"Picovoice, turn off the lights\". Try pressing the home button and saying it again.")
                .padding()
                .multilineTextAlignment(.center)
            
            Button(action: {
                if self.buttonLabel == "START" {
                    NotificationManager.shared.requestNotificationAuthorization()
                    
                    do {
                        self.picovoiceManager = PicovoiceManager(
                            keywordPath: self.keywordPath!,
                            porcupineSensitivity: 0.5,
                            onWakeWordDetection: {
                                NotificationManager.shared.sendNotification(message: "Wake Word Detected")
                            },
                            contextPath: self.contextPath!,
                            rhinoSensitivity: 0.0,
                            onInference: { x in
                                DispatchQueue.main.async {
                                    var result = "{\n"
                                    result += "    \"isUnderstood\" : \"" + x.isUnderstood.description + "\",\n"
                                    if x.isUnderstood {
                                        result += "    \"intent : \"" + x.intent + "\",\n"
                                        if !x.slots.isEmpty {
                                            result += "    \"slots\" : {\n"
                                            for (k, v) in x.slots {
                                                result += "        \"" + k + "\" : \"" + v + "\",\n"
                                            }
                                            result += "    }\n"
                                        }
                                    }
                                    result += "}\n"
                                    
                                    NotificationManager.shared.sendNotification(message: result)
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
                }
            }) {
                Text("\(buttonLabel)")
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(Color.white)
                    .font(.largeTitle)
            }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
