#!/bin/bash

ROOT_DIR=$(pwd)
echo "#### Working from $ROOT_DIR ####\n"

# Build the Porcupine and Rhino WEB bindings
pushd resources/porcupine/binding/web
yarn && yarn build
for i in porcupine-web*
do
    pushd $i
    yarn install
    yarn build || exit 1
    popd
done
popd

pushd resources/rhino/binding/web
yarn && yarn build
for i in rhino-web*
do
    pushd $i
    yarn install
    yarn build || exit 1
    popd
done
popd


# Build Picovoice WEB packages
pushd sdk/web
yarn install
yarn build || exit 1
for i in picovoice-web*
do
    pushd $i
    yarn install

    echo "Copying required local PPN and RHN dependencies..."
    PORCUPINE_DEP=$(echo $i | sed 's/picovoice/porcupine/' | sed 's/worker/factory/')
    RHINO_DEP=$(echo $i | sed 's/picovoice/rhino/' | sed 's/worker/factory/')
    cp -r $ROOT_DIR/resources/porcupine/binding/web/$PORCUPINE_DEP ./node_modules/@picovoice/
    cp -r $ROOT_DIR/resources/rhino/binding/web/$RHINO_DEP ./node_modules/@picovoice/

    yarn build || exit 1
    popd
done
popd
