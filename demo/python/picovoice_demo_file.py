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
from picovoice import Picovoice


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        '--access_key',
        help='AccessKey obtained from Picovoice Console (https://picovoice.ai/console/)',
        required=True)

    parser.add_argument('--input_audio_path', help='Absolute path to input audio file.', required=True)

    parser.add_argument('--keyword_path', help="Absolute path to a Porcupine keyword file.", required=True)

    parser.add_argument('--context_path', help="Absolute path to a Rhino context file.", required=True)

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

    args = parser.parse_args()

    if args.require_endpoint.lower() == 'false':
        require_endpoint = False
    else:
        require_endpoint = True

    def wake_word_callback():
        print('[wake word]\n')

    def inference_callback(inference):
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

    pv = Picovoice(
        access_key=args.access_key,
        keyword_path=args.keyword_path,
        wake_word_callback=wake_word_callback,
        context_path=args.context_path,
        inference_callback=inference_callback,
        porcupine_library_path=args.porcupine_library_path,
        porcupine_model_path=args.porcupine_model_path,
        porcupine_sensitivity=args.porcupine_sensitivity,
        rhino_library_path=args.rhino_library_path,
        rhino_model_path=args.rhino_model_path,
        rhino_sensitivity=args.rhino_sensitivity,
        require_endpoint=require_endpoint)

    audio, sample_rate = soundfile.read(args.input_audio_path, dtype='int16')
    if audio.ndim == 2:
        print("Picovoice processes single-channel audio but stereo file is provided. Processing left channel only.")
        audio = audio[0, :]

    if sample_rate != pv.sample_rate:
        raise ValueError("Input audio file should have a sample rate of %d. got %d" % (pv.sample_rate, sample_rate))

    for i in range(len(audio) // pv.frame_length):
        frame = audio[i * pv.frame_length:(i + 1) * pv.frame_length]
        pv.process(frame)

    pv.delete()


if __name__ == '__main__':
    main()
