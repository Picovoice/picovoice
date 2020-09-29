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
import platform
import subprocess
import unittest

import pvporcupine
import soundfile

from .picovoice import Picovoice


class PicovoiceTestCase(unittest.TestCase):
    @staticmethod
    def _context_path():
        if platform.system() == 'Darwin':
            return os.path.join(
                os.path.dirname(__file__),
                '../../res/rhino/resources/contexts/mac/coffee_maker_mac.rhn')
        elif platform.system() == 'Linux':
            if platform.machine() == 'x86_64':
                return os.path.join(
                    os.path.dirname(__file__),
                    '../../res/rhino/resources/contexts/linux/coffee_maker_linux.rhn')
            else:
                cpu_info = subprocess.check_output(['cat', '/proc/cpuinfo']).decode()
                hardware_info = [x for x in cpu_info.split('\n') if 'Hardware' in x][0]

                if 'BCM' in hardware_info:
                    return os.path.join(
                        os.path.dirname(__file__),
                        '../../res/rhino/resources/contexts/raspberry-pi/coffee_maker_raspberry-pi.rhn')
                elif 'AM33' in hardware_info:
                    return os.path.join(
                        os.path.dirname(__file__),
                        '../../res/rhino/resources/contexts/beaglebone/coffee_maker_beaglebone.rhn')
                else:
                    raise NotImplementedError('Unsupported CPU:\n%s' % cpu_info)
        elif platform.system() == 'Windows':
            return os.path.join(
                os.path.dirname(__file__),
                '../../res/rhino/resources/contexts/windows/coffee_maker_windows.rhn')
        else:
            raise NotImplementedError('Unsupported platform')

    def _wake_word_callback(self):
        self._is_wake_word_detected = True

    def _inference_callback(self, is_understood, intent, slot_values):
        self._is_understood = is_understood
        self._intent = intent
        self._slot_values = slot_values

    def setUp(self):
        self._pv = Picovoice(
            keyword_path=pvporcupine.KEYWORD_FILE_PATHS['picovoice'],
            wake_word_callback=self._wake_word_callback,
            context_path=self._context_path(),
            inference_callback=self._inference_callback)

        self._is_wake_word_detected = False
        self._is_understood = False
        self._intent = None
        self._slot_values = dict()

    def tearDown(self):
        self._pv.delete()

    def test_process(self):
        audio, sample_rate = \
            soundfile.read(
                os.path.join(os.path.dirname(__file__), '../../res/audio_samples/picovoice-coffee.wav'),
                dtype='int16')

        for i in range(len(audio) // self._pv.frame_length):
            frame = audio[i * self._pv.frame_length:(i + 1) * self._pv.frame_length]
            self._pv.process(frame)

        self.assertTrue(self._is_wake_word_detected)
        self.assertEqual(self._intent, 'orderDrink')
        self.assertEqual(self._slot_values, dict(size='large', coffeeDrink='coffee'))

    def test_process_again(self):
        self.test_process()


if __name__ == '__main__':
    unittest.main()
