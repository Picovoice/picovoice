import SwiftUI

struct ContentView: View {

    let activeBlue = Color(red: 55 / 255, green: 125 / 255, blue: 1, opacity: 1)
    let inactiveGrey = Color(red: 0.6, green: 0.6, blue: 0.6)

    @ObservedObject var viewModel = ViewModel()

    func action() {
    }

    var body: some View {
        VStack(alignment: .center, spacing: 20) {
                Text("Say 'Hey Barista!'").font(.largeTitle).foregroundColor(activeBlue)
                Image("cuppa").resizable().scaledToFit().padding(.horizontal, 50.0)

                VStack(alignment: .center, spacing: 5) {

                Text("Beverage Size").font(.body).fontWeight(.semibold).foregroundColor(inactiveGrey)

                // Size row
                HStack(alignment: .center, spacing: 10) {
                        ForEach(viewModel.sizeSel) { item in
                        Button(action: action) {
                                Text(item.title)
                                        .font(.system(size: 20))
                                        .foregroundColor(item.isSelected ? Color.white : inactiveGrey)
                                        .padding(10)

                        }
                                .disabled(true)
                                .background(
                                        Capsule()
                                                .fill(item.isSelected ? activeBlue : Color.white)
                                                .overlay(
                                                        Capsule()
                                                                .stroke(
                                                                        inactiveGrey,
                                                                        lineWidth: 2).opacity(
                                                                                item.isSelected ? 0 : 1)
                                                )
                                )
                        }
                }

                // # Shot row
                Text("Espresso Shots")
                        .font(.body)
                        .fontWeight(.semibold)
                        .foregroundColor(inactiveGrey)
                        .padding(.top, 8.0)

                HStack(alignment: .center, spacing: 7) {
                        ForEach(viewModel.shotSel) { item in
                        Button(action: action) {
                                Text(item.title)
                                        .font(.system(size: 16))
                                        .foregroundColor(item.isSelected ? Color.white : inactiveGrey)
                                        .padding(8.0)

                        }
                                .disabled(true)
                                .background(
                                        Capsule()
                                                .fill(item.isSelected ? activeBlue : Color.white)
                                                .overlay(
                                                        Capsule()
                                                                .stroke(
                                                                        inactiveGrey,
                                                                        lineWidth: 2).opacity(
                                                                                item.isSelected ? 0 : 1)
                                                )
                                )
                        }
                }

                // Beverage row
                Text("Beverage Type")
                        .font(.body)
                        .fontWeight(.semibold)
                        .foregroundColor(inactiveGrey)
                        .padding(.top, 8.0)

                VStack(alignment: .center, spacing: 6) {
                        HStack(alignment: .center) {
                        ForEach(0..<viewModel.bevSel.count / 2) { i in
                                Button(action: action) {
                                Text(viewModel.bevSel[i].title)
                                        .font(.system(size: 15))
                                        .foregroundColor(viewModel.bevSel[i].isSelected ? Color.white : inactiveGrey)
                                        .padding(8.0)

                                }
                                        .disabled(true)
                                        .background(
                                                Capsule()
                                                        .fill(viewModel.bevSel[i].isSelected ? activeBlue : Color.white)
                                                        .overlay(
                                                                Capsule()
                                                                        .stroke(inactiveGrey, lineWidth: 2)
                                                                        .opacity(viewModel.bevSel[i].isSelected ? 0 : 1)
                                                        )
                                        )
                        }
                        }
                        HStack(alignment: .center) {
                        ForEach(viewModel.bevSel.count / 2..<viewModel.bevSel.count) { i in
                                Button(action: action) {
                                Text(viewModel.bevSel[i].title)
                                        .font(.system(size: 15))
                                        .foregroundColor(viewModel.bevSel[i].isSelected ? Color.white : inactiveGrey)
                                        .padding(8.0)

                                }
                                        .disabled(true)
                                        .background(
                                                Capsule()
                                                        .fill(viewModel.bevSel[i].isSelected ? activeBlue : Color.white)
                                                        .overlay(
                                                                Capsule()
                                                                        .stroke(inactiveGrey, lineWidth: 2)
                                                                        .opacity(viewModel.bevSel[i].isSelected ? 0 : 1)
                                                        )
                                        )
                        }
                        }
                }
                }
                        .padding(.top, 10.0)
                ZStack(alignment: .center) {
                Text(viewModel.errorMessage)
                        .padding()
                        .background(Color.red)
                        .foregroundColor(Color.white)
                        .frame(minWidth: 0, maxWidth: UIScreen.main.bounds.width - 50)
                        .font(.body)
                        .opacity(viewModel.errorMessage.isEmpty ? 0 : 1)
                        .cornerRadius(10)
                Text("Listening...")
                        .font(.body)
                        .foregroundColor(activeBlue)
                        .opacity(viewModel.isListening ? 1 : 0)
                Text("Didn't understand the command")
                        .font(.body)
                        .foregroundColor(activeBlue)
                        .opacity(viewModel.missedCommand ? 1 : 0)
                }
                        .padding(.top, 10.0)

        }
                .padding(.vertical, 6.0)
                .frame(minWidth: 0, maxWidth: .infinity, minHeight: 0, maxHeight: .infinity).background(Color.white)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
