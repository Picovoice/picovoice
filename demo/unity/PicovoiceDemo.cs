using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;

using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Networking;

using Pv.Unity;

public class PicovoiceDemo : MonoBehaviour
{
    Text _activityText;
    Image[] _locationStates;
            
    PicovoiceManager _picovoiceManager;

    private static readonly string _platform;
    private static readonly string _keywordPath;
    private static readonly string _contextPath;
    private readonly Dictionary<string, Color> _colourLookup = new Dictionary<string, Color>()
    {
        { "none", new Color(0,0,0,1) },
        { "blue", new Color(0,0,1,1) },
        { "green", new Color(0,1,0,1) },
        { "orange", new Color(0.5f,1,0,1) },
        { "pink", new Color(1,0,0.5f,1) },
        { "purple", new Color(1,0,1,1) },
        { "red", new Color(1,0,0,1) },
        { "white", new Color(1,1,1,1) },
        { "yellow", new Color(1,1,0,1) },
    };

    static PicovoiceDemo()
    {
        _platform = GetPlatform();
        _keywordPath = GetKeywordPath();
        _contextPath = GetContextPath();
    }

    void Start()
    {
        _activityText = gameObject.GetComponentInChildren<Text>();        
        _locationStates = gameObject.GetComponentsInChildren<Image>();
        
        try
        {
            _picovoiceManager = PicovoiceManager.Create(_keywordPath, OnWakeWordDetected, _contextPath, OnInferenceResult);
        }
        catch (Exception ex)
        {
            Debug.LogError("PicovoiceManager was unable to initialize: " + ex.ToString());
        }
    }


    private void OnWakeWordDetected(int keywordIndex)
    {
        _activityText.text = "Listening...";                   
    }

    private void OnInferenceResult(Inference inference)
    {
        if (inference.IsUnderstood)
        {
            if (inference.Intent == "changeColor")
            {
                Color newColour = _colourLookup["white"];
                if (inference.Slots.ContainsKey("color"))
                {
                    newColour = _colourLookup[inference.Slots["color"]];
                }

                Image[] locations = _locationStates;
                if (inference.Slots.ContainsKey("location"))
                {
                    string locationName = inference.Slots["location"];
                    locations = _locationStates.Where(g => g.name == locationName).ToArray();
                }

                ChangeLightColour(locations, newColour);
            }
            else if (inference.Intent == "changeLightState")
            {
                bool state = false;
                if (inference.Slots.ContainsKey("state"))
                {
                    state = inference.Slots["state"] == "on";                    
                }

                Image[] locations = _locationStates;
                if (inference.Slots.ContainsKey("location"))
                {
                    string locationName = inference.Slots["location"];
                    locations = _locationStates.Where(g => g.name == locationName).ToArray();                       
                }

                ChangeLightState(locations, state);
            }
            else if (inference.Intent == "changeLightStateOff")
            {
                Image[] locations = _locationStates;
                if (inference.Slots.ContainsKey("location"))
                {
                    string locationName = inference.Slots["location"];
                    locations = _locationStates.Where(g => g.name == locationName).ToArray();
                }

                ChangeLightState(locations, false);
            }
        }
        else
        {
            Debug.Log("Didn't understand the command.\n");
        }

        _activityText.text = "Say 'Picovoice'!";              
    }

    private void ChangeLightState(Image[] locations, bool state) 
    {        
        float alphaValue = state ? 1 : 0.1f;
        for (int i = 0; i < locations.Length; i++)
        {
            Color c = locations[i].color;
            c.a = alphaValue;
            locations[i].color = c;
        }
    }

    private void ChangeLightColour(Image[] locations, Color colour)
    {
        for (int i = 0; i < locations.Length; i++)
        {
            locations[i].color = colour;
        }
    }

    void Update()
    {
        if (!_picovoiceManager.IsRecording) 
        {
            if (_picovoiceManager.IsAudioDeviceAvailable())
                _picovoiceManager.Start();
            else
                Debug.LogError("No audio recording device available!");
        }
            
    }

    void OnApplicationQuit()
    {
        if (_picovoiceManager != null)
        {
            _picovoiceManager.Stop();
            _picovoiceManager.Delete();
        }
    }

    private static string GetPlatform()
    {
        switch (Application.platform)
        {
            case RuntimePlatform.WindowsEditor:
            case RuntimePlatform.WindowsPlayer:
                return "windows";
            case RuntimePlatform.OSXEditor:
            case RuntimePlatform.OSXPlayer:
                return "mac";
            case RuntimePlatform.LinuxEditor:
            case RuntimePlatform.LinuxPlayer:
                return "linux";
            case RuntimePlatform.IPhonePlayer:
                return "ios";
            case RuntimePlatform.Android:
                return "android";
            default:
                throw new NotSupportedException(string.Format("Platform '{0}' not supported by Picovoice Unity binding", Application.platform));
        }
    }


    public static string GetKeywordPath()
    {                        
        string fileName = string.Format("picovoice_{0}.ppn", _platform);
        string srcPath = Path.Combine(Application.streamingAssetsPath, string.Format("keyword_files/{0}/{1}", _platform, fileName));
#if !UNITY_EDITOR && UNITY_ANDROID
        string dstPath = Path.Combine(Application.persistentDataPath, string.Format("keyword_files/{0}", _platform));
        if (!Directory.Exists(dstPath))
        {
            Directory.CreateDirectory(dstPath);
        }
        dstPath = Path.Combine(dstPath, fileName);

        return ExtractResource(srcPath, dstPath);
#else
        return srcPath;
#endif
    }

    public static string GetContextPath()
    {
        string fileName = string.Format("smart_lighting_{0}.rhn", _platform);
        string srcPath = Path.Combine(Application.streamingAssetsPath, string.Format("contexts/{0}/{1}", _platform, fileName));
#if !UNITY_EDITOR && UNITY_ANDROID
        string dstPath = Path.Combine(Application.persistentDataPath, string.Format("contexts/{0}", _platform));
        if (!Directory.Exists(dstPath))
        {
            Directory.CreateDirectory(dstPath);
        }
        dstPath = Path.Combine(dstPath, fileName);

        return ExtractResource(srcPath, dstPath);
#else
        return srcPath;
#endif
    }

#if !UNITY_EDITOR && UNITY_ANDROID
    public static string ExtractResource(string srcPath, string dstPath)
    {
        var loadingRequest = UnityWebRequest.Get(srcPath);
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
    }
#endif
}
