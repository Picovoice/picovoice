#!/usr/bin/env bash

echo "Copying demo resources"

if [ ! -d "./android/app/src/main/res/raw" ]
then 
    echo "Creating Android demo resources directory..."
    mkdir -p ./android/app/src/main/res/raw
fi

echo "Copying Android demo resources..."
cp ../../resources/porcupine/resources/keyword_files/android/porcupine_android.ppn ./android/app/src/main/res/raw/porcupine_android.ppn 
cp ../../resources/rhino/resources/contexts/android/smart_lighting_android.rhn ./android/app/src/main/res/raw/smart_lighting_android.rhn

if [ ! -d "./ios/resources" ]
then 
    echo "Creating iOS demo resources directory..."
    mkdir -p ./ios/resources
fi

echo "Copying iOS demo resources..."
cp ../../resources/rhino/resources/contexts/ios/smart_lighting_ios.rhn ./ios/resources/smart_lighting_ios.rhn

echo "Copy complete!"