/*
    Copyright 2020 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/pv_assert.h"

#include "pv_embedded/pv_edison_two.h"
#include "pv_embedded/pv_message.h"
#include "pv_embedded/pv_nxp_rt1050.h"
#include "pv_embedded/pv_params.h"
#include "pv_embedded/pv_profile.h"

#define PICOVOICE_MEMORY_BUFFER_SIZE (70 * 1024)

static int8_t picovoice_memory_buffer[PICOVOICE_MEMORY_BUFFER_SIZE] __attribute__((aligned(16)));
static const float PORCUPINE_SENSITIVITY = 0.75f;
static const float RHINO_SENSITIVITY = 0.5f;

static pv_profile_t *profile = NULL;
static pv_picovoice_t *picovoice_obj = NULL;

static void wake_word_callback(void);
static void inference_callback(pv_inference_t *inference);
static void check_status(pv_status_t status);

int main(void) {
    pv_status_t status = pv_board_init();
    check_status(status);
    status = pv_message_init();
    check_status(status);
    pv_message_send(PV_MESSAGE_CODE_HANDSHAKE, "Profile");
    pv_message_send_uuid(pv_get_uuid(), pv_get_uuid_size());
    status = pv_profile_init(&profile);
    check_status(status);

    status = pv_picovoice_init(
            PICOVOICE_MEMORY_BUFFER_SIZE,
            picovoice_memory_buffer,
            pv_param_keyword_length(),
            pv_param_keyword(),
            PORCUPINE_SENSITIVITY,
            wake_word_callback,
            pv_param_context_length(),
            pv_param_context(),
            RHINO_SENSITIVITY,
            inference_callback,
            &picovoice_obj);
    if (status != PV_STATUS_SUCCESS) {
        pv_message_send(PV_MESSAGE_CODE_ERROR, "Picovoice init failed with '%s'", pv_status_to_string(status));
        check_status(status);
    }

    static const int32_t REPETITION = 5;
    const int32_t test_msec = (REPETITION * pv_ediston_two_length()) / (pv_sample_rate() / 1000);
    const int32_t frame_length = pv_picovoice_frame_length();
    int16_t *dummy_buffer = calloc(frame_length, sizeof(int16_t));
    if (!dummy_buffer) {
        pv_message_send(PV_MESSAGE_CODE_ERROR, "Memory allocation for dummy buffer failed with '%s'", PV_STATUS_OUT_OF_MEMORY);
        check_status(status);
    }

    pv_profile_set_tic(profile);
    for (int32_t i = 0; i < REPETITION; i++) {
        for (int32_t j = 0; j < pv_ediston_two_length(); j += frame_length) {
            status = pv_picovoice_process(picovoice_obj, pv_ediston_two() + j);
            check_status(status);
        }
    }
    pv_profile_set_toc(profile);
    pv_message_send(PV_MESSAGE_CODE_INFO, "Non-idle-case: processed %lu milliseconds of audio in %lu milliseconds (%ld Percent)",
            test_msec,
            pv_profile_get_elapsed_msec(profile),
            (100 * pv_profile_get_elapsed_msec(profile)) / test_msec);

    pv_profile_set_tic(profile);
    for (int32_t i = 0; i < REPETITION; i++) {
        for (int32_t j = 0; j < pv_ediston_two_length(); j += frame_length) {
            status = pv_picovoice_process(picovoice_obj, dummy_buffer);
            check_status(status);
        }
    }
    pv_profile_set_toc(profile);
    pv_message_send(PV_MESSAGE_CODE_INFO, "Idle-case: processed %lu milliseconds of audio in %lu milliseconds (%ld Percent)",
            test_msec,
            pv_profile_get_elapsed_msec(profile),
            (100 * pv_profile_get_elapsed_msec(profile)) / test_msec);

    pv_picovoice_delete(picovoice_obj);
    pv_profile_delete(profile);
    free(dummy_buffer);
    return 0;
}

static void wake_word_callback(void) {
    pv_message_send_wake();
}

static void inference_callback(pv_inference_t *inference) {
    if (inference) {
        pv_inference_delete(inference);
    }
}

static void check_status(pv_status_t status) {
    if (status != PV_STATUS_SUCCESS) {
        pv_error_handler();
    }
}
