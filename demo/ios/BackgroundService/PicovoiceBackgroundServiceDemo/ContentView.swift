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
import SwiftySound

struct ContentView: View {

    let ACCESS_KEY = "${YOUR_ACCESS_KEY_HERE}"

    let keywordPath = Bundle.main.path(forResource: "picovoice_ios", ofType: "ppn")
    let contextPath = Bundle.main.path(forResource: "smart_lighting_ios", ofType: "rhn")

    @State var picovoiceManager: PicovoiceManager!
    @State var buttonLabel = "START"
    @State var errorMessage: String = ""

    var body: some View {
        VStack {
            Spacer()
            Text(errorMessage)
                .padding()
                .background(Color.red)
                .foregroundColor(Color.white)
                .frame(minWidth: 0, maxWidth: UIScreen.main.bounds.width - 50)
                .font(.body)
                .opacity(errorMessage.isEmpty ? 0 : 1)
                .cornerRadius(.infinity)

            Spacer()
            Text("Press the Start button and say \"Picovoice, turn off the lights\".
                    Try pressing the home button and saying it again.")
                .padding()
                .foregroundColor(Color.black)
                .multilineTextAlignment(.center)
            Button {
                if self.buttonLabel == "START" {
                    do {
                        self.picovoiceManager = PicovoiceManager(
                            accessKey: self.ACCESS_KEY,
                            keywordPath: self.keywordPath!,
                            onWakeWordDetection: {
                                Sound.play(file: "beep.wav")
                                NotificationManager.shared.sendNotification(message: "Wake Word Detected")
                            },
                            contextPath: self.contextPath!,
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

                        self.buttonLabel = "STOP"
                        Sound.category = .playAndRecord
                        NotificationManager.shared.requestNotificationAuthorization()
                    } catch let error as PicovoiceInvalidArgumentError {
                        errorMessage = "\(error.localizedDescription)\nEnsure your AccessKey '\(ACCESS_KEY)' is valid"
                    } catch is PicovoiceActivationError {
                        errorMessage = "ACCESS_KEY activation error"
                    } catch is PicovoiceActivationRefusedError {
                        errorMessage = "ACCESS_KEY activation refused"
                    } catch is PicovoiceActivationLimitError {
                        errorMessage = "ACCESS_KEY reached its limit"
                    } catch is PicovoiceActivationThrottledError {
                        errorMessage = "ACCESS_KEY is throttled"
                    } catch {
                        errorMessage = "\(error)"
                    }

                } else {
                    self.picovoiceManager.stop()
                    self.buttonLabel = "START"
                }
            } label: {
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
