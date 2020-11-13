import time
import apa102
from threading import Thread
import pyaudio
import struct
import sys
from picovoice import Picovoice
from gpiozero import LED

COLOR_CODES = dict(
    blue=(0, 0, 255),
    green=(0, 255, 0),
    orange=(255, 128, 0),
    pink=(255, 51, 153),
    purple=(128, 0, 128),
    red=(255, 0, 0),
    white=(255, 255, 255),
    yellow=(255, 255, 51),
    off=(0, 0, 0)
)

driver = apa102.APA102(num_led=12)
power = LED(5)
power.on()

class PicovoiceDemo(Thread):
    def __init__(
            self,
            keyword_path,
            context_path,
            porcupine_sensitivity=0.7,
            rhino_sensitivity=0.0):
        super(PicovoiceDemo, self).__init__()

        def inference_callback(inference):
            return self._inference_callback(inference)

        self._picovoice = Picovoice(
            keyword_path=keyword_path,
            wake_word_callback=self._wake_word_callback,
            context_path=context_path,
            inference_callback=inference_callback,
            porcupine_sensitivity=porcupine_sensitivity,
            rhino_sensitivity=rhino_sensitivity)
        
        print(self._picovoice._rhino.context_info)

        self._color = 'blue'
        self._brightness = 100

    def _set(self, color, brightness=10):
        for i in range(12):
            _driver.set_pixel(i, color[0], color[1], color[2], bright_percent=brightness)
        
        _driver.show()
    
    @staticmethod
    def _wake_word_callback():
        print('[wake word]\n')

    def _inference_callback(self, inference):
        print('{')
        print("  is_understood : '%s'," % 'true' if inference.is_understood else 'false')
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
                    self._set(COLOR_CODES['off'])
                else:
                    self._set(COLOR_CODES[self._color])
            elif inference.intent == 'changeColor':
                self._color = inference.slots['color']
                self._set(COLOR_CODES[self._color])
            elif inference.intent == 'changeBrightless':
                self._brightness = int(inference.slots['brightness'][:-1])
                print(self._brightness)
                self._set(self._color, self._brightness)
            else:
                raise NotImplementedError()

    def run(self):
        pa = None
        audio_stream = None

        try:
            pa = pyaudio.PyAudio()

            audio_stream = pa.open(
                rate=self._picovoice.sample_rate,
                channels=1,
                format=pyaudio.paInt16,
                input=True,
                frames_per_buffer=self._picovoice.frame_length)

            print('[Listening ...]')

            while True:
                pcm = audio_stream.read(self._picovoice.frame_length)
                pcm = struct.unpack_from("h" * self._picovoice.frame_length, pcm)

                self._picovoice.process(pcm)
        except KeyboardInterrupt:
            sys.stdout.write('\b' * 2)
            print('Stopping ...')
        finally:
            if audio_stream is not None:
                audio_stream.close()

            if pa is not None:
                pa.terminate()

            self._picovoice.delete()


if __name__ == '__main__':
    PicovoiceDemo(sys.argv[1], sys.argv[2]).run()
