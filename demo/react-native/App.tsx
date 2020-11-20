import React, {Component} from 'react';
import {PermissionsAndroid, Platform, TouchableOpacity} from 'react-native';
import {StyleSheet, Text, View} from 'react-native';
import {PicovoiceManager} from '@picovoice/picovoice-react-native';

const RNFS = require('react-native-fs');

type Props = {};
type State = {
  buttonText: string;
  rhinoText: string;
  isListening: boolean;
  backgroundColour: string;

  error: string | null;
};

export default class App extends Component<Props, State> {
  _picovoiceManager: PicovoiceManager | undefined;

  constructor(props: Props) {
    super(props);
    this.state = {
      buttonText: 'Start',
      picovoiceText: '',
      isListening: false,

      error: null,
    };
  }

  async componentDidMount() {
    let wakeWordName = 'porcupine';
    let wakeWordFilename = wakeWordName;
    let wakeWordPath = '';
    let contextName = 'smart_lighting';
    let contextFilename = contextName;
    let contextPath = '';

    // get platform filesystem path to resources
    if (Platform.OS == 'android') {
      // for Android, extract resources
      wakeWordFilename += '_android.ppn';
      wakeWordPath = `${RNFS.DocumentDirectoryPath}/${wakeWordFilename}`;
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
        (keywordIndex: number) => {
          if (keywordIndex === 0) {
            this.setState({
              picovoiceText: 'Wake word detected! Listening for intent...',
            });
          }
        },
        contextPath,
        (inference: object) => {
          if (inference['isUnderstood']) {
            this.setState({
              picovoiceText: JSON.stringify(inference, null, 4),
            });
          } else {
            this.setState({
              picovoiceText: JSON.stringify({isUnderstood: false}, null, 4),
            });
          }

          setTimeout(() => {
            if (this.state.isListening) {
              this.setState({
                picovoiceText: 'Listening for wake word...',
              });
            } else {
              this.setState({
                picovoiceText: '',
              });
            }
          }, 2000);
        },
      );
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

      this._picovoiceManager?.start();
      this.setState({
        buttonText: 'Stop',
        picovoiceText: 'Listening for wake word...',
        isListening: true,
      });
    });
  }

  _stopProcessing() {
    this._picovoiceManager?.stop();
    this.setState({
      buttonText: 'Start',
      picovoiceText: '',
      isListening: false,
    });
  }

  _toggleListening() {
    if (this.state.isListening) this._stopProcessing();
    else this._startProcessing();
  }

  async _requestRecordAudioPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message:
            'Rhino needs access to your microphone to make intent inferences.',
          buttonNeutral: 'Ask Me Later',
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

  render() {
    return (
      <View
        style={[
          styles.container,
          {backgroundColor: this.state.backgroundColour},
        ]}>
        <View style={styles.statusBar}>
          <Text style={styles.statusBarText}>Picovoice</Text>
        </View>

        <View
          style={{
            flex: 0.35,
            justifyContent: 'center',
            alignContent: 'center',
          }}>
          <TouchableOpacity
            style={{
              width: '50%',
              height: '50%',
              alignSelf: 'center',
              justifyContent: 'center',
              backgroundColor: '#377DFF',
              borderRadius: 100,
            }}
            onPress={() => this._toggleListening()}>
            <Text style={styles.buttonText}>{this.state.buttonText}</Text>
          </TouchableOpacity>
        </View>
        <View style={{flex: 1, padding: 20}}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              padding: 30,
              backgroundColor: '#25187E',
            }}>
            <Text style={styles.picovoiceText}>{this.state.picovoiceText}</Text>
          </View>
        </View>
        <View
          style={{flex: 0.08, justifyContent: 'flex-end', paddingBottom: 25}}>
          <Text style={styles.instructions}>
            Made in Vancouver, Canada by Picovoice
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
  },
  subContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  statusBar: {
    flex: 0.17,
    backgroundColor: '#377DFF',
    justifyContent: 'flex-end',
  },
  statusBarText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 15,
    marginBottom: 15,
  },

  buttonStyle: {
    backgroundColor: '#377DFF',
    borderRadius: 100,
  },
  buttonText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  picovoiceText: {
    flex: 1,
    flexWrap: 'wrap',
    color: 'white',
    fontSize: 20,
  },
  itemStyle: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
  instructions: {
    textAlign: 'center',
    color: '#666666',
  },
});
