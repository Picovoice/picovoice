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

        self._is_ready = False
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
            raise ValueError("unsupported platform '%s'" % platform.system())

    @staticmethod
    def _context_path():
        if platform.system() == 'Linux':
            return os.path.join(os.path.dirname(__file__), 'res/contexts/linux/alarm_linux.rhn')
        elif platform.system() == 'Darwin':
            return os.path.join(os.path.dirname(__file__), 'res/contexts/mac/alarm_mac.rhn')
        elif platform.system() == 'Windows':
            return os.path.join(os.path.dirname(__file__), 'res/contexts/windows/alarm_windows.rhn')
        else:
            raise ValueError("unsupported platform '%s'" % platform.system())

    def _wake_word_callback(self):
        self._time_label.configure(fg='red')

    def _inference_callback(self, inference):
        self._time_label.configure(fg='black')

        if inference.is_understood:
            if inference.intent == 'reset':
                self._time_label.configure(text='00 : 00 : 00')
            elif inference.intent == 'setAlarm':
                hours = '%.2d' % int(inference.slots['hours']) if 'hours' in inference.slots else '00'
                minutes = '%.2d' % int(inference.slots['minutes']) if 'minutes' in inference.slots else '00'
                seconds = '%.2d' % int(inference.slots['seconds']) if 'seconds' in inference.slots else '00'
                self._time_label.configure(text='%s : %s : %s' % (hours, minutes, seconds))
            else:
                raise ValueError("unsupported intent '%s'" % inference.intent)

    def run(self):
        pv = None
        py_audio = None
        audio_stream = None

        try:
            pv = Picovoice(
                keyword_path=self._keyword_path(),
                porcupine_sensitivity=0.75,
                wake_word_callback=self._wake_word_callback,
                context_path=self._context_path(),
                inference_callback=self._inference_callback)

            py_audio = pyaudio.PyAudio()
            audio_stream = py_audio.open(
                rate=pv.sample_rate,
                channels=1,
                format=pyaudio.paInt16,
                input=True,
                frames_per_buffer=pv.frame_length)

            self._is_ready = True

            while not self._stop:
                pcm = audio_stream.read(pv.frame_length)
                pcm = struct.unpack_from("h" * pv.frame_length, pcm)
                pv.process(pcm)
        finally:
            if audio_stream is not None:
                audio_stream.close()
            if py_audio is not None:
                py_audio.terminate()

            if pv is not None:
                pv.delete()

        self._is_stopped = True

    def is_ready(self):
        return self._is_ready

    def stop(self):
        self._stop = True

    def is_stopped(self):
        return self._is_stopped


def main():
    window = tk.Tk()
    window.title('Picovoice Demo')
    window.minsize(width=150, height=200)

    time_label = tk.Label(window, text='00 : 00 : 00')
    time_label.pack(fill=tk.BOTH, pady=90)

    picovoice_thread = PicovoiceThread(time_label)

    def on_close():
        picovoice_thread.stop()
        while not picovoice_thread.is_stopped():
            pass
        window.destroy()

    window.protocol('WM_DELETE_WINDOW', on_close)

    picovoice_thread.start()
    while not picovoice_thread.is_ready():
        pass

    window.mainloop()


if __name__ == '__main__':
    main()
