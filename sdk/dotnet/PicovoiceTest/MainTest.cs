/*
    Copyright 2020-2022 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using Microsoft.VisualStudio.TestTools.UnitTesting;

using Pv;

namespace PicovoiceTest
{
    [TestClass]
    public class MainTest
    {
        private static string _cwd;
        private static string _rootDir;
        private static string _env;
        private static Architecture _arch;

        private static string ACCESS_KEY;

        private static bool _isWakeWordDetected;
        private static void _wakeWordCallback() => _isWakeWordDetected = true;

        private static Inference _inference;
        private static void _inferenceCallback(Inference inference) => _inference = inference;

        private static Picovoice _picovoice;


        [ClassInitialize]
        public static void ClassInitialize(TestContext testContext)
        {

            ACCESS_KEY = Environment.GetEnvironmentVariable("ACCESS_KEY");

            _cwd = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            _rootDir = Path.Combine(_cwd, "../../../../../..");
            _arch = RuntimeInformation.ProcessArchitecture;
            _env = RuntimeInformation.IsOSPlatform(OSPlatform.OSX) ? "mac" :
                                                     RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? "windows" :
                                                     RuntimeInformation.IsOSPlatform(OSPlatform.Linux) && _arch == Architecture.X64 ? "linux" :
                                                     RuntimeInformation.IsOSPlatform(OSPlatform.Linux) &&
                                                        (_arch == Architecture.Arm || _arch == Architecture.Arm64) ? PvLinuxEnv() : "";
        }

        private static string AppendLanguage(string s, string language) => language == "en" ? s : $"{s}_{language}";

        private static string GetKeywordPath(string language, string keyword)
        {
            return Path.Combine(
                _rootDir,
                "resources/porcupine/resources",
                AppendLanguage("keyword_files", language),
                $"{_env}/{keyword}_{_env}.ppn"
            );
        }

        private static string GetPorcupineModelPath(string language)
        {
            string file_name = AppendLanguage("porcupine_params", language);
            return Path.Combine(
                _rootDir,
                "resources/porcupine/lib/common",
                $"{file_name}.pv"
            );
        }

        private static string GetContextPath(string language, string context)
        {
            return Path.Combine(
                _rootDir,
                "resources/rhino/resources",
                AppendLanguage("contexts", language),
                $"{_env}/{context}_{_env}.rhn"
            );
        }

        private static string GetRhinoModelPath(string language)
        {
            string file_name = AppendLanguage("rhino_params", language);
            return Path.Combine(
                _rootDir,
                "resources/rhino/lib/common",
                $"{file_name}.pv"
            );
        }

        [TestInitialize]
        public void ResetCallbacks()
        {
            _isWakeWordDetected = false;
            _inference = null;
        }

        [TestCleanup]
        public void TestClean()
        {
            _picovoice?.Dispose();
        }

        public void RunTestCase(string audioFileName, string expectedIntent, Dictionary<string, string> expectedSlots)
        {
            string testAudioPath = Path.Combine(_rootDir, "resources/audio_samples/", audioFileName);

            List<short> data = GetPcmFromFile(testAudioPath, _picovoice.SampleRate);

            int framecount = (int)Math.Floor((float)(data.Count / _picovoice.FrameLength));
            var results = new List<int>();
            for (int i = 0; i < framecount; i++)
            {
                int start = i * _picovoice.FrameLength;
                int count = _picovoice.FrameLength;
                List<short> frame = data.GetRange(start, count);

                _picovoice.Process(frame.ToArray());
            }

            Assert.IsTrue(_isWakeWordDetected);
            Assert.AreEqual(_inference.Intent, expectedIntent);

            Assert.IsTrue(_inference.Slots.All((keyValuePair) =>
                                          expectedSlots.ContainsKey(keyValuePair.Key) &&
                                          expectedSlots[keyValuePair.Key] == keyValuePair.Value));
        }

        [TestMethod]
        [DataRow("en", "picovoice", "coffee_maker", "orderBeverage", new string[] {"beverage", "size"}, new string[] {"coffee", "large"}, "picovoice-coffee.wav")]
        [DataRow("de", "heuschrecke", "beleuchtung", "changeState", new string[] {"state"}, new string[] {"aus"}, "heuschrecke-beleuchtung_de.wav")]
        [DataRow("es", "manzana", "iluminación_inteligente", "changeColor", new string[] {"location", "color"}, new string[] {"habitación", "rosado"}, "manzana-luz_es.wav")]
        [DataRow("fr", "mon chouchou", "éclairage_intelligent", "changeColor", new string[] {"color"}, new string[] {"violet"}, "mon-intelligent_fr.wav")]
        [DataRow("it", "cameriere", "illuminazione", "spegnereLuce", new string[] {"luogo"}, new string[] {"bagno"}, "cameriere-luce_it.wav")]
        [DataRow("ja", "ninja", "sumāto_shōmei", "色変更", new string[] {"色"}, new string[] {"オレンジ"}, "ninja-sumāto-shōmei_ja.wav")]
        [DataRow("ko", "koppulso", "seumateu_jomyeong", "changeColor", new string[] {"color"}, new string[] {"파란색"}, "koppulso-seumateu-jomyeong_ko.wav")]
        [DataRow("pt", "abacaxi", "luz_inteligente", "ligueLuz", new string[] {"lugar"}, new string[] {"cozinha"}, "abaxi-luz_pt.wav")]
        public void TestTwice(
            string language,
            string keywordName,
            string contextName,
            string expectedIntent,
            string[] slotKeys,
            string[] slotValues,
            string audioFileName)
        {
            _picovoice = Picovoice.Create(
                ACCESS_KEY,
                GetKeywordPath(language, keywordName),
                _wakeWordCallback,
                GetContextPath(language, contextName),
                _inferenceCallback,
                porcupineModelPath: GetPorcupineModelPath(language),
                rhinoModelPath: GetRhinoModelPath(language));

            Dictionary<string, string> expectedSlots = new Dictionary<string, string>();
            for (int i = 0; i < slotKeys.Length; i++) {
                expectedSlots[slotKeys[i]] = slotValues[i];
            }

            RunTestCase(audioFileName, expectedIntent, expectedSlots);
            ResetCallbacks();
            RunTestCase(audioFileName, expectedIntent, expectedSlots);
        }

        private List<short> GetPcmFromFile(string audioFilePath, int expectedSampleRate)
        {
            List<short> data = new List<short>();
            using (BinaryReader reader = new BinaryReader(File.Open(audioFilePath, FileMode.Open)))
            {
                reader.ReadBytes(24); // skip over first part of the header to get to sample rate
                Assert.AreEqual(reader.ReadInt32(), expectedSampleRate, "Specified sample rate did not match test file.");
                reader.ReadBytes(16); // skip over the rest of the header to get to data

                while (reader.BaseStream.Position != reader.BaseStream.Length)
                {
                    data.Add(reader.ReadInt16());
                }
            }

            return data;
        }

        public static string PvLinuxEnv()
        {
            string cpuInfo = File.ReadAllText("/proc/cpuinfo");
            string[] cpuPartList = cpuInfo.Split('\n').Where(x => x.Contains("CPU part")).ToArray();
            if (cpuPartList.Length == 0)
                throw new PlatformNotSupportedException($"Unsupported CPU.\n{cpuInfo}");

            string cpuPart = cpuPartList[0].Split(' ').Last().ToLower();

            switch (cpuPart)
            {
                case "0xc07":
                case "0xd03":
                case "0xd08": return "raspberry-pi";
                case "0xd07": return "jetson";
                case "0xc08": return "beaglebone";
                default:
                    throw new PlatformNotSupportedException($"This device (CPU part = {cpuPart}) is not supported by Picovoice.");
            }
        }
    }
}
