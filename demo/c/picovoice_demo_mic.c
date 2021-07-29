/*
    Copyright 2020-2021 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

#if !defined(_WIN32) && !defined(_WIN64)

#include <dlfcn.h>

#endif

#include <signal.h>
#include <stdio.h>

#if defined(_WIN32) && defined(_WIN64)

#include <windows.h>

#endif

#define MINIAUDIO_IMPLEMENTATION

#include "miniaudio/miniaudio.h"

#include "pv_picovoice.h"

typedef struct {
    int16_t *buffer;
    int32_t max_size;
    int32_t filled;
} frame_buffer_t;

typedef struct {
    frame_buffer_t frame_buffer;
    const char *(*pv_status_to_string_func)(pv_status_t);
    pv_status_t (*pv_picovoice_process_func)(pv_picovoice_t *, const int16_t *);
    pv_picovoice_t *picovoice;
} pv_picovoice_data_t;

static volatile bool is_interrupted = false;

static void *open_dl(const char *dl_path) {

#if defined(_WIN32) || defined(_WIN64)

    return LoadLibrary(dl_path);

#else

    return dlopen(dl_path, RTLD_NOW);

#endif

}

static void *load_symbol(void *handle, const char *symbol) {

#if defined(_WIN32) || defined(_WIN64)

    return GetProcAddress((HMODULE) handle, symbol);

#else

    return dlsym(handle, symbol);

#endif

}

static void close_dl(void *handle) {

#if defined(_WIN32) || defined(_WIN64)

    FreeLibrary((HMODULE) handle);

#else

    dlclose(handle);

#endif

}

static void print_dl_error(const char *message) {

#if defined(_WIN32) || defined(_WIN64)

    fprintf(stderr, "%s with code '%lu'.\n", message, GetLastError());

#else

    fprintf(stderr, "%s with '%s'.\n", message, dlerror());

#endif

}

static void print_usage(const char *program) {
    fprintf(stderr, "usage : %s library_path porcupine_model_path keyword_path porcupine_sensitivity rhino_model_path "
                    "context_path rhino_sensitivity input_audio_device\n"
                    "        %s --show_audio_devices\n", program, program);
}

static void picovoice_process_callback(const pv_picovoice_data_t *pv_picovoice_data, const int16_t *pcm) {
    pv_status_t status = pv_picovoice_data->pv_picovoice_process_func(pv_picovoice_data->picovoice, pcm);
    if (status != PV_STATUS_SUCCESS) {
        fprintf(stderr, "'pv_picovoice_process' failed with '%s'\n",
                pv_picovoice_data->pv_status_to_string_func(status));
        exit(1);
    }
}

static void mic_callback(ma_device *device, void *output, const void *input, ma_uint32 frame_count) {
    (void) output;

    pv_picovoice_data_t *pv_picovoice_data = (pv_picovoice_data_t *) device->pUserData;

    frame_buffer_t *frame_buffer = &pv_picovoice_data->frame_buffer;

    int16_t *buffer_ptr = &frame_buffer->buffer[frame_buffer->filled];
    int16_t *input_ptr = (int16_t *) input;

    int32_t processed_frames = 0;

    while (processed_frames < frame_count) {
        const int32_t remaining_frames = (int32_t) frame_count - processed_frames;
        const int32_t available_frames = frame_buffer->max_size - frame_buffer->filled;

        if (available_frames > 0) {
            const int32_t frames_to_read = (remaining_frames < available_frames) ? remaining_frames : available_frames;

            memcpy(buffer_ptr, input_ptr, frames_to_read * sizeof(int16_t));
            buffer_ptr += frames_to_read;
            input_ptr += frames_to_read;

            processed_frames += frames_to_read;
            frame_buffer->filled += frames_to_read;
        } else {
            picovoice_process_callback(pv_picovoice_data, frame_buffer->buffer);

            buffer_ptr = frame_buffer->buffer;
            frame_buffer->filled = 0;
        }
    }
}

void interrupt_handler(int _) {
    (void) _;
    is_interrupted = true;
    fprintf(stdout, "\n");
}

static void wake_word_callback(void) {
    fprintf(stdout, "[wake word]\n");
    fflush(stdout);
}

static void (*pv_inference_delete_func)(pv_inference_t *) = NULL;

static void inference_callback(pv_inference_t *inference) {
    fprintf(stdout, "{\n");
    fprintf(stdout, "    is_understood : '%s',\n", (inference->is_understood ? "true" : "false"));
    if (inference->is_understood) {
        fprintf(stdout, "    intent : '%s',\n", inference->intent);
        if (inference->num_slots > 0) {
            fprintf(stdout, "    slots : {\n");
            for (int32_t i = 0; i < inference->num_slots; i++) {
                fprintf(stdout, "        '%s' : '%s',\n", inference->slots[i], inference->values[i]);
            }
            fprintf(stdout, "    }\n");
        }
    }
    fprintf(stdout, "}\n\n");
    fflush(stdout);

    pv_inference_delete_func(inference);
}

int main(int argc, char *argv[]) {
    if (argc != 2 && argc != 9) {
        print_usage(argv[0]);
        exit(1);
    }

    ma_context context;
    ma_result result;

    result = ma_context_init(NULL, 0, NULL, &context);
    if (result != MA_SUCCESS) {
        fprintf(stderr, "failed to initialize the input audio device list.\n");
        exit(1);
    }

    ma_device_info *capture_info;
    ma_uint32 capture_count;

    result = ma_context_get_devices(&context, NULL, NULL, &capture_info, &capture_count);
    if (result != MA_SUCCESS) {
        fprintf(stderr, "failed to get the available input devices.\n");
        exit(1);
    }

    if (argc == 2) {
        if (strcmp(argv[1], "--show_audio_devices") == 0) {
            for (ma_uint32 device = 0; device < capture_count; device++) {
                fprintf(stdout, "index: %d, name: %s\n", device, capture_info[device].name);
            }
            return 0;
        } else {
            print_usage(argv[0]);
            exit(1);
        }
    }

    signal(SIGINT, interrupt_handler);

    const char *library_path = argv[1];
    const char *porcupine_model_path = argv[2];
    const char *keyword_path = argv[3];
    const float porcupine_sensitivity = (float) strtod(argv[4], NULL);
    const char *rhino_model_path = argv[5];
    const char *context_path = argv[6];
    const float rhino_sensitivity = (float) strtod(argv[7], NULL);
    const int32_t device_index = strtol(argv[8], NULL, 10);

    void *picovoice_library = open_dl(library_path);
    if (!picovoice_library) {
        fprintf(stderr, "failed to open library.\n");
        exit(1);
    }

    const char *(*pv_status_to_string_func)(pv_status_t) = load_symbol(picovoice_library, "pv_status_to_string");
    if (!pv_status_to_string_func) {
        print_dl_error("failed to load 'pv_status_to_string'");
        exit(1);
    }

    int32_t (*pv_sample_rate_func)() = load_symbol(picovoice_library, "pv_sample_rate");
    if (!pv_sample_rate_func) {
        print_dl_error("failed to load 'pv_sample_rate'");
        exit(1);
    }

    pv_status_t (*pv_picovoice_init_func)(
            const char *,
            const char *,
            float,
            void (*)(void),
            const char *,
            const char *,
            float,
            void (*)(pv_inference_t *),
            pv_picovoice_t **) = NULL;
    pv_picovoice_init_func = load_symbol(picovoice_library, "pv_picovoice_init");
    if (!pv_picovoice_init_func) {
        print_dl_error("failed to load 'pv_picovoice_init'");
        exit(1);
    }

    void (*pv_picovoice_delete_func)(pv_picovoice_t *) = load_symbol(picovoice_library, "pv_picovoice_delete");
    if (!pv_picovoice_delete_func) {
        print_dl_error("failed to load 'pv_picovoice_delete'");
        exit(1);
    }

    pv_status_t (*pv_picovoice_process_func)(pv_picovoice_t *, const int16_t *) =
    load_symbol(picovoice_library, "pv_picovoice_process");
    if (!pv_picovoice_process_func) {
        print_dl_error("failed to load 'pv_picovoice_process'");
        exit(1);
    }

    const char *(*pv_picovoice_version_func)() = load_symbol(picovoice_library, "pv_picovoice_version");
    if (!pv_picovoice_version_func) {
        print_dl_error("failed to load 'pv_picovoice_version'");
        exit(1);
    }

    int32_t (*pv_picovoice_frame_length_func)() = load_symbol(picovoice_library, "pv_picovoice_frame_length");
    if (!pv_picovoice_frame_length_func) {
        print_dl_error("failed to load 'pv_picovoice_frame_length'");
        exit(1);
    }

    pv_inference_delete_func = load_symbol(picovoice_library, "pv_inference_delete");
    if (!pv_inference_delete_func) {
        print_dl_error("failed to load 'pv_inference_delete'");
        exit(1);
    }

    pv_picovoice_t *picovoice = NULL;
    pv_status_t status = pv_picovoice_init_func(
            porcupine_model_path,
            keyword_path,
            porcupine_sensitivity,
            wake_word_callback,
            rhino_model_path,
            context_path,
            rhino_sensitivity,
            inference_callback,
            &picovoice);
    if (status != PV_STATUS_SUCCESS) {
        fprintf(stderr, "'pv_picovoice_init' failed with '%s'\n", pv_status_to_string_func(status));
        exit(1);
    }

    const int32_t frame_length = pv_picovoice_frame_length_func();

    pv_picovoice_data_t pv_picovoice_data;
    pv_picovoice_data.frame_buffer.buffer = malloc(frame_length * sizeof(int16_t));
    if (!pv_picovoice_data.frame_buffer.buffer) {
        fprintf(stderr, "failed to allocate memory using 'malloc'\n");
        exit(1);
    }

    pv_picovoice_data.frame_buffer.max_size = frame_length;
    pv_picovoice_data.frame_buffer.filled = 0;

    pv_picovoice_data.pv_picovoice_process_func = pv_picovoice_process_func;
    pv_picovoice_data.pv_status_to_string_func = pv_status_to_string_func;
    pv_picovoice_data.picovoice = picovoice;

    ma_device_config device_config;
    ma_device device;

    device_config = ma_device_config_init(ma_device_type_capture);
    device_config.capture.format = ma_format_s16;
    device_config.capture.pDeviceID = &capture_info[device_index].id;
    device_config.capture.channels = 1;
    device_config.sampleRate = pv_sample_rate_func();
    device_config.dataCallback = mic_callback;
    device_config.pUserData = &pv_picovoice_data;

    result = ma_device_init(&context, &device_config, &device);
    if (result != MA_SUCCESS) {
        fprintf(stderr, "failed to initialize capture device.\n");
        exit(1);
    }

    result = ma_device_start(&device);
    if (result != MA_SUCCESS) {
        fprintf(stderr, "failed to start device.\n");
        exit(1);
    }

    fprintf(stdout, "Using device: %s\n", device.capture.name);
    fprintf(stdout, "Picovoice %s\nListening ...\n\n", pv_picovoice_version_func());
    fflush(stdout);

    while (!is_interrupted) {}

    ma_device_uninit(&device);
    ma_context_uninit(&context);

    free(pv_picovoice_data.frame_buffer.buffer);
    pv_picovoice_delete_func(picovoice);

    close_dl(picovoice_library);

    return 0;
}
