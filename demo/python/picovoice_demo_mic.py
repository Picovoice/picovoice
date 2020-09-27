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

import argparse
import struct
from threading import Thread

import pyaudio
from picovoice import *


class PicovoiceDemo(Thread):
    def __init__(self, keyword_path, context_path):
        super(PicovoiceDemo, self).__init__()

        self._picovoice = Picovoice(
            keyword_path=keyword_path,
            keyword_callback=self.keyword_callback,
            context_path=context_path,
            command_callback=self.command_callback())

    def keyword_callback(self):
        raise NotImplementedError()

    def command_callback(self):
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

            while True:
                pcm = audio_stream.read(self._picovoice.frame_length)
                pcm = struct.unpack_from("h" * self._picovoice.frame_length, pcm)

                self._picovoice.process(pcm)
        except KeyboardInterrupt:
            print('stopping ...')
        finally:
            if audio_stream is not None:
                audio_stream.close()

            if pa is not None:
                pa.terminate()

            self._picovoice.delete()


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument('--keyword_path', required=True)

    parser.add_argument('--context_path', required=True)

    args = parser.parse_args()

    PicovoiceDemo(keyword_path=args.keyword_path, context_path=args.context_path)


if __name__ == '__main__':
    pass
