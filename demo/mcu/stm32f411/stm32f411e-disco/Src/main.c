/*
    Copyright 2021-2022 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

#include "stm32f411e_discovery.h"

#include "pv_picovoice.h"

#include "pv_audio_rec.h"
#include "pv_params.h"
#include "pv_st_f411.h"

#define MEMORY_BUFFER_SIZE (70 * 1024)

static const char *ACCESS_KEY = "${ACCESS_KEY}"; //AccessKey string obtained from Picovoice Console (https://picovoice.ai/console/)

static int8_t memory_buffer[MEMORY_BUFFER_SIZE] __attribute__((aligned(16)));

static const float PORCUPINE_SENSITIVITY = 0.75f;
static const float RHINO_SENSITIVITY = 0.5f;
static const float RHINO_ENDPOINT_DURATION_SEC = 1.0f;
static const bool RHINO_REQUIRE_ENDPOINT = true;

static void wake_word_callback(void) {
    printf("[wake word]\n");
    BSP_LED_On(LED4);
}

static void inference_callback(pv_inference_t *inference) {
    BSP_LED_Off(LED4);
    printf("{\n");
    printf("    is_understood : '%s',\n", (inference->is_understood ? "true" : "false"));
    if (inference->is_understood) {
        printf("    intent : '%s',\n", inference->intent);
        if (inference->num_slots > 0) {
            printf("    slots : {\n");
            for (int32_t i = 0; i < inference->num_slots; i++) {
                printf("        '%s' : '%s',\n", inference->slots[i], inference->values[i]);
            }
            printf("    }\n");
        }
    }
    printf("}\n\n");
    for (int32_t i = 0; i < 10; i++) {
        BSP_LED_Toggle(LED3);
        BSP_LED_Toggle(LED4);
        BSP_LED_Toggle(LED5);
        BSP_LED_Toggle(LED6);
        HAL_Delay(30);
    }
    pv_inference_delete(inference);
}

static void error_handler(void) {
    printf("\r\n");
    while (true);
}

void print_error_message(char **message_stack, int32_t message_stack_depth) {
    for (int32_t i = 0; i < message_stack_depth; i++) {
        printf("[%ld] %s\n", i, message_stack[i]);
    }
}

int main(void) {

    pv_status_t status = pv_board_init();
    if (status != PV_STATUS_SUCCESS) {
        error_handler();
    }

    const uint8_t *board_uuid = pv_get_uuid();
    printf("UUID: ");
    for (uint32_t i = 0; i < pv_get_uuid_size(); i++) {
        printf(" %.2x", board_uuid[i]);
    }
    printf("\r\n");

    status = pv_audio_rec_init();
    if (status != PV_STATUS_SUCCESS) {
        printf("Audio init failed with '%s'", pv_status_to_string(status));
        error_handler();
    }

    status = pv_audio_rec_start();
    if (status != PV_STATUS_SUCCESS) {
        printf("Recording audio failed with '%s'", pv_status_to_string(status));
        error_handler();
    }

    pv_picovoice_t *handle = NULL;

    char **message_stack = NULL;
    int32_t message_stack_depth = 0;
    pv_status_t error_status;

    status = pv_picovoice_init(
            ACCESS_KEY,
            MEMORY_BUFFER_SIZE,
            memory_buffer,
            sizeof(KEYWORD_ARRAY),
            KEYWORD_ARRAY,
            PORCUPINE_SENSITIVITY,
            wake_word_callback,
            sizeof(CONTEXT_ARRAY),
            CONTEXT_ARRAY,
            RHINO_SENSITIVITY,
            RHINO_ENDPOINT_DURATION_SEC,
            RHINO_REQUIRE_ENDPOINT,
            inference_callback,
            &handle);
    if (status != PV_STATUS_SUCCESS) {
        printf("Picovoice init failed with '%s'", pv_status_to_string(status));

        error_status = pv_get_error_stack(&message_stack, &message_stack_depth);
        if (error_status != PV_STATUS_SUCCESS) {
            printf("Unable to get Picovoice error state with '%s':\n", pv_status_to_string(error_status));
            error_handler();
        }

        print_error_message(message_stack, message_stack_depth);
        pv_free_error_stack(message_stack);

        error_handler();
    }

    const char *rhino_context = NULL;
    status = pv_picovoice_context_info(handle, &rhino_context);
    if (status != PV_STATUS_SUCCESS) {
        printf("retrieving context info failed with '%s'", pv_status_to_string(status));
        error_handler();
    }
    printf("Rhino context info: %s\r\n", rhino_context);


    while (true) {
        const int16_t *buffer = pv_audio_rec_get_new_buffer();
        if (buffer) {
            const pv_status_t status = pv_picovoice_process(handle, buffer);
            if (status != PV_STATUS_SUCCESS) {
                printf("Picovoice process failed with '%s'", pv_status_to_string(status));
                error_handler();
            }
        }
    }
    pv_board_deinit();
    pv_audio_rec_deinit();
    pv_picovoice_delete(handle);
}
