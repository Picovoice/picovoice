PICOVOICE_RESOURCE_DIR=../../../resources

PORCUPINE_DIR=${PICOVOICE_RESOURCE_DIR}/porcupine
PORCUPINE_LIB_DIR=${PORCUPINE_DIR}/lib
PORCUPINE_RESOURCE_DIR=${PORCUPINE_DIR}/resources

RHINO_DIR=${PICOVOICE_RESOURCE_DIR}/rhino
RHINO_LIB_DIR=${RHINO_DIR}/lib
RHINO_RESOURCE_DIR=${RHINO_DIR}/resources

ASSETS_DIR="./PicovoiceAppTestUITests/test_resources"

echo "Creating test resources asset directory"
mkdir -p ${ASSETS_DIR}

echo "Copying test audio samples..."
mkdir -p ${ASSETS_DIR}/audio_samples
cp ${PICOVOICE_RESOURCE_DIR}/audio_samples/*.wav ${ASSETS_DIR}/audio_samples

echo "Copying test keyword files..."
mkdir -p ${ASSETS_DIR}/keyword_files/en/
cp ${PORCUPINE_RESOURCE_DIR}/keyword_files/linux/alexa_linux.ppn ${ASSETS_DIR}/keyword_files/en/
cp ${PORCUPINE_RESOURCE_DIR}/keyword_files/ios/*_ios.ppn ${ASSETS_DIR}/keyword_files/en/

for d in ${PORCUPINE_RESOURCE_DIR}/keyword_files_*; do
    LANGUAGE=$(echo "${d}" | cut -d'_' -f3)

    mkdir -p ${ASSETS_DIR}/keyword_files/${LANGUAGE}
    cp ${PORCUPINE_RESOURCE_DIR}/keyword_files_${LANGUAGE}/ios/*_ios.ppn ${ASSETS_DIR}/keyword_files/${LANGUAGE}/
done

echo "Copying test context files..."
mkdir -p ${ASSETS_DIR}/context_files

mkdir -p ${ASSETS_DIR}/context_files/en
cp ${RHINO_RESOURCE_DIR}/contexts/linux/coffee_maker_linux.rhn ${ASSETS_DIR}/context_files/en/
cp ${RHINO_RESOURCE_DIR}/contexts/ios/*.rhn ${ASSETS_DIR}/context_files/en/

for d in ${RHINO_RESOURCE_DIR}/contexts_*; do
    LANGUAGE=$(echo "${d}" | cut -d'_' -f2)

    mkdir -p ${ASSETS_DIR}/context_files/${LANGUAGE}
    cp ${RHINO_RESOURCE_DIR}/contexts_${LANGUAGE}/ios/*.rhn ${ASSETS_DIR}/context_files/${LANGUAGE}
done

echo "Copying test model files..."
mkdir -p ${ASSETS_DIR}/model_files
cp ${PORCUPINE_LIB_DIR}/common/*.pv ${ASSETS_DIR}/model_files
cp ${RHINO_LIB_DIR}/common/*.pv ${ASSETS_DIR}/model_files

echo "Copying test data file..."
cp ${PICOVOICE_RESOURCE_DIR}/.test/test_data.json ${ASSETS_DIR}

echo "Fixing filename encodings for Appcenter compatibility"
convmv --notest -f utf8 -t utf8 --nfd -r ${ASSETS_DIR}
