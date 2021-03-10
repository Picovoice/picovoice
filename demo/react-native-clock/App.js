import React, {Component} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import {StyleSheet, Text, View} from 'react-native';
import {PicovoiceManager} from '@picovoice/picovoice-react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Moment from 'react-moment';
import moment from 'moment';
import NotificationSounds, { playSampleSound, stopSampleSound } from  'react-native-notification-sounds';
import BottomNavigation, {
  FullTab,
} from 'react-native-material-bottom-navigation';

const RNFS = require('react-native-fs');

export default class App extends Component {
  _picovoiceManager;
  tabs = [
    {
      key: 'clock',
      label: 'Clock',
      barColor: '#F7F7F7',
      pressColor: 'rgba(255, 255, 255, 0.16)',
      icon: 'schedule',
    },
    {
      key: 'timer',
      label: 'Timer',
      barColor: '#F7F7F7',
      pressColor: 'rgba(255, 255, 255, 0.16)',
      icon: 'hourglass-bottom',
    },
    {
      key: 'stopwatch',
      label: 'Stopwatch',
      barColor: '#F7F7F7',
      pressColor: 'rgba(255, 255, 255, 0.16)',
      icon: 'timer',
    },
  ];

  constructor(props) {
    super(props);
    this.state = {
      activeTab: this.tabs[0].key,
      isListening: false,
      isStopwatchRunning: false,
      stopwatchTime: moment.duration({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      }),
      isTimerRunning: true,
      timerStartTime: moment.duration({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      }),
      timerCurrentTime: moment.duration({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      }),
      alarmTime: undefined,
      alarmSounding: false
    };
  }

  async componentDidMount() {
    let wakeWordName = 'pico_clock';
    let wakeWordFilename = wakeWordName;
    let wakeWordPath = '';
    let contextName = 'clock';
    let contextFilename = contextName;
    let contextPath = '';

    // get platform filesystem path to resources
    if (Platform.OS == 'android') {
      // for Android, extract resources
      wakeWordFilename += '_android.ppn';
      wakeWordPath = `${RNFS.DocumentDirectoryPath}/${wakeWordFilename.replace(
        ' ',
        '_',
      )}`;
      await RNFS.copyFileRes(wakeWordFilename, wakeWordPath);

      contextFilename += '_android.rhn';
      contextPath = `${RNFS.DocumentDirectoryPath}/${contextFilename}`;
      await RNFS.copyFileRes(contextFilename, contextPath);
    } else if (Platform.OS == 'ios') {
      wakeWordFilename += '_ios.ppn';
      wakeWordPath = `${RNFS.MainBundlePath}/${wakeWordFilename}`;

      contextFilename += '_ios.rhn';
      contextPath = `${RNFS.MainBundlePath}/${contextFilename}`;
    }

    try {
      this._picovoiceManager = await PicovoiceManager.create(
        wakeWordPath,
        (keywordIndex) => {
          if (keywordIndex === 0) {
            this.setState({
              isListening: true,
            });
          }
        },
        contextPath,
        (inference) => {
          var tab = this.state.activeTab;
          if (inference['isUnderstood']) {
            if (inference['intent'] == 'clock') {
              tab = 'clock';
            } else if (inference['intent'] == 'timer') {
              this._performTimerCommand(inference['slots']);
              tab = 'timer';
            } else if (inference['intent'] == 'setTimer') {
              this._setTimer(inference['slots']);
              tab = 'timer';
            } else if (inference['intent'] == 'alarm') {
              this._performAlarmCommand(inference['slots']);
              tab = 'clock';
            } else if (inference['intent'] == 'setAlarm') {
              this._setAlarm(inference['slots']);
              tab = 'clock';
            } else if (inference['intent'] == 'stopwatch') {
              this._performStopwatchCommand(inference['slots']);
              tab = 'stopwatch';
            }
          }

          this.setState({
            activeTab: tab,
            isListening: false,
          });
        },
      );

      await this._startProcessing();
    } catch (e) {
      console.error(e);
    }
  }

  componentWillUnmount() {
    if (this.state.isListening) {
      this._stopProcessing();
    }
    this._picovoiceManager?.delete();
  }

