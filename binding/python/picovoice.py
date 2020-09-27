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

import pvporcupine
import pvrhino


class Picovoice(object):
    def __init__(
            self,
            keyword_path,
            keyword_callback,
            context_path,
            command_callback,
            porcupine_library_path=None,
            porcupine_model_path=None,
            porcupine_sensitivity=0.5,
            rhino_library_path=None,
            rhino_model_path=None,
            rhino_sensitivity=0.5):
        self._porcupine = pvporcupine.create(
            library_path=porcupine_library_path,
            model_file_path=porcupine_model_path,
            keyword_file_paths=[keyword_path],
            sensitivities=porcupine_sensitivity)
        self._keyword_callback = keyword_callback
        self._is_wake_word_detected = False

        self._rhino = pvrhino.create(
            library_path=rhino_library_path,
            model_path=rhino_model_path,
            context_path=context_path,
            sensitivity=rhino_sensitivity)
        self._command_callback = command_callback

    def delete(self):
        self._porcupine.delete()
        self._rhino.delete()

    def process(self, pcm):
        if not self._is_wake_word_detected:
            self._is_wake_word_detected = self._porcupine.process(pcm)
            if self._is_wake_word_detected:
                self._keyword_callback()
        else:
            is_finalized = self._rhino.process(pcm)
            if is_finalized:
                is_understood = self._rhino.is_understood()
                if is_understood:
                    intent, slot_values = self._rhino.get_intent()
                else:
                    intent = None
                    slot_values = dict()

                self._rhino.reset()
                self._is_wake_word_detected = False
                self._command_callback(is_understood=is_understood, intent=intent, slot_values=slot_values)

    @property
    def sample_rate(self):
        return self._porcupine.sample_rate

    @property
    def frame_length(self):
        return self._porcupine.frame_length
