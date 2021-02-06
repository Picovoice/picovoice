/*
    Copyright 2020 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

#include <stdlib.h>

#include "fsl_gpt.h"

#include "core/pv_assert.h"

#include "pv_profile.h"

#define pv_min(a,b) ((a) > (b) ? (b) : (a))
#define TIC_TOC_HISTORY (31)

#define PV_GPT_IRQ_ID           GPT2_IRQn
#define PV_GPT                  GPT2
#define PV_GPT_IRQHandler       GPT2_IRQHandler
#define PV_GPT_CLK_FREQ         CLOCK_GetFreq(kCLOCK_PerClk)

AT_NONCACHEABLE_SECTION(static volatile uint32_t pv_tick);
static bool is_timer_on = false;

void PV_GPT_IRQHandler(void)
{
    GPT_ClearStatusFlags(PV_GPT, kGPT_OutputCompare1Flag);
    pv_tick++;
    __DSB();
}

static pv_status_t pv_gpt_init() {
    uint32_t gptFreq;
    gpt_config_t gptConfig;
    GPT_GetDefaultConfig(&gptConfig);
    GPT_Init(PV_GPT, &gptConfig);
    gptFreq = PV_GPT_CLK_FREQ;
    gptFreq /= 500;
    GPT_SetOutputCompareValue(PV_GPT, kGPT_OutputCompare_Channel1, gptFreq);
    GPT_EnableInterrupts(PV_GPT, kGPT_OutputCompare1InterruptEnable);
    if (EnableIRQ(PV_GPT_IRQ_ID) != kStatus_Success) {
        return PV_STATUS_INVALID_STATE;
    }
    NVIC_SetPriority(PV_GPT_IRQ_ID, 0U);
    GPT_StartTimer(PV_GPT);
    is_timer_on = true;
    pv_tick = 0;
    return PV_STATUS_SUCCESS;
}

static uint32_t pv_get_tick(void) {
  return pv_tick;
}

struct pv_profile {
    uint32_t tic[TIC_TOC_HISTORY];
    uint32_t toc[TIC_TOC_HISTORY];
    uint32_t history_index;
    uint32_t last_history_index;
};

pv_status_t pv_profile_init(pv_profile_t **object) {
    PV_ASSERT(object);
    *object = NULL;
    if (!is_timer_on) {
        if (pv_gpt_init() != PV_STATUS_SUCCESS) {
            return PV_STATUS_INVALID_STATE;
        }
    }
    pv_profile_t *o = calloc(1, sizeof(pv_profile_t));
    if (!o) {
        return PV_STATUS_OUT_OF_MEMORY;
    }
    *object = o;
    return PV_STATUS_SUCCESS;
}

void pv_profile_set_tic(pv_profile_t *object) {
    PV_ASSERT(object);
    object->tic[object->history_index] = pv_get_tick();
}

void pv_profile_set_toc(pv_profile_t *object) {
    PV_ASSERT(object);
    object->toc[object->history_index] = pv_get_tick();
    object->last_history_index = object->history_index;
    object->history_index = (object->history_index + 1) % TIC_TOC_HISTORY;
}

float pv_profile_get_elapsed_percentage(pv_profile_t *object) {
    PV_ASSERT(object);
    float sum = 0;
    for (uint32_t i = 0; i < TIC_TOC_HISTORY; i++) {
        sum += object->toc[i] - object->tic[i];
    }
    return (sum) / (object->tic[object->last_history_index] - object->tic[(object->last_history_index + 1) % TIC_TOC_HISTORY]);
}

uint32_t pv_profile_get_elapsed_msec(pv_profile_t *object) {
    PV_ASSERT(object);
    return (object->toc[object->last_history_index] - object->tic[object->last_history_index]);
}

void pv_profile_reset(pv_profile_t *object) {
    PV_ASSERT(object);
    object->history_index = 0;
    object->last_history_index = 0;
    for (uint32_t i = 0; i < TIC_TOC_HISTORY; i++) {
        object->tic[i] = 0;
        object->toc[i] = 0;
    }
}

void pv_profile_delete(pv_profile_t *object) {
    if (object) {
        free(object);
    }
}
