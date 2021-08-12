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
from picovoice import Picovoice

class PicovoiceTestCase(unittest.TestCase):
    @staticmethod
    def _context_path():
        if platform.system() == 'Darwin':
            return os.path.join(
                os.path.dirname(__file__),
                '../../resources/rhino/resources/contexts/mac/coffee_maker_mac.rhn')
        elif platform.system() == 'Linux':
            if platform.machine() == 'x86_64':
                return os.path.join(
                    os.path.dirname(__file__),
                    '../../resources/rhino/resources/contexts/linux/coffee_maker_linux.rhn')
            else:
                cpu_info = subprocess.check_output(['cat', '/proc/cpuinfo']).decode()
                hardware_info = [x for x in cpu_info.split('\n') if 'Hardware' in x][0]

                if 'BCM' in hardware_info:
                    return os.path.join(
                        os.path.dirname(__file__),
                        '../../resources/rhino/resources/contexts/raspberry-pi/coffee_maker_raspberry-pi.rhn')
                elif 'AM33' in hardware_info:
                    return os.path.join(
                        os.path.dirname(__file__),
                        '../../resources/rhino/resources/contexts/beaglebone/coffee_maker_beaglebone.rhn')
                else:
                    raise NotImplementedError('Unsupported CPU:\n%s' % cpu_info)
        elif platform.system() == 'Windows':
            return os.path.join(
                os.path.dirname(__file__),
                '../../resources/rhino/resources/contexts/windows/coffee_maker_windows.rhn')
        else:
            raise NotImplementedError('Unsupported platform')

    @classmethod
    def _wake_word_callback(cls):
        cls._is_wake_word_detected = True

    @classmethod
    def _inference_callback(cls, inference):
        cls._inference = inference

    @classmethod
    def setUpClass(cls):
        cls._pv = Picovoice(
            keyword_path=pvporcupine.KEYWORD_PATHS['picovoice'],
            wake_word_callback=cls._wake_word_callback,
            context_path=cls._context_path(),
            inference_callback=cls._inference_callback)

        cls._is_wake_word_detected = False
        cls._inference = None

    @classmethod
    def tearDownClass(cls):
        cls._pv.delete()

    def test_process(self):
        PicovoiceTestCase._is_wake_word_detected = False
        PicovoiceTestCase._inference = None

        audio, sample_rate = \
            soundfile.read(
                os.path.join(os.path.dirname(__file__), '../../resources/audio_samples/picovoice-coffee.wav'),
                dtype='int16')

        for i in range(len(audio) // PicovoiceTestCase._pv.frame_length):
            frame = audio[i * PicovoiceTestCase._pv.frame_length:(i + 1) * PicovoiceTestCase._pv.frame_length]
            PicovoiceTestCase._pv.process(frame)

        self.assertTrue(PicovoiceTestCase._is_wake_word_detected)
        self.assertEqual(PicovoiceTestCase._inference.intent, 'orderBeverage')
        self.assertEqual(PicovoiceTestCase._inference.slots, dict(size='large', beverage='coffee'))

    def test_process_again(self):
        self.test_process()


if __name__ == '__main__':
    unittest.main()
