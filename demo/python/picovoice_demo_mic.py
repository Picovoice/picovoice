#
# Copyright 2020-2023 Picovoice Inc.
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
import wave

from picovoice import *
from pvrecorder import PvRecorder


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        '--access_key',
        help='AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)')

    parser.add_argument(
        '--keyword_path',
        help="Absolute path to a Porcupine keyword file.")

    parser.add_argument(
        '--context_path',
        help="Absolute path to a Rhino context file.")

    parser.add_argument(
        '--porcupine_library_path',
        help="Absolute path to Porcupine's dynamic library.")

    parser.add_argument(
        '--porcupine_model_path',
        help="Absolute path to Porcupine's model file.")

    parser.add_argument(
        '--porcupine_sensitivity',
        help="Sensitivity for detecting wake word. Each value should be a number within [0, 1]. A higher sensitivity "
             "results in fewer misses at the cost of increasing the false alarm rate.",
        type=float,
        default=0.5)

    parser.add_argument(
        '--rhino_library_path',
        help="Absolute path to Rhino's dynamic library.")

    parser.add_argument(
        '--rhino_model_path',
        help="Absolute path to Rhino's model file.")

    parser.add_argument(
        '--rhino_sensitivity',
        help="Inference sensitivity. It should be a number within [0, 1]. A higher sensitivity value results in fewer "
             "misses at the cost of (potentially) increasing the erroneous inference rate.",
        type=float,
        default=0.5)

    parser.add_argument(
        '--endpoint_duration_sec',
        help="Endpoint duration in seconds. An endpoint is a chunk of silence at the end of an utterance that marks "
             "the end of spoken command. It should be a positive number within [0.5, 5]. A lower endpoint duration "
             "reduces delay and improves responsiveness. A higher endpoint duration assures Rhino doesn't return "
             "inference pre-emptively in case the user pauses before finishing the request.",
        type=float,
        default=1.)

    parser.add_argument(
        '--require_endpoint',
        help="If set to `True`, Rhino requires an endpoint (a chunk of silence) after the spoken command. If set to "
             "`False`, Rhino tries to detect silence, but if it cannot, it still will provide inference regardless. "
             "Set to `False` only if operating in an environment with overlapping speech (e.g. people talking in the "
             "background).",
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
        for i, device in enumerate(PvRecorder.get_available_devices()):
            print('Device %d: %s' % (i, device))
        return

    if not args.access_key or not args.keyword_path or not args.context_path:
        print('--access_key, --keyword_path and --context_path are required.')
        return

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

    try:
        picovoice = Picovoice(
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
            endpoint_duration_sec=args.endpoint_duration_sec,
            require_endpoint=require_endpoint)
    except PicovoiceInvalidArgumentError as e:
        print("One or more arguments provided to Picovoice is invalid: ", args)
        print(e)
        raise e
    except PicovoiceActivationError as e:
        print("AccessKey activation error")
        raise e
    except PicovoiceActivationLimitError as e:
        print("AccessKey '%s' has reached it's temporary device limit" % args.access_key)
        raise e
    except PicovoiceActivationRefusedError as e:
        print("AccessKey '%s' refused" % args.access_key)
        raise e
    except PicovoiceActivationThrottledError as e:
        print("AccessKey '%s' has been throttled" % args.access_key)
        raise e
    except PicovoiceError as e:
        print("Failed to initialize Picovoice")
        raise e

    print('Picovoice version: %s' % picovoice.version)
    print('Context info: %s' % picovoice.context_info)

    recorder = PvRecorder(
        frame_length=picovoice.frame_length,
        device_index=args.audio_device_index,
    )
    recorder.start()

    print('Listening ... (Press Ctrl+C to exit)\n')

    wav_file = None
    if args.output_path is not None:
        wav_file = wave.open(args.output_path, 'wb')
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(picovoice.sample_rate)

    try:
        while True:
            pcm = recorder.read()

            if wav_file is not None:
                wav_file.writeframes(struct.pack("h" * len(pcm), *pcm))

            picovoice.process(pcm)

    except KeyboardInterrupt:
        print('Stopping ...')
    finally:
        recorder.delete()
        picovoice.delete()
        if wav_file is not None:
            wav_file.close()


if __name__ == '__main__':
    main()