  _updateTime() {
    if (this.state.isTimerRunning) {
      this.setState({
        timerCurrentTime: this.state.timerCurrentTime.subtract(
          100,
          'milliseconds',
        ),
      });

      // timer's up
      if (this.state.timerCurrentTime && this.state.timerCurrentTime.as('seconds') == 0) {        
        NotificationSounds.getNotifications('ringtone').then(soundsList  => {          
          playSampleSound(soundsList[0]);
          setTimeout(()=>{stopSampleSound()}, 5000);
        });

        this.setState({
          isTimerRunning: false,          
          activeTab: 'timer'
        });
      }
    }

    if (this.state.isStopwatchRunning) {
      this.setState({
        stopwatchTime: this.state.stopwatchTime.add(100, 'milliseconds'),
      });
    }

    var now = moment()
    if (this.state.alarmTime&& ! this.state.alarmSounding && this.state.alarmTime.isSameOrBefore(now))
    {        
        this.setState({            
          activeTab: 'clock',
          alarmSounding: true
        });

        NotificationSounds.getNotifications('ringtone').then(soundsList  => {          
          playSampleSound(soundsList[0]);
          setTimeout(()=>{
            stopSampleSound();
            this.setState({                            
              alarmSounding: false,
              alarmTime: undefined
            }); 
          }, 5000);
        });      
    }
  }

  async _startProcessing() {
    let recordAudioRequest;
    if (Platform.OS == 'android') {
      recordAudioRequest = this._requestRecordAudioPermission();
    } else {
      recordAudioRequest = new Promise(function (resolve, _) {
        resolve(true);
      });
    }

    recordAudioRequest.then((hasPermission) => {
      if (!hasPermission) {
        console.error('Required microphone permission was not granted.');
        return;
      }

      this._picovoiceManager?.start().then((didStart) => {
        if (didStart) {
          setInterval(this._updateTime.bind(this), 100);
        }
      });
    });
  }

  async _requestRecordAudioPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message:
            'Picovoice wants to access your mic to enable voice commands.',          
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  _stopProcessing() {
    this._picovoiceManager?.stop().then((didStop) => {
      if (didStop) {
        this.setState({});
      }
    });
  }

  _performTimerCommand(slots) {
    var action = slots['action'];
    if (action == 'start') {
      this.setState({
        isTimerRunning: true,
      });
    } else if (action == 'pause' || action == 'stop') {
      this.setState({
        isTimerRunning: false,
      });
    } else if (action == 'reset') {
      this.setState({
        timerCurrentTime: moment.duration(this.state.timerStartTime),
        isTimerRunning: false,
      });
    } else if (action == 'restart') {
      this.setState({
        timerCurrentTime: moment.duration(this.state.timerStartTime),
        isTimerRunning: true,
      });
    }
  }

  _setTimer(slots) {
    if (this.state.isTimerRunning) {
      this.setState({
        isTimerRunning: false,
      });
    }

    var hours = 0;
    var minutes = 0;
    var seconds = 0;
    if (slots['hours']) {
      hours = Number.parseInt(slots['hours']);
    }
    if (slots['minutes']) {
      minutes = Number.parseInt(slots['minutes']);
    }
    if (slots['seconds']) {
      seconds = Number.parseInt(slots['seconds']);
    }

    this.setState({
      timerCurrentTime: moment.duration({
        hour: hours,
        minute: minutes,
        second: seconds,
        millisecond: 0,
      }),
      timerStartTime: moment.duration({
        hour: hours,
        minute: minutes,
        second: seconds,
        millisecond: 0,
      }),
      isTimerRunning: true,
    });
  }

  _performAlarmCommand(slots) {    
    if (slots['action'] == 'delete') {
      _alarmTime = undefined;
    }
  }

  _setAlarm(slots) {       
    var hours = 0;
    var minutes = 0;
    var alarmWeekday = moment().day();
    if (slots['day']) {
      alarmWeekday = this._dayToWeekday(slots['day']);
    }
    if (slots['hour']) {
      hours = Number.parseInt(slots['hour']);
    }
    if (slots['minute']) {
      minutes = Number.parseInt(slots['minute']);
    }

    if (slots['amPm'] == "p m") hours += 12;
    
    if (hours >= 24 || minutes >= 60) {
      console.error(`${hours}:${minutes} is an invalid time.`)
      return;
    }

    var now = moment();
    var dayOfMonth = now.date() + alarmWeekday - now.day();
    var time = moment({
      year:now.year(),
      month: now.month(),
      date: dayOfMonth,
      hour: hours,
      minute: minutes
    });

    if(time.isBefore(now)){
      console.error(`${time.format("ddd, MMM Do h:mm a")} is an invalid alarm time.`)
      return;
    }
    
    this.setState({
      alarmTime: moment(time)
    });
  }

