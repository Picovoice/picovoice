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

import soundfile
from picovoice import *


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument('--input_audio_path', help='absolute path to input audio file', required=True)

    parser.add_argument('--keyword_path', help="absolute path to keyword file", required=True)

    parser.add_argument('--context_path', help="absolute path to context file", required=True)

    parser.add_argument('--porcupine_library_path', help="absolute path to Porcupine's dynamic library", default=None)

    parser.add_argument('--porcupine_model_path', help="absolute path to Porcupine's model file", default=None)

    parser.add_argument('--porcupine_sensitivity', help='Porcupine sensitivity', default=0.5)

    parser.add_argument('--rhino_library_path', help="absolute path to Rhino's dynamic library", default=None)

    parser.add_argument('--rhino_model_path', help="absolute path to Rhino's model file", default=None)

    parser.add_argument('--rhino_sensitivity', help='Rhino sensitivity', default=0.5)

    args = parser.parse_args()

    def wake_word_callback():
        print('[wake word detected]\n')

    def command_callback(is_understood, intent, slot_values):
        if is_understood:
            print('{')
            print("  intent : '%s'" % intent)
            print('  slots : {')
            for slot, value in slot_values.items():
                print("    %s : '%s'" % (slot, value))
            print('  }')
            print('}')
        else:
            print("didn't understand the command")
        print()

    pv = Picovoice(
        keyword_path=args.keyword_path,
        wake_word_callback=wake_word_callback,
        context_path=args.context_path,
        command_callback=command_callback,
        porcupine_library_path=args.porcupine_library_path,
        porcupine_model_path=args.porcupine_model_path,
        porcupine_sensitivity=args.porcupine_sensitivity,
        rhino_library_path=args.rhino_library_path,
        rhino_model_path=args.rhino_model_path,
        rhino_sensitivity=args.rhino_sensitivity)

    audio, sample_rate = soundfile.read(args.input_audio_path, dtype='int16')
    if sample_rate != pv.sample_rate:
        raise ValueError("input audio file should have a sample rate of %d. got %d" % (pv.sample_rate, sample_rate))

    num_frames = len(audio) // pv.frame_length
    for i in range(num_frames):
        frame = audio[i * pv.frame_length:(i + 1) * pv.frame_length]
        pv.process(frame)

    pv.delete()


if __name__ == '__main__':
    main()
