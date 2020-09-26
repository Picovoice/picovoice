#
# Copyright 2020 Picovoice Inc.
#
# You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
# file accompanying this source.
#
# Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
# an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
# specific language governing permissions and limitations under the License.
#

import os

import pvporcupine
import pvrhino


class WakeWordConfig(object):
    def __init__(self, path, sensitivity=0.5):
        if not os.path.exists(path):
            raise ValueError()
        self._path = path

        if not 0 <= sensitivity <= 1:
            raise ValueError()
        self._sensitivity = sensitivity

    @property
    def path(self):
        return self._path

    @property
    def sensitivity(self):
        return self._sensitivity


class ContextConfig(object):
    def __init__(self, path, sensitivity=0.5):
        if not os.path.exists(path):
            raise ValueError()
        self._path = path

        if not 0 <= sensitivity <= 1:
            raise ValueError()
        self._sensitivity = sensitivity

    @property
    def path(self):
        return self._path

    @property
    def sensitivity(self):
        return self._sensitivity


class Inference(object):
    def __init__(
            self, is_wake_word_detected=False,
            is_inference_finalized=False,
            is_intent_understood=False,
            intent=None,
            slot_values=None):
        self._is_wake_word_detected = is_wake_word_detected
        self._is_inference_finalized = is_inference_finalized
        self._is_intent_understood = is_intent_understood
        self._intent = intent
        self._slot_values = slot_values

    @property
    def is_wake_word_detected(self):
        return self._is_wake_word_detected

    @property
    def is_inference_finalized(self):
        return self._is_inference_finalized

    @property
    def is_intent_understood(self):
        return self._is_intent_understood

    @property
    def intent(self):
        return self._intent

    @property
    def slot_values(self):
        return self._slot_values


class Picovoice(object):
    def __init__(
            self,
            keyword_config,
            context_config,
            porcupine_library_path=None,
            porcupine_model_path=None,
            rhino_library_path=None,
            rhino_model_path=None):
        self._porcupine = pvporcupine.create(
            library_path=porcupine_library_path,
            model_file_path=porcupine_model_path,
            keyword_file_paths=[keyword_config.path],
            sensitivities=[keyword_config.sensitivity])

        self._keyword_config = keyword_config
        self._is_wake_word_detected = False

        self._rhino = pvrhino.create(
            library_path=rhino_library_path,
            model_path=rhino_model_path,
            context_path=context_config.path,
            sensitivity=context_config.sensitivity)
        self._context_config = context_config

    def process(self, pcm):
        if not self._is_wake_word_detected:
            self._is_wake_word_detected = self._porcupine.process(pcm)
            return Inference(is_wake_word_detected=self._is_wake_word_detected)
        else:
            is_finalized = self._rhino.process(pcm)
            is_understood = False
            intent = None
            slot_values = None
            if is_finalized:
                is_understood = self._rhino.is_understood()
                if is_understood:
                    intent, slot_values = self._rhino.get_intent()
                    self._rhino.reset()

            return Inference(
                is_inference_finalized=is_finalized,
                is_intent_understood=is_understood,
                intent=intent,
                slot_values=slot_values)
