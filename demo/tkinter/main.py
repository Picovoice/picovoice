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
import platform
import tkinter as tk
from threading import Thread
from threading import Timer

from picovoice import Picovoice
from pvrecorder import PvRecorder


class PicovoiceThread(Thread):
    def __init__(self, time_label, access_key):
        super().__init__()

        self._access_key = access_key

        self._time_label = time_label

        self._is_paused = False
        self._hours = 0
        self._minutes = 0
        self._seconds = 0

        self._is_ready = False
        self._stop = False
        self._is_stopped = False

        self._countdown()

    def _countdown(self):
        if not self._is_paused:
            update = False
            if self._seconds > 0:
                self._seconds -= 1
                update = True
            elif self._minutes > 0:
                self._minutes -= 1
                self._seconds = 59
                update = True
            elif self._hours > 0:
                self._hours -= 1
                self._minutes = 59
                self._seconds = 59
                update = True

            if update:
                self._time_label.configure(text='%.2d : %.2d : %.2d' % (self._hours, self._minutes, self._seconds))

        Timer(1, self._countdown).start()

    @staticmethod
    def _keyword_path():
        if platform.system() == 'Linux':
            if platform.machine() == 'x86_64':
                return os.path.join(
                    os.path.dirname(__file__),
                    '../../resources/porcupine/resources/keyword_files/linux/picovoice_linux.ppn')
            else:
                return os.path.join(
                    os.path.dirname(__file__),
                    '../../resources/porcupine/resources/keyword_files/raspberry-pi/picovoice_raspberry-pi.ppn')
        elif platform.system() == 'Darwin':
            return os.path.join(
                os.path.dirname(__file__),
                '../../resources/porcupine/resources/keyword_files/mac/picovoice_mac.ppn')
        elif platform.system() == 'Windows':
            return os.path.join(
                os.path.dirname(__file__),
                '../../resources/porcupine/resources/keyword_files/windows/picovoice_windows.ppn')
        else:
            raise ValueError("unsupported platform '%s'" % platform.system())

    @staticmethod
    def _context_path():
        if platform.system() == 'Linux':
            if platform.machine() == 'x86_64':
                return os.path.join(
                    os.path.dirname(__file__),
                    '../../resources/rhino/resources/contexts/linux/alarm_linux.rhn')
            else:
                return os.path.join(
                    os.path.dirname(__file__),
                    '../../resources/rhino/resources/contexts/raspberry-pi/alarm_raspberry-pi.rhn')
        elif platform.system() == 'Darwin':
            return os.path.join(
                os.path.dirname(__file__),
                '../../resources/rhino/resources/contexts/mac/alarm_mac.rhn')
        elif platform.system() == 'Windows':
            return os.path.join(
                os.path.dirname(__file__),
                '../../resources/rhino/resources/contexts/windows/alarm_windows.rhn')
        else:
            raise ValueError("unsupported platform '%s'" % platform.system())

    def _wake_word_callback(self):
        self._time_label.configure(fg='red')

    def _inference_callback(self, inference):
        self._time_label.configure(fg='black')

        if inference.is_understood:
            if inference.intent == 'setAlarm':
                self._is_paused = False
                self._hours = int(inference.slots['hours']) if 'hours' in inference.slots else 0
                self._minutes = int(inference.slots['minutes']) if 'minutes' in inference.slots else 0
                self._seconds = int(inference.slots['seconds']) if 'seconds' in inference.slots else 0
                self._time_label.configure(text='%.2d : %.2d : %.2d' % (self._hours, self._minutes, self._seconds))
            elif inference.intent == 'reset':
                self._is_paused = False
                self._hours = 0
                self._minutes = 0
                self._seconds = 0
                self._time_label.configure(text='00 : 00 : 00')
            elif inference.intent == 'pause':
                self._is_paused = True
            elif inference.intent == 'resume':
                self._is_paused = False
            else:
                raise ValueError("unsupported intent '%s'" % inference.intent)

    def run(self):
        pv = None
        recorder = None

        try:
            pv = Picovoice(
                access_key=self._access_key,
                keyword_path=self._keyword_path(),
                porcupine_sensitivity=0.75,
                wake_word_callback=self._wake_word_callback,
                context_path=self._context_path(),
                inference_callback=self._inference_callback)

            print(pv.context_info)

            recorder = PvRecorder(device_index=-1, frame_length=pv.frame_length)
            recorder.start()

            self._is_ready = True

            while not self._stop:
                pcm = recorder.read()
                pv.process(pcm)
        finally:
            if recorder is not None:
                recorder.delete()

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
    parser = argparse.ArgumentParser()

    parser.add_argument(
        '--access_key',
        help='AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)',
        required=True)

    args = parser.parse_args()

    window = tk.Tk()
    window.title('Picovoice Demo')
    window.minsize(width=400, height=200)

    time_label = tk.Label(window, text='00 : 00 : 00', font=('Ubuntu', 48))
    time_label.pack(fill=tk.BOTH, pady=90)

    picovoice_thread = PicovoiceThread(time_label, args.access_key)

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
