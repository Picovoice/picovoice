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
import struct
import tkinter as tk
from threading import Thread

import pyaudio
from picovoice import Picovoice


class PicovoiceThread(Thread):
    def __init__(self, time_label):
        super().__init__()
        self._time_label = time_label
        self._stop = False
        self._is_stopped = False

    @staticmethod
    def _keyword_path():
        if platform.system() == 'Linux':
            return os.path.join(os.path.dirname(__file__), 'res/keyword_files/linux/picovoice_linux.ppn')
        elif platform.system() == 'Darwin':
            return os.path.join(os.path.dirname(__file__), 'res/keyword_files/mac/picovoice_mac.ppn')
        elif platform.system() == 'Windows':
            return os.path.join(os.path.dirname(__file__), 'res/keyword_files/windows/picovoice_windows.ppn')
        else:
            raise ValueError()

    @staticmethod
    def _context_path():
        if platform.system() == 'Linux':
            return os.path.join(os.path.dirname(__file__), 'res/contexts/linux/alarm_linux.rhn')
        elif platform.system() == 'Darwin':
            return os.path.join(os.path.dirname(__file__), 'res/contexts/mac/alarm_mac.rhn')
        elif platform.system() == 'Windows':
            return os.path.join(os.path.dirname(__file__), 'res/contexts/windows/alarm_windows.rhn')
        else:
            raise ValueError()

    def _wake_word_callback(self):
        self._time_label.configure(fg='red')

    def _inference_callback(self, inference):
        self._time_label.configure(fg='black')
        print(inference)
        if inference.is_understood:
            if inference.intent == 'reset':
                self._time_label.configure(text='00 : 00 : 00')
            elif inference.intent == 'setAlarm':
                hours = '%.2d' % int(inference.slots['hours']) if 'hours' in inference.slots else '00'
                minutes = '%.2d' % int(inference.slots['minutes']) if 'minutes' in inference.slots else '00'
                seconds = '%.2d' % int(inference.slots['seconds']) if 'seconds' in inference.slots else '00'
                self._time_label.configure(text='%s : %s : %s' % (hours, minutes, seconds))
            else:
                raise ValueError()

    def run(self):
        o = None
        py_audio = None
        audio_stream = None

        try:
            o = Picovoice(
                keyword_path=self._keyword_path(),
                wake_word_callback=self._wake_word_callback,
                context_path=self._context_path(),
                inference_callback=self._inference_callback)

            py_audio = pyaudio.PyAudio()
            audio_stream = py_audio.open(
                rate=o.sample_rate,
                channels=1,
                format=pyaudio.paInt16,
                input=True,
                frames_per_buffer=o.frame_length)

            while not self._stop:
                pcm = audio_stream.read(o.frame_length)
                pcm = struct.unpack_from("h" * o.frame_length, pcm)
                o.process(pcm)
        except KeyboardInterrupt:
            print('Stopping ...')
        finally:
            if audio_stream is not None:
                audio_stream.close()

            if py_audio is not None:
                py_audio.terminate()

            if o is not None:
                o.delete()

        self._is_stopped = True

    def stop(self):
        self._stop = True

    def is_stopped(self):
        return self._is_stopped


def main():
    window = tk.Tk()
    window.title('Picovoice Demo')
    window.minsize(width=150, height=200)

    time_label = tk.Label(window, text='00 : 00 : 00')
    time_label.pack(fill=tk.X, pady=50)

    picovoice_thread = PicovoiceThread(time_label)

    def on_close():
        picovoice_thread.stop()
        while not picovoice_thread.is_stopped():
            pass
        window.destroy()

    window.protocol('WM_DELETE_WINDOW', on_close)

    picovoice_thread.start()
    window.mainloop()


if __name__ == '__main__':
    main()
