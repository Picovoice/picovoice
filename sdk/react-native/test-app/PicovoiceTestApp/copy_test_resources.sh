PICOVOICE_RESOURCE_DIR=../../../../resources

PORCUPINE_DIR=${PICOVOICE_RESOURCE_DIR}/porcupine
PORCUPINE_LIB_DIR=${PORCUPINE_DIR}/lib
PORCUPINE_RESOURCE_DIR=${PORCUPINE_DIR}/resources

RHINO_DIR=${PICOVOICE_RESOURCE_DIR}/rhino
RHINO_LIB_DIR=${RHINO_DIR}/lib
RHINO_RESOURCE_DIR=${RHINO_DIR}/resources

ANDROID_ASSETS_DIR="./android/app/src/main/assets"
IOS_ASSETS_DIR="./ios/PicovoiceTestApp/Assets.bundle"

echo "Creating test resources asset directory"
mkdir -p ${ANDROID_ASSETS_DIR}
mkdir -p ${IOS_ASSETS_DIR}

echo "Copying test audio samples..."
mkdir -p ${ANDROID_ASSETS_DIR}/audio_samples
mkdir -p ${IOS_ASSETS_DIR}/audio_samples
cp ${PICOVOICE_RESOURCE_DIR}/audio_samples/*.wav ${ANDROID_ASSETS_DIR}/audio_samples
cp ${PICOVOICE_RESOURCE_DIR}/audio_samples/*.wav ${IOS_ASSETS_DIR}/audio_samples

echo "Copying test keyword files..."
mkdir -p ${ANDROID_ASSETS_DIR}/keyword_files
mkdir -p ${IOS_ASSETS_DIR}/keyword_files

mkdir -p ${ANDROID_ASSETS_DIR}/keyword_files/en
mkdir -p ${IOS_ASSETS_DIR}/keyword_files/en
cp ${PORCUPINE_RESOURCE_DIR}/keyword_files/android/*.ppn ${ANDROID_ASSETS_DIR}/keyword_files/en/
cp ${PORCUPINE_RESOURCE_DIR}/keyword_files/ios/*.ppn ${IOS_ASSETS_DIR}/keyword_files/en/

for d in ${PORCUPINE_RESOURCE_DIR}/keyword_files_*; do
    LANGUAGE=$(echo "${d}" | cut -d'_' -f3)

    mkdir -p ${ANDROID_ASSETS_DIR}/keyword_files/${LANGUAGE}
    mkdir -p ${IOS_ASSETS_DIR}/keyword_files/${LANGUAGE}
    cp ${PORCUPINE_RESOURCE_DIR}/keyword_files_${LANGUAGE}/android/*.ppn ${ANDROID_ASSETS_DIR}/keyword_files/${LANGUAGE}
    cp ${PORCUPINE_RESOURCE_DIR}/keyword_files_${LANGUAGE}/ios/*.ppn ${IOS_ASSETS_DIR}/keyword_files/${LANGUAGE}
done

echo "Copying test context files..."
mkdir -p ${ANDROID_ASSETS_DIR}/context_files
mkdir -p ${IOS_ASSETS_DIR}/context_files

mkdir -p ${ANDROID_ASSETS_DIR}/context_files/en
mkdir -p ${IOS_ASSETS_DIR}/context_files/en
cp ${RHINO_RESOURCE_DIR}/contexts/android/*.rhn ${ANDROID_ASSETS_DIR}/context_files/en/
cp ${RHINO_RESOURCE_DIR}/contexts/ios/*.rhn ${IOS_ASSETS_DIR}/context_files/en/

for d in ${RHINO_RESOURCE_DIR}/contexts_*; do
    LANGUAGE=$(echo "${d}" | cut -d'_' -f2)

    mkdir -p ${ANDROID_ASSETS_DIR}/context_files/${LANGUAGE}
    mkdir -p ${IOS_ASSETS_DIR}/context_files/${LANGUAGE}
    cp ${RHINO_RESOURCE_DIR}/contexts_${LANGUAGE}/android/*.rhn ${ANDROID_ASSETS_DIR}/context_files/${LANGUAGE}
    cp ${RHINO_RESOURCE_DIR}/contexts_${LANGUAGE}/ios/*.rhn ${IOS_ASSETS_DIR}/context_files/${LANGUAGE}
done

echo "Copying test model files..."
mkdir -p ${ANDROID_ASSETS_DIR}/model_files
mkdir -p ${IOS_ASSETS_DIR}/model_files
cp ${PORCUPINE_LIB_DIR}/common/*.pv ${ANDROID_ASSETS_DIR}/model_files
cp ${PORCUPINE_LIB_DIR}/common/*.pv ${IOS_ASSETS_DIR}/model_files
cp ${RHINO_LIB_DIR}/common/*.pv ${ANDROID_ASSETS_DIR}/model_files
cp ${RHINO_LIB_DIR}/common/*.pv ${IOS_ASSETS_DIR}/model_files

echo "Copying test data file..."
cp ${PICOVOICE_RESOURCE_DIR}/.test/test_data.json .
