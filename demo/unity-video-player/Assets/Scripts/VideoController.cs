using System;
using System.IO;
using System.Linq;
using System.Collections;
using System.Collections.Generic;

using UnityEngine;
using UnityEngine.Video;
using UnityEngine.Networking;

using Pv.Unity;
using System.Text;
using TMPro;
using UnityEngine.UI;

public class VideoController : MonoBehaviour
{
    private static string ACCESS_KEY = "${YOUR_ACCESS_KEY_HERE}"; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)

    VideoPlayer _videoPlayer;
    PicovoiceManager _picovoiceManager;
    MeshRenderer _screenOverlay;
    MeshRenderer _border;
    TextMeshPro _playbackSpeedText;
    Text _notificationText;
    Image _notificationPanel;
    Canvas _helpCanvas;

    Component _timeline;
    Component _timelineFull;
    Component _volume;
    Component _volumeFull;
    Dictionary<string, SpriteRenderer> _stateIcons;
    VoiceProcessor _voiceProcessor;

    private bool isListening;

    private string _platform;
    private string _keywordPath;
    private string _contextPath;

    private readonly Color picoBlue = new Color(0.21568627451f, 0.49019607843f, 1f, 0.5f);

    void Start()
    {
        try {
            _platform = GetPlatform();
            _keywordPath = GetKeywordPath();
            _contextPath = GetContextPath();

            _voiceProcessor = VoiceProcessor.Instance;
            _voiceProcessor.OnFrameCaptured += AnalyzeMicSignal;

            _videoPlayer = gameObject.GetComponentInChildren<VideoPlayer>();

            MeshRenderer[] meshes = gameObject.GetComponentsInChildren<MeshRenderer>();
            _border = meshes.First(x=>x.name == "Border");
            _screenOverlay = meshes.First(x => x.name == "ScreenOverlay");

            Component[] objs = gameObject.GetComponentsInChildren<Component>();
            _timeline = objs.First(x => x.name == "TimelinePivot");
            _timelineFull = objs.First(x => x.name == "TimelineFullPivot");
            _timeline.transform.localScale = new Vector3(0, 0.2f, 1);
            _timelineFull.transform.localScale = new Vector3(1, 0.2f, 1);

            _volume = objs.First(x => x.name == "VolumePivot");
            _volumeFull = objs.First(x => x.name == "VolumeFullPivot");
            _volume.transform.localScale = new Vector3(1, 0, 1);
            _volumeFull.transform.localScale = new Vector3(1, 0, 1);

            _stateIcons = gameObject.GetComponentsInChildren<SpriteRenderer>().ToDictionary(x => x.name);
            _playbackSpeedText = gameObject.GetComponentsInChildren<TextMeshPro>().First(x=>x.name == "PlaybackSpeed");
            _notificationText = gameObject.GetComponentsInChildren<Text>().First(x => x.name == "NotificationText");
            _notificationText.text = "Say 'Porcupine, what can I say?' for help";
            _notificationPanel = gameObject.GetComponentsInChildren<Image>().First(x => x.name == "NotificationPanel");

            _helpCanvas = gameObject.GetComponentsInChildren<Canvas>().First(x => x.name == "HelpCanvas");

            StartCoroutine(FadeIntroNotification());
            _picovoiceManager = PicovoiceManager.Create(ACCESS_KEY, _keywordPath, OnWakeWordDetected, _contextPath, OnInferenceResult);
        }
        catch (Exception e)
        {
            ShowError(e.Message);
        }
    }

    IEnumerator FadeIntroNotification()
    {
        yield return new WaitForSeconds(3);

        Color _alphaSubtract = new Color(0, 0, 0, 0.008f);
        while (_notificationText.color.a > 0)
        {
            _notificationPanel.color -= _alphaSubtract;
            _notificationText.color -= _alphaSubtract;
            yield return null;
        }
    }

    void Update()
    {
        if (!_picovoiceManager.IsRecording)
        {
            if (_picovoiceManager.IsAudioDeviceAvailable())
            {
                try
                {
                    _picovoiceManager.Start();
                }
                catch (PicovoiceInvalidArgumentException ex)
                {
                    ShowError($"{ex.Message}\nEnsure your access key '{ACCESS_KEY}' is a valid access key.");
                }
                catch (PicovoiceActivationException)
                {
                    ShowError("AccessKey activation error");
                }
                catch (PicovoiceActivationLimitException)
                {
                    ShowError("AccessKey reached its device limit");
                }
                catch (PicovoiceActivationRefusedException)
                {
                    ShowError("AccessKey refused");
                }
                catch (PicovoiceActivationThrottledException)
                {
                    ShowError("AccessKey has been throttled");
                }
                catch (PicovoiceException ex)
                {
                    ShowError("PicovoiceManager was unable to initialize: " + ex.Message);
                }
            }
            else
            {
                ShowError("No audio recording device available!");
            }
        }
        float timelineScaleX = (float)(_videoPlayer.time / _videoPlayer.length);
        _timeline.transform.localScale = new Vector3(timelineScaleX, _timeline.transform.localScale.y, _timeline.transform.localScale.z);
    }

    void OnApplicationQuit()
    {
        _voiceProcessor.OnFrameCaptured -= AnalyzeMicSignal;

        if (_picovoiceManager != null)
        {
            _picovoiceManager.Stop();
        }
    }

    void ShowError(string error)
    {
        _notificationText.text = error;
        _notificationText.color = Color.red;
        Debug.Log(error);
    }

    private void OnWakeWordDetected()
    {
        isListening = true;
        Debug.Log("Listening...");
        _border.material.SetColor("_EmissionColor", picoBlue * 0.5f);
    }

    private void OnInferenceResult(Inference inference)
    {
        if (inference.IsUnderstood)
        {
            PrintInference(inference);
            if (inference.Intent == "changeVideoState")
            {
                ChangeVideoState(inference.Slots);
            }
            else if (inference.Intent == "seek")
            {
                SeekVideo(inference.Slots);
            }
            else if (inference.Intent == "changeVolume")
            {
                ChangeVolume(inference.Slots);
            }
            else if (inference.Intent == "changePlaybackSpeed")
            {
                ChangePlaybackSpeed(inference.Slots);
            }
            else if(inference.Intent == "help")
            {
                ToggleHelp(inference.Slots);
            }
        }
        else
        {
            Debug.Log("Didn't understand the command.\n");
            _notificationText.text = "Didn't understand the command";
            StartCoroutine(FadeNotification());
        }

        isListening = false;
        _border.material.SetColor("_EmissionColor", picoBlue * 0f);
    }

    IEnumerator FadeNotification()
    {
        _notificationPanel.color = new Color(0.3f, 0.3f, 0.3f, 0.8f);
        _notificationText.color = Color.white;
        yield return new WaitForSeconds(1);

        Color _alphaSubtract = new Color(0, 0, 0, 0.008f);
        while (_notificationText.color.a > 0)
        {
            _notificationPanel.color -= _alphaSubtract;
            _notificationText.color -= _alphaSubtract;
            yield return null;
        }
    }

    private void PrintInference(Inference inference)
    {
        StringBuilder str = new StringBuilder();
        str.Append("{\n");
        str.Append($"  intent : '{inference.Intent}'\n");
        str.Append("  slots : {\n");
        foreach (KeyValuePair<string, string> slot in inference.Slots)
            str.Append($"    {slot.Key} : '{slot.Value}'\n");
        str.Append("  }\n");
        str.Append("}\n");
        Debug.Log(str.ToString());
    }

    private void ChangeVideoState(Dictionary<string, string> slots)
    {
        if (slots.ContainsKey("action"))
        {
            string action = slots["action"];
            if (action == "play")
            {
                if (!_videoPlayer.isPlaying)
                    _videoPlayer.Play();
            }
            else if (action == "pause")
            {
                if (!_videoPlayer.isPaused)
                    _videoPlayer.Pause();
            }
            else if (action == "stop")
            {
                if (_videoPlayer.isPlaying || _videoPlayer.isPaused)
                    _videoPlayer.Stop();
            }
            else if (action == "mute")
            {
                _videoPlayer.SetDirectAudioMute(0, true);
            }
            else if (action == "unmute")
            {
                _videoPlayer.SetDirectAudioMute(0, false);
            }
            else if (action == "resume")
            {
                if (!_videoPlayer.isPlaying)
                    _videoPlayer.Play();
            }
            else if (action == "restart")
            {
                if (_videoPlayer.isPlaying)
                    _videoPlayer.Stop();
                else
                    _videoPlayer.time = 0;
                _videoPlayer.Play();
            }

            _stateIcons[action].color = Color.white;
            _screenOverlay.material.color = new Color(0, 0, 0, 0.5f);
            StartCoroutine(FadeStateIcon(_stateIcons[action]));
            StartCoroutine(FadeOverlay());
        }
    }

    IEnumerator FadeStateIcon(SpriteRenderer icon)
    {
        Color _alphaSubtract = new Color(0, 0, 0, 0.008f);
        while (icon.color.a > 0)
        {
            icon.color -= _alphaSubtract;
            yield return null;
        }
    }

    IEnumerator FadeOverlay()
    {
        Color _alphaSubtract = new Color(0, 0, 0, 0.004f);
        while (_screenOverlay.material.color.a > 0)
        {
            _screenOverlay.material.color -= _alphaSubtract;
            yield return null;
        }
    }

    private void SeekVideo(Dictionary<string, string> slots)
    {
        int hours = 0;
        int minutes = 0;
        int seconds = 0;
        if (slots.ContainsKey("hours"))
        {
            hours = int.Parse(slots["hours"]);
            hours *= 3600;
        }

        if (slots.ContainsKey("minutes"))
        {
            minutes = int.Parse(slots["minutes"]);
            minutes *= 60;
        }

        if (slots.ContainsKey("seconds"))
        {
            seconds = int.Parse(slots["seconds"]);
        }

        if (slots.ContainsKey("direction"))
        {
            if (slots["direction"] == "forward" || slots["direction"] == "forwards" || slots["direction"] == "ahead")
            {
                _videoPlayer.time += hours + minutes + seconds;
            }
            else
            {
                _videoPlayer.time -= hours + minutes + seconds;
            }
        }
        else
        {
            _videoPlayer.time = hours + minutes + seconds;
        }

        _timeline.transform.localScale = new Vector3(_timeline.transform.localScale.x, 1, _timeline.transform.localScale.z);
        _timelineFull.transform.localScale = new Vector3(_timelineFull.transform.localScale.x, 1, _timelineFull.transform.localScale.z);
        StartCoroutine(ShrinkTimeline());
    }

    IEnumerator ShrinkTimeline()
    {
        yield return new WaitForSeconds(3);
        _timeline.transform.localScale = new Vector3(_timeline.transform.localScale.x, 0.2f, _timeline.transform.localScale.z);
        _timelineFull.transform.localScale = new Vector3(_timelineFull.transform.localScale.x, 0.2f, _timelineFull.transform.localScale.z);
    }

    private void ChangeVolume(Dictionary<string, string> slots)
    {
        if (slots.ContainsKey("volumePercent"))
        {
            float volumePercent = float.Parse(slots["volumePercent"].Replace("%", "")) * 0.01f;
            _videoPlayer.SetDirectAudioVolume(0, volumePercent);

            _volume.transform.localScale = new Vector3(volumePercent, 1, _volume.transform.localScale.z);
            _volumeFull.transform.localScale = new Vector3(_volumeFull.transform.localScale.x, 1, _volumeFull.transform.localScale.z);
            StartCoroutine(ShrinkVolume());
        }
    }

    IEnumerator ShrinkVolume()
    {
        yield return new WaitForSeconds(4);
        _volume.transform.localScale = new Vector3(_volume.transform.localScale.x, 0, _volume.transform.localScale.z);
        _volumeFull.transform.localScale = new Vector3(_volumeFull.transform.localScale.x, 0, _volumeFull.transform.localScale.z);
    }

    private void ChangePlaybackSpeed(Dictionary<string, string> slots)
    {
        float playbackSpeed = 1f;
        if (slots.ContainsKey("playbackSpeedInt"))
        {
            playbackSpeed = float.Parse(slots["playbackSpeedInt"]);
        }

        if (slots.ContainsKey("playbackSpeedDecimal"))
        {
            playbackSpeed += float.Parse(slots["playbackSpeedDecimal"]) * 0.1f;
        }

        if (slots.ContainsKey("playbackSpeedTenth"))
        {
            playbackSpeed += float.Parse(slots["playbackSpeedTenth"]) * 0.1f;
        }

        if (slots.ContainsKey("playbackSpeedHundredth"))
        {
            playbackSpeed += float.Parse(slots["playbackSpeedHundredth"]) * 0.01f;
        }

        if (slots.ContainsKey("playbackSpeedPercent"))
        {
            playbackSpeed = float.Parse(slots["playbackSpeedPercent"].Replace("%", "")) * 0.01f;
        }

        _videoPlayer.playbackSpeed = playbackSpeed;
        _playbackSpeedText.text = string.Format("{0}x", playbackSpeed);
        _playbackSpeedText.color = Color.white;
        _screenOverlay.material.color = new Color(0, 0, 0, 0.5f);
        StartCoroutine(FadePlaybackSpeed());
        StartCoroutine(FadeOverlay());
    }

    IEnumerator FadePlaybackSpeed()
    {
        Color _alphaSubtract = new Color(0, 0, 0, 0.008f);
        while (_playbackSpeedText.color.a > 0)
        {
            _playbackSpeedText.color -= _alphaSubtract;
            yield return null;
        }
    }

    private void ToggleHelp(Dictionary<string, string> slots)
    {
        bool showHelp = true;
        if (slots.ContainsKey("toggleHelp"))
        {
            showHelp = slots["toggleHelp"] == "show";
        }

        _helpCanvas.enabled = showHelp;
    }


    private readonly Queue rmsQueue = new Queue(7);
    private void AnalyzeMicSignal(short[] audio)
    {
        if (!isListening)
            return;

        // calculate RMS of frame
        double rmsSum = 0;
        for (int i = 0; i < audio.Length; i++)
            rmsSum += Math.Pow(audio[i], 2);
        double rms =  Math.Sqrt(rmsSum / audio.Length) / 32767.0f;

        // average past values for smoothing effect
        if (rmsQueue.Count == 7)
            rmsQueue.Dequeue();
        rmsQueue.Enqueue(rms);
        double rmsAvg = 0;
        foreach (double rmsVal in rmsQueue)
        {
            rmsAvg += rmsVal;
        }
        rmsAvg /= rmsQueue.Count;

        // convert to dBFS
        double dBFS = 20 * Math.Log10(rmsAvg);
        float normalizedDbfs = (float)(dBFS + 50) / 50.0f;

        _border.material.SetColor("_EmissionColor", picoBlue * normalizedDbfs);
    }

    private string GetPlatform()
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


    public string GetKeywordPath()
    {
        string fileName = string.Format("porcupine_{0}.ppn", _platform);
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

    public string GetContextPath()
    {
        string fileName = string.Format("video_player_{0}.rhn", _platform);
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
    public string ExtractResource(string srcPath, string dstPath)
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
