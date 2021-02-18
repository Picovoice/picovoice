echo "Creating asset directories..."
if [ ! -d "./assets/ios" ]
then 
    mkdir -p ./assets/ios
fi

if [ ! -d "./assets/android" ]
then 
    mkdir -p ./assets/android
fi

echo "Copying keyword and context files..."
cp ../../resources/porcupine/resources/keyword_files/android/pico\ clock_android.ppn ./assets/android/pico\ clock_android.ppn
cp ../../resources/porcupine/resources/keyword_files/ios/pico\ clock_ios.ppn ./assets/ios/pico\ clock_ios.ppn
cp ../../resources/rhino/resources/contexts/android/clock_android.rhn ./assets/android/clock_android.rhn
cp ../../resources/rhino/resources/contexts/ios/clock_ios.rhn ./assets/ios/clock_ios.rhn