  _dayToWeekday(day) {
      if(day == 'tomorrow')
        return moment().day() + 1;
      else if(day == 'today'){
        return moment().day();    
      }
      else if(day =='sunday'){
        return 7;
      }
      else{        
        return moment().day(day).day();
      }
  }

  _performStopwatchCommand(slots) {
    var action = slots['action'];
    if (action == 'start') {
      this.setState({
        isStopwatchRunning: true,
      });
    } else if (action == 'pause' || action == 'stop') {
      this.setState({
        isStopwatchRunning: false,
      });
    } else if (action == 'reset') {
      this.setState({
        isStopwatchRunning: false,
        stopwatchTime: moment.duration({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        }),
      });
    } else if (action == 'restart') {
      this.setState({
        stopwatchTime: moment.duration({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        }),
        isStopwatchRunning: true,
      });
    }
  }

  _renderIcon = (icon) => ({isActive}) => (
    <Icon size={40} color={isActive ? '#377DFF' : '#777777'} name={icon} />
  );

  _renderTab = ({tab, isActive}) => (
    <FullTab
      isActive={isActive}
      key={tab.key}
      label={tab.label}
      labelStyle={{color: isActive ? '#377DFF' : '#777777'}}
      renderIcon={this._renderIcon(tab.icon)}
    />
  );

  _renderDisplayClockText() {
    if (this.state.activeTab == 'clock') {      
      return (
        <Moment
          element={Text}
          style={styles.clockText}
          format={'h:mm A'}
          interval={500}></Moment>          
      );
    } else if (this.state.activeTab == 'timer') {
      return (
        <Moment element={Text} style={styles.clockText} format={'H:mm:ss'}>
          {moment.utc(this.state.timerCurrentTime.as('milliseconds'))}
        </Moment>
      );
    } else if (this.state.activeTab == 'stopwatch') {
      return (
        <Moment element={Text} style={styles.clockText} format={'m:ss.S'}>
          {moment.utc(this.state.stopwatchTime.as('milliseconds'))}
        </Moment>
      );
    } else {
      return null;
    }
  }

  _renderDisplayDateText() {
    if (this.state.activeTab == 'clock') {      
      return (
        <Moment
          element={Text}         
          format={'dddd, MMMM Do'}
          interval={500}
          style={styles.dateText}></Moment>          
      );
    }
    else return null;
  }

  _renderAlarmText() {
    if (this.state.activeTab == 'clock' && this.state.alarmTime) {      
      return (
        <View style={{position:'absolute', 
                      bottom:0, 
                      alignItems:'center'}}>
          <Icon name='alarm'
                color="#ff005f"
                size={20}></Icon>
          <Moment
            element={Text}         
            format={'ddd, MMM Do h:mma'}          
            style={styles.alarmText}>
              {this.state.alarmTime}
          </Moment>          
        </View>
      );
    }
    else return null;
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{flex: 1, marginTop:20, justifyContent:'center', alignItems:'center'}}>
          {this._renderDisplayClockText()}
          {this._renderDisplayDateText()}           
          {this._renderAlarmText()}
        </View>        
        <View style={{flex: 0.35, justifyContent: 'center'}}>
          <Icon
            size={100}
            color={this.state.isListening ? '#377DFF' : '#777777'}
            name={this.state.isListening ? 'mic' : 'mic-none'}
            style={{ alignSelf: 'center' }} 
          />
          <Text style={styles.instructions}>Say 'PicoClock'!</Text>
        </View>
        <View style={{flex: 0.18, justifyContent: 'flex-end'}}>
          <BottomNavigation
            style={{borderTopWidth: 2, borderTopColor: '#EEEEEE', flex: 1}}
            activeTab={this.state.activeTab}
            renderTab={this._renderTab}
            tabs={this.tabs}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center'
  },
  clockText: {       
    color: '#377DFF',
    fontSize: 70,
    textAlign: 'center',
    textAlignVertical: 'center',        
  },
  dateText: {    
    color: '#777777',    
    textAlign: 'center',
    textAlignVertical: 'center',    
    fontSize: 22
  },
  alarmText: {    
    color: '#ff005f',    
    textAlign: 'center',
    textAlignVertical: 'center',    
    fontSize: 15
  },
  instructions: {
    textAlign: 'center',
    color: '#BBBBBB',
    fontWeight: 'bold',
    fontSize: 18
  },
});
