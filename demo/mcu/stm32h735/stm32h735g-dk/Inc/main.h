
#ifndef __MAIN_H
#define __MAIN_H

#ifdef __cplusplus
extern "C" {
#endif

#include "stm32h7xx_hal.h"
#include "micCapture_saiPdm.h"

extern SAI_HandleTypeDef hsai_BlockA4;
extern DMA_HandleTypeDef hdma_sai4_a;

extern UART_HandleTypeDef huart;

void pv_pcm_process(int16_t *record_pcm_buffer);
void Error_Handler(void);

#ifdef __cplusplus
}
#endif

#endif /* __MAIN_H */
