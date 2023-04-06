using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices;

using NUnit.Framework;

using Newtonsoft.Json;

using UnityEngine;
using UnityEngine.TestTools;

#if !UNITY_EDITOR && UNITY_ANDROID

using UnityEngine.Networking;

#endif

using Pv.Unity;

namespace Tests
{
    [Serializable]
    public class TestData
    {
        public Tests tests;
    }

    [Serializable]
    public class Tests
    {
        public ParametersTest[] parameters;
    }

    [Serializable]
    public class ParametersTest
    {
        public string language;
        public string wakeword;
        public string context_name;
        public string audio_file;
        public TestDataInference inference;
    }

    [Serializable]
    public class TestDataInference
    {
        public string intent;
        public Dictionary<string, string> slots;
    }

    public class Integration
    {
        private static string ACCESS_KEY = "{TESTING_ACCESS_KEY_HERE}";
        private Picovoice picovoice;

#if !UNITY_EDITOR && UNITY_ANDROID

        private static string _env = "android";

#elif !UNITY_EDITOR && UNITY_IOS

        private static string _env = "ios";

#elif UNITY_STANDALONE_LINUX || UNITY_EDITOR_LINUX

        private static string _env = "linux";

#elif UNITY_STANDALONE_OSX || UNITY_EDITOR_OSX

        private static string _env = "mac";

#elif UNITY_STANDALONE_WIN || UNITY_EDITOR_WIN

        private static string _env = "windows";

#else

#error

#endif

        public static string ExtractResource(string filePath)
        {

#if !UNITY_EDITOR && UNITY_ANDROID

            string dstPath = filePath.Replace(Application.streamingAssetsPath, Application.persistentDataPath);
            string dstDir = Path.GetDirectoryName(dstPath);
            if (!Directory.Exists(dstDir))
            {
                Directory.CreateDirectory(dstDir);
            }

            var loadingRequest = UnityWebRequest.Get(filePath);
            loadingRequest.SendWebRequest();

            while (!loadingRequest.isDone)
            {
                if (loadingRequest.isNetworkError || loadingRequest.isHttpError)
                {
                    break;
                }
            }
            if (!(loadingRequest.isNetworkError || loadingRequest.isHttpError))
            {
                File.WriteAllBytes(dstPath, loadingRequest.downloadHandler.data);
            }

            return dstPath;

#else

            return filePath;

#endif
        }

        private static TestData LoadJsonTestData()
        {
            string dataAsJson = File.ReadAllText(ExtractResource(Path.Combine(Application.streamingAssetsPath, "test/test_data.json")));
            return JsonConvert.DeserializeObject<TestData>(dataAsJson);
        }

        static ParametersTest[] ParameterTestData()
        {
            TestData testData = LoadJsonTestData();
            return testData.tests.parameters;
        }

        private List<short> GetPcmFromFile(string audioFilePath, int expectedSampleRate)
        {
            List<short> data = new List<short>();
            using (BinaryReader reader = new BinaryReader(File.OpenRead(audioFilePath)))
            {
                reader.ReadBytes(24); // skip over part of the header
                Assert.AreEqual(reader.ReadInt32(), expectedSampleRate, "Specified sample rate did not match test file.");
                reader.ReadBytes(16); // skip over the rest of the header

                while (reader.BaseStream.Position != reader.BaseStream.Length)
                {
                    data.Add(reader.ReadInt16());
                }
            }

            return data;
        }

        private static string AppendLanguage(string s, string language)
        {
            if (language == "en")
            {
                return s;
            }
            return $"{s}_{language}";
        }

        private static string GetKeywordPath(string language, string keyword)
        {
            string filepath = Path.Combine(
                Application.streamingAssetsPath,
                "test",
                AppendLanguage("keyword_files", language),
                $"{_env}/{keyword}_{_env}.ppn"
            );
            return ExtractResource(filepath);
        }

        private static string GetContextPath(string language, string contextName)
        {
            string filepath = Path.Combine(
                Application.streamingAssetsPath,
                "test",
                AppendLanguage("context_files", language),
                $"{_env}/{contextName}_{_env}.rhn"
            );
            return ExtractResource(filepath);
        }

        private static string GetModelPath(string filename)
        {
            string filepath = Path.Combine(
                Application.streamingAssetsPath,
                "test",
                "model_files",
                $"{filename}.pv"
            );
            return ExtractResource(filepath);
        }

        private static string GetPorcupineModelPath(string language)
        {
            string filename = AppendLanguage("porcupine_params", language);
            return GetModelPath(filename);
        }

        private static string GetRhinoModelPath(string language)
        {
            string filename = AppendLanguage("rhino_params", language);
            return GetModelPath(filename);
        }

        private void RunAudioFile(string audioFileName)
        {
            int frameLen = picovoice.FrameLength;
            string testAudioPath = ExtractResource(Path.Combine(Application.streamingAssetsPath, "test/audio_samples", audioFileName));
            List<short> data = GetPcmFromFile(testAudioPath, picovoice.SampleRate);

            int framecount = (int)Math.Floor((float)(data.Count / frameLen));
            var results = new List<int>();
            for (int i = 0; i < framecount; i++)
            {
                int start = i * picovoice.FrameLength;
                int count = picovoice.FrameLength;
                List<short> frame = data.GetRange(start, count);
                picovoice.Process(frame.ToArray());
            }
        }

        [Test]
        public void PicovoiceTest([ValueSource("ParameterTestData")] ParametersTest testCase)
        {
            bool wakewordCalled = false;
            Inference inference = null;

            void wakeWordCallback()
            {
                wakewordCalled = true;
            }

            void inferenceCallback(Inference newInference)
            {
                inference = newInference;
            }

            picovoice = Picovoice.Create(
                ACCESS_KEY,
                GetKeywordPath(testCase.language, testCase.wakeword),
                wakeWordCallback,
                GetContextPath(testCase.language, testCase.context_name),
                inferenceCallback,
                porcupineModelPath: GetPorcupineModelPath(testCase.language),
                rhinoModelPath: GetRhinoModelPath(testCase.language)
            );

            RunAudioFile(testCase.audio_file);

            Assert.IsTrue(wakewordCalled, "Wakeword was not called.");
            Assert.IsTrue(inference != null, "Inference not found.");
            Assert.IsTrue(inference.IsUnderstood, "Couldn't understand.");
            Assert.AreEqual(testCase.inference.intent, inference.Intent, "Incorrect intent.");
            Assert.IsTrue(inference.Slots.All((keyValuePair) =>
                                        testCase.inference.slots.ContainsKey(keyValuePair.Key) &&
                                        testCase.inference.slots[keyValuePair.Key] == keyValuePair.Value));

            picovoice.Dispose();
        }
    }
}
