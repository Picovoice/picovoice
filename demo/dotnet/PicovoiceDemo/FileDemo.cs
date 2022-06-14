/*
    Copyright 2020-2021 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

using Pv;

namespace PicovoiceDemo
{
    /// <summary>
    /// File Demo for Picovoice end-to-end platform. It takes an input audio file, a Porcupine keyword and a Rhino context
    /// and prints when/if it encounters the keyword and when/if it makes an inference.
    /// </summary>
    public class FileDemo
    {

        /// <summary>
        /// Reads through input audio file and prints to the console when it encounters the specified keyword or makes an
        /// inference in the given context.
        /// </summary>
        /// <param name="inputAudioPath">Absolute path to input audio file.</param>
        /// <param name="accessKey">AccessKey obtained from Picovoice Console (https://console.picovoice.ai/).</param>
        /// <param name="keywordPath">Absolute path to a Porcupine keyword model file.</param>
        /// <param name="contextPath">Absolute path to file containing Rhino context parameters.</param>
        /// <param name="porcupineModelPath">Absolute path to the file containing Porcupine's model parameters.</param>
        /// <param name="porcupineSensitivity">Wake word detection sensitivity.</param>
        /// <param name="rhinoModelPath">Absolute path to the file containing Rhino's model parameters.</param>
        /// <param name="rhinoSensitivity">Inference sensitivity.</param>
        /// <param name="endpointDurationSec">
        /// Endpoint duration in seconds. An endpoint is a chunk of silence at the end of an
        /// utterance that marks the end of spoken command. It should be a positive number within [0.5, 5]. A lower endpoint
        /// duration reduces delay and improves responsiveness. A higher endpoint duration assures Rhino doesn't return inference
        /// pre-emptively in case the user pauses before finishing the request.
        /// </param>
        /// <param name="requireEndpoint">
        /// If set to `true`, Rhino requires an endpoint (a chunk of silence) after the spoken command.
        /// If set to `false`, Rhino tries to detect silence, but if it cannot, it still will provide inference regardless. Set
        /// to `false` only if operating in an environment with overlapping speech (e.g. people talking in the background).
        /// </param>
        public static void RunDemo(
            string inputAudioPath,
            string accessKey,
            string keywordPath,
            string contextPath,
            string porcupineModelPath,
            float porcupineSensitivity,
            string rhinoModelPath,
            float rhinoSensitivity,
            float endpointDurationSec,
            bool requireEndpoint)
        {
            static void wakeWordCallback() => Console.WriteLine("[wake word]");

            static void inferenceCallback(Inference inference)
            {
                if (inference.IsUnderstood)
                {
                    Console.WriteLine("{");
                    Console.WriteLine($"  intent : '{inference.Intent}'");
                    Console.WriteLine("  slots : {");
                    foreach (KeyValuePair<string, string> slot in inference.Slots)
                        Console.WriteLine($"    {slot.Key} : '{slot.Value}'");
                    Console.WriteLine("  }");
                    Console.WriteLine("}\n");
                }
                else
                {
                    Console.WriteLine("Didn't understand the command\n");
                }
            }

            // init picovoice platform
            using Picovoice picovoice = Picovoice.Create(
                accessKey,
                keywordPath,
                wakeWordCallback,
                contextPath,
                inferenceCallback,
                porcupineModelPath,
                porcupineSensitivity,
                rhinoModelPath,
                rhinoSensitivity,
                endpointDurationSec,
                requireEndpoint);

            // open and validate wav
            using BinaryReader reader = new BinaryReader(File.Open(inputAudioPath, FileMode.Open));
            ValidateWavFile(reader, picovoice.SampleRate, 16, out short numChannels);

            // read audio and send frames to picovoice
            short[] picovoiceFrame = new short[picovoice.FrameLength];
            int frameIndex = 0;
            while (reader.BaseStream.Position != reader.BaseStream.Length)
            {
                picovoiceFrame[frameIndex++] = reader.ReadInt16();

                if (frameIndex == picovoiceFrame.Length)
                {
                    picovoice.Process(picovoiceFrame);
                    frameIndex = 0;
                }

                // skip right channel
                if (numChannels == 2)
                {
                    reader.ReadInt16();
                }
            }
        }


        /// <summary>
        ///  Reads RIFF header of a WAV file and validates its properties against Picovoice audio processing requirements
        /// </summary>
        /// <param name="reader">WAV file stream reader</param>
        /// <param name="requiredSampleRate">Required sample rate in Hz</param>
        /// <param name="requiredBitDepth">Required number of bits per sample</param>
        /// <param name="numChannels">Number of channels can be returned by function</param>
        public static void ValidateWavFile(BinaryReader reader, int requiredSampleRate, short requiredBitDepth, out short numChannels)
        {
            byte[] riffHeader = reader?.ReadBytes(44);

            int riff = BitConverter.ToInt32(riffHeader, 0);
            int wave = BitConverter.ToInt32(riffHeader, 8);
            if (riff != BitConverter.ToInt32(Encoding.UTF8.GetBytes("RIFF"), 0) ||
                wave != BitConverter.ToInt32(Encoding.UTF8.GetBytes("WAVE"), 0))
            {
                throw new ArgumentException("input_audio_path", $"Invalid input audio file format. Input file must be a {requiredSampleRate}Hz, 16-bit WAV file.");
            }

            numChannels = BitConverter.ToInt16(riffHeader, 22);
            int sampleRate = BitConverter.ToInt32(riffHeader, 24);
            short bitDepth = BitConverter.ToInt16(riffHeader, 34);
            if (sampleRate != requiredSampleRate || bitDepth != requiredBitDepth)
            {
                throw new ArgumentException("input_audio_path", $"Invalid input audio file format. Input file must be a {requiredSampleRate}Hz, 16-bit WAV file.");
            }

            if (numChannels == 2)
            {
                Console.WriteLine("Picovoice processes single-channel audio but stereo file is provided. Processing left channel only.");
            }
        }

        public static void Main(string[] args)
        {
            AppDomain.CurrentDomain.UnhandledException += OnUnhandledException;
            if (args.Length == 0)
            {
                Console.WriteLine(HELP_STR);
                Console.Read();
                return;
            }

            string inputAudioPath = null;
            string accessKey = null;
            string keywordPath = null;
            string contextPath = null;
            string porcupineModelPath = null;
            float porcupineSensitivity = 0.5f;
            string rhinoModelPath = null;
            float rhinoSensitivity = 0.5f;
            float endpointDurationSec = 1.0f;
            bool requireEndpoint = true;
            bool showHelp = false;

            // parse command line arguments
            int argIndex = 0;
            while (argIndex < args.Length)
            {
                if (args[argIndex] == "--input_audio_path")
                {
                    if (++argIndex < args.Length)
                    {
                        inputAudioPath = args[argIndex++];
                    }
                }
                else if (args[argIndex] == "--access_key")
                {
                    if (++argIndex < args.Length)
                    {
                        accessKey = args[argIndex++];
                    }
                }
                else if (args[argIndex] == "--keyword_path")
                {
                    if (++argIndex < args.Length)
                    {
                        keywordPath = args[argIndex++];
                    }
                }
                else if (args[argIndex] == "--context_path")
                {
                    if (++argIndex < args.Length)
                    {
                        contextPath = args[argIndex++];
                    }
                }
                else if (args[argIndex] == "--porcupine_model_path")
                {
                    if (++argIndex < args.Length)
                    {
                        porcupineModelPath = args[argIndex++];
                    }
                }
                else if (args[argIndex] == "--porcupine_sensitivity")
                {
                    if (++argIndex < args.Length && float.TryParse(args[argIndex], out porcupineSensitivity))
                    {
                        argIndex++;
                    }
                }
                else if (args[argIndex] == "--rhino_model_path")
                {
                    if (++argIndex < args.Length)
                    {
                        rhinoModelPath = args[argIndex++];
                    }
                }
                else if (args[argIndex] == "--rhino_sensitivity")
                {
                    if (++argIndex < args.Length && float.TryParse(args[argIndex], out rhinoSensitivity))
                    {
                        argIndex++;
                    }
                }
                else if (args[argIndex] == "--endpoint_duration")
                {
                    argIndex++;
                    if (argIndex < args.Length && float.TryParse(args[argIndex], out endpointDurationSec))
                    {
                        argIndex++;
                    }
                }
                else if (args[argIndex] == "--require_endpoint")
                {
                    if (++argIndex < args.Length)
                    {
                        if (args[argIndex++].ToLower() == "false")
                        {
                            requireEndpoint = false;
                        }
                    }
                }
                else if (args[argIndex] == "-h" || args[argIndex] == "--help")
                {
                    showHelp = true;
                    argIndex++;
                }
                else
                {
                    argIndex++;
                }
            }

            // print help text and exit
            if (showHelp)
            {
                Console.WriteLine(HELP_STR);
                Console.Read();
                return;
            }

            // argument validation
            if (string.IsNullOrEmpty(inputAudioPath))
            {
                throw new ArgumentNullException("input_audio_path");
            }
            if (!File.Exists(inputAudioPath))
            {
                throw new ArgumentException($"Audio file at path {inputAudioPath} does not exist");
            }

            // run demo with validated arguments
            RunDemo(
                inputAudioPath,
                accessKey,
                keywordPath,
                contextPath,
                porcupineModelPath,
                porcupineSensitivity,
                rhinoModelPath,
                rhinoSensitivity,
                endpointDurationSec,
                requireEndpoint);
        }

        private static void OnUnhandledException(object sender, UnhandledExceptionEventArgs e)
        {
            Console.WriteLine(e.ExceptionObject.ToString());
            Console.Read();
            Environment.Exit(-1);
        }

        private static readonly string HELP_STR = "Available options: \n " +
            "\t--input_audio_path (required): Absolute path to input audio file.\n" +
            "\t--access_key (required): AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)\n" +
            "\t--keyword_path (required): Absolute path to a Porcupine keyword file.\n" +
            "\t--context_path (required): Absolute path to a Rhino context file.\n" +
            "\t--porcupine_model_path: Absolute path to Porcupine's model file.\n" +
            "\t--porcupine_sensitivity: Sensitivity for detecting wake word. Each value should be a number within [0, 1]. A higher " +
            "sensitivity results in fewer misses at the cost of increasing the false alarm rate.\n" +
            "\t--rhino_model_path: Absolute path to Rhino's model file.\n" +
            "\t--rhino_sensitivity: Inference sensitivity. It should be a number within [0, 1]. A higher sensitivity " +
            "value results in fewer misses at the cost of (potentially) increasing the erroneous inference rate.\n" +
            "\t--endpoint_duration: Endpoint duration in seconds. It should be a positive number within [0.5, 5].\n" +
            "\t--require_endpoint: ['true'|'false'] If set to 'false', Rhino does not require an endpoint (chunk of silence) before finishing inference.\n";
    }
}
