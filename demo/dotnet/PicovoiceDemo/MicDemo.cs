﻿/*
    Copyright 2020-2023 Picovoice Inc.

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
using System.Threading;

using Pv;

namespace PicovoiceDemo
{
    /// <summary>
    /// Microphone Demo for Picovoice end-to-end platform. It creates an input audio stream from a microphone, monitors it, and
    /// prints when it detects a keyword or makes an inference. It optionally saves the recorded audio into a file for further debugging.
    /// </summary>
    public class MicDemo
    {
        static void WakeWordCallback() => Console.WriteLine("[wake word]");

        static void InferenceCallback(Inference inference)
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

        /// <summary>
        /// Reads through input audio file and prints to the console when it encounters the specified keyword or makes an
        /// inference in the given context.
        /// </summary>
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
        /// <param name="audioDeviceIndex">Audio is recorded from this input device.</param>
        /// <param name="outputPath">Optional argument. If provided, recorded audio will be stored in this location at the end of the run.</param>
        public static void RunDemo(
            string accessKey,
            string keywordPath,
            string contextPath,
            string porcupineModelPath,
            float porcupineSensitivity,
            string rhinoModelPath,
            float rhinoSensitivity,
            float endpointDurationSec,
            bool requireEndpoint,
            int audioDeviceIndex,
            string outputPath = null)
        {
            // init picovoice platform
            using (Picovoice picovoice = Picovoice.Create(
                accessKey,
                keywordPath,
                WakeWordCallback,
                contextPath,
                InferenceCallback,
                porcupineModelPath,
                porcupineSensitivity,
                rhinoModelPath,
                rhinoSensitivity,
                endpointDurationSec,
                requireEndpoint))
            {

                // create recorder
                using (PvRecorder recorder = PvRecorder.Create(frameLength: picovoice.FrameLength, deviceIndex: audioDeviceIndex))
                {
                    Console.WriteLine($"Using device: {recorder.SelectedDevice}");
                    Console.CancelKeyPress += delegate (object sender, ConsoleCancelEventArgs e)
                    {
                        e.Cancel = true;
                        recorder.Stop();
                        Console.WriteLine("Stopping...");
                    };

                    // open stream to output file
                    BinaryWriter outputFileWriter = null;
                    int totalSamplesWritten = 0;
                    if (!string.IsNullOrWhiteSpace(outputPath))
                    {
                        outputFileWriter = new BinaryWriter(new FileStream(outputPath, FileMode.OpenOrCreate, FileAccess.Write));
                        WriteWavHeader(outputFileWriter, 1, 16, recorder.SampleRate, 0);
                    }

                    recorder.Start();
                    Console.WriteLine($"Using device: {recorder.SelectedDevice}");
                    Console.WriteLine("Listening...\n");

                    while (recorder.IsRecording)
                    {
                        short[] frame = recorder.Read();

                        picovoice.Process(frame);

                        if (outputFileWriter != null)
                        {
                            foreach (short sample in frame)
                            {
                                outputFileWriter.Write(sample);
                            }
                            totalSamplesWritten += frame.Length;
                        }
                        Thread.Yield();
                    }

                    if (outputFileWriter != null)
                    {
                        // write size to header and clean up
                        WriteWavHeader(outputFileWriter, 1, 16, recorder.SampleRate, totalSamplesWritten);
                        outputFileWriter.Flush();
                        outputFileWriter.Dispose();
                        Console.Write($"Wrote audio to '{outputPath}'");
                    }
                }
            }
        }

        /// <summary>
        /// Writes the RIFF header for a file in WAV format
        /// </summary>
        /// <param name="writer">Output stream to WAV file</param>
        /// <param name="channelCount">Number of channels</param>
        /// <param name="bitDepth">Number of bits per sample</param>
        /// <param name="sampleRate">Sampling rate in Hz</param>
        /// <param name="totalSampleCount">Total number of samples written to the file</param>
        private static void WriteWavHeader(BinaryWriter writer, ushort channelCount, ushort bitDepth, int sampleRate, int totalSampleCount)
        {
            if (writer == null)
                return;

            writer.Seek(0, SeekOrigin.Begin);
            writer.Write(Encoding.ASCII.GetBytes("RIFF"));
            writer.Write((bitDepth / 8 * totalSampleCount) + 36);
            writer.Write(Encoding.ASCII.GetBytes("WAVE"));
            writer.Write(Encoding.ASCII.GetBytes("fmt "));
            writer.Write(16);
            writer.Write((ushort)1);
            writer.Write(channelCount);
            writer.Write(sampleRate);
            writer.Write(sampleRate * channelCount * bitDepth / 8);
            writer.Write((ushort)(channelCount * bitDepth / 8));
            writer.Write(bitDepth);
            writer.Write(Encoding.ASCII.GetBytes("data"));
            writer.Write(bitDepth / 8 * totalSampleCount);
        }

        /// <summary>
        /// Lists available audio input devices.
        /// </summary>
        public static void ShowAudioDevices()
        {
            string[] devices = PvRecorder.GetAvailableDevices();
            for (int i = 0; i < devices.Length; i++)
            {
                Console.WriteLine($"index: {i}, device name: {devices[i]}");
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

            string accessKey = null;
            string keywordPath = null;
            string contextPath = null;
            string porcupineModelPath = null;
            float porcupineSensitivity = 0.5f;
            string rhinoModelPath = null;
            float rhinoSensitivity = 0.5f;
            float endpointDurationSec = 1.0f;
            bool requireEndpoint = true;
            string outputPath = null;
            int audioDeviceIndex = -1;
            bool showAudioDevices = false;
            bool showHelp = false;

            // parse command line arguments
            int argIndex = 0;
            while (argIndex < args.Length)
            {
                if (args[argIndex] == "--access_key")
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
                else if (args[argIndex] == "--show_audio_devices")
                {
                    showAudioDevices = true;
                    argIndex++;
                }
                else if (args[argIndex] == "--audio_device_index")
                {
                    if (++argIndex < args.Length && int.TryParse(args[argIndex], out int deviceIndex))
                    {
                        audioDeviceIndex = deviceIndex;
                        argIndex++;
                    }
                }
                else if (args[argIndex] == "--output_path")
                {
                    if (++argIndex < args.Length)
                    {
                        outputPath = args[argIndex++];
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

            // print audio device info and exit
            if (showAudioDevices)
            {
                ShowAudioDevices();
                Console.Read();
                return;
            }

            // run demo with validated arguments
            RunDemo(
                accessKey,
                keywordPath,
                contextPath,
                porcupineModelPath,
                porcupineSensitivity,
                rhinoModelPath,
                rhinoSensitivity,
                endpointDurationSec,
                requireEndpoint,
                audioDeviceIndex,
                outputPath);
        }

        private static void OnUnhandledException(object sender, UnhandledExceptionEventArgs e)
        {
            Console.WriteLine(e.ExceptionObject.ToString());
            Console.Read();
            Environment.Exit(1);
        }

        private static readonly string HELP_STR = "Available options: \n " +
            "\t--access_key (required): AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)\n" +
            "\t--keyword_path (required): Absolute path to a Porcupine keyword file.\n" +
            "\t--context_path (required): Absolute path to a Rhino context file.\n" +
            "\t--porcupine_model_path: Absolute path to Porcupine's model file.\n" +
            "\t--porcupine_sensitivity: Sensitivity for detecting wake word. Each value should be a number within [0, 1]. A higher \n" +
            "\t\tsensitivity results in fewer misses at the cost of increasing the false alarm rate.\n" +
            "\t--rhino_model_path: Absolute path to Rhino's model file.\n" +
            "\t--rhino_sensitivity: Inference sensitivity. It should be a number within [0, 1]. A higher sensitivity \n" +
            "\t\tvalue results in fewer misses at the cost of (potentially) increasing the erroneous inference rate.\n" +
            "\t--endpoint_duration: Endpoint duration in seconds. It should be a positive number within [0.5, 5].\n" +
            "\t--require_endpoint: ['true'|'false'] If set to 'false', Rhino does not require an endpoint (chunk of silence) before finishing inference.\n" +
            "\t--audio_device_index: Index of input audio device.\n" +
            "\t--output_path: Absolute path to recorded audio for debugging.\n" +
            "\t--show_audio_devices: Print available recording devices.\n";
    }
}
