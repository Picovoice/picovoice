/*
    Copyright 2020-2021 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

#include <getopt.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#if defined(_WIN32) || defined(_WIN64)

#include <windows.h>

#else

#include <dlfcn.h>

#endif

#include "pv_picovoice.h"
#include "pv_recorder.h"


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

static struct option long_options[] = {
        {"show_audio_devices",    no_argument,       NULL, 'd'},
        {"library_path",          required_argument, NULL, 'l'},
        {"access_key",            required_argument, NULL, 'a'},
        {"keyword_path",          required_argument, NULL, 'k'},
        {"context_path",          required_argument, NULL, 'c'},
        {"porcupine_sensitivity", required_argument, NULL, 's'},
        {"porcupine_model_path",  required_argument, NULL, 'p'},
        {"rhino_sensitivity",     required_argument, NULL, 't'},
        {"rhino_model_path",      required_argument, NULL, 'r'},
        {"endpoint_duration_sec", required_argument, NULL, 'u'},
        {"require_endpoint",      required_argument, NULL, 'e'},
        {"audio_device_index",    required_argument, NULL, 'i'}
};

void print_usage(const char *program_name) {
    fprintf(stderr,
            "Usage : %s -l LIBRARY_PATH -a ACCESS_KEY -k KEYWORD_PATH -c CONTEXT_PATH -p PPN_MODEL_PATH -r RHN_MODEL_PATH "
            "[--audio_device_index AUDIO_DEVICE_INDEX --porcupine_sensitivity PPN_SENSITIVITY --rhino_sensitivity RHN_SENSITIVITY --endpoint_duration_sec --require_endpoint \"true\"|\"false\" ]\n"
            "       %s --show_audio_devices\n",
            program_name,
            program_name);
}

void interrupt_handler(int _) {
    (void) _;
    is_interrupted = true;
}

void show_audio_devices(void) {
    char **devices = NULL;
    int32_t count = 0;

    pv_recorder_status_t status = pv_recorder_get_audio_devices(&count, &devices);
    if (status != PV_RECORDER_STATUS_SUCCESS) {
        fprintf(stderr, "Failed to get audio devices with: %s.\n", pv_recorder_status_to_string(status));
        exit(1);
    }

    fprintf(stdout, "Printing devices...\n");
    for (int32_t i = 0; i < count; i++) {
        fprintf(stdout, "index: %d, name: %s\n", i, devices[i]);
    }

    pv_recorder_free_device_list(count, devices);
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

int picovoice_main(int argc, char *argv[]) {

    signal(SIGINT, interrupt_handler);
    const char *library_path = NULL;
    const char *access_key = NULL;
    const char *keyword_path = NULL;
    const char *context_path = NULL;
    float porcupine_sensitivity = 0.5f;
    const char *porcupine_model_path = NULL;
    float rhino_sensitivity = 0.5f;
    const char *rhino_model_path = NULL;
    float endpoint_duration_sec = 1.f;
    bool require_endpoint = true;
    int32_t device_index = -1;

    int c;
    while ((c = getopt_long(argc, argv, "de:l:a:k:c:s:p:t:r:i:u:", long_options, NULL)) != -1) {
        switch (c) {
            case 'd':
                show_audio_devices();
                return 0;
            case 'l':
                library_path = optarg;
                break;
            case 'a':
                access_key = optarg;
                break;
            case 'k':
                keyword_path = optarg;
                break;
            case 'c':
                context_path = optarg;
                break;
            case 's':
                porcupine_sensitivity = strtof(optarg, NULL);
                break;
            case 'p':
                porcupine_model_path = optarg;
                break;
            case 't':
                rhino_sensitivity = strtof(optarg, NULL);
                break;
            case 'r':
                rhino_model_path = optarg;
                break;
            case 'u':
                endpoint_duration_sec = strtof(optarg, NULL);
                break;
            case 'e':
                if (strcmp(optarg, "false") == 0) {
                    require_endpoint = false;
                }
                break;
            case 'i':
                device_index = (int32_t) strtol(optarg, NULL, 10);
                break;
            default:
                print_usage(argv[0]);
                exit(1);
        }
    }

    if (!library_path || !keyword_path || !context_path || !access_key || !porcupine_model_path || !rhino_model_path) {
        print_usage(argv[0]);
        exit(1);
    }

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
            const char *,
            float,
            void (*)(void),
            const char *,
            const char *,
            float,
            float,
            bool,
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

    int32_t (*pv_picovoice_frame_length_func)() = load_symbol(picovoice_library, "pv_picovoice_frame_length");
    if (!pv_picovoice_frame_length_func) {
        print_dl_error("failed to load 'pv_picovoice_frame_length'");
        exit(1);
    }

    const char *(*pv_picovoice_version_func)() = load_symbol(picovoice_library, "pv_picovoice_version");
    if (!pv_picovoice_version_func) {
        print_dl_error("failed to load 'pv_picovoice_version'");
        exit(1);
    }

    pv_inference_delete_func = load_symbol(picovoice_library, "pv_inference_delete");
    if (!pv_inference_delete_func) {
        print_dl_error("failed to load 'pv_inference_delete'");
        exit(1);
    }

    fprintf(stdout, "%s\n", access_key);
    fprintf(stdout, "%s\n", library_path);
    fprintf(stdout, "%s\n", keyword_path);
    fprintf(stdout, "%s\n", context_path);
    fprintf(stdout, "%s\n", access_key);

    pv_picovoice_t *picovoice = NULL;
    pv_status_t status = pv_picovoice_init_func(
            access_key,
            porcupine_model_path,
            keyword_path,
            porcupine_sensitivity,
            wake_word_callback,
            rhino_model_path,
            context_path,
            rhino_sensitivity,
            endpoint_duration_sec,
            require_endpoint,
            inference_callback,
            &picovoice);
    if (status != PV_STATUS_SUCCESS) {
        fprintf(stderr, "'pv_picovoice_init' failed with '%s'\n", pv_status_to_string_func(status));
        exit(1);
    }

    fprintf(stdout, "Picovoice End-to-End Platform (%s) :\n\n", pv_picovoice_version_func());

    const int32_t frame_length = pv_picovoice_frame_length_func();
    pv_recorder_t *recorder = NULL;
    pv_recorder_status_t recorder_status = pv_recorder_init(device_index, frame_length, 100, true, true, &recorder);
    if (recorder_status != PV_RECORDER_STATUS_SUCCESS) {
        fprintf(stderr, "Failed to initialize device with %s.\n", pv_recorder_status_to_string(recorder_status));
        exit(1);
    }

    const char *selected_device = pv_recorder_get_selected_device(recorder);
    fprintf(stdout, "Selected device: %s\n", selected_device);


    recorder_status = pv_recorder_start(recorder);
    if (recorder_status != PV_RECORDER_STATUS_SUCCESS) {
        fprintf(stderr, "Failed to start device with %s.\n", pv_recorder_status_to_string(recorder_status));
        exit(1);
    }

    int16_t *pcm = malloc(frame_length * sizeof(int16_t));
    if (!pcm) {
        fprintf(stderr, "Failed to allocate pcm memory.\n");
        exit(1);
    }

    fprintf(stdout, "Listening...\n\n");
    fflush(stdout);

    while (!is_interrupted) {
        recorder_status = pv_recorder_read(recorder, pcm);
        if (recorder_status != PV_RECORDER_STATUS_SUCCESS) {
            fprintf(stderr, "Failed to read with %s.\n", pv_recorder_status_to_string(recorder_status));
            exit(1);
        }

        status = pv_picovoice_process_func(picovoice, pcm);
        if (status != PV_STATUS_SUCCESS) {
            fprintf(stderr, "'pv_picovoice_process' failed with '%s'\n",
                    pv_status_to_string_func(status));
            exit(1);
        }
    }

    fprintf(stdout, "Stopping...\n");
    fflush(stdout);

    recorder_status = pv_recorder_stop(recorder);
    if (recorder_status != PV_RECORDER_STATUS_SUCCESS) {
        fprintf(stderr, "Failed to stop device with %s.\n", pv_recorder_status_to_string(recorder_status));
        exit(1);
    }

    free(pcm);
    pv_recorder_delete(recorder);
    pv_picovoice_delete_func(picovoice);
    close_dl(picovoice_library);

    return 0;
}

int main(int argc, char *argv[]) {

#if defined(_WIN32) || defined(_WIN64)

#define UTF8_COMPOSITION_FLAG (0)
#define NULL_TERMINATED (-1)

    LPWSTR *wargv = CommandLineToArgvW(GetCommandLineW(), &argc);
    if (wargv == NULL) {
        fprintf(stderr, "CommandLineToArgvW failed\n");
        exit(1);
    }
    
    char *utf8_argv[argc];

    for (int i = 0; i < argc; ++i) {
        // WideCharToMultiByte: https://docs.microsoft.com/en-us/windows/win32/api/stringapiset/nf-stringapiset-widechartomultibyte
        int arg_chars_num = WideCharToMultiByte(CP_UTF8, UTF8_COMPOSITION_FLAG, wargv[i], NULL_TERMINATED, NULL, 0, NULL, NULL);
        utf8_argv[i] = (char *) malloc(arg_chars_num * sizeof(char));
        if (!utf8_argv[i]) {
            fprintf(stderr, "failed to to allocate memory for converting args");
        }
        WideCharToMultiByte(CP_UTF8, UTF8_COMPOSITION_FLAG, wargv[i], NULL_TERMINATED, utf8_argv[i], arg_chars_num, NULL, NULL);
    }

    LocalFree(wargv);
    argv = utf8_argv;

#endif

    int result = picovoice_main(argc, argv);

#if defined(_WIN32) || defined(_WIN64)

    for (int i = 0; i < argc; ++i) {
        free(utf8_argv[i]);
    }

#endif

    return result;
}
