```console
gcc -std=c99 -O3 -o demo/c/picovoice_demo_mic \
-I sdk/c/include demo/c/picovoice_demo_mic.c -ldl -lasound
```

```console
./demo/c/picovoice_demo_mic \
${LIBRARY_PATH} \
resources/porcupine/lib/common/porcupine_params.pv \
resources/porcupine/resources/keyword_files/${PLATFORM}/picovoice_${PLATFORM}.ppn \
0.5 \
resources/rhino/lib/common/rhino_params.pv \
resources/rhino/resources/contexts/${PLATFORM}/coffee_maker_${PLATFORM}.rhn \
0.5 \
${INPUT_AUDIO_DEVICE}
```

```console
gcc -std=c99 -O3 -o demo/c/picovoice_demo_file \
-I sdk/c/include demo/c/picovoice_demo_file.c -ldl
```

```console
./demo/c/picovoice_demo_file \
${LIBRARY_PATH} \
resources/porcupine/lib/common/porcupine_params.pv \
resources/porcupine/resources/keyword_files/${PLATFORM}/picovoice_${PLATFORM}.ppn \
0.5 \
resources/rhino/lib/common/rhino_params.pv \
resources/rhino/resources/contexts/${PLATFORM}/coffee_maker_${PLATFORM}.rhn \
0.5 \
resources/audio_samples/picovoice-coffee.wav
```
