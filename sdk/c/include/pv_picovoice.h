/*
    Copyright 2020-2022 Picovoice Inc.

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
 * @param porcupine_model_path Absolute path to the file containing Porcupine model parameters.
 * @param keyword_path Absolute path to Porcupine's keyword model file.
 * @param porcupine_sensitivity Wake word detection sensitivity. It should be a number within [0, 1]. A higher
 * sensitivity results in fewer misses at the cost of increasing the false alarm rate.
 * @param wake_word_callback User-defined callback invoked upon detection of the wake phrase. The callback accepts no
 * input arguments.
 * @param rhino_model_path Absolute path to the file containing Rhino model parameters.
 * @param context_path Absolute path to file containing context parameters. A context represents the set of expressions
 * (spoken commands), intents, and intent arguments (slots) within a domain of interest.
 * @param rhino_sensitivity Inference sensitivity. It should be a number within [0, 1]. A higher sensitivity value
 * results in fewer misses at the cost of (potentially) increasing the erroneous inference rate.
 * @param endpoint_duration_sec Endpoint duration in seconds. An endpoint is a chunk of silence at the end of an
 * utterance that marks the end of spoken command. It should be a positive number within [0.5, 5]. A lower endpoint
 * duration reduces delay and improves responsiveness. A higher endpoint duration assures Rhino doesn't return inference
 * pre-emptively in case the user pauses before finishing the request.
 * @param require_endpoint If set to `true`, Rhino requires an endpoint (a chunk of silence) after the spoken command.
 * If set to `false`, Rhino tries to detect silence, but if it cannot, it still will provide inference regardless. Set
 * to `false` only if operating in an environment with overlapping speech (e.g. people talking in the background).
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
        const char *porcupine_model_path,
        const char *keyword_path,
        float porcupine_sensitivity,
        void (*wake_word_callback)(void),
        const char *rhino_model_path,
        const char *context_path,
        float rhino_sensitivity,
        float endpoint_duration_sec,
        bool require_endpoint,
        void (*inference_callback)(pv_inference_t *),
        pv_picovoice_t **object);

/**
 * Destructor.
 *
 * @param object Picovoice object.
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
