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


import sys
import unittest

import pvporcupine
import soundfile

from picovoice import Picovoice

from test_util import *


class PicovoiceTestData:
    def __init__(self):
        self.pv = None
        self.reset()

    def reset(self):
        self.is_wake_word_detected = False
        self.inference = None

    def wake_word_callback(self):
        self.is_wake_word_detected = True

    def inference_callback(self, inference):
        self.inference = inference


class PicovoiceTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        models = [
            ('en', 'coffee_maker', 'picovoice'),
            ('es', 'luz', 'manzana'),
            ('de', 'beleuchtung', 'heuschrecke')]

        cls._pvs = dict()
        for model in models:
            language, context, keyword = model
            pvTestData = PicovoiceTestData()
            _pv = Picovoice(
                access_key=sys.argv[1],
                keyword_path=pv_keyword_paths_by_language(language)[keyword],
                context_path=context_path(context, language),
                porcupine_model_path=pv_porcupine_model_path_by_language(language),
                rhino_model_path=pv_rhino_model_path_by_language(language),
                wake_word_callback=pvTestData.wake_word_callback,
                inference_callback=pvTestData.inference_callback)
            pvTestData.pv = _pv

            if language not in cls._pvs:
                cls._pvs[language] = dict()
            if context not in cls._pvs[language]:
                cls._pvs[language][context] = dict()
            cls._pvs[language][context][keyword] = pvTestData

    @classmethod
    def tearDownClass(cls):
        for language in cls._pvs:
            for context in cls._pvs[language]:
                for keyword in cls._pvs[language][context]:
                    cls._pvs[language][context][keyword].pv.delete()

    def run_picovoice(self, language, context, keyword, audio_file_name, intent, slots):
        _pvTestData = self._pvs[language][context][keyword]
        _pvTestData.reset()
        _pv = _pvTestData.pv

        audio, sample_rate = \
            soundfile.read(
                os.path.join(os.path.dirname(__file__), '../../resources/audio_samples', audio_file_name),
                dtype='int16')

        for i in range(len(audio) // _pv.frame_length):
            frame = audio[i * _pv.frame_length:(i + 1) * _pv.frame_length]
            _pv.process(frame)

        self.assertTrue(_pvTestData.is_wake_word_detected)
        self.assertEqual(_pvTestData.inference.intent, intent)
        self.assertEqual(_pvTestData.inference.slots, slots)

    def test(self):
        self.run_picovoice(
                language='en',
                context='coffee_maker',
                keyword='picovoice',
                audio_file_name='picovoice-coffee.wav',
                intent='orderBeverage',
                slots=dict(size='large', beverage='coffee')) 

    def test_again(self):
        self.test()                        

    def test_es(self):
        self.run_picovoice(
                language='es',
                context='luz',
                keyword='manzana',            
                audio_file_name='manzana-luz_es.wav',
                intent='changeColor',
                slots=dict(location='habitación', color='rosado'))

    def test_de(self):
        self.run_picovoice(
                language='de',
                context='beleuchtung',
                keyword='heuschrecke',
                audio_file_name='heuschrecke-beleuchtung_de.wav',
                intent='changeState',
                slots=dict(state='aus'))

    def test_es_again(self):
        self.test_es()                

    def test_de_again(self):
        self.test_de()


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("usage: test_porcupine.py ${ACCESS_KEY}")
        exit(1)

    unittest.main(argv=sys.argv[:1])
