#
# Copyright 2020-2022 Picovoice Inc.
#
# You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
# file accompanying this source.
#
# Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
# an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
# specific language governing permissions and limitations under the License.
#

import argparse
import os
import struct
import sys
from threading import Thread

from gpiozero import LED
from picovoice import Picovoice
from pvrecorder import PvRecorder

from .apa102 import APA102

COLORS_RGB = dict(
    blue=(0, 0, 255),
    green=(0, 255, 0),
    orange=(255, 128, 0),
    pink=(255, 51, 153),
    purple=(128, 0, 128),
    red=(255, 0, 0),
    white=(255, 255, 255),
    yellow=(255, 255, 51),
)

driver = APA102(num_led=12)
power = LED(5)
power.on()


class PicovoiceDemo(Thread):
    def __init__(
            self,
            keyword_path,
            context_path,
            access_key,
            device_index,
            porcupine_sensitivity=0.75,
            rhino_sensitivity=0.25):
        super(PicovoiceDemo, self).__init__()

        def inference_callback(inference):
            return self._inference_callback(inference)

        self._picovoice = Picovoice(
            access_key=access_key,
            keyword_path=keyword_path,
            wake_word_callback=self._wake_word_callback,
            context_path=context_path,
            inference_callback=inference_callback,
            porcupine_sensitivity=porcupine_sensitivity,
            rhino_sensitivity=rhino_sensitivity)

        self._context = self._picovoice.context_info

        self._color = 'blue'
        self._device_index = device_index

    @staticmethod
    def _set_color(color):
        for i in range(12):
            driver.set_pixel(i, color[0], color[1], color[2])
        driver.show()

    @staticmethod
    def _wake_word_callback():
        print('[wake word]\n')

    def _inference_callback(self, inference):
        print('{')
        print("  is_understood : '%s'," % ('true' if inference.is_understood else 'false'))
        if inference.is_understood:
            print("  intent : '%s'," % inference.intent)
            if len(inference.slots) > 0:
                print('  slots : {')
                for slot, value in inference.slots.items():
                    print("    '%s' : '%s'," % (slot, value))
                print('  }')
        print('}\n')

        if inference.is_understood:
            if inference.intent == 'turnLights':
                if inference.slots['state'] == 'off':
                    self._set_color((0, 0, 0))
                else:
                    self._set_color(COLORS_RGB[self._color])
            elif inference.intent == 'changeColor':
                self._color = inference.slots['color']
                self._set_color(COLORS_RGB[self._color])
            else:
                raise NotImplementedError()

    def run(self):
        recorder = None

        try:
            recorder = PvRecorder(device_index=self._device_index, frame_length=self._picovoice.frame_length)
            recorder.start()

            print(self._context)

            print('[Listening ...]')

            while True:
                pcm = recorder.read()
                self._picovoice.process(pcm)
        except KeyboardInterrupt:
            sys.stdout.write('\b' * 2)
            print('Stopping ...')
        finally:
            if recorder is not None:
                recorder.delete()

            self._picovoice.delete()


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        '--access_key',
        help='AccessKey obtained from Picovoice Console (https://picovoice.ai/console/)',
        required=True)

    parser.add_argument('--audio_device_index', help='Index of input audio device.', type=int, default=-1)

    args = parser.parse_args()

    o = PicovoiceDemo(
        os.path.join(os.path.dirname(__file__), 'picovoice_raspberry-pi.ppn'),
        os.path.join(os.path.dirname(__file__), 'respeaker_raspberry-pi.rhn'),
        args.access_key,
        args.audio_device_index
    )
    o.run()


if __name__ == '__main__':
    main()
