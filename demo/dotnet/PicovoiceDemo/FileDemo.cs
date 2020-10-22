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
        /// <param name="keywordPath">Absolute path to a Porcupine keyword model file.</param>
        /// <param name="contextPath">Absolute path to file containing Rhino context parameters.</param>
        /// <param name="porcupineModelPath">Absolute path to the file containing Porcupine's model parameters.</param>
        /// <param name="porcupineSensitivity">Wake word detection sensitivity.</param>
        /// <param name="rhinoModelPath">Absolute path to the file containing Rhino's model parameters.</param>
        /// <param name="rhinoSensitivity">Inference sensitivity.</param>
        public static void RunDemo(string inputAudioPath, string keywordPath, string contextPath,
                                   string porcupineModelPath, float porcupineSensitivity,
                                   string rhinoModelPath, float rhinoSensitivity)
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

            // open and validate wav
            using BinaryReader reader = new BinaryReader(File.Open(inputAudioPath, FileMode.Open));
            ValidateWavFile(reader, picovoice.SampleRate, 16, out short numChannels);

            // read audio and send frames to picovoice
            short[] porcupineFrame = new short[picovoice.FrameLength];
            int frameIndex = 0;
            while (reader.BaseStream.Position != reader.BaseStream.Length)
            {
                porcupineFrame[frameIndex++] = reader.ReadInt16();

                if (frameIndex == porcupineFrame.Length)
                {
                    picovoice.Process(porcupineFrame);
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
                Console.ReadKey();
                return;
            }

            string inputAudioPath = null;
            string keywordPath = null;
            string contextPath = null;
            string porcupineModelPath = null;
            float porcupineSensitivity = 0.5f;
            string rhinoModelPath = null;
            float rhinoSensitivity = 0.5f;                  
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

            // argument validation
            if (string.IsNullOrEmpty(inputAudioPath))
            {
                throw new ArgumentNullException("input_audio_path");
            }
            if (!File.Exists(inputAudioPath)) 
            {
                throw new ArgumentException($"Audio file at path {inputAudioPath} does not exist");
            }

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
            RunDemo(inputAudioPath, keywordPath, contextPath, 
                    porcupineModelPath, porcupineSensitivity, 
                    rhinoModelPath, rhinoSensitivity);
        }

        private static void OnUnhandledException(object sender, UnhandledExceptionEventArgs e)
        {
            Console.WriteLine(e.ExceptionObject.ToString());
            Console.ReadKey();
            Environment.Exit(-1);
        }

        private static readonly string HELP_STR = "Available options: \n " +
            $"\t--input_audio_path (required): Absolute path to input audio file.\n" +
            $"\t--keyword_path (required): Absolute path to a Porcupine keyword file.\n" +
            $"\t--context_path (required): Absolute path to a Rhino context file.\n" +
            $"\t--porcupine_model_path: Absolute path to Porcupine's model file.\n" +
            $"\t--porcupine_sensitivity: Sensitivity for detecting wake word. Each value should be a number within [0, 1]. A higher \n" +
            $"\t\tsensitivity results in fewer misses at the cost of increasing the false alarm rate.\n" +
            $"\t--rhino_model_path: Absolute path to Rhino's model file.\n" +
            $"\t--rhino_sensitivity: Inference sensitivity. It should be a number within [0, 1]. A higher sensitivity \n" +
            $"\t\tvalue results in fewer misses at the cost of (potentially) increasing the erroneous inference rate.\n";
    }
}
