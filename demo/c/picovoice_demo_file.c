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

#include <stdio.h>
#include <stdlib.h>
#include <sys/time.h>

#if defined(_WIN32) || defined(_WIN64)

#include <windows.h>

#endif

#include "pv_picovoice.h"

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

static void wake_word_callback(void) {
    fprintf(stdout, "[wake word]\n");
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

    pv_inference_delete_func(inference);
}

int main(int argc, char *argv[]) {
    if (argc != 9) {
        static const char *USAGE_STRING =
                "usage : %s library_path porcupine_model_path keyword_path porcupine_sensitivity rhino_model_path "
                "context_path rhino_sensitivity wav_path\n";
        fprintf(stderr, USAGE_STRING, argv[0]);
        exit(1);
    }

    const char *library_path = argv[1];
    const char *porcupine_model_path = argv[2];
    const char *keyword_path = argv[3];
    const float porcupine_sensitivity = (float) strtod(argv[4], NULL);
    const char *rhino_model_path = argv[5];
    const char *context_path = argv[6];
    const float rhino_sensitivity = (float) strtod(argv[7], NULL);
    const char *wav_path = argv[8];

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

    pv_picovoice_t *handle = NULL;
    pv_status_t status = pv_picovoice_init_func(
            porcupine_model_path,
            keyword_path,
            porcupine_sensitivity,
            wake_word_callback,
            rhino_model_path,
            context_path,
            rhino_sensitivity,
            inference_callback,
            &handle);
    if (status != PV_STATUS_SUCCESS) {
        fprintf(stderr, "'pv_picovoice_init' failed with '%s'\n", pv_status_to_string_func(status));
        exit(1);
    }

    FILE *wav = fopen(wav_path, "rb");
    if (!wav) {
        fprintf(stderr, "failed to open wav file\n");
        exit(1);
    }

    if (fseek(wav, 44, SEEK_SET) != 0) {
        fprintf(stderr, "failed to skip the wav header\n");
        exit(1);
    }

    const int32_t frame_length = pv_picovoice_frame_length_func();

    int16_t *pcm = malloc(sizeof(int16_t) * frame_length);
    if (!pcm) {
        fprintf(stderr, "failed to allocate memory for audio buffer\n");
        exit(1);
    }

    double total_cpu_time_usec = 0;
    double total_processed_time_usec = 0;
    int32_t frame_index = 0;

    while (fread(pcm, sizeof(int16_t), frame_length, wav) == (size_t) frame_length) {
        struct timeval before;
        gettimeofday(&before, NULL);

        status = pv_picovoice_process_func(handle, pcm);
        if (status != PV_STATUS_SUCCESS) {
            fprintf(stderr, "'pv_picovoice_process' failed with '%s'\n", pv_status_to_string_func(status));
            exit(1);
        }

        struct timeval after;
        gettimeofday(&after, NULL);

        total_cpu_time_usec +=
                (double) (after.tv_sec - before.tv_sec) * 1e6 + (double) (after.tv_usec - before.tv_usec);
        total_processed_time_usec += (frame_length * 1e6) / pv_sample_rate_func();
        frame_index++;
    }

    const double real_time_factor = total_cpu_time_usec / total_processed_time_usec;
    fprintf(stdout, "real time factor : %.3f\n", real_time_factor);

    free(pcm);
    fclose(wav);
    pv_picovoice_delete_func(handle);
    close_dl(picovoice_library);

    return 0;
}
