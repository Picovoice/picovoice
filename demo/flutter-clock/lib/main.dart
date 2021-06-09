import 'dart:async';
import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:flutter/services.dart' show rootBundle;

import 'package:path_provider/path_provider.dart';
import 'package:picovoice/picovoice_manager.dart';
import 'package:picovoice/picovoice_error.dart';
import 'package:flutter_ringtone_player/flutter_ringtone_player.dart';
import 'package:fluttertoast/fluttertoast.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final Color picoBlue = Color.fromRGBO(55, 125, 255, 1);
    final Color picoGrey = Color.fromRGBO(120, 120, 120, 1);
    final Color picoRed = Color.fromRGBO(255, 0, 89, 1);
    final Color lightGrey = Color.fromRGBO(200, 200, 200, 1);
    return MaterialApp(
      title: 'Flutter Demo',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
          primarySwatch: Colors.blue,
          visualDensity: VisualDensity.adaptivePlatformDensity,
          primaryColor: picoGrey,
          focusColor: picoBlue,
          highlightColor: picoRed,
          textTheme: TextTheme(
              headline1: TextStyle(
                  fontSize: 60, fontWeight: FontWeight.bold, color: picoBlue),
              headline2: TextStyle(
                  fontSize: 60, fontWeight: FontWeight.bold, color: picoGrey),
              subtitle1: TextStyle(fontSize: 23, color: picoGrey),
              subtitle2: TextStyle(fontSize: 15, color: picoRed),
              bodyText1: TextStyle(fontSize: 18, color: lightGrey))),
      home: MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  MyHomePage({Key? key, this.title = ""}) : super(key: key);

  final String title;

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _selectedIndex = 0;
  bool _listeningForCommand = false;
  bool _timerTextInvisible = false;
  bool _alarmTextInvisible = false;
  bool _alarmSounding = false;
  DateTime _clockTime = DateTime.now();
  DateTime? _alarmTime;
  Stopwatch _stopwatch = Stopwatch();
  Stopwatch _timerStopwatch = Stopwatch();
  Duration _timerDuration = Duration();
  PicovoiceManager? _picovoiceManager;
  Timer? _updateTimer;
  @override
  void initState() {
    super.initState();
    _initPicovoice();
    _updateTime();
  }

  @override
  void dispose() {
    _updateTimer?.cancel();
    super.dispose();
  }

  void _initPicovoice() async {
    String platform = Platform.isAndroid
        ? "android"
        : Platform.isIOS
            ? "ios"
            : throw new PvError("This demo supports iOS and Android only.");
    String keywordAsset = "assets/$platform/pico clock_$platform.ppn";
    String contextAsset = "assets/$platform/clock_$platform.rhn";

    try {
      _picovoiceManager = await PicovoiceManager.create(
          keywordAsset, _wakeWordCallback, contextAsset, _inferenceCallback,
          errorCallback: _errorCallback);
      _picovoiceManager?.start();
    } on PvError catch (ex) {
      print(ex);
    }
  }

  void _wakeWordCallback() {
    setState(() {
      _listeningForCommand = true;
    });
  }

  void _inferenceCallback(Map<String, dynamic> inference) {
    print(inference);
    if (inference['isUnderstood']) {
      Map<String, String> slots = inference['slots'];
      if (inference['intent'] == 'clock') {
        setState(() {
          _selectedIndex = 0;
        });
      } else if (inference['intent'] == 'timer') {
        _performTimerCommand(slots);
      } else if (inference['intent'] == 'setTimer') {
        _setTimer(slots);
      } else if (inference['intent'] == 'alarm') {
        _performAlarmCommand(slots);
      } else if (inference['intent'] == 'setAlarm') {
        _setAlarm(slots);
      } else if (inference['intent'] == 'stopwatch') {
        _performStopwatchCommand(slots);
      } else if (inference['intent'] == 'availableCommands') {
        Fluttertoast.showToast(
            msg: "Try saying: \n" +
                " - 'set timer for 5 minutes'\n" +
                " - 'set alarm for tomorrow at 10:30am'\n" +
                " - 'start stopwatch'\n" +
                " - 'show me the time'",
            toastLength: Toast.LENGTH_LONG,
            gravity: ToastGravity.TOP,
            timeInSecForIosWeb: 5,
            backgroundColor: Color.fromRGBO(55, 125, 255, 1),
            textColor: Colors.white,
            fontSize: 16.0);
      }
    } else {
      Fluttertoast.showToast(
          msg: "Didn't understand command!\n" +
              "Say 'PicoClock, what can I say?' to see a list of example commands",
          toastLength: Toast.LENGTH_LONG,
          gravity: ToastGravity.TOP,
          timeInSecForIosWeb: 2,
          backgroundColor: Color.fromRGBO(55, 125, 255, 1),
          textColor: Colors.white,
          fontSize: 16.0);
    }
    setState(() {
      _listeningForCommand = false;
    });
  }

  void _errorCallback(PvError error) {
    print(error);
  }

  void _performAlarmCommand(Map<String, String> slots) {
    String? action = slots['action'];
    if (action == 'delete') {
      _alarmTime = null;
    }
    setState(() {
      _selectedIndex = 0;
    });
  }

  void _performTimerCommand(Map<String, String> slots) {
    String? action = slots['action'];
    if (action == 'start') {
      if (!_timerStopwatch.isRunning) _timerStopwatch.start();
    } else if (action == 'pause' || action == 'stop') {
      if (_timerStopwatch.isRunning) _timerStopwatch.stop();
    } else if (action == 'reset') {
      _stopwatch.stop();
      _timerStopwatch.reset();
    } else if (action == 'restart') {
      _timerStopwatch.reset();
      _timerStopwatch.start();
    }
    setState(() {
      _selectedIndex = 1;
    });
  }

  void _setAlarm(Map<String, String> slots) {
    int hour = 0;
    int minute = 0;
    int alarmWeekday = DateTime.now().weekday;

    if (slots['day'] != null) {
      alarmWeekday = _dayToWeekday(slots['day']!);
    }
    if (slots['hour'] != null) {
      hour = int.parse(slots['hour']!);
      if (hour == 12) hour = 0;
    }
    if (slots['minute'] != null) {
      minute = int.parse(slots['minute']!);
    }

    if (slots['amPm'] == "p m") hour += 12;

    if (hour >= 24 || minute >= 60) {
      Fluttertoast.showToast(
          msg: "$hour:$minute is an invalid time.",
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.TOP,
          timeInSecForIosWeb: 2,
          backgroundColor: Color.fromRGBO(55, 125, 255, 1),
          textColor: Colors.white,
          fontSize: 16.0);
      return;
    }

    DateTime now = DateTime.now();
    int dayOfMonth = now.day + alarmWeekday - now.weekday;
    DateTime alarmTime =
        new DateTime(now.year, now.month, dayOfMonth, hour, minute);
    if (alarmTime.isBefore(now)) {
      Fluttertoast.showToast(
          msg: DateFormat.MMMEd().add_jm().format(alarmTime) +
              " is not a valid future time.",
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.TOP,
          timeInSecForIosWeb: 2,
          backgroundColor: Color.fromRGBO(55, 125, 255, 1),
          textColor: Colors.white,
          fontSize: 16.0);
      return;
    }

    _alarmTime = alarmTime;
    setState(() {
      _selectedIndex = 0;
    });
  }

  int _dayToWeekday(String day) {
    switch (day) {
      case "monday":
        return 1;
      case "tuesday":
        return 2;
      case "wednesday":
        return 3;
      case "thursday":
        return 4;
      case "friday":
        return 5;
      case "saturday":
        return 6;
      case "sunday":
        return 7;
      case "tomorrow":
        return DateTime.now().weekday + 1;
      default:
        return DateTime.now().weekday;
    }
  }

  void _setTimer(Map<String, String> slots) {
    if (_timerStopwatch.isRunning) _timerStopwatch.reset();

    int hours = 0;
    int minutes = 0;
    int seconds = 0;
    if (slots['hours'] != null) {
      hours = int.parse(slots['hours']!);
    }
    if (slots['minutes'] != null) {
      minutes = int.parse(slots['minutes']!);
    }
    if (slots['seconds'] != null) {
      seconds = int.parse(slots['seconds']!);
    }
    _timerDuration = Duration(hours: hours, minutes: minutes, seconds: seconds);
    _timerStopwatch.start();
    setState(() {
      _selectedIndex = 1;
    });
  }

  void _performStopwatchCommand(Map<String, String> slots) {
    String? action = slots['action'];
    if (action == 'start') {
      if (!_stopwatch.isRunning) _stopwatch.start();
    } else if (action == 'pause' || action == 'stop') {
      if (_stopwatch.isRunning) _stopwatch.stop();
    } else if (action == 'reset') {
      _stopwatch.stop();
      _stopwatch.reset();
    } else if (action == 'restart') {
      _stopwatch.reset();
      _stopwatch.start();
    }
    setState(() {
      _selectedIndex = 2;
    });
  }

  void _updateTime() {
    if (_timerStopwatch.isRunning &&
        _timerStopwatch.elapsed >= _timerDuration) {
      _timerComplete();
    }

    DateTime now = DateTime.now();
    if (_alarmTime != null &&
        !_alarmSounding &&
        (_alarmTime!.isBefore(now) || _alarmTime!.isAtSameMomentAs(now))) {
      _alarmComplete();
    }

    setState(() {
      _clockTime = now;
      _updateTimer = Timer(
        Duration(milliseconds: 50),
        _updateTime,
      );
    });
  }

  void _timerComplete() {
    setState(() {
      _selectedIndex = 1;
      _timerStopwatch.stop();
      _timerStopwatch.reset();
    });

    // play alarm and flash text
    FlutterRingtonePlayer.playAlarm();
    new Timer.periodic(Duration(milliseconds: 500), (timer) {
      _timerTextInvisible = !_timerTextInvisible;

      // clear timer alarm
      if (timer.tick == 20) {
        FlutterRingtonePlayer.stop();
        _timerTextInvisible = false;
        timer.cancel();
      }
      setState(() {});
    });
  }

  void _alarmComplete() {
    setState(() {
      _selectedIndex = 0;
      _alarmSounding = true;
    });

    // play alarm and flash text
    FlutterRingtonePlayer.playAlarm();
    new Timer.periodic(Duration(milliseconds: 500), (timer) {
      _alarmTextInvisible = !_alarmTextInvisible;

      // clear alarm
      if (timer.tick == 20) {
        FlutterRingtonePlayer.stop();
        _alarmTextInvisible = false;
        _alarmSounding = false;
        _alarmTime = null;
        timer.cancel();
      }
      setState(() {});
    });
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  String _formatDuration(Duration duration) {
    String pad(int n) => n.toString().padLeft(2, "0");
    final int hours = duration.inHours;
    final int minutes = duration.inMinutes.remainder(60);
    final int seconds = duration.inSeconds.remainder(60);
    String formatStr = "";
    if (hours > 0)
      formatStr = "$hours:${pad(minutes)}:${pad(seconds)}";
    else if (minutes > 0) {
      formatStr = "$minutes:${pad(seconds)}";
    } else {
      formatStr = "$seconds";
    }

    return formatStr;
  }

  Widget buildClock(context) {
    return Stack(children: [
      Container(
          alignment: Alignment.center,
          child: Text(
            DateFormat.jm().format(_clockTime),
            style: Theme.of(context).textTheme.headline1,
          )),
      Container(
          alignment: Alignment.center,
          padding: EdgeInsets.only(top: 100),
          child: Text(
            DateFormat.MMMMEEEEd().format(_clockTime),
            style: Theme.of(context).textTheme.subtitle1,
          )),
      Container(
          alignment: Alignment.bottomCenter,
          padding: EdgeInsets.only(bottom: 60),
          child: _alarmTime == null || _alarmTextInvisible
              ? Text("")
              : Icon(
                  Icons.alarm,
                  color: Theme.of(context).highlightColor,
                )),
      Container(
          alignment: Alignment.bottomCenter,
          padding: EdgeInsets.only(bottom: 35),
          child: Text(
            _alarmTime == null || _alarmTextInvisible
                ? ""
                : DateFormat.MMMEd().add_jm().format(_alarmTime!),
            style: Theme.of(context).textTheme.subtitle2,
          )),
    ]);
  }

  Widget buildTimer(context) {
    final Duration currentTimer = (_timerDuration - _timerStopwatch.elapsed);
    final String timerStr = _formatDuration(currentTimer);

    return Stack(children: [
      Container(
          alignment: Alignment.center,
          child: Text(
            _timerTextInvisible
                ? ""
                : _timerStopwatch.isRunning
                    ? timerStr
                    : "00:00:00",
            style: Theme.of(context).textTheme.headline1,
          )),
    ]);
  }

  Widget buildStopwatch(context) {
    String milliStr = _stopwatch.elapsed.inMilliseconds
        .remainder(1000)
        .toString()
        .padLeft(3, "0")
        .substring(0, 2);
    String stopwatchStr = "${_formatDuration(_stopwatch.elapsed)}.$milliStr";

    return Stack(children: [
      Container(
          alignment: Alignment.center,
          child: Text(
            stopwatchStr,
            style: Theme.of(context).textTheme.headline1,
          )),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    List<Widget> _clockWidgets = <Widget>[
      buildClock(context),
      buildTimer(context),
      buildStopwatch(context)
    ];
    return Scaffold(
      // appBar: AppBar(
      //   title: Text(widget.title),
      // ),
      body: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Flexible(
                flex: 4,
                child: Container(
                    margin: EdgeInsets.only(top: 40),
                    child: _clockWidgets.elementAt(_selectedIndex))),
            Column(
              children: [
                Container(
                    child: _listeningForCommand
                        ? Icon(Icons.mic,
                            size: 100, color: Theme.of(context).focusColor)
                        : Icon(Icons.mic_none,
                            size: 100, color: Theme.of(context).primaryColor)),
                Container(
                    margin: EdgeInsets.only(bottom: 10),
                    child: Text("Say 'PicoClock'!",
                        style: Theme.of(context).textTheme.bodyText1))
              ],
            )
          ]),
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.schedule, size: 35),
            label: 'Clock',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.hourglass_bottom, size: 35),
            label: 'Timer',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.timer, size: 35),
            label: 'Stopwatch',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Theme.of(context).focusColor,
        onTap: _onItemTapped,
      ),
    );
  }
}
