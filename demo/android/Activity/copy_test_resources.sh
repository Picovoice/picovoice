if [ ! -d "./picovoice-activity-demo-app/src/androidTest/assets/test_resources/audio_samples" ]
then 
    echo "Creating test audio samples directory..."
    mkdir -p ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/audio_samples
fi

echo "Copying test audio samples..."
cp ../../../resources/audio_samples/*.wav ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/audio_samples

if [ ! -d "./picovoice-activity-demo-app/src/androidTest/assets/test_resources/keyword_files" ]
then
    echo "Creating test keyword files directory..."
    mkdir -p ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/keyword_files
fi

echo "Copying test keyword files..."
cp ../../../resources/porcupine/resources/keyword_files/android/picovoice_android.ppn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/keyword_files/picovoice_android.ppn
cp ../../../resources/porcupine/resources/keyword_files/linux/alexa_linux.ppn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/keyword_files/alexa_linux.ppn
cp ../../../resources/porcupine/resources/keyword_files_de/android/heuschrecke_android.ppn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/keyword_files/heuschrecke_android.ppn
cp ../../../resources/porcupine/resources/keyword_files_es/android/manzana_android.ppn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/keyword_files/manzana_android.ppn
cp ../../../resources/porcupine/resources/keyword_files_fr/android/mon\ chouchou_android.ppn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/keyword_files/mon\ chouchou_android.ppn
cp ../../../resources/porcupine/resources/keyword_files_it/android/cameriere_android.ppn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/keyword_files/cameriere_android.ppn
cp ../../../resources/porcupine/resources/keyword_files_ja/android/ninja_android.ppn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/keyword_files/ninja_android.ppn
cp ../../../resources/porcupine/resources/keyword_files_ko/android/koppulso_android.ppn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/keyword_files/koppulso_android.ppn
cp ../../../resources/porcupine/resources/keyword_files_pt/android/abacaxi_android.ppn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/keyword_files/abacaxi_android.ppn

if [ ! -d "./picovoice-activity-demo-app/src/androidTest/assets/test_resources/context_files" ]
then
    echo "Creating test context files directory..."
    mkdir -p ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/context_files
fi

echo "Copying test context files..."
cp ../../../resources/rhino/resources/contexts/android/coffee_maker_android.rhn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/context_files/coffee_maker_android.rhn
cp ../../../resources/rhino/resources/contexts/linux/coffee_maker_linux.rhn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/context_files/coffee_maker_linux.rhn
cp ../../../resources/rhino/resources/contexts_de/android/beleuchtung_android.rhn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/context_files/beleuchtung_android.rhn
cp ../../../resources/rhino/resources/contexts_es/android/iluminación_inteligente_android.rhn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/context_files/iluminación_inteligente_android.rhn
cp ../../../resources/rhino/resources/contexts_fr/android/éclairage_intelligent_android.rhn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/context_files/éclairage_intelligent_android.rhn
cp ../../../resources/rhino/resources/contexts_it/android/illuminazione_android.rhn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/context_files/illuminazione_android.rhn
cp ../../../resources/rhino/resources/contexts_ja/android/sumāto_shōmei_android.rhn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/context_files/sumāto_shōmei_android.rhn
cp ../../../resources/rhino/resources/contexts_ko/android/seumateu_jomyeong_android.rhn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/context_files/seumateu_jomyeong_android.rhn
cp ../../../resources/rhino/resources/contexts_pt/android/luz_inteligente_android.rhn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/context_files/luz_inteligente_android.rhn

if [ ! -d "./picovoice-activity-demo-app/src/androidTest/assets/test_resources/porcupine_model_files" ]
then 
    echo "Creating porcupine test model files directory..."
    mkdir -p ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/porcupine_model_files
fi

echo "Copying porcupine test model files..."
cp ../../../resources/porcupine/lib/common/*.pv ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/porcupine_model_files

if [ ! -d "./picovoice-activity-demo-app/src/androidTest/assets/test_resources/rhino_model_files" ]
then 
    echo "Creating rhino test model files directory..."
    mkdir -p ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/rhino_model_files
fi

echo "Copying rhino test model files..."
cp ../../../resources/rhino/lib/common/*.pv ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/rhino_model_files
