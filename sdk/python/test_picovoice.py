#
# Copyright 2020-2023 Picovoice Inc.
#
# You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
# file accompanying this source.
#
# Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
# an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
# specific language governing permissions and limitations under the License.
#


import struct
import sys
import unittest
import wave

from parameterized import parameterized

from _picovoice import Picovoice
from test_util import *


test_parameters = load_test_data()


class PicovoiceTestData:
    def __init__(self):
        self.picovoiceInstance = None
        self.is_wake_word_detected = False
        self.inference = None

    def reset(self):
        self.is_wake_word_detected = False
        self.inference = None

    def wake_word_callback(self):
        self.is_wake_word_detected = True

    def inference_callback(self, inference):
        self.inference = inference


class PicovoiceTestCase(unittest.TestCase):
    @staticmethod
    def _concatenate(language, context, keyword):
        return '%s#%s#%s' % (language, context, keyword)

    @staticmethod
    def __read_file(file_name, sample_rate):
        wav_file = wave.open(file_name, mode="rb")
        channels = wav_file.getnchannels()
        num_frames = wav_file.getnframes()

        if wav_file.getframerate() != sample_rate:
            raise ValueError(
                "Audio file should have a sample rate of %d, got %d" % (sample_rate, wav_file.getframerate()))

        samples = wav_file.readframes(num_frames)
        wav_file.close()

        frames = struct.unpack('h' * num_frames * channels, samples)

        if channels == 2:
            print("Picovoice processes single-channel audio but stereo file is provided. Processing left channel only.")

        return frames[::channels]

    def run_picovoice(self, language, keyword, context, audio_file_name, intent, slots):
        test_data = PicovoiceTestData()
        picovoice = Picovoice(
            access_key=sys.argv[1],
            keyword_path=pv_keyword_paths_by_language(language)[keyword],
            context_path=context_path(context, language),
            porcupine_model_path=pv_porcupine_model_path_by_language(language),
            rhino_model_path=pv_rhino_model_path_by_language(language),
            wake_word_callback=test_data.wake_word_callback,
            inference_callback=test_data.inference_callback)

        audio = \
            self.__read_file(
                os.path.join(os.path.dirname(__file__), '../../resources/audio_samples', audio_file_name),
                picovoice.sample_rate)

        for _ in range(2):
            test_data.reset()
            for i in range(len(audio) // picovoice.frame_length):
                frame = audio[i * picovoice.frame_length:(i + 1) * picovoice.frame_length]
                picovoice.process(frame)

            self.assertTrue(test_data.is_wake_word_detected)
            self.assertEqual(test_data.inference.intent, intent)
            self.assertEqual(test_data.inference.slots, slots)

    @parameterized.expand(test_parameters)
    def test_picovoice(self, language, keyword, context, audio_file_name, intent, slots):
        self.run_picovoice(
            language=language,
            keyword=keyword,
            context=context,
            audio_file_name=audio_file_name,
            intent=intent,
            slots=slots)


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("usage: test_porcupine.py ${ACCESS_KEY}")
        exit(1)

    unittest.main(argv=sys.argv[:1])
