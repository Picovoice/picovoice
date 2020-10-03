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


class Picovoice(object):
    def __init__(
            self,
            keyword_path,
            wake_word_callback,
            context_path,
            inference_callback,
            porcupine_library_path=None,
            porcupine_model_path=None,
            porcupine_sensitivity=0.5,
            rhino_library_path=None,
            rhino_model_path=None,
            rhino_sensitivity=0.5):
        if not os.path.exists(keyword_path):
            raise ValueError("Couldn't find Porcupine's keyword file at '%s'." % keyword_path)

        if not callable(wake_word_callback):
            raise ValueError("Invalid wake word callback.")

        if not os.path.exists(context_path):
            raise ValueError("Couldn't find Rhino's context file at '%s'." % context_path)

        if not callable(inference_callback):
            raise ValueError("Invalid inference callback.")

        if porcupine_library_path is not None and not os.path.exists(porcupine_library_path):
            raise ValueError("Couldn't find Porcupine's dynamic library at '%s'." % porcupine_library_path)

        if porcupine_model_path is not None and not os.path.exists(porcupine_model_path):
            raise ValueError("Couldn't find Porcupine's model file at '%s'." % porcupine_model_path)

        if not 0 <= porcupine_sensitivity <= 1:
            raise ValueError("Porcupine's sensitivity should be within [0, 1].")

        if rhino_library_path is not None and not os.path.exists(rhino_library_path):
            raise ValueError("Couldn't find Rhino's dynamic library at '%s'." % rhino_library_path)

        if rhino_model_path is not None and not os.path.exists(rhino_model_path):
            raise ValueError("Couldn't find Rhino's model file at '%s'." % rhino_model_path)

        if not 0 <= rhino_sensitivity <= 1:
            raise ValueError("Rhino's sensitivity should be within [0, 1]")

        self._porcupine = pvporcupine.create(
            library_path=porcupine_library_path,
            model_path=porcupine_model_path,
            keyword_paths=[keyword_path],
            sensitivities=[porcupine_sensitivity])

        self._wake_word_callback = wake_word_callback

        self._is_wake_word_detected = False

        self._rhino = pvrhino.create(
            library_path=rhino_library_path,
            model_path=rhino_model_path,
            context_path=context_path,
            sensitivity=rhino_sensitivity)

        self._inference_callback = inference_callback

        assert self._porcupine.sample_rate == self._rhino.sample_rate
        self._sample_rate = self._porcupine.sample_rate

        assert self._porcupine.frame_length == self._rhino.frame_length
        self._frame_length = self._porcupine.frame_length

    def delete(self):
        self._porcupine.delete()
        self._rhino.delete()

    def process(self, pcm):
        if not self._is_wake_word_detected:
            self._is_wake_word_detected = self._porcupine.process(pcm)
            if self._is_wake_word_detected:
                self._wake_word_callback()
        else:
            is_finalized = self._rhino.process(pcm)
            if is_finalized:
                self._is_wake_word_detected = False
                inference = self._rhino.get_inference()
                self._inference_callback(inference)

    @property
    def sample_rate(self):
        return self._sample_rate

    @property
    def frame_length(self):
        return self._frame_length

    @property
    def version(self):
        return '1.0.0'

    def __str__(self):
        return 'Picovoice %s {Porcupine %s, Rhino %s}' % (self.version, self._porcupine.version, self._rhino.version)
