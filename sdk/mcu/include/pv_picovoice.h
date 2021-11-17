/*
    Copyright 2020-2021 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

#ifndef PV_PICOVOICE_H
#define PV_PICOVOICE_H

#include <stdbool.h>
#include <stdint.h>

#include "picovoice.h"

#ifdef __cplusplus

extern "C" {

#endif

/**
 * Forward declaration for Picovoice end-to-end platform. Picovoice enables building voice experiences similar to Alexa
 * but runs entirely on-device (offline).
 *
 * Picovoice detects utterances of a customizable wake word (phrase) within an incoming stream of audio in real-time.
 * After detection of wake word, it begins to infer the user's intent from the follow-on spoken command. Upon detection
 * of wake word and completion of voice command, it invokes user-provided callbacks to signal these events.
 *
 * Picovoice processes incoming audio in consecutive frames. The number of samples per frame is
 * `pv_picovoice_frame_length()`. The incoming audio needs to have a sample rate equal to `pv_sample_rate()` and be
 * 16-bit linearly-encoded. Picovoice operates on single-channel audio. It uses Porcupine wake word engine for wake word
 * detection and Rhino Speech-to-Intent engine for intent inference.
 */
typedef struct pv_picovoice pv_picovoice_t;

/**
 * Container representing inferred user intent.
 */
typedef struct {
    bool is_understood;
    const char *intent;
    int32_t num_slots;
    const char **slots;
    const char **values;
} pv_inference_t;

/**
 * Destructor.
 *
 * @param inference Inference container.
 */
PV_API void pv_inference_delete(pv_inference_t *inference);

/**
 * Constructor.
 *
 * @param access_key AccessKey obtained from Picovoice Console (https://console.picovoice.ai/).
 * @param memory_size Memory needs to be 8-byte aligned.
 * @param memory_buffer Memory size in bytes.
 * @param keyword_model_size Size of keyword model in bytes.
 * @param keyword_model Keyword model.
 * @param porcupine_sensitivity Wake word detection sensitivity. It should be a number within [0, 1]. A higher
 * sensitivity results in fewer misses at the cost of increasing the false alarm rate.
 * @param wake_word_callback User-defined callback invoked upon detection of the wake phrase. The callback accepts no
 * input arguments.
 * @param context_model_size Size of the context in bytes.
 * @param context_model Context parameters. A context represents the set of expressions (spoken commands), intents, and
 * intent arguments (slots) within a domain of interest.
 * @param rhino_sensitivity Inference sensitivity. It should be a number within [0, 1]. A higher sensitivity value
 * results in fewer misses at the cost of (potentially) increasing the erroneous inference rate.
 * @param require_endpoint If set to `true`, Rhino requires an endpoint (chunk of silence) before finishing inference.
 * @param inference_callback User-defined callback invoked upon completion of intent inference. The callback accepts a
 * single input argument of type `pv_inference_t` that exposes the following immutable fields:
 *         (1) `is_understood` is a flag indicating if the spoken command is understood.
 *         (2) `intent` is the inferred intent from the voice command. If the command is not understood then it's set to
 *         `NULL`.
 *         (3) `num_slots` is the number of slots.
 *         (4) `slots` is a list of slot keys.
 *         (5) `values` is the corresponding slot values.
 * @param object Constructed instance of Picovoice.
 * @return Status code. Returns 'PV_STATUS_INVALID_ARGUMENT', 'PV_STATUS_IO_ERROR', or 'PV_STATUS_OUT_OF_MEMORY' on
 * failure.
 */
PV_API pv_status_t pv_picovoice_init(
        const char *access_key,
        int32_t memory_size,
        void *memory_buffer,
        int32_t keyword_model_size,
        const void *keyword_model,
        float porcupine_sensitivity,
        void (*wake_word_callback)(void),
        int32_t context_model_size,
        const void *context_model,
        float rhino_sensitivity,
        bool require_endpoint,
        void (*inference_callback)(pv_inference_t *),
        pv_picovoice_t **object);

/**
 * Destructor.
 *
 * @param object Porcupine object.
 */
PV_API void pv_picovoice_delete(pv_picovoice_t *object);

/**
 * Processes a frame of the incoming audio stream. Upon detection of wake word and completion of follow-on command
 * inference invokes user-defined callbacks.
 *
 * @param object Picovoice object.
 * @param pcm A frame of audio samples. The number of samples per frame can be attained by calling
 * `pv_picovoice_frame_length()`. The incoming audio needs to have a sample rate equal to `pv_sample_rate()` and be
 * 16-bit linearly-encoded. Picovoice operates on single-channel audio.
 * @return Status code. Returns 'PV_STATUS_INVALID_ARGUMENT', 'PV_STATUS_INVALID_STATE', or 'PV_STATUS_OUT_OF_MEMORY'
 * on failure.
 */
PV_API pv_status_t pv_picovoice_process(pv_picovoice_t *object, const int16_t *pcm);

/**
 * Computes the minimum required memory buffer size, in bytes, for the given keyword and context model.
 * A relatively large value for 'preliminary_memory_buffer' is suggested (e.g., 70 kilobytes).
 * Then, 'pv_picovoice_init' can be called optimally passing a memory buffer with the size of 'min_memory_buffer_size'.
 *
 * @param preliminary_memory_size Memory size in bytes.
 * @param preliminary_memory_buffer Memory needs to be 8-byte aligned.
 * @param keyword_model_size Size of keyword model in bytes.
 * @param keyword_model Keyword model.
 * @param context_model_size Size of the context in bytes.
 * @param context_model Context parameters.
 * @param[out] min_memory_buffer_size minimum required memory buffer size in bytes.
 * @return Status code. Returns 'PV_STATUS_INVALID_ARGUMENT', 'PV_STATUS_INVALID_STATE', or 'PV_STATUS_OUT_OF_MEMORY'
 * on failure.
 * */

PV_API pv_status_t pv_picovoice_get_min_memory_buffer_size(
        int32_t preliminary_memory_size,
        void *preliminary_memory_buffer,
        int32_t keyword_model_size,
        const void *keyword_model,
        int32_t context_model_size,
        const void *context_model,
        int32_t *min_memory_buffer_size);

/**
 * Getter for version.
 *
 * @return Version.
 */
PV_API const char *pv_picovoice_version(void);

/**
 * Getter for number of audio samples per frame.
 *
 * @return Frame length.
 */
PV_API int32_t pv_picovoice_frame_length(void);

/**
 * Getter for context information.
 *
 * @param object Picovoice object.
 * @param[out] context Context information.
 * @return Status code. Returns 'PV_STATUS_INVALID_ARGUMENT' on failure.
 */
PV_API pv_status_t pv_picovoice_context_info(const pv_picovoice_t *object, const char **context);

#ifdef __cplusplus
}

#endif

#endif // PV_PICOVOICE_H
