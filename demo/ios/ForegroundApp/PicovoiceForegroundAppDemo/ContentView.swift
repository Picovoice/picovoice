//
//  Copyright 2018-2023 Picovoice Inc.
//  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
//  file accompanying this source.
//  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
//  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
//  specific language governing permissions and limitations under the License.
//

import SwiftUI
import Picovoice
import ios_voice_processor

struct SheetView: View {
    @Binding var contextInfo: String

    var body: some View {
        ScrollView {
            Text(self.contextInfo)
                    .padding()
                    .font(.system(size: 14))
        }
    }
}

struct ContentView: View {

    let ACCESS_KEY = "${YOUR_ACCESS_KEY_HERE}"

    let language: String = ProcessInfo.processInfo.environment["LANGUAGE"]!
    let wakeword: String = ProcessInfo.processInfo.environment["WAKEWORD"]!
    let context: String = ProcessInfo.processInfo.environment["CONTEXT"]!

    @State var textTimer: Timer?

    @State var picovoiceManager: PicovoiceManager!
    @State var buttonLabel = "START"
    @State var result: String = ""
    @State var errorMessage: String = ""
    @State var contextInfo: String = ""
    @State var showInfo: Bool = false

    func initPicovoice() -> Bool {
        let keywordPath = Bundle.main.url(
                forResource: "\(wakeword)_ios",
                withExtension: "ppn",
                subdirectory: "keywords")!.path
        let ppnModelPath = (language == "en") ? nil :
                Bundle.main.url(
                        forResource: "porcupine_params_\(language)",
                        withExtension: "pv",
                        subdirectory: "models")!.path

        let contextPath = Bundle.main.url(
                forResource: "\(context)_ios",
                withExtension: "rhn",
                subdirectory: "contexts")!.path
        let rhnModelPath = (language == "en") ? nil :
                Bundle.main.url(
                        forResource: "rhino_params_\(language)",
                        withExtension: "pv",
                        subdirectory: "models")!.path
        do {
            self.picovoiceManager = try PicovoiceManager(
                accessKey: self.ACCESS_KEY,
                keywordPath: keywordPath,
                onWakeWordDetection: {
                    result = "Wake Word Detected!\nListening for command..."
                },
                contextPath: contextPath,
                onInference: { x in
                    DispatchQueue.main.async {
                        result = "{\n"
                        self.result += "    \"isUnderstood\" : \"" +
                                x.isUnderstood.description + "\",\n"
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

                        self.textTimer = Timer.scheduledTimer(withTimeInterval: 1.75, repeats: false) { _ in
                            if self.buttonLabel == "STOP" {
                                result = "Listening for '\(wakeword.uppercased())'..."
                            }
                        }
                    }
                },
                porcupineModelPath: ppnModelPath,
                rhinoModelPath: rhnModelPath,
                processErrorCallback: { error in
                    DispatchQueue.main.async {
                        errorMessage = "\(error)"
                    }
                })
            self.contextInfo = self.picovoiceManager.contextInfo
            return true
        } catch let error as PicovoiceInvalidArgumentError {
            errorMessage = "\(error.localizedDescription)"
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
        return false
    }

    func startListening() {
        if self.picovoiceManager == nil {
            guard initPicovoice() else {
                return
            }
        }

        self.textTimer?.invalidate()
        self.result = ""

        guard VoiceProcessor.hasRecordAudioPermission else {
            VoiceProcessor.requestRecordAudioPermission { isGranted in
                guard isGranted else {
                    DispatchQueue.main.async {
                        errorMessage = "Demo requires microphone permission"
                    }
                    return
                }

                DispatchQueue.main.async {
                    self.startListening()
                }
            }
            return
        }

        do {
            try self.picovoiceManager.start()
            self.buttonLabel = "STOP"
            self.result = "Listening for '\(wakeword.uppercased())'..."
        } catch {
            errorMessage = "\(error)"
        }
    }

    func stopListening() {
        do {
            try self.picovoiceManager.stop()
            self.buttonLabel = "START"
            self.result = ""
            self.textTimer?.invalidate()
        } catch {
            errorMessage = "\(error)"
        }
    }

    var body: some View {
        NavigationView {
            VStack {
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
                        .cornerRadius(10)
                Spacer()

                Button {
                    if self.buttonLabel == "START" {
                        startListening()
                    } else {
                        stopListening()
                    }
                } label: {
                    Text("\(buttonLabel)")
                            .padding()
                            .background(errorMessage.isEmpty ? Color.blue : Color.gray)
                            .foregroundColor(Color.white)
                            .font(.largeTitle)
                }
                        .disabled(!errorMessage.isEmpty)
            }
                    .padding()
                    .frame(minWidth: 0, maxWidth: .infinity, minHeight: 0, maxHeight: .infinity)
                    .background(Color.white)
                    .navigationBarItems(trailing: Button("Context Info") {
                        if self.picovoiceManager == nil {
                            guard initPicovoice() else {
                                return
                            }
                        }

                        self.showInfo = true
                    })
        }
                .sheet(isPresented: self.$showInfo) {
                    SheetView(contextInfo: self.$contextInfo)
                }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
