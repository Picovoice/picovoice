/*
    Copyright 2020 Picovoice Inc.

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
        private readonly static string _cwd;
        private readonly static string _env;
        private readonly static string _contextPath;

        static MainTest()
        {
            _cwd = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            _env = RuntimeInformation.IsOSPlatform(OSPlatform.OSX) ? "mac" :
                   RuntimeInformation.IsOSPlatform(OSPlatform.Linux) ? "linux" :
                   RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? "windows" : "";
            _contextPath = Path.Combine(_cwd, $"resources/rhino/resources/contexts/{_env}/coffee_maker_{_env}.rhn");
        }

        private bool _isWakeWordDetected;
        private void _wakeWordCallback() => _isWakeWordDetected = true;

        private Inference _inference;
        private void _inferenceCallback(Inference inference) => _inference = inference;

        private Picovoice _pv;

        [TestInitialize]
        public void TestInit()
        {
            _pv = new Picovoice(Porcupine.KEYWORD_PATHS["picovoice"], 
                                        _wakeWordCallback,
                                        _contextPath, 
                                        _inferenceCallback);
            
            _isWakeWordDetected = false;
            _inference = null;
        }

        [TestMethod]
        public void TestProcess() 
        {
            string testAudioPath = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location), "resources/audio_samples/picovoice-coffee.wav");
            List<short> data = GetPcmFromFile(testAudioPath, _pv.SampleRate);

            int framecount = (int)Math.Floor((float)(data.Count / _pv.FrameLength));
            var results = new List<int>();
            for (int i = 0; i < framecount; i++)
            {
                int start = i * _pv.FrameLength;
                int count = _pv.FrameLength;
                List<short> frame = data.GetRange(start, count);

                _pv.Process(frame.ToArray());                                
            }

            Assert.IsTrue(_isWakeWordDetected);
            Assert.AreEqual(_inference.Intent, "orderDrink");
            Dictionary<string, string> expectedSlotValues = new Dictionary<string, string>()
            {
                {"size", "large"},
                {"coffeeDrink", "coffee"}
            };
            Assert.IsTrue(_inference.Slots.All((keyValuePair) =>
                                          expectedSlotValues.ContainsKey(keyValuePair.Key) &&
                                          expectedSlotValues[keyValuePair.Key] == keyValuePair.Value));
        }

        [TestMethod]
        public void TestProcessAgain()
        {
            TestProcess();
        }

        [TestCleanup]
        public void TestCleanup()
        {
            _pv.Dispose();
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
    }
}
