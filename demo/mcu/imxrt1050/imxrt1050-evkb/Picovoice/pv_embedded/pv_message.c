/*
    Copyright 2020 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

#include <stdarg.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/pv_assert.h"

#include "pv_embedded/pv_message.h"

struct {
    volatile bool is_new_message;
    pv_message_code_t code;
    const char *context;
} pv_message;

static pv_status_t pv_uart_init(void) {
    return PV_STATUS_SUCCESS;
}

pv_status_t pv_message_init(void) {
    if (pv_uart_init() != PV_STATUS_SUCCESS) {
        return PV_STATUS_INVALID_STATE;
    }
    pv_message.code = PV_MESSAGE_CODE_ERROR;
    pv_message.is_new_message = false;
    pv_message.context = NULL;
    return PV_STATUS_SUCCESS;
}

void pv_message_get_message(pv_message_code_t *code, const char **context) {
    *code = pv_message.code;
    *context = pv_message.context;
    pv_message.is_new_message = false;
}

bool pv_message_is_there_a_new_message(void) {
    return pv_message.is_new_message;
}

pv_status_t pv_message_process(const char *raw) {
    PV_ASSERT(raw);
    if (raw[0]=='[' && raw[3]==']' && raw[4]==' ') {
        char digits[3] = {raw[1], raw[2], '\0'};
        pv_message.code = atoi(digits);
        if (pv_message.code < PV_MESSAGE_CODE_HANDSHAKE || pv_message.code > PV_MESSAGE_CODE_ERROR) {
            return PV_STATUS_INVALID_ARGUMENT;
        }
        pv_message.context = (raw + 5);
        pv_message.is_new_message = true;
        return PV_STATUS_SUCCESS;
    } else {
        return PV_STATUS_INVALID_ARGUMENT;
    }
}

void pv_message_send(pv_message_code_t code, const char *message, ...) {
    PV_ASSERT(message);
    printf("[%02d] ", code);
    va_list args;
    va_start(args, message);
    vfprintf(stdout, message, args);
    va_end(args);
    printf("\r\n");
}

void pv_message_send_inference(pv_inference_t *inference) {
    PV_ASSERT(inference);
    if (inference->is_understood) {
        printf("[%02d] %s;intent:%s", PV_MESSAGE_CODE_INFERENCE, "is_understood:true", inference->intent);
        for (int32_t i = 0; i < inference->num_slots; i++) {
            printf(";%s:", inference->slots[i]);
            printf("%s", inference->values[i]);
        }
        printf("\r\n");
    } else {
        pv_message_send(PV_MESSAGE_CODE_INFERENCE, "is_understood:false");
    }
}

void pv_message_send_wake(void) {
    pv_message_send(PV_MESSAGE_CODE_WAKE_DETECTED, "Wake word detected!");
}

void pv_message_send_uuid(const uint8_t *uuid, uint32_t size) {
    printf("[%02d]", PV_MESSAGE_CODE_UUID);
    for (uint32_t i = 0; i < size; i++) {
        printf(" %.2x", uuid[i]);
    }
    printf("\r\n");
}

void pv_refresh_check_message(void) {
}

const char *pv_message_code_to_string(pv_message_code_t code) {
    static const char *const STRINGS[] = {
            "PV_MESSAGE_CODE_HANDSHAKE",
            "PV_MESSAGE_CODE_INFO",
            "PV_MESSAGE_CODE_CONTEXT",
            "PV_MESSAGE_CODE_WAKE_DETECTED",
            "PV_MESSAGE_CODE_NOT_UNDERSTOOD",
            "PV_MESSAGE_CODE_INFERENCE",
            "PV_MESSAGE_CODE_UID",
            "PV_MESSAGE_CODE_PPN_SEN",
            "PV_MESSAGE_CODE_RHN_SEN",
            "PV_MESSAGE_CODE_ERROR",
    };
    return STRINGS[code];
}
