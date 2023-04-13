PICOVOICE_RESOURCE_DIR=../../resources

PORCUPINE_DIR=${PICOVOICE_RESOURCE_DIR}/porcupine
PORCUPINE_LIB_DIR=${PORCUPINE_DIR}/lib
PORCUPINE_RESOURCE_DIR=${PORCUPINE_DIR}/resources

RHINO_DIR=${PICOVOICE_RESOURCE_DIR}/rhino
RHINO_LIB_DIR=${RHINO_DIR}/lib
RHINO_RESOURCE_DIR=${RHINO_DIR}/resources

ASSETS_DIR="./Assets/StreamingAssets/test"

echo "Creating test resources asset directory"
mkdir -p ${ASSETS_DIR}

echo "Copying test audio samples..."
mkdir -p ${ASSETS_DIR}/audio_samples
cp ${PICOVOICE_RESOURCE_DIR}/audio_samples/*.wav ${ASSETS_DIR}/audio_samples

echo "Copying test keyword files..."
mkdir -p ${ASSETS_DIR}/keyword_files
cp -r ${PORCUPINE_RESOURCE_DIR}/keyword_files/android ${ASSETS_DIR}/keyword_files/
cp -r ${PORCUPINE_RESOURCE_DIR}/keyword_files/ios ${ASSETS_DIR}/keyword_files/
cp -r ${PORCUPINE_RESOURCE_DIR}/keyword_files/linux ${ASSETS_DIR}/keyword_files/
cp -r ${PORCUPINE_RESOURCE_DIR}/keyword_files/mac ${ASSETS_DIR}/keyword_files/
cp -r ${PORCUPINE_RESOURCE_DIR}/keyword_files/windows ${ASSETS_DIR}/keyword_files/

for d in ${PORCUPINE_RESOURCE_DIR}/keyword_files_*; do
    LANGUAGE=$(echo "${d}" | cut -d'_' -f3)

    mkdir -p ${ASSETS_DIR}/keyword_files_${LANGUAGE}
    cp -r ${PORCUPINE_RESOURCE_DIR}/keyword_files_${LANGUAGE}/android ${ASSETS_DIR}/keyword_files_${LANGUAGE}/
    cp -r ${PORCUPINE_RESOURCE_DIR}/keyword_files_${LANGUAGE}/ios ${ASSETS_DIR}/keyword_files_${LANGUAGE}/
    cp -r ${PORCUPINE_RESOURCE_DIR}/keyword_files_${LANGUAGE}/linux ${ASSETS_DIR}/keyword_files_${LANGUAGE}/
    cp -r ${PORCUPINE_RESOURCE_DIR}/keyword_files_${LANGUAGE}/mac ${ASSETS_DIR}/keyword_files_${LANGUAGE}/
    cp -r ${PORCUPINE_RESOURCE_DIR}/keyword_files_${LANGUAGE}/windows ${ASSETS_DIR}/keyword_files_${LANGUAGE}/
done

echo "Copying test context files..."
mkdir -p ${ASSETS_DIR}/context_files
cp -r ${RHINO_RESOURCE_DIR}/contexts/android ${ASSETS_DIR}/context_files/
cp -r ${RHINO_RESOURCE_DIR}/contexts/ios ${ASSETS_DIR}/context_files/
cp -r ${RHINO_RESOURCE_DIR}/contexts/linux ${ASSETS_DIR}/context_files/
cp -r ${RHINO_RESOURCE_DIR}/contexts/mac ${ASSETS_DIR}/context_files/
cp -r ${RHINO_RESOURCE_DIR}/contexts/windows ${ASSETS_DIR}/context_files/

for d in ${RHINO_RESOURCE_DIR}/contexts_*; do
    LANGUAGE=$(echo "${d}" | cut -d'_' -f2)

    mkdir -p ${ASSETS_DIR}/context_files_${LANGUAGE}
    cp -r ${RHINO_RESOURCE_DIR}/contexts_${LANGUAGE}/android ${ASSETS_DIR}/context_files_${LANGUAGE}/
    cp -r ${RHINO_RESOURCE_DIR}/contexts_${LANGUAGE}/ios ${ASSETS_DIR}/context_files_${LANGUAGE}/
    cp -r ${RHINO_RESOURCE_DIR}/contexts_${LANGUAGE}/linux ${ASSETS_DIR}/context_files_${LANGUAGE}/
    cp -r ${RHINO_RESOURCE_DIR}/contexts_${LANGUAGE}/mac ${ASSETS_DIR}/context_files_${LANGUAGE}/
    cp -r ${RHINO_RESOURCE_DIR}/contexts_${LANGUAGE}/windows ${ASSETS_DIR}/context_files_${LANGUAGE}/
done

echo "Copying test model files..."
mkdir -p ${ASSETS_DIR}/model_files
cp ${PORCUPINE_LIB_DIR}/common/*.pv ${ASSETS_DIR}/model_files
cp ${RHINO_LIB_DIR}/common/*.pv ${ASSETS_DIR}/model_files

echo "Copying test data file..."
cp ${PICOVOICE_RESOURCE_DIR}/.test/test_data.json ${ASSETS_DIR}
