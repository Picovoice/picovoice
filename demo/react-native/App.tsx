import React, { Component } from 'react';
import {
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  PicovoiceManager,
  PicovoiceErrors,
} from '@picovoice/picovoice-react-native';
import { RhinoInference } from '@picovoice/rhino-react-native';

import { language, wakeword, context } from './params.json';

type Props = {};
type State = {
  buttonText: string;
  buttonDisabled: boolean;
  picovoiceText: string;
  isListening: boolean;
  isError: boolean;
  errorMessage: string;
  contextInfo?: string;
  showContextInfo: boolean;
};

const marginOffset = Platform.OS === 'ios' ? 30 : 0;

export default class App extends Component<Props, State> {
  readonly _accessKey = '${YOUR_ACCESS_KEY_HERE}'; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)

  _picovoiceManager: PicovoiceManager | undefined;
  _timeoutRef = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      buttonText: 'Start',
      buttonDisabled: false,
      picovoiceText: '',
      isListening: false,
      isError: false,
      errorMessage: '',
      showContextInfo: false,
    };
  }

  async componentDidMount() {
    let wakeWordPath = `keywords/${wakeword}_${Platform.OS}.ppn`;
    let contextPath = `contexts/${context}_${Platform.OS}.rhn`;
    let ppnModelPath: string | undefined;
    if (language !== 'en') {
      ppnModelPath = `models/porcupine_params_${language}.pv`;
    }
    let rhnModelPath: string | undefined;
    if (language !== 'en') {
      rhnModelPath = `models/rhino_params_${language}.pv`;
    }

    this._picovoiceManager = PicovoiceManager.create(
      this._accessKey,
      wakeWordPath,
      this._wakeWordCallback.bind(this),
      contextPath,
      this._inferenceCallback.bind(this),
      (error: PicovoiceErrors.PicovoiceError) => {
        this._errorCallback(error.message);
      },
      0.5,
      0.5,
      ppnModelPath,
      rhnModelPath,
    );
  }

  componentWillUnmount() {
    if (this.state.isListening) {
      this._stopProcessing();
    }
  }

  _wakeWordCallback() {
    if (this._timeoutRef != null) {
      clearTimeout(this._timeoutRef);
      this._timeoutRef = null;
    }
    this.setState({
      picovoiceText: 'Wake word detected! Listening for intent...',
    });
  }

  _inferenceCallback(inference: RhinoInference) {
    this.setState({
      picovoiceText: this._prettyPrintInference(inference),
    });

    this._timeoutRef = setTimeout(() => {
      this.setState({
        picovoiceText: `Listening for ${wakeword}...`,
      });
      this._timeoutRef = null;
    }, 2000);
  }

  _prettyPrintInference(inference: RhinoInference) {
    let printText = `{\n    "isUnderstood" : "${inference.isUnderstood}",\n`;
    if (inference.isUnderstood) {
      printText += `    "intent" : "${inference.intent}",\n`;
      if (Object.keys(inference.slots).length > 0) {
        printText += '    "slots" : {\n';
        let slots = inference.slots;
        for (const key in slots) {
          printText += `        "${key}" : "${slots[key]}",\n`;
        }
        printText += '    }\n';
      }
    }
    printText += '}';
    return printText;
  }

  _errorCallback(error: string) {
    this._picovoiceManager?.stop();
    this.setState({
      isError: true,
      errorMessage: error,
    });
  }

  async _startProcessing() {
    this.setState({
      buttonDisabled: true,
    });

    let recordAudioRequest;
    if (Platform.OS === 'android') {
      recordAudioRequest = this._requestRecordAudioPermission();
    } else {
      recordAudioRequest = new Promise(function (resolve, _) {
        resolve(true);
      });
    }

    recordAudioRequest.then(async (hasPermission) => {
      if (!hasPermission) {
        this._errorCallback('Required microphone permission was not granted.');
        this.setState({
          buttonDisabled: false,
        });
        return;
      }
      const didStart = await this._startPicovoice();
      if (didStart) {
        this.setState({
          buttonText: 'Stop',
          buttonDisabled: false,
          picovoiceText: `Listening for ${wakeword}...`,
          isListening: true,
        });
      }
    });
  }

  async _startPicovoice() {
    try {
      const didStart = await this._picovoiceManager?.start();
      if (didStart) {
        this.setState({
          contextInfo: this._picovoiceManager?.contextInfo,
        });
      }
      return didStart;
    } catch (err) {
      let errorMessage = '';
      if (err instanceof PicovoiceErrors.PicovoiceInvalidArgumentError) {
        errorMessage = `${err.message}\nPlease make sure your accessKey '${this._accessKey}'' is a valid access key.`;
      } else if (err instanceof PicovoiceErrors.PicovoiceActivationError) {
        errorMessage = 'AccessKey activation error';
      } else if (err instanceof PicovoiceErrors.PicovoiceActivationLimitError) {
        errorMessage = 'AccessKey reached its device limit';
      } else if (
        err instanceof PicovoiceErrors.PicovoiceActivationRefusedError
      ) {
        errorMessage = 'AccessKey refused';
      } else if (
        err instanceof PicovoiceErrors.PicovoiceActivationThrottledError
      ) {
        errorMessage = 'AccessKey has been throttled';
      } else {
        errorMessage = err.toString();
      }
      this._errorCallback(errorMessage);
    }

    return false;
  }

  _stopProcessing() {
    this.setState({
      buttonDisabled: true,
    });

    this._picovoiceManager?.stop().then((didStop) => {
      if (didStop) {
        if (this._timeoutRef != null) {
          clearTimeout(this._timeoutRef);
          this._timeoutRef = null;
        }
        this.setState({
          buttonText: 'Start',
          picovoiceText: '',
          buttonDisabled: false,
          isListening: false,
        });
      }
    });
  }

  _toggleListening() {
    if (this.state.isListening) {
      this._stopProcessing();
    } else {
      this._startProcessing();
    }
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
      this._errorCallback(err);
      return false;
    }
  }

  async showContextInfo() {
    if (!this.state.contextInfo) {
      await this._startPicovoice();
      this._stopProcessing();
    }
    if (!this.state.isError) {
      this.setState({ showContextInfo: true });
    }
  }

  render() {
    return (
      <View style={[styles.container]}>
        <View style={styles.statusBar}>
          <Text style={styles.statusBarText}>Picovoice</Text>
          <View style={styles.statusBarButtonContainer}>
            <TouchableOpacity
              style={{ backgroundColor: '#ffd105' }}
              onPress={() => this.showContextInfo()}>
              <Text style={styles.statusBarButtonStyle}>Context Info</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.showContextInfo}>
          <View style={styles.modalView}>
            <ScrollView style={{ flex: 0.95, marginBottom: 10 }}>
              <Text>{this._picovoiceManager?.contextInfo}</Text>
            </ScrollView>
            <TouchableOpacity
              style={{
                alignSelf: 'center',
                justifyContent: 'center',
                backgroundColor: '#377DFF',
                padding: 3,
                flex: 0.05,
              }}
              onPress={() => this.setState({ showContextInfo: false })}>
              <Text style={{ color: 'white' }}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        <View style={{ flex: 1, padding: 20 }}>
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
        {this.state.isError && (
          <View style={styles.errorBox}>
            <Text
              style={{
                color: 'white',
                fontSize: 16,
              }}>
              {this.state.errorMessage}
            </Text>
          </View>
        )}

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
              backgroundColor: this.state.isError ? '#cccccc' : '#377DFF',
              borderRadius: 100,
            }}
            onPress={() => this._toggleListening()}
            disabled={this.state.buttonDisabled || this.state.isError}>
            <Text style={styles.buttonText}>{this.state.buttonText}</Text>
          </TouchableOpacity>
        </View>

        <View
          style={{ flex: 0.08, justifyContent: 'flex-end', paddingBottom: 25 }}>
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
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBarText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 15,
    marginTop: marginOffset,
  },
  statusBarButtonContainer: {
    marginRight: 5,
    marginTop: marginOffset,
  },
  statusBarButtonStyle: {
    padding: 7.5,
    fontWeight: '500',
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
  errorBox: {
    backgroundColor: 'red',
    borderRadius: 5,
    margin: 20,
    marginTop: 5,
    marginBottom: 5,
    padding: 10,
    textAlign: 'center',
  },
  modalView: {
    margin: 10,
    marginTop: 10 + marginOffset,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
});
