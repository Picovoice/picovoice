import SwiftUI

struct ContentView: View {
    
    let activeBlue = Color(red: 55/255, green: 125/255, blue: 1, opacity: 1)
    let inactiveGrey = Color(red: 0.6, green: 0.6, blue: 0.6)
    
    
    @ObservedObject var viewModel = ViewModel()
    
    var body: some View {
        
        return
            VStack(alignment: .center) {
                Text("Say 'Hey Barista!'").font(.largeTitle).foregroundColor(activeBlue)
                Image("cuppa")
                    .padding(50.0)
                
                VStack(alignment: .center, spacing: 20) {
                    
                    // Size row
                    HStack(alignment: .center, spacing: 20) {
                        ForEach(viewModel.sizeSel) { item in
                            Button(action: {}){
                                Text(item.title)
                                    .font(.system(size: 25))
                                    .foregroundColor(item.isSelected ? Color.white : inactiveGrey)
                                    .padding(10.0)
                                
                            }.background(
                                Capsule()
                                    .fill(item.isSelected ? activeBlue : Color.white)
                                    .overlay(
                                        Capsule()
                                            .stroke(inactiveGrey, lineWidth: 2).opacity(item.isSelected ? 0 : 1)
                                    )
                            )
                        }
                    }
                    
                    // # Shot row
                    HStack(alignment: .center, spacing: 15) {
                        ForEach(viewModel.shotSel) { item in
                            Button(action: {}){
                                Text(item.title)
                                    .font(.system(size: 20))
                                    .foregroundColor(item.isSelected ? Color.white : inactiveGrey)
                                    .padding(10.0)
                                
                            }.background(
                                Capsule()
                                    .fill(item.isSelected ? activeBlue : Color.white)
                                    .overlay(
                                        Capsule()
                                            .stroke(inactiveGrey, lineWidth: 2).opacity(item.isSelected ? 0 : 1)
                                    )
                            )
                        }
                    }
                    
                    // Beverage row
                    VStack(alignment: /*@START_MENU_TOKEN@*/.center/*@END_MENU_TOKEN@*/, spacing: 7) {
                        HStack(alignment: /*@START_MENU_TOKEN@*/.center/*@END_MENU_TOKEN@*/) {
                            ForEach(0..<viewModel.bevSel.count/2) { i in
                                Button(action: {}){
                                    Text(viewModel.bevSel[i].title)
                                        .font(.system(size: 15))
                                        .foregroundColor(viewModel.bevSel[i].isSelected ? Color.white : inactiveGrey)
                                        .padding(8.0)
                                    
                                }.background(
                                    Capsule()
                                        .fill(viewModel.bevSel[i].isSelected ? activeBlue : Color.white)
                                        .overlay(
                                            Capsule()
                                                .stroke(inactiveGrey, lineWidth: 2).opacity(viewModel.bevSel[i].isSelected ? 0 : 1)
                                        )
                                )
                            }
                        }
                        HStack(alignment: /*@START_MENU_TOKEN@*/.center/*@END_MENU_TOKEN@*/) {
                            ForEach(viewModel.bevSel.count/2..<viewModel.bevSel.count) { i in
                                Button(action: {}){
                                    Text(viewModel.bevSel[i].title)
                                        .font(.system(size: 15))
                                        .foregroundColor(viewModel.bevSel[i].isSelected ? Color.white : inactiveGrey)
                                        .padding(8.0)
                                    
                                }.background(
                                    Capsule()
                                        .fill(viewModel.bevSel[i].isSelected ? activeBlue : Color.white)
                                        .overlay(
                                            Capsule()
                                                .stroke(inactiveGrey, lineWidth: 2).opacity(viewModel.bevSel[i].isSelected ? 0 : 1)
                                        )
                                )
                            }
                        }
                    }
                }
                .padding(EdgeInsets(top: 0, leading: 10, bottom: 0, trailing: 10))
                
                Text("Listening...")
                    .offset(x: 0, y: 50)
                    .font(.body)
                    .foregroundColor(activeBlue)
                    .opacity(viewModel.isListening ? 1 : 0)
                Text("Didn't understand the command")
                    .offset(x: 0, y: 50)
                    .font(.body)
                    .foregroundColor(activeBlue)
                    .opacity(viewModel.missedCommand ? 1 : 0)
            }
            .frame(minWidth: 0, maxWidth: .infinity, minHeight: 0, maxHeight: .infinity).background(Color.white`)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
