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


class PicovoiceMetaData:
    def __init__(self, language, context, keywords):
        self.language = language
        self.keywords = keywords
        self.context = context
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
        metas = [
            PicovoiceMetaData('en', 'coffee_maker', ['picovoice']),
            PicovoiceMetaData('es', 'luz', ['manzana']),
            PicovoiceMetaData('de', 'beleuchtung', ['heuschrecke'])]

        cls._pvs = list()
        for meta in metas:
            keyword_paths = list()
            for x in meta.keywords:
                keyword_paths.append(pv_keyword_paths_by_language(meta.language)[x])
            
            cls._pvs.append([meta, Picovoice(
                access_key=sys.argv[1],
                keyword_path=keyword_paths[0],
                context_path=context_path(meta.context, meta.language),
                porcupine_model_path=pv_porcupine_model_path_by_language(meta.language),
                rhino_model_path=pv_rhino_model_path_by_language(meta.language),
                wake_word_callback=meta.wake_word_callback,
                inference_callback=meta.inference_callback)])

    @classmethod
    def tearDownClass(cls):
        for meta, pv in cls._pvs:
            pv.delete()

    def run_picovoice(self, pv_index, audio_file_name, intent, slots):
        _meta, _pv = self._pvs[pv_index]
        _meta.reset()

        audio, sample_rate = \
            soundfile.read(
                os.path.join(os.path.dirname(__file__), '../../resources/audio_samples', audio_file_name),
                dtype='int16')

        for i in range(len(audio) // _pv.frame_length):
            frame = audio[i * _pv.frame_length:(i + 1) * _pv.frame_length]
            _pv.process(frame)

        self.assertTrue(_meta.is_wake_word_detected)
        self.assertEqual(_meta.inference.intent, intent)
        self.assertEqual(_meta.inference.slots, slots)

    def test(self):
        self.run_picovoice(
                pv_index=0,
                audio_file_name='picovoice-coffee.wav',
                intent='orderBeverage',
                slots=dict(size='large', beverage='coffee')) 

    # def test_again(self):
    #     self.test()                        

    # def test_es(self):
    #     self.run_picovoice(
    #             pv_index=1,
    #             audio_file_name='manzana-luz_es.wav',
    #             intent='changeColor',
    #             slots=dict(location='habitación', color='rosado'))

    # def test_de(self):
    #     self.run_picovoice(
    #             pv_index=2,
    #             audio_file_name='heuschrecke-beleuchtung_de.wav',
    #             intent='changeState',
    #             slots=dict(state='aus'))

    # def test_es_again(self):
    #     self.test_es()                

    # def test_de_again(self):
    #     self.test_de()


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("usage: test_porcupine.py ${ACCESS_KEY}")
        exit(1)

    unittest.main(argv=sys.argv[:1])
