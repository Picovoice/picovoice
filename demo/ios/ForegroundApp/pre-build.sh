#!/bin/sh

mkdir -p "${SRCROOT}/PicovoiceForegroundAppDemo/keywords/"
mkdir -p "${SRCROOT}/PicovoiceForegroundAppDemo/contexts/"
mkdir -p "${SRCROOT}/PicovoiceForegroundAppDemo/models/"

rm "${SRCROOT}/PicovoiceForegroundAppDemo/keywords/"*
rm "${SRCROOT}/PicovoiceForegroundAppDemo/contexts/"*
rm "${SRCROOT}/PicovoiceForegroundAppDemo/models/"*

if [ $1 == 'en' ];
then
    cp "${SRCROOT}/../../../resources/porcupine/resources/keyword_files/ios/"* "${SRCROOT}/PicovoiceForegroundAppDemo/keywords/"
    cp "${SRCROOT}/../../../resources/porcupine/lib/common/porcupine_params.pv" "${SRCROOT}/PicovoiceForegroundAppDemo/models/"
    cp "${SRCROOT}/../../../resources/rhino/resources/contexts/ios/"* "${SRCROOT}/PicovoiceForegroundAppDemo/contexts/"
    cp "${SRCROOT}/../../../resources/rhino/lib/common/rhino_params.pv" "${SRCROOT}/PicovoiceForegroundAppDemo/models/"
else
    cp "${SRCROOT}/../../../resources/porcupine/resources/keyword_files_$1/ios/"* "${SRCROOT}/PicovoiceForegroundAppDemo/keywords/"
    cp "${SRCROOT}/../../../resources/porcupine/lib/common/porcupine_params_$1.pv" "${SRCROOT}/PicovoiceForegroundAppDemo/models/"
    cp "${SRCROOT}/../../../resources/rhino/resources/contexts_$1/ios/"* "${SRCROOT}/PicovoiceForegroundAppDemo/contexts/"
    cp "${SRCROOT}/../../../resources/rhino/lib/common/rhino_params_$1.pv" "${SRCROOT}/PicovoiceForegroundAppDemo/models/"
fi
