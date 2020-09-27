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

    args = parser.parse_args()

    pv = Picovoice(
        keyword_path=args.keyword_path,
        keyword_callback=lambda: print('wake word detected'),
        context_path=args.context_path,
        command_callback=lambda is_understood, intent, slot_values: print(intent) if is_understood else 'oops')

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
