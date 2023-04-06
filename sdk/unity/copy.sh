echo "Copying Android resources..."
cp ../../resources/porcupine/lib/android/arm64-v8a/libpv_porcupine.so ./Assets/Picovoice/Plugins/android/arm64-v8a/libpv_porcupine.so
cp ../../resources/porcupine/lib/android/armeabi-v7a/libpv_porcupine.so ./Assets/Picovoice/Plugins/android/armeabi-v7a/libpv_porcupine.so
cp ../../resources/rhino/lib/android/arm64-v8a/libpv_rhino.so ./Assets/Picovoice/Plugins/android/arm64-v8a/libpv_rhino.so
cp ../../resources/rhino/lib/android/armeabi-v7a/libpv_rhino.so ./Assets/Picovoice/Plugins/android/armeabi-v7a/libpv_rhino.so

echo "Copying iOS lib..."
cp -R ../../resources/porcupine/lib/ios/PvPorcupine.xcframework/ios-arm64/PvPorcupine.framework ./Assets/Picovoice/Plugins/ios
cp -R ../../resources/rhino/lib/ios/PvRhino.xcframework/ios-arm64/PvRhino.framework ./Assets/Picovoice/Plugins/ios

echo "Copying Linux lib..."
cp ../../resources/porcupine/lib/linux/x86_64/libpv_porcupine.so ./Assets/Picovoice/Plugins/linux/x86_64/libpv_porcupine.so
cp ../../resources/rhino/lib/linux/x86_64/libpv_rhino.so ./Assets/Picovoice/Plugins/linux/x86_64/libpv_rhino.so

echo "Copying macOS lib..."
cp ../../resources/porcupine/lib/mac/x86_64/libpv_porcupine.dylib ./Assets/Picovoice/Plugins/mac/x86_64/libpv_porcupine.dylib
cp ../../resources/rhino/lib/mac/x86_64/libpv_rhino.dylib ./Assets/Picovoice/Plugins/mac/x86_64/libpv_rhino.dylib

echo "Copying macOS (Apple silicon) lib..."
cp ../../resources/porcupine/lib/mac/arm64/libpv_porcupine.dylib ./Assets/Picovoice/Plugins/mac/arm64/libpv_porcupine.dylib
cp ../../resources/rhino/lib/mac/arm64/libpv_rhino.dylib ./Assets/Picovoice/Plugins/mac/arm64/libpv_rhino.dylib

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
cp -rp ../../demo/unity/* ./Assets/Picovoice/Demo


echo "Copying keyword files..."
cp -rp ../../resources/porcupine/resources/keyword_files/android/* ./Assets/StreamingAssets/keyword_files/android
cp -rp ../../resources/porcupine/resources/keyword_files/ios/* ./Assets/StreamingAssets/keyword_files/ios
cp -rp ../../resources/porcupine/resources/keyword_files/linux/* ./Assets/StreamingAssets/keyword_files/linux
cp -rp ../../resources/porcupine/resources/keyword_files/mac/* ./Assets/StreamingAssets/keyword_files/mac
cp -rp ../../resources/porcupine/resources/keyword_files/windows/* ./Assets/StreamingAssets/keyword_files/windows

echo "Copying context files..."
cp ../../resources/rhino/resources/contexts/android/smart_lighting_android.rhn ./Assets/StreamingAssets/contexts/android/smart_lighting_android.rhn
cp ../../resources/rhino/resources/contexts/ios/smart_lighting_ios.rhn ./Assets/StreamingAssets/contexts/ios/smart_lighting_ios.rhn
cp ../../resources/rhino/resources/contexts/linux/smart_lighting_linux.rhn ./Assets/StreamingAssets/contexts/linux/smart_lighting_linux.rhn
cp ../../resources/rhino/resources/contexts/mac/smart_lighting_mac.rhn ./Assets/StreamingAssets/contexts/mac/smart_lighting_mac.rhn
cp ../../resources/rhino/resources/contexts/windows/smart_lighting_windows.rhn ./Assets/StreamingAssets/contexts/windows/smart_lighting_windows.rhn

echo "Copying unity scripts..."
cp ../../resources/porcupine/binding/unity/Assets/Porcupine/Porcupine.cs ./Assets/Picovoice/Porcupine.cs
cp ../../resources/porcupine/binding/unity/Assets/Porcupine/PorcupineException.cs ./Assets/Picovoice/PorcupineException.cs
cp ../../resources/rhino/binding/unity/Assets/Rhino/Rhino.cs ./Assets/Picovoice/Rhino.cs
cp ../../resources/rhino/binding/unity/Assets/Rhino/RhinoException.cs ./Assets/Picovoice/RhinoException.cs

echo "Copy complete!"