if [ ! -d "../../resources/porcupine" ]
then
    echo "Porcupine folder not found. Ensure you clone Picovoice repo with submodules."
	echo "Use 'git clone --recurse-submodules'"
	exit 1
fi

if [ ! -d "../../resources/rhino" ]
then
    echo "Rhino folder not found. Ensure you clone Picovoice repo with submodules."
	echo "Use 'git clone --recurse-submodules'"
	exit 1
fi

echo "Copying Android resources..."
cp ../../resources/porcupine/lib/android/arm64-v8a/libpv_porcupine.so ./Assets/Picovoice/Plugins/android/arm64-v8a/libpv_porcupine.so
cp ../../resources/porcupine/lib/android/armeabi-v7a/libpv_porcupine.so ./Assets/Picovoice/Plugins/android/armeabi-v7a/libpv_porcupine.so
cp ../../resources/rhino/lib/android/arm64-v8a/libpv_rhino.so ./Assets/Picovoice/Plugins/android/arm64-v8a/libpv_rhino.so
cp ../../resources/rhino/lib/android/armeabi-v7a/libpv_rhino.so ./Assets/Picovoice/Plugins/android/armeabi-v7a/libpv_rhino.so

echo "Copying iOS lib..."
cp -R ../../resources/porcupine/lib/ios/PvPorcupine.xcframework/ios-arm64/PvPorcupine.framework ./Assets/Picovoice/Plugins/ios/PvPorcupine.framework
cp -R ../../resources/rhino/lib/ios/PvRhino.xcframework/ios-arm64/PvRhino.framework ./Assets/Picovoice/Plugins/ios/PvRhino.framework

echo "Copying Linux lib..."
cp ../../resources/porcupine/lib/linux/x86_64/libpv_porcupine.so ./Assets/Picovoice/Plugins/linux/x86_64/libpv_porcupine.so
cp ../../resources/rhino/lib/linux/x86_64/libpv_rhino.so ./Assets/Picovoice/Plugins/linux/x86_64/libpv_rhino.so

echo "Copying macOS lib..."
cp ../../resources/porcupine/lib/mac/x86_64/libpv_porcupine.dylib ./Assets/Picovoice/Plugins/mac/x86_64/libpv_porcupine.dylib
cp ../../resources/rhino/lib/mac/x86_64/libpv_rhino.dylib ./Assets/Picovoice/Plugins/mac/x86_64/libpv_rhino.dylib

echo "Copying Windows lib..."
cp ../../resources/porcupine/lib/windows/amd64/libpv_porcupine.dll ./Assets/Picovoice/Plugins/windows/amd64/pv_porcupine.dll
cp ../../resources/rhino/lib/windows/amd64/libpv_rhino.dll ./Assets/Picovoice/Plugins/windows/amd64/pv_rhino.dll

echo "Copying model files..."
cp ../../resources/porcupine/lib/common/porcupine_params.pv ./Assets/StreamingAssets/porcupine_params.pv
cp ../../resources/rhino/lib/common/rhino_params.pv ./Assets/StreamingAssets/rhino_params.pv

echo "Copying demo files..."
if [ ! -d "./Assets/Picovoice/Demo" ]
then
    mkdir -p ./Assets/Picovoice/Demo
fi
cp -rp ../unity/* ./Assets/Picovoice/Demo

echo "Copying Voice Processor..."
if [ ! -d "./Assets/Picovoice/VoiceProcessor" ]
then
    mkdir -p ./Assets/Picovoice/VoiceProcessor
fi
cp -rp ../../sdk/unity/Assets/Picovoice/VoiceProcessor/* ./Assets/Picovoice/VoiceProcessor

echo "Copying keyword files..."
cp ../../resources/porcupine/resources/keyword_files/android/porcupine_android.ppn ./Assets/StreamingAssets/keyword_files/android/porcupine_android.ppn
cp ../../resources/porcupine/resources/keyword_files/ios/porcupine_ios.ppn ./Assets/StreamingAssets/keyword_files/ios/porcupine_ios.ppn
cp ../../resources/porcupine/resources/keyword_files/linux/porcupine_linux.ppn ./Assets/StreamingAssets/keyword_files/linux/porcupine_linux.ppn
cp ../../resources/porcupine/resources/keyword_files/mac/porcupine_mac.ppn ./Assets/StreamingAssets/keyword_files/mac/porcupine_mac.ppn
cp ../../resources/porcupine/resources/keyword_files/windows/porcupine_windows.ppn ./Assets/StreamingAssets/keyword_files/windows/porcupine_windows.ppn

echo "Copying context files..."
cp ../../resources/rhino/resources/contexts/android/video_player_android.rhn ./Assets/StreamingAssets/contexts/android/video_player_android.rhn
cp ../../resources/rhino/resources/contexts/ios/video_player_ios.rhn ./Assets/StreamingAssets/contexts/ios/video_player_ios.rhn
cp ../../resources/rhino/resources/contexts/linux/video_player_linux.rhn ./Assets/StreamingAssets/contexts/linux/video_player_linux.rhn
cp ../../resources/rhino/resources/contexts/mac/video_player_mac.rhn ./Assets/StreamingAssets/contexts/mac/video_player_mac.rhn
cp ../../resources/rhino/resources/contexts/windows/video_player_windows.rhn ./Assets/StreamingAssets/contexts/windows/video_player_windows.rhn

echo "Copying unity scripts..."
cp ../../sdk/unity/Assets/Picovoice/Picovoice.cs ./Assets/Picovoice/Picovoice.cs
cp ../../sdk/unity/Assets/Picovoice/PicovoiceManager.cs ./Assets/Picovoice/PicovoiceManager.cs
cp ../../sdk/unity/Assets/Picovoice/PicovoiceException.cs ./Assets/Picovoice/PicovoiceException.cs
cp ../../resources/porcupine/binding/unity/Assets/Porcupine/Porcupine.cs ./Assets/Picovoice/Porcupine.cs
cp ../../resources/porcupine/binding/unity/Assets/Porcupine/PorcupineException.cs ./Assets/Picovoice/PorcupineException.cs
cp ../../resources/rhino/binding/unity/Assets/Rhino/Rhino.cs ./Assets/Picovoice/Rhino.cs
cp ../../resources/rhino/binding/unity/Assets/Rhino/RhinoException.cs ./Assets/Picovoice/RhinoException.cs

echo "Copy complete!"