/*
    Copyright 2020-2021 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

#include <alsa/asoundlib.h>
#include <asm/ioctl.h>
#include <dlfcn.h>
#include <errno.h>
#include <getopt.h>
#include <linux/spi/spidev.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/ioctl.h>

#include "pv_picovoice.h"

static const uint8_t OFF_RGB[3] = {0, 0, 0};
static const uint8_t BLUE_RGB[3] = {0, 0, 255};
static const uint8_t GREEN_RGB[3] = {0, 255, 0};
static const uint8_t ORANGE_RGB[3] = {255, 128, 0};
static const uint8_t PINK_RGB[3] = {255, 51, 153};
static const uint8_t PURPLE_RGB[3] = {128, 0, 128};
static const uint8_t RED_RGB[3] = {255, 0, 0};
static const uint8_t WHITE_RGB[3] = {255, 255, 255};
static const uint8_t YELLOW_RGB[3] = {255, 255, 51};

static volatile bool is_interrupted = false;

/*
// LED SPI Documentation:
https://github.com/torvalds/linux/blob/master/include/uapi/linux/spi/spi.h
https://github.com/torvalds/linux/blob/master/include/uapi/linux/spi/spidev.h
https://cdn-shop.adafruit.com/datasheets/APA102.pdf
*/
static const uint8_t spi_mode = 0;
static const uint8_t spi_BPW = 8;
static const uint32_t spi_speed = 6000000;
static const uint16_t spi_delay = 0;
static int spidev_fd = -1;

static void setup_spi() {
    spidev_fd = open("/dev/spidev0.0", O_RDWR);
    if (spidev_fd < 0) {
        fprintf(stderr, "unable to open SPI device '%s'.\n", strerror(errno));
        exit(1);
    }

    if (ioctl(spidev_fd, SPI_IOC_WR_MODE, &spi_mode) < 0) {
        fprintf(stderr, "failed to change SPI mode '%s'.\n", strerror(errno));
        exit(1);
    }

    if (ioctl(spidev_fd, SPI_IOC_WR_BITS_PER_WORD, &spi_BPW) < 0) {
        fprintf(stderr, "failed to change SPI BPW '%s'.\n", strerror(errno));
        exit(1);
    }

    if (ioctl(spidev_fd, SPI_IOC_WR_MAX_SPEED_HZ, &spi_speed) < 0) {
        fprintf(stderr, "failed to change SPI speed '%s'.\n", strerror(errno));
        exit(1);
    }
}

static void spi_write_data(unsigned char *data, int len) {
    struct spi_ioc_transfer spi;
    memset(&spi, 0, sizeof(spi));

    spi.tx_buf = (unsigned long) data;
    spi.rx_buf = (unsigned long) data;
    spi.len = len;
    spi.delay_usecs = spi_delay;
    spi.speed_hz = spi_speed;
    spi.bits_per_word = spi_BPW;

    if (ioctl(spidev_fd, SPI_IOC_MESSAGE(1), &spi) < 0) {
        fprintf(stderr, "failed to write to SPI '%s'.\n", strerror(errno));
        exit(1);
    }
}

static void set_color(const uint8_t rgb[3]) {
    for (int32_t i = 0; i < 4; i++) {
        uint8_t zero = 0x00;
        spi_write_data(&zero, 1);
    }

    static const uint32_t BRIGHTNESS = 1;
    for (int32_t i = 0; i < 12; i++) {
        uint8_t led_frame[4];
        led_frame[0] = 0b11100000 | (0b00011111 & BRIGHTNESS);
        led_frame[1] = rgb[2];
        led_frame[2] = rgb[1];
        led_frame[3] = rgb[0];
        spi_write_data(led_frame, 4);
    }

    for (int32_t i = 0; i < 4; i++) {
        uint8_t zero = 0x00;
        spi_write_data(&zero, 1);
    }
}

void interrupt_handler(int _) {
    (void) _;
    is_interrupted = true;
    fprintf(stdout, "\n");
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

        char command[1024];
        if (strcmp(inference->intent, "turnLights") == 0) {
            if (strcmp(inference->values[0], "on") == 0) {
                set_color(WHITE_RGB);
            } else {
                set_color(OFF_RGB);
            }
        } else {
            const char *color = inference->values[0];
            if (strcmp(color, "blue") == 0) {
                set_color(BLUE_RGB);
            } else if (strcmp(color, "green") == 0) {
                set_color(GREEN_RGB);
            } else if (strcmp(color, "orange") == 0) {
                set_color(ORANGE_RGB);
            } else if (strcmp(color, "pink") == 0) {
                set_color(PINK_RGB);
            } else if (strcmp(color, "purple") == 0) {
                set_color(PURPLE_RGB);
            } else if (strcmp(color, "red") == 0) {
                set_color(RED_RGB);
            } else if (strcmp(color, "white") == 0) {
                set_color(WHITE_RGB);
            } else if (strcmp(color, "yellow") == 0) {
                set_color(YELLOW_RGB);
            }
        }
    }
    fprintf(stdout, "}\n\n");

    pv_inference_delete_func(inference);
}

