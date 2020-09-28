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
            porcupine_keyword_path,
            wake_word_callback,
            rhino_context_path,
            command_callback,
            porcupine_library_path=None,
            porcupine_model_path=None,
            porcupine_sensitivity=0.5,
            rhino_library_path=None,
            rhino_model_path=None,
            rhino_sensitivity=0.5):
        if not os.path.exists(porcupine_keyword_path):
            raise ValueError()
        if porcupine_library_path is not None and not os.path.exists(porcupine_library_path):
            raise ValueError()
        if porcupine_model_path is not None and not os.path.exists(porcupine_model_path):
            raise ValueError()
        if not 0 <= porcupine_sensitivity <= 1:
            raise ValueError()
        self._porcupine = pvporcupine.create(
            library_path=porcupine_library_path,
            model_file_path=porcupine_model_path,
            keyword_file_paths=[porcupine_keyword_path],
            sensitivities=[porcupine_sensitivity])
        if not callable(wake_word_callback):
            raise ValueError()
        self._wake_word_callback = wake_word_callback
        self._is_wake_word_detected = False

        if not os.path.exists(rhino_context_path):
            raise ValueError()
        if rhino_library_path is not None and not os.path.exists(rhino_library_path):
            raise ValueError()
        if rhino_model_path is not None and not os.path.exists(rhino_model_path):
            raise ValueError()
        if not 0 <= rhino_sensitivity <= 1:
            raise ValueError()
        self._rhino = pvrhino.create(
            library_path=rhino_library_path,
            model_path=rhino_model_path,
            context_path=rhino_context_path,
            sensitivity=rhino_sensitivity)
        if not callable(command_callback):
            raise ValueError()
        self._command_callback = command_callback

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
                is_understood = self._rhino.is_understood()
                intent, slot_values = self._rhino.get_intent() if is_understood else None, dict()

                self._rhino.reset()
                self._is_wake_word_detected = False

                self._command_callback(is_understood=is_understood, intent=intent, slot_values=slot_values)

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
        return 'Picovoice %s' % self.version

    def __repr__(self):
        res = '%s {\n' % str(self)
        res += "    Porcupine: %s\n" % self._porcupine.version
        res += "    Rhino: %s\n" % self._rhino.version
        res += '}'
        return res
