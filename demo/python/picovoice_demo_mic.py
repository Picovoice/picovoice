#
# Copyright 2020-2021 Picovoice Inc.
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
import sys
from threading import Thread

import numpy as np
import soundfile
from picovoice import Picovoice
from pvrecorder import PvRecorder


class PicovoiceDemo(Thread):
    def __init__(
            self,
            access_key,
            audio_device_index,
            keyword_path,
            context_path,
            porcupine_library_path=None,
            porcupine_model_path=None,
            porcupine_sensitivity=0.5,
            rhino_library_path=None,
            rhino_model_path=None,
            rhino_sensitivity=0.5,
            require_endpoint=True,
            output_path=None):
        super(PicovoiceDemo, self).__init__()

        self._picovoice = Picovoice(
            access_key=access_key,
            keyword_path=keyword_path,
            wake_word_callback=self._wake_word_callback,
            context_path=context_path,
            inference_callback=self._inference_callback,
            porcupine_library_path=porcupine_library_path,
            porcupine_model_path=porcupine_model_path,
            porcupine_sensitivity=porcupine_sensitivity,
            rhino_library_path=rhino_library_path,
            rhino_model_path=rhino_model_path,
            rhino_sensitivity=rhino_sensitivity,
            require_endpoint=require_endpoint)

        self.audio_device_index = audio_device_index
        self.output_path = output_path
        if self.output_path is not None:
            self._recorded_frames = list()

    @staticmethod
    def _wake_word_callback():
        print('[wake word]\n')

    @staticmethod
    def _inference_callback(inference):
        if inference.is_understood:
            print('{')
            print("  intent : '%s'" % inference.intent)
            print('  slots : {')
            for slot, value in inference.slots.items():
                print("    %s : '%s'" % (slot, value))
            print('  }')
            print('}\n')
        else:
            print("Didn't understand the command.\n")

    def run(self):
        recorder = None

        try:
            recorder = PvRecorder(device_index=self.audio_device_index, frame_length=self._picovoice.frame_length)
            recorder.start()

            print(f"Using device: {recorder.selected_device}")
            print('[Listening ...]')

            while True:
                pcm = recorder.read()

                if self.output_path is not None:
                    self._recorded_frames.append(pcm)

                self._picovoice.process(pcm)
        except KeyboardInterrupt:
            sys.stdout.write('\b' * 2)
            print('Stopping ...')
        finally:
            if recorder is not None:
                recorder.delete()

            if self.output_path is not None and len(self._recorded_frames) > 0:
                recorded_audio = np.concatenate(self._recorded_frames, axis=0).astype(np.int16)
                soundfile.write(
                    self.output_path,
                    recorded_audio,
                    samplerate=self._picovoice.sample_rate,
                    subtype='PCM_16')

            self._picovoice.delete()

    @classmethod
    def show_audio_devices(cls):
        devices = PvRecorder.get_audio_devices()

        for i in range(len(devices)):
            print(f'index: {i}, device name: {devices[i]}')


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        '--access_key',
        help='AccessKey obtained from Picovoice Console (https://picovoice.ai/console/)',
        required=True)

    parser.add_argument('--keyword_path', help="Absolute path to a Porcupine keyword file.")

    parser.add_argument('--context_path', help="Absolute path to a Rhino context file.")

    parser.add_argument('--porcupine_library_path', help="Absolute path to Porcupine's dynamic library.", default=None)

    parser.add_argument('--porcupine_model_path', help="Absolute path to Porcupine's model file.", default=None)

    parser.add_argument(
        '--porcupine_sensitivity',
        help="Sensitivity for detecting wake word. Each value should be a number within [0, 1]. A higher sensitivity " +
             "results in fewer misses at the cost of increasing the false alarm rate.",
        type=float,
        default=0.5)

    parser.add_argument('--rhino_library_path', help="Absolute path to Rhino's dynamic library.", default=None)

    parser.add_argument('--rhino_model_path', help="Absolute path to Rhino's model file.", default=None)

    parser.add_argument(
        '--rhino_sensitivity',
        help="Inference sensitivity. It should be a number within [0, 1]. A higher sensitivity value results in fewer" +
             "misses at the cost of (potentially) increasing the erroneous inference rate.",
        type=float,
        default=0.5)

    parser.add_argument(
        '--require_endpoint',
        help="If set to `False`, Rhino does not require an endpoint (chunk of silence) before finishing inference.",
        default='True',
        choices=['True', 'False'])

    parser.add_argument('--audio_device_index', help='index of input audio device', type=int, default=-1)

    parser.add_argument('--output_path', help='Absolute path to recorded audio for debugging.', default=None)

    parser.add_argument('--show_audio_devices', action='store_true')

    args = parser.parse_args()

    if args.require_endpoint.lower() == 'false':
        require_endpoint = False
    else:
        require_endpoint = True

    if args.show_audio_devices:
        PicovoiceDemo.show_audio_devices()
    else:
        if not args.keyword_path:
            raise ValueError("Missing path to Porcupine's keyword file.")

        if not args.context_path:
            raise ValueError("Missing path to Rhino's context file.")

        PicovoiceDemo(
            access_key=args.access_key,
            audio_device_index=args.audio_device_index,
            keyword_path=args.keyword_path,
            context_path=args.context_path,
            porcupine_library_path=args.porcupine_library_path,
            porcupine_model_path=args.porcupine_model_path,
            porcupine_sensitivity=args.porcupine_sensitivity,
            rhino_library_path=args.rhino_library_path,
            rhino_model_path=args.rhino_model_path,
            rhino_sensitivity=args.rhino_sensitivity,
            require_endpoint=require_endpoint,
            output_path=os.path.expanduser(args.output_path) if args.output_path is not None else None).run()


if __name__ == '__main__':
    main()