static struct option long_options[] = {
        {"library_path",          required_argument, NULL, 'l'},
        {"access_key",            required_argument, NULL, 'a'},
        {"keyword_path",          required_argument, NULL, 'k'},
        {"context_path",          required_argument, NULL, 'c'},
        {"porcupine_sensitivity", required_argument, NULL, 's'},
        {"porcupine_model_path",  required_argument, NULL, 'p'},
        {"rhino_sensitivity",     required_argument, NULL, 't'},
        {"rhino_model_path",      required_argument, NULL, 'r'},
        {"require_endpoint",      required_argument, NULL, 'e'},
        {"input_audio_device",    required_argument, NULL, 'i'}
};

void print_usage(const char *program_name) {
    fprintf(stderr,
            "Usage : %s -l LIBRARY_PATH -a ACCESS_KEY -k KEYWORD_PATH -c CONTEXT_PATH -p PPN_MODEL_PATH -r RHN_MODEL_PATH -i INPUT_AUDIO_DEVICE "
            "[--porcupine_sensitivity PPN_SENSITIVITY --rhino_sensitivity RHN_SENSITIVITY --require_endpoint \"true\"|\"false\" ]\n",
            program_name,
            program_name);
}

int main(int argc, char *argv[]) {

    signal(SIGINT, interrupt_handler);

    const char *library_path = NULL;
    const char *access_key = NULL;
    const char *keyword_path = NULL;
    const char *context_path = NULL;
    float porcupine_sensitivity = 0.5f;
    const char *porcupine_model_path = NULL;
    float rhino_sensitivity = 0.5f;
    const char *rhino_model_path = NULL;
    bool require_endpoint = true;
    const char *input_audio_device = NULL;

    int c;
    while ((c = getopt_long(argc, argv, "el:a:k:c:s:p:t:r:i:", long_options, NULL)) != -1) {
        switch (c) {
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
            case 'e':
                if (strcmp(optarg, "false") == 0) {
                    require_endpoint = false;
                }
                break;
            case 'i':
                input_audio_device = optarg;
                break;
            default:
                print_usage(argv[0]);
                exit(1);
        }
    }

    if (!library_path || !keyword_path || !context_path || !access_key || !porcupine_model_path || !rhino_model_path || !input_audio_device) {
        print_usage(argv[0]);
        exit(1);
    }

    void *picovoice_library = dlopen(library_path, RTLD_NOW);
    if (!picovoice_library) {
        fprintf(stderr, "failed to open library.\n");
        exit(1);
    }

    char *error = NULL;

    const char *(*pv_status_to_string_func)(pv_status_t) = dlsym(picovoice_library, "pv_status_to_string");
    if ((error = dlerror()) != NULL) {
        fprintf(stderr, "failed to load 'pv_status_to_string' with '%s'.\n", error);
        exit(1);
    }

    int32_t (*pv_sample_rate_func)() = dlsym(picovoice_library, "pv_sample_rate");
    if ((error = dlerror()) != NULL) {
        fprintf(stderr, "failed to load 'pv_sample_rate' with '%s'.\n", error);
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
    pv_picovoice_init_func = dlsym(picovoice_library, "pv_picovoice_init");
    if ((error = dlerror()) != NULL) {
        fprintf(stderr, "failed to load 'pv_picovoice_init' with '%s'", error);
        exit(1);
    }

    void (*pv_picovoice_delete_func)(pv_picovoice_t *) = dlsym(picovoice_library, "pv_picovoice_delete");
    if ((error = dlerror()) != NULL) {
        fprintf(stderr, "failed to load 'pv_picovoice_delete' with '%s'", error);
        exit(1);
    }

    pv_status_t (*pv_picovoice_process_func)(pv_picovoice_t *, const int16_t *) =
            dlsym(picovoice_library, "pv_picovoice_process");
    if ((error = dlerror()) != NULL) {
        fprintf(stderr, "failed to load 'pv_picovoice_process' with '%s'", error);
        exit(1);
    }

    const char *(*pv_picovoice_version_func)() = dlsym(picovoice_library, "pv_picovoice_version");
    if ((error = dlerror()) != NULL) {
        fprintf(stderr, "failed to load 'pv_picovoice_version' with '%s'", error);
        exit(1);
    }

    int32_t (*pv_picovoice_frame_length_func)() = dlsym(picovoice_library, "pv_picovoice_frame_length");
    if ((error = dlerror()) != NULL) {
        fprintf(stderr, "failed to load 'pv_picovoice_frame_length' with '%s'", error);
        exit(1);
    }

    pv_inference_delete_func = dlsym(picovoice_library, "pv_inference_delete");
    if ((error = dlerror()) != NULL) {
        fprintf(stderr, "failed to load 'pv_inference_delete' with '%s'", error);
        exit(1);
    }

    pv_picovoice_t *handle = NULL;
    pv_status_t status = pv_picovoice_init_func(
            access_key,
            porcupine_model_path,
            keyword_path,
            porcupine_sensitivity,
            wake_word_callback,
            rhino_model_path,
            context_path,
            rhino_sensitivity,
            1.0f,
            require_endpoint,
            inference_callback,
            &handle);
    if (status != PV_STATUS_SUCCESS) {
        fprintf(stderr, "'pv_picovoice_init' failed with '%s'\n", pv_status_to_string_func(status));
        exit(1);
    }

    snd_pcm_t *alsa_handle = NULL;
    int error_code = snd_pcm_open(&alsa_handle, input_audio_device, SND_PCM_STREAM_CAPTURE, 0);
    if (error_code != 0) {
        fprintf(stderr, "'snd_pcm_open' failed with '%s'\n", snd_strerror(error_code));
        exit(1);
    }

    snd_pcm_hw_params_t *hardware_params = NULL;
    error_code = snd_pcm_hw_params_malloc(&hardware_params);
    if (error_code != 0) {
        fprintf(stderr, "'snd_pcm_hw_params_malloc' failed with '%s'\n", snd_strerror(error_code));
        exit(1);
    }

    error_code = snd_pcm_hw_params_any(alsa_handle, hardware_params);
    if (error_code != 0) {
        fprintf(stderr, "'snd_pcm_hw_params_any' failed with '%s'\n", snd_strerror(error_code));
        exit(1);
    }

    error_code = snd_pcm_hw_params_set_access(alsa_handle, hardware_params, SND_PCM_ACCESS_RW_INTERLEAVED);
    if (error_code != 0) {
        fprintf(stderr, "'snd_pcm_hw_params_set_access' failed with '%s'\n", snd_strerror(error_code));
        exit(1);
    }

    error_code = snd_pcm_hw_params_set_format(alsa_handle, hardware_params, SND_PCM_FORMAT_S16_LE);
    if (error_code != 0) {
        fprintf(stderr, "'snd_pcm_hw_params_set_format' failed with '%s'\n", snd_strerror(error_code));
        exit(1);
    }

    error_code = snd_pcm_hw_params_set_rate(alsa_handle, hardware_params, pv_sample_rate_func(), 0);
    if (error_code != 0) {
        fprintf(stderr, "'snd_pcm_hw_params_set_rate' failed with '%s'\n", snd_strerror(error_code));
        exit(1);
    }

    error_code = snd_pcm_hw_params_set_channels(alsa_handle, hardware_params, 1);
    if (error_code != 0) {
        fprintf(stderr, "'snd_pcm_hw_params_set_channels' failed with '%s'\n", snd_strerror(error_code));
        exit(1);
    }

    error_code = snd_pcm_hw_params(alsa_handle, hardware_params);
    if (error_code != 0) {
        fprintf(stderr, "'snd_pcm_hw_params' failed with '%s'\n", snd_strerror(error_code));
        exit(1);
    }

    snd_pcm_hw_params_free(hardware_params);

    error_code = snd_pcm_prepare(alsa_handle);
    if (error_code != 0) {
        fprintf(stderr, "'snd_pcm_prepare' failed with '%s'\n", snd_strerror(error_code));
        exit(1);
    }

    const int32_t frame_length = pv_picovoice_frame_length_func();

    int16_t *pcm = malloc(frame_length * sizeof(int16_t));
    if (!pcm) {
        fprintf(stderr, "failed to allocate memory for audio buffer\n");
        exit(1);
    }

    setup_spi();

    fprintf(stdout, "Picovoice %s\nListening ...\n\n", pv_picovoice_version_func());

    while (!is_interrupted) {
        const int count = snd_pcm_readi(alsa_handle, pcm, frame_length);
        if (count < 0) {
            fprintf(stderr, "'snd_pcm_readi' failed with '%s'\n", snd_strerror(count));
            exit(1);
        } else if (count != frame_length) {
            fprintf(stderr, "read %d frames instead of %d\n", count, frame_length);
            exit(1);
        }

        status = pv_picovoice_process_func(handle, pcm);
        if (status != PV_STATUS_SUCCESS) {
            fprintf(stderr, "'pv_picovoice_process' failed with '%s'\n", pv_status_to_string_func(status));
            exit(1);
        }
    }

    free(pcm);
    snd_pcm_close(alsa_handle);
    pv_picovoice_delete_func(handle);
    dlclose(picovoice_library);
    close(spidev_fd);

    return 0;
}
