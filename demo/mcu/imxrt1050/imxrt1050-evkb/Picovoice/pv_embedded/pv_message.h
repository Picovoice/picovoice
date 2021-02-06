/*
    Copyright 2020 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

#ifndef PV_MESSAGE_H
#define PV_MESSAGE_H

#include "picovoice/pv_picovoice.h"

typedef enum {
    PV_MESSAGE_CODE_HANDSHAKE = 0,
    PV_MESSAGE_CODE_INFO,
    PV_MESSAGE_CODE_CONTEXT,
    PV_MESSAGE_CODE_WAKE_DETECTED,
    PV_MESSAGE_CODE_INFERENCE,
    PV_MESSAGE_CODE_PORCUPINE_SENSITIVITY,
    PV_MESSAGE_CODE_RHINO_SENSITIVITY,
    PV_MESSAGE_CODE_UUID,
    PV_MESSAGE_CODE_CPU_USAGE,
    PV_MESSAGE_CODE_VOLUME,
    PV_MESSAGE_CODE_ERROR,
} pv_message_code_t;


pv_status_t pv_message_init(void);
void pv_message_deinit(void);
void pv_message_get_message(pv_message_code_t *code, const char **context);
bool pv_message_is_there_a_new_message(void);
pv_status_t pv_message_process(const char *raw);

void pv_message_send(pv_message_code_t code, const char *message, ...);
void pv_message_send_inference(pv_inference_t *inference);
void pv_message_send_wake(void);
void pv_message_send_uuid(const uint8_t *uuid, uint32_t size);
const char *pv_message_code_to_string(pv_message_code_t code);
void pv_refresh_check_message(void);

#endif // PV_MESSAGE_H
