#
# Copyright 2021 Picovoice Inc.
#
# You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
# file accompanying this source.
#
# Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
# an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
# specific language governing permissions and limitations under the License.
#

import logging
import os
import platform
import subprocess
import sys
import unittest

class PorcupineDemoTestCase(unittest.TestCase):
    @staticmethod
    def __append_language(s, language):
        if language == 'en':
            return s
        return f'{s}_{language}'

    @classmethod
    def setUpClass(cls):
        cls.__PV_SYSTEM, cls.__PV_MACHINE = cls.__pv_platform()
        cls.__ENVIRONMENT = cls.__get_environemnt()

    def setUp(self):
        self.command = ["./build/picovoice_demo_file",
                    "-l", self.__pv_library_path(),
                    "-p", self.__pv_porcupine_model_path("en"),
                    "-k", "",
                    "-r", self.__pv_rhino_model_path("en"),
                    "-c", "",
                    "-w", "",
                    "-a", sys.argv[1]]

    def __check_picovoice_output(self, output, expectedIntent = None, expectedSlots = None):
        lines = output.split('\n')[1:-2]
        
        is_understood = False
        for line in lines:
            if 'is_understood' in line:
                self.assertTrue('true' in line)

        for key in expectedSlots:
            has_match = False
            for line in lines:
                if key in line:
                    if expectedSlots[key] in line:
                        has_match = True
                        break
            self.assertTrue(has_match)               

    def test_picovoice_coffee(self):
        language = "en"
        self.command[6] = self.__pv_keyword_path(language, "picovoice")
        self.command[10] = self.__pv_context_path(language, "coffee_maker")
        self.command[12] = self.__pv_audio_path("picovoice-coffee.wav")

        run_demo = subprocess.run(self.command, capture_output=True, text=True)

        self.assertEqual(run_demo.returncode, 0)
        
        expectedIntent = 'orderBeverage'
        expectedSlots = dict(beverage='coffee', size='large')
        self.__check_picovoice_output(run_demo.stdout, expectedIntent, expectedSlots)

    def test_heuschrecke_beleuchtung_de(self):
        language = "de"
        self.command[4] = self.__pv_porcupine_model_path(language)
        self.command[6] = self.__pv_keyword_path(language, "heuschrecke")
        self.command[8] = self.__pv_rhino_model_path(language)
        self.command[10] = self.__pv_context_path(language, "beleuchtung")
        self.command[12] = self.__pv_audio_path("heuschrecke-beleuchtung_de.wav")

        run_demo = subprocess.run(self.command, capture_output=True, text=True)

        self.assertEqual(run_demo.returncode, 0)
        
        expectedIntent = 'orderBeverage'
        expectedSlots = dict(state='aus')
        self.__check_picovoice_output(run_demo.stdout, expectedIntent, expectedSlots)

    def test_manzana_luz_es(self):
        language = "es"
        self.command[4] = self.__pv_porcupine_model_path(language)
        self.command[6] = self.__pv_keyword_path(language, "manzana")
        self.command[8] = self.__pv_rhino_model_path(language)
        self.command[10] = self.__pv_context_path(language, "luz")
        self.command[12] = self.__pv_audio_path("manzana-luz_es.wav")

        run_demo = subprocess.run(self.command, capture_output=True, text=True)

        self.assertEqual(run_demo.returncode, 0)
        
        expectedIntent = 'changeColor'
        expectedSlots = dict(location='habitación', color='rosado')
        self.__check_picovoice_output(run_demo.stdout, expectedIntent, expectedSlots)      

    def test_mon_intelligent_fr(self):
        language = "fr"
        self.command[4] = self.__pv_porcupine_model_path(language)
        self.command[6] = self.__pv_keyword_path(language, "mon chouchou")
        self.command[8] = self.__pv_rhino_model_path(language)
        self.command[10] = self.__pv_context_path(language, "éclairage_intelligent")
        self.command[12] = self.__pv_audio_path("mon-intelligent_fr.wav")

        run_demo = subprocess.run(self.command, capture_output=True, text=True)

        self.assertEqual(run_demo.returncode, 0)
        
        expectedIntent = 'changeColor'
        expectedSlots = dict(color='violet')
        self.__check_picovoice_output(run_demo.stdout, expectedIntent, expectedSlots)                  

    @staticmethod
    def __pv_linux_machine(machine):
        if machine == 'x86_64':
            return machine
        elif machine == 'aarch64':
            arch_info = '-' + machine
        elif machine in ['armv7l', 'armv6l']:
            arch_info = ''
        else:
            raise NotImplementedError("Unsupported CPU architecture: '%s'" % machine)

        cpu_info = ''
        try:
            cpu_info = subprocess.check_output(['cat', '/proc/cpuinfo']).decode()
            cpu_part_list = [x for x in cpu_info.split('\n') if 'CPU part' in x]
            cpu_part = cpu_part_list[0].split(' ')[-1].lower()
        except Exception as error:
            raise RuntimeError("Failed to identify the CPU with '%s'\nCPU info: %s" % (error, cpu_info))

        if '0xb76' == cpu_part:
            return 'arm11' + arch_info
        elif '0xc07' == cpu_part:
            return 'cortex-a7' + arch_info
        elif '0xd03' == cpu_part:
            return 'cortex-a53' + arch_info
        elif '0xd07' == cpu_part:
            return 'cortex-a57' + arch_info
        elif '0xd08' == cpu_part:
            return 'cortex-a72' + arch_info
        elif '0xc08' == cpu_part:
            return 'beaglebone' + arch_info
        elif machine == 'armv7l':
            log.warning(
                'WARNING: Please be advised that this device (CPU part = %s) is not officially supported by Picovoice. '
                'Falling back to the armv6-based (Raspberry Pi Zero) library. This is not tested nor optimal.' % cpu_part)
            return 'arm11'
        else:
            raise NotImplementedError("Unsupported CPU: '%s'." % cpu_part)

    @classmethod
    def __pv_platform(cls):
        pv_system = platform.system()
        if pv_system not in {'Darwin', 'Linux', 'Windows'}:
            raise ValueError("Unsupported system '%s'." % pv_system)

        if pv_system == 'Linux':
            pv_machine = cls.__pv_linux_machine(platform.machine())
        else:
            pv_machine = platform.machine()

        return pv_system, pv_machine

    @classmethod
    def __pv_library_path(cls):
        _PV_SYSTEM, _PV_MACHINE = cls.__PV_SYSTEM, cls.__PV_MACHINE
        _RASPBERRY_PI_MACHINES = {'arm11', 'cortex-a7', 'cortex-a53', 'cortex-a72', 'cortex-a53-aarch64', 'cortex-a72-aarch64'}
        _JETSON_MACHINES = {'cortex-a57-aarch64'}

        subdir = ''
        if _PV_SYSTEM == 'Darwin':
            if _PV_MACHINE == 'x86_64':
                subdir = 'lib/mac/x86_64/libpicovoice.dylib'
            elif _PV_MACHINE == "arm64":
                subdir = 'lib/mac/arm64/libpicovoice.dylib'
        elif _PV_SYSTEM == 'Linux':
            if _PV_MACHINE == 'x86_64':
                subdir = 'lib/linux/x86_64/libpicovoice.so'
            elif _PV_MACHINE in _JETSON_MACHINES:
                subdir = f'lib/jetson/{_PV_MACHINE}/libpicovoice.so'
            elif _PV_MACHINE in _RASPBERRY_PI_MACHINES:
                subdir = f'lib/raspberry-pi/{_PV_MACHINE}/libpicovoice.so'
            elif _PV_MACHINE == 'beaglebone':
                subdir = 'lib/beaglebone/libpicovoice.so'
        elif _PV_SYSTEM == 'Windows':
            subdir = 'lib/windows/amd64/libpicovoice.dll'

        return os.path.join(
            os.path.dirname(__file__),
            '../../sdk/c',
            subdir)

    @staticmethod
    def __get_environemnt():
        system = platform.system()
        if system == 'Darwin':
            return 'mac'
        elif system == 'Windows':
            return 'windows'
        elif system == 'Linux':
            if platform.machine() == 'x86_64':
                return 'linux'
            else:
                cpu_info = ''
                try:
                    cpu_info = subprocess.check_output(['cat', '/proc/cpuinfo']).decode()
                    cpu_part_list = [x for x in cpu_info.split('\n') if 'CPU part' in x]
                    cpu_part = cpu_part_list[0].split(' ')[-1].lower()
                except Exception as error:
                    raise RuntimeError("Failed to identify the CPU with '%s'\nCPU info: %s" % (error, cpu_info))

                if '0xb76' == cpu_part or '0xc07' == cpu_part or '0xd03' == cpu_part or '0xd08' == cpu_part:
                    return 'raspberry-pi'
                elif '0xd07' == cpu_part:
                    return 'jetson'
                elif '0xc08' == cpu_part:
                    return 'beaglebone'
                else:
                    raise NotImplementedError("Unsupported CPU: '%s'." % cpu_part)
        else:
            raise ValueError("Unsupported system '%s'." % system)

    @classmethod
    def __pv_porcupine_model_path(cls, language):
        model_file = cls.__append_language('porcupine_params', language)
        return os.path.join(
            os.path.dirname(__file__),
            f'../../resources/porcupine/lib/common/{model_file}.pv')

    @classmethod
    def __pv_keyword_path(cls, language, keyword):
        keyword_files = cls.__append_language('keyword_files', language)
        return os.path.join(
            os.path.dirname(__file__),
            '../../resources/porcupine/resources',
            f'{keyword_files}/{cls.__ENVIRONMENT}/{keyword}_{cls.__ENVIRONMENT}.ppn')

    @classmethod
    def __pv_rhino_model_path(cls, language):
        model_file = cls.__append_language('rhino_params', language)
        return os.path.join(
            os.path.dirname(__file__),
            f'../../resources/rhino/lib/common/{model_file}.pv')  

    @classmethod
    def __pv_context_path(cls, language, context):
        contexts = cls.__append_language('contexts', language)
        return os.path.join(
            os.path.dirname(__file__),
            '../../resources/rhino/resources/',
            f'{contexts}/{cls.__ENVIRONMENT}/{context}_{cls.__ENVIRONMENT}.rhn')                      

    @classmethod
    def __pv_audio_path(cls, audio_file_name):
        return os.path.join(
            os.path.dirname(__file__),
            f'../../resources/audio_samples/{audio_file_name}')      


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("usage: test_porcupine.py ${AccessKey}")
        exit(1)

    unittest.main(argv=sys.argv[:1])
