if [ ! -d "./picovoice-activity-demo-app/src/androidTest/assets/test_resources/audio_samples" ]
then 
    echo "Creating test audio samples directory..."
    mkdir -p ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/audio_samples
fi

echo "Copying test audio samples..."
cp ../../../resources/audio_samples/picovoice-coffee.wav ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/audio_samples/picovoice-coffee.wav

if [ ! -d "./picovoice-activity-demo-app/src/androidTest/assets/test_resources/keyword_files" ]
then 
    echo "Creating test keyword files directory..."
    mkdir -p ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/keyword_files/de
    mkdir -p ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/keyword_files/en
    mkdir -p ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/keyword_files/es
    mkdir -p ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/keyword_files/fr
fi

echo "Copying test keyword files..."
cp ../../../resources/porcupine/resources/keyword_files/android/picovoice_android.ppn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/keyword_files/en/picovoice_android.ppn
cp ../../../resources/porcupine/resources/keyword_files/linux/alexa_linux.ppn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/keyword_files/en/alexa_linux.ppn
cp ../../../resources/porcupine/resources/keyword_files_de/android/ananas_android.ppn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/keyword_files/de/ananas_android.ppn
cp ../../../resources/porcupine/resources/keyword_files_es/android/emparedado_android.ppn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/keyword_files/es/emparedado_android.ppn
cp ../../../resources/porcupine/resources/keyword_files_fr/android/framboise_android.ppn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/keyword_files/fr/framboise_android.ppn
cp ../../../resources/porcupine/resources/keyword_files_es/android/murciélago_android.ppn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/keyword_files/es/murciélago_android.ppn

if [ ! -d "./picovoice-activity-demo-app/src/androidTest/assets/test_resources/context_files" ]
then
    echo "Creating test context files directory..."
    mkdir -p ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/context_files/de
    mkdir -p ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/context_files/en
    mkdir -p ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/context_files/es
    mkdir -p ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/context_files/fr
fi

echo "Copying test context files..."
cp ../../../resources/rhino/resources/contexts/android/coffee_maker_android.rhn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/context_files/en/coffee_maker_android.rhn
cp ../../../resources/rhino/resources/contexts/linux/coffee_maker_linux.rhn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/context_files/en/coffee_maker_linux.rhn
cp ../../../resources/rhino/demo/android/Activity/rhino-activity-demo-app/src/androidTest/assets/test_resources/context_files/test_de_android.rhn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/context_files/de/test_de_android.rhn
cp ../../../resources/rhino/demo/android/Activity/rhino-activity-demo-app/src/androidTest/assets/test_resources/context_files/test_es_android.rhn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/context_files/es/test_es_android.rhn
cp ../../../resources/rhino/demo/android/Activity/rhino-activity-demo-app/src/androidTest/assets/test_resources/context_files/test_fr_android.rhn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/context_files/fr/test_fr_android.rhn
cp ../../../resources/rhino/resources/contexts_es/android/iluminación_inteligente_android.rhn ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/context_files/es/iluminación_inteligente_android.rhn 

if [ ! -d "./picovoice-activity-demo-app/src/androidTest/assets/test_resources/porcupine_model_files" ]
then 
    echo "Creating porcupine test model files directory..."
    mkdir -p ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/porcupine_model_files
fi

echo "Copying porcupine test model files..."
cp ../../../resources/porcupine/lib/common/porcupine_params.pv ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/porcupine_model_files/porcupine_params.pv
cp ../../../resources/porcupine/lib/common/porcupine_params_de.pv ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/porcupine_model_files/porcupine_params_de.pv
cp ../../../resources/porcupine/lib/common/porcupine_params_es.pv ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/porcupine_model_files/porcupine_params_es.pv
cp ../../../resources/porcupine/lib/common/porcupine_params_fr.pv ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/porcupine_model_files/porcupine_params_fr.pv

if [ ! -d "./picovoice-activity-demo-app/src/androidTest/assets/test_resources/rhino_model_files" ]
then 
    echo "Creating rhino test model files directory..."
    mkdir -p ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/rhino_model_files
fi

echo "Copying rhino test model files..."
cp ../../../resources/rhino/lib/common/rhino_params.pv ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/rhino_model_files/rhino_params.pv
cp ../../../resources/rhino/lib/common/rhino_params_de.pv ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/rhino_model_files/rhino_params_de.pv
cp ../../../resources/rhino/lib/common/rhino_params_es.pv ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/rhino_model_files/rhino_params_es.pv
cp ../../../resources/rhino/lib/common/rhino_params_fr.pv ./picovoice-activity-demo-app/src/androidTest/assets/test_resources/rhino_model_files/rhino_params_fr.pv
