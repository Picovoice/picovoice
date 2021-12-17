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
import sys
import unittest

import pvporcupine
import soundfile

from picovoice import Picovoice


class PicovoiceTestCase(unittest.TestCase):
    @staticmethod
    def __append_language(s, language):
        if language == 'en':
            return s
        return s + '_' + language

    @classmethod
    def __context_path(cls, context, language):
        system = platform.system()

        contexts_root = cls.__append_language('../../resources/rhino/resources/contexts', language)

        if system == 'Darwin':
            return os.path.join(os.path.dirname(__file__), contexts_root, 'mac', context+'_mac.rhn')
        elif system == 'Linux':
            if platform.machine() == 'x86_64':
                return os.path.join(os.path.dirname(__file__), contexts_root, 'linux', context+'_linux.rhn')
            else:
                cpu_info = ''
                try:
                    cpu_info = subprocess.check_output(['cat', '/proc/cpuinfo']).decode()
                    cpu_part_list = [x for x in cpu_info.split('\n') if 'CPU part' in x]
                    cpu_part = cpu_part_list[0].split(' ')[-1].lower()
                except Exception as error:
                    raise RuntimeError("Failed to identify the CPU with '%s'\nCPU info: %s" % (error, cpu_info))

                if '0xb76' == cpu_part or '0xc07' == cpu_part or '0xd03' == cpu_part or '0xd08' == cpu_part:
                    return os.path.join(os.path.dirname(__file__),
                                        contexts_root, 'raspberry-pi', context+'_raspberry-pi.rhn')
                elif '0xd07' == cpu_part:
                    return os.path.join(os.path.dirname(__file__),
                                        contexts_root, 'jetson', context+'_jetson.rhn')
                elif '0xc08' == cpu_part:
                    return os.path.join(os.path.dirname(__file__),
                                        contexts_root, 'beaglebone', context+'_beaglebone.rhn')    
                else:
                    raise NotImplementedError("Unsupported CPU: '%s'." % cpu_part)
        elif system == 'Windows':
            return os.path.join(os.path.dirname(__file__), contexts_root, 'windows', context+'_windows.rhn')
        else:
            raise ValueError("Unsupported system '%s'." % system)

    @classmethod
    def _wake_word_callback(cls):
        cls._is_wake_word_detected = True

    @classmethod
    def _inference_callback(cls, inference):
        cls._inference = inference

    @classmethod
    def setUpClass(cls):
        cls._pv = Picovoice(
            access_key=sys.argv[1],
            keyword_path=pvporcupine.KEYWORD_PATHS['picovoice'],
            wake_word_callback=cls._wake_word_callback,
            context_path=cls.__context_path('coffee_maker', 'en'),
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
    if len(sys.argv) != 2:
        print("usage: test_porcupine.py ${ACCESS_KEY}")
        exit(1)

    unittest.main(argv=sys.argv[:1])
