/*
    Copyright 2020 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;

using OpenTK.Audio.OpenAL;
using Pv;

namespace PicovoiceDemo
{
    /// <summary>
    /// Microphone Demo for Porcupine wake word engine. It creates an input audio stream from a microphone, monitors it, and
    /// upon detecting the specified wake word(s) prints the detection time and wake word on console. It optionally saves
    /// the recorded audio into a file for further debugging.
    /// </summary>                
    public class MicDemo
    {

        /// <summary>
        /// Reads through input audio file and prints to the console when it encounters the specified keyword or makes an
        /// inference in the given context.
        /// </summary>        
        /// <param name="keywordPath">Absolute path to a Porcupine keyword model file.</param>
        /// <param name="contextPath">Absolute path to file containing Rhino context parameters.</param>
        /// <param name="porcupineModelPath">Absolute path to the file containing Porcupine's model parameters.</param>
        /// <param name="porcupineSensitivity">Wake word detection sensitivity.</param>
        /// <param name="rhinoModelPath">Absolute path to the file containing Rhino's model parameters.</param>
        /// <param name="rhinoSensitivity">Inference sensitivity.</param>
        /// <param name="audioDeviceIndex">Optional argument. If provided, audio is recorded from this input device. Otherwise, the default audio input device is used.</param>        
        /// <param name="outputPath">Optional argument. If provided, recorded audio will be stored in this location at the end of the run.</param>                
        public static void RunDemo(string keywordPath, string contextPath,
                                   string porcupineModelPath, float porcupineSensitivity,
                                   string rhinoModelPath, float rhinoSensitivity,
                                   int? audioDeviceIndex = null, string outputPath = null)
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
                    Console.WriteLine("Didn't understand the command");
                }
            }

            // init picovoice platform
            using Picovoice picovoice = new Picovoice(keywordPath, wakeWordCallback, contextPath, inferenceCallback,
                                                        porcupineModelPath, porcupineSensitivity,
                                                        rhinoModelPath, rhinoSensitivity);
            BinaryWriter outputFileWriter = null;
            int totalSamplesWritten = 0;
            try
            {                
                // open stream to output file
                if (!string.IsNullOrWhiteSpace(outputPath))
                {
                    outputFileWriter = new BinaryWriter(new FileStream(outputPath, FileMode.OpenOrCreate, FileAccess.Write));
                    WriteWavHeader(outputFileWriter, 1, 16, 16000, 0);
                }

                // choose audio device
                string deviceName = null;
                if(audioDeviceIndex != null) 
                {
                    List<string> captureDeviceList = ALC.GetStringList(GetEnumerationStringList.CaptureDeviceSpecifier).ToList();
                    if (captureDeviceList != null && audioDeviceIndex.Value < captureDeviceList.Count)
                    {
                        deviceName = captureDeviceList[audioDeviceIndex.Value];
                    }
                    else
                    {
                        throw new ArgumentException("No input device found with the specified index. Use --show_audio_devices to show" +
                                                    "available inputs", "--audio_device_index");
                    }
                }

                Console.WriteLine("Listening...");
                
                // create and start recording
                short[] recordingBuffer = new short[picovoice.FrameLength];
                ALCaptureDevice captureDevice = ALC.CaptureOpenDevice(deviceName, 16000, ALFormat.Mono16, picovoice.FrameLength * 2);
                {
                    ALC.CaptureStart(captureDevice);
                    while (!Console.KeyAvailable)
                    {
                        int samplesAvailable = ALC.GetAvailableSamples(captureDevice);
                        if (samplesAvailable > picovoice.FrameLength)
                        {
                            ALC.CaptureSamples(captureDevice, ref recordingBuffer[0], picovoice.FrameLength);
                            picovoice.Process(recordingBuffer);                                                        
                            
                            if (outputFileWriter != null) 
                            {
                                foreach (short sample in recordingBuffer) 
                                {
                                    outputFileWriter.Write(sample);
                                }
                                totalSamplesWritten += recordingBuffer.Length;
                            }
                        }
                        Thread.Yield();
                    }

                    // stop and clean up resources
                    Console.WriteLine("Stopping...");
                    ALC.CaptureStop(captureDevice);
                    ALC.CaptureCloseDevice(captureDevice);
                }                
            }
            finally 
            {
                if (outputFileWriter != null)
                {
                    // write size to header and clean up
                    WriteWavHeader(outputFileWriter, 1, 16, 16000, totalSamplesWritten);
                    outputFileWriter.Flush();
                    outputFileWriter.Dispose();
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
            Console.WriteLine("Available audio devices: \n");
            List<string> captureDeviceList = ALC.GetStringList(GetEnumerationStringList.CaptureDeviceSpecifier).ToList();
            for(int i=0; i<captureDeviceList.Count; i++)
            {            
                Console.WriteLine($"\tDevice {i}: {captureDeviceList[i]}");
            }
        }

        public static void Main(string[] args)
        {
            AppDomain.CurrentDomain.UnhandledException += OnUnhandledException;
            if (args.Length == 0)
            {
                Console.WriteLine(HELP_STR);
                Console.ReadKey();
                return;
            }
            
            string keywordPath = null;
            string contextPath = null;
            string porcupineModelPath = null;
            float porcupineSensitivity = 0.5f;
            string rhinoModelPath = null;
            float rhinoSensitivity = 0.5f;
            string outputPath = null;
            int? audioDeviceIndex = null;
            bool showAudioDevices = false;
            bool showHelp = false;

            // parse command line arguments
            int argIndex = 0;
            while (argIndex < args.Length)
            {
                if (args[argIndex] == "--keyword_path")
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
                Console.ReadKey();
                return;
            }

            // print audio device info and exit
            if (showAudioDevices)
            {
                ShowAudioDevices();
                Console.ReadKey();
                return;
            }

            // argument validation            
            if (string.IsNullOrEmpty(keywordPath))
            {
                throw new ArgumentNullException("keyword_path");
            }
            if (!File.Exists(keywordPath))
            {
                throw new ArgumentException($"Porcupine keyword file at path {keywordPath} does not exist");
            }

            if (string.IsNullOrEmpty(contextPath))
            {
                throw new ArgumentNullException("context_path");
            }
            if (!File.Exists(contextPath))
            {
                throw new ArgumentException($"Rhino context file at path {contextPath} does not exist");
            }

            porcupineModelPath ??= Porcupine.MODEL_PATH;
            if (porcupineSensitivity < 0 || porcupineSensitivity > 1)
            {
                throw new ArgumentException($"Porcupine sensitivity value of '{porcupineSensitivity}' is not valid. Value must be with [0, 1].");
            }

            rhinoModelPath ??= Rhino.MODEL_PATH;
            if (rhinoSensitivity < 0 || rhinoSensitivity > 1)
            {
                throw new ArgumentException($"Rhino sensitivity value of '{rhinoSensitivity}' is not valid. Value must be with [0, 1].");
            }

            // run demo with validated arguments
            RunDemo(keywordPath, contextPath,
                    porcupineModelPath, porcupineSensitivity,
                    rhinoModelPath, rhinoSensitivity, 
                    audioDeviceIndex, outputPath);
        }

        private static void OnUnhandledException(object sender, UnhandledExceptionEventArgs e)
        {
            Console.WriteLine(e.ExceptionObject.ToString());
            Console.ReadKey();
            Environment.Exit(-1);
        }

        private static readonly string HELP_STR = "Available options: \n " +            
            "\t--keyword_path (required): Absolute path to a Porcupine keyword file.\n" +
            "\t--context_path (required): Absolute path to a Rhino context file.\n" +
            "\t--porcupine_model_path: Absolute path to Porcupine's model file.\n" +
            "\t--porcupine_sensitivity: Sensitivity for detecting wake word. Each value should be a number within [0, 1]. A higher \n" +
            "\t\tsensitivity results in fewer misses at the cost of increasing the false alarm rate.\n" +
            "\t--rhino_model_path: Absolute path to Rhino's model file.\n" +
            "\t--rhino_sensitivity: Inference sensitivity. It should be a number within [0, 1]. A higher sensitivity \n" +
            "\t\tvalue results in fewer misses at the cost of (potentially) increasing the erroneous inference rate.\n" +
            "\t--audio_device_index: Index of input audio device.\n" +
            "\t--output_path: Absolute path to recorded audio for debugging.\n" +
            "\t--show_audio_devices: Print available recording devices.\n";
    }
}
