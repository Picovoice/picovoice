/*
    Copyright 2020-2021 Picovoice Inc.

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

#include "stm32h7xx_hal.h"

#include "core/pv_assert.h"

#include "pv_embedded/pv_message.h"

#define PV_COM                          (USART1)
#define PV_COM_ALT                      (GPIO_AF7_USART1)
#define PV_COM_IRQn                     (USART1_IRQn)
#define PV_COM_TX_Pin                   (GPIO_PIN_10)
#define PV_COM_TX_GPIO_Port             (GPIOA)
#define PV_COM_RX_Pin                   (GPIO_PIN_9)
#define PV_COM_RX_GPIO_Port             (GPIOA)

#define PV_MSG_SIZE (5 + 10)

static uint8_t rx_raw_data[PV_MSG_SIZE + 2];
UART_HandleTypeDef huart;

struct {
    volatile bool is_new_message;
    pv_message_code_t code;
    const char *context;
} pv_message;

static pv_status_t pv_uart_init(void) {

    GPIO_InitTypeDef GPIO_InitStruct = {0};
    __HAL_RCC_USART1_CLK_ENABLE();
    __HAL_RCC_GPIOA_CLK_ENABLE();
    GPIO_InitStruct.Pin = PV_COM_TX_Pin | PV_COM_RX_Pin;
    GPIO_InitStruct.Mode = GPIO_MODE_AF_PP;
    GPIO_InitStruct.Pull = GPIO_NOPULL;
    GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
    GPIO_InitStruct.Alternate = PV_COM_ALT;
    HAL_GPIO_Init(PV_COM_TX_GPIO_Port, &GPIO_InitStruct);

    huart.Instance = PV_COM;
    huart.Init.BaudRate = 115200;
    huart.Init.WordLength = UART_WORDLENGTH_8B;
    huart.Init.StopBits = UART_STOPBITS_1;
    huart.Init.Parity = UART_PARITY_NONE;
    huart.Init.Mode = UART_MODE_TX_RX;
    huart.Init.HwFlowCtl = UART_HWCONTROL_NONE;
    huart.Init.OverSampling = UART_OVERSAMPLING_16;

    if (HAL_UART_Init(&huart) != HAL_OK) {
        return PV_STATUS_INVALID_STATE;
    }
    if (HAL_UARTEx_SetTxFifoThreshold(&huart, UART_TXFIFO_THRESHOLD_1_8) != HAL_OK) {
        return PV_STATUS_INVALID_STATE;
    }
    if (HAL_UARTEx_SetRxFifoThreshold(&huart, UART_RXFIFO_THRESHOLD_1_8) != HAL_OK) {
        return PV_STATUS_INVALID_STATE;
    }
    if (HAL_UARTEx_DisableFifoMode(&huart) != HAL_OK) {
        return PV_STATUS_INVALID_STATE;
    }
    HAL_NVIC_SetPriority(PV_COM_IRQn, 0, 0);
    HAL_NVIC_EnableIRQ(PV_COM_IRQn);
    return PV_STATUS_SUCCESS;
}

pv_status_t pv_message_init(void) {
    if (pv_uart_init() != PV_STATUS_SUCCESS) {
        return PV_STATUS_INVALID_STATE;
    }
    pv_message.code = PV_MESSAGE_CODE_ERROR;
    pv_message.is_new_message = false;
    pv_message.context = NULL;
    HAL_UART_Receive_IT(&huart, rx_raw_data, PV_MSG_SIZE);
    return PV_STATUS_SUCCESS;
}

void pv_message_get_message(pv_message_code_t *code, const char **context) {
    PV_ASSERT(code);
    PV_ASSERT(context);
    *code = pv_message.code;
    *context = pv_message.context;
    pv_message.is_new_message = false;
}

bool pv_message_is_there_a_new_message(void) {
    return pv_message.is_new_message;
}

static pv_status_t pv_message_process(const char *raw) {
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

void pv_message_send_audio(int16_t *audio, uint32_t size) {
    PV_ASSERT(audio);
    PV_ASSERT(size > 0);
    printf("[%02d]", PV_MESSAGE_CODE_AUDIO_DUMP);
    for (uint32_t i = 0; i < size; i++) {
        printf(" %.4x", ((uint16_t) audio[i]));
    }
    printf("\r\n");
}

void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart) {
    if (huart->Instance == PV_COM)
    {
        pv_message_process((char *)rx_raw_data);
    }
}

void pv_refresh_check_message(void) {
    HAL_UART_Receive_IT(&huart, rx_raw_data, PV_MSG_SIZE);
}

const char *pv_message_code_to_string(pv_message_code_t code) {
    static const char *const STRINGS[] = {
            "PV_MESSAGE_CODE_HANDSHAKE",
            "PV_MESSAGE_CODE_INFO",
            "PV_MESSAGE_CODE_CONTEXT",
            "PV_MESSAGE_CODE_WAKE_DETECTED",
            "PV_MESSAGE_CODE_NOT_UNDERSTOOD",
            "PV_MESSAGE_CODE_INFERENCE",
            "PV_MESSAGE_CODE_PORCUPINE_SENSITIVITY",
            "PV_MESSAGE_CODE_RHINO_SENSITIVITY",
            "PV_MESSAGE_CODE_UUID",
            "PV_MESSAGE_CODE_CPU_USAGE",
            "PV_MESSAGE_CODE_VOLUME",
            "PV_MESSAGE_CODE_AUDIO_DUMP",
            "PV_MESSAGE_CODE_ERROR",
    };
    return STRINGS[code];
}

int __io_putchar (int ch) {
    HAL_UART_Transmit(&huart, (uint8_t *) &ch, 1, 1000);
    return ch;
}
