/*
    Copyright 2020 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

#include <stdbool.h>
#include <string.h>

#include "MIMXRT1052.h"

#include "board.h"
#include "clock_config.h"
#include "fsl_debug_console.h"
#include "fsl_ocotp.h"
#include "peripherals.h"
#include "pin_mux.h"

#include "pv_nxp_rt1050.h"

#define PV_OCOTP_FREQ_HZ (CLOCK_GetFreq(kCLOCK_IpgClk))
#define UUID_SIZE (8)

static uint8_t uuid[UUID_SIZE];

const uint8_t *pv_get_uuid(void) {
    return (const uint8_t *) uuid;
}

const uint32_t pv_get_uuid_size(void) {
    return UUID_SIZE;
}

pv_status_t pv_board_init() {
    BOARD_InitBootPins();
    BOARD_InitBootClocks();
    BOARD_InitBootPeripherals();
#ifndef BOARD_INIT_DEBUG_CONSOLE_PERIPHERAL
    BOARD_InitDebugConsole();
#endif
    uint32_t uuid_int32[2] = {0};
    OCOTP_Init(OCOTP, PV_OCOTP_FREQ_HZ);
    OCOTP_ClearErrorStatus(OCOTP);
    OCOTP_ReloadShadowRegister(OCOTP);
    uuid_int32[0] = OCOTP_ReadFuseShadowRegister(OCOTP, 0x01);
    uuid_int32[1] = OCOTP_ReadFuseShadowRegister(OCOTP, 0x02);
    memcpy(uuid, uuid_int32, UUID_SIZE);
    return PV_STATUS_SUCCESS;
}

void pv_board_deinit() {
}

void pv_error_handler(void) {
    while(true);
}
