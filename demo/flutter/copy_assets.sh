# Android resources
if [ ! -d "./assets/contexts/android" ]
then 
    echo "Creating Android demo context directory..."
    mkdir -p ./assets/contexts/android
fi
echo "Copying Android demo context..."
cp ../../resources/rhino/resources/contexts/android/smart_lighting_android.rhn ./assets/contexts/android/smart_lighting_android.rhn

if [ ! -d "./assets/keyword_files/android" ]
then 
    echo "Creating Android demo keyword directory..."
    mkdir -p ./assets/keyword_files/android
fi
echo "Copying Android demo keyword file..."
cp ../../resources/porcupine/resources/keyword_files/android/picovoice_android.ppn ./assets/keyword_files/android/picovoice_android.ppn

# iOS resources
if [ ! -d "./assets/contexts/ios" ]
then 
    echo "Creating iOS demo context directory..."
    mkdir -p ./assets/contexts/ios
fi
echo "Copying iOS demo context..."
cp ../../resources/rhino/resources/contexts/ios/smart_lighting_ios.rhn ./assets/contexts/ios/smart_lighting_ios.rhn

if [ ! -d "./assets/keyword_files/ios" ]
then 
    echo "Creating iOS demo keyword directory..."
    mkdir -p ./assets/keyword_files/ios
fi
echo "Copying iOS demo keyword file..."
cp ../../resources/porcupine/resources/keyword_files/ios/picovoice_ios.ppn ./assets/keyword_files/ios/picovoice_ios.ppn