// swift-tools-version:5.3
import PackageDescription
let package = Package(
    name: "Picovoice-iOS",
    platforms: [
        .iOS(.v13)
    ],
    products: [
        .library(
            name: "Picovoice",
            targets: ["Picovoice"]
        )
    ],
    dependencies: [
        .package(
            url: "https://github.com/Picovoice/porcupine.git",
            .upToNextMajor(from: "3.0.4")
        ),
        .package(
            url: "https://github.com/Picovoice/rhino.git",
            .upToNextMajor(from: "3.0.2")
        ),
        .package(
            url: "https://github.com/Picovoice/ios-voice-processor.git",
            .upToNextMajor(from: "1.2.0")
        )
    ],
    targets: [
        .target(
            name: "Picovoice",
            dependencies: [
                .product(name: "Porcupine", package: "porcupine"),
                .product(name: "Rhino", package: "rhino"),
                .product(name: "ios_voice_processor", package: "ios-voice-processor")
            ],
            path: ".",
            exclude: [
                "sdk/ios/PicovoiceAppTest",
                "sdk/flutter",
                "sdk/react-native",
                "sdk/unity",
                "resources",
                "demo"
            ],
            sources: [
                "sdk/ios/Picovoice.swift",
                "sdk/ios/PicovoiceErrors.swift",
                "sdk/ios/PicovoiceManager.swift"
            ]
        )
    ]
)
