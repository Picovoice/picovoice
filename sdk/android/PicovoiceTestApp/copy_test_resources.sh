PICOVOICE_RESOURCE_DIR=../../../resources

PORCUPINE_DIR=${PICOVOICE_RESOURCE_DIR}/porcupine
PORCUPINE_LIB_DIR=${PORCUPINE_DIR}/lib
PORCUPINE_RESOURCE_DIR=${PORCUPINE_DIR}/resources

RHINO_DIR=${PICOVOICE_RESOURCE_DIR}/rhino
RHINO_LIB_DIR=${RHINO_DIR}/lib
RHINO_RESOURCE_DIR=${RHINO_DIR}/resources

ASSET_DIR=./picovoice-test-app/src/androidTest/assets/test_resources

if [ ! -d "${ASSET_DIR}/audio_samples" ]
then
    echo "Creating test audio samples directory..."
    mkdir -p ${ASSET_DIR}/audio_samples
fi

echo "Copying test audio samples..."
cp ${PICOVOICE_RESOURCE_DIR}/audio_samples/*.wav ${ASSET_DIR}/audio_samples

if [ ! -d "${ASSET_DIR}/porcupine_model_files" ]
then
    echo "Creating test porcupine model files directory..."
    mkdir -p ${ASSET_DIR}/porcupine_model_files
fi

if [ ! -d "${ASSET_DIR}/rhino_model_files" ]
then
    echo "Creating test rhino model files directory..."
    mkdir -p ${ASSET_DIR}/rhino_model_files
fi

echo "Copying test model files..."
cp ${PORCUPINE_LIB_DIR}/common/*.pv ${ASSET_DIR}/porcupine_model_files
cp ${RHINO_LIB_DIR}/common/*.pv ${ASSET_DIR}/rhino_model_files

if [ ! -d "${ASSET_DIR}/keyword_files" ]
then
    echo "Creating test keyword files directory..."
    mkdir -p ${ASSET_DIR}/keyword_files
fi

echo "Copying test keyword files..."
mkdir -p ${ASSET_DIR}/keyword_files/en/
cp ${PORCUPINE_RESOURCE_DIR}/keyword_files/linux/alexa_linux.ppn ${ASSET_DIR}/keyword_files/en/
cp ${PORCUPINE_RESOURCE_DIR}/keyword_files/android/*_android.ppn ${ASSET_DIR}/keyword_files/en/

for d in ${PORCUPINE_RESOURCE_DIR}/keyword_files_*; do
    LANGUAGE=$(echo "${d}" | cut -d'_' -f3)

    mkdir -p ${ASSET_DIR}/keyword_files/${LANGUAGE}
    cp ${PORCUPINE_RESOURCE_DIR}/keyword_files_${LANGUAGE}/android/*_android.ppn ${ASSET_DIR}/keyword_files/${LANGUAGE}/
done

if [ ! -d "${ASSET_DIR}/context_files" ]
then
    echo "Creating test context files directory..."
    mkdir -p ${ASSET_DIR}/context_files
fi

echo "Copying test context files..."
mkdir -p ${ASSET_DIR}/context_files/en/
cp ${RHINO_RESOURCE_DIR}/contexts/linux/coffee_maker_linux.rhn ${ASSET_DIR}/context_files/en/
cp ${RHINO_RESOURCE_DIR}/contexts/android/*_android.rhn ${ASSET_DIR}/context_files/en/

for d in ${RHINO_RESOURCE_DIR}/contexts_*; do
    LANGUAGE=$(echo "${d}" | cut -d'_' -f2)

    mkdir -p ${ASSET_DIR}/context_files/${LANGUAGE}
    cp ${RHINO_RESOURCE_DIR}/contexts_${LANGUAGE}/android/*_android.rhn ${ASSET_DIR}/context_files/${LANGUAGE}/
done

echo "Copying test data file..."
cp ${PICOVOICE_RESOURCE_DIR}/.test/test_data.json ${ASSET_DIR}/
