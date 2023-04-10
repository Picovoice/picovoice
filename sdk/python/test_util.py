#
# Copyright 2020-2023 Picovoice Inc.
#
# You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
# file accompanying this source.
#
# Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
# an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
# specific language governing permissions and limitations under the License.
#

import json
import logging
import os
import platform
import subprocess


log = logging.getLogger('PPN')
log.setLevel(logging.WARNING)


def _pv_linux_machine(machine):
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


def _pv_platform():
    pv_system = platform.system()
    if pv_system not in {'Darwin', 'Linux', 'Windows'}:
        raise ValueError("Unsupported system '%s'." % pv_system)

    if pv_system == 'Linux':
        pv_machine = _pv_linux_machine(platform.machine())
    else:
        pv_machine = platform.machine()

    return pv_system, pv_machine


_PV_SYSTEM, _PV_MACHINE = _pv_platform()

_RASPBERRY_PI_MACHINES = {'arm11', 'cortex-a7', 'cortex-a53', 'cortex-a72', 'cortex-a53-aarch64', 'cortex-a72-aarch64'}
_JETSON_MACHINES = {'cortex-a57-aarch64'}


def pv_model_path(relative):
    return os.path.join(os.path.dirname(__file__), relative, 'lib/common/porcupine_params.pv')


def pv_keyword_files_subdir():
    if _PV_SYSTEM == 'Darwin':
        return 'mac'
    elif _PV_SYSTEM == 'Linux':
        if _PV_MACHINE == 'x86_64':
            return 'linux'
        elif _PV_MACHINE in _JETSON_MACHINES:
            return 'jetson'
        elif _PV_MACHINE in _RASPBERRY_PI_MACHINES:
            return 'raspberry-pi'
        elif _PV_MACHINE == 'beaglebone':
            return 'beaglebone'
    elif _PV_SYSTEM == 'Windows':
        return 'windows'

    raise NotImplementedError('Unsupported platform')


def __append_language(s, language):
    if language == 'en':
        return s
    return '%s_%s' % (s, language)


def context_path(context, language):
    system = platform.system()

    contexts_root = __append_language('../../resources/rhino/resources/contexts', language)

    if system == 'Darwin':
        return os.path.join(os.path.dirname(__file__), contexts_root, 'mac', '%s_mac.rhn' % context)
    elif system == 'Linux':
        if platform.machine() == 'x86_64':
            return os.path.join(os.path.dirname(__file__), contexts_root, 'linux', '%s_linux.rhn' % context)
        else:
            cpu_info = ''
            try:
                cpu_info = subprocess.check_output(['cat', '/proc/cpuinfo']).decode()
                cpu_part_list = [x for x in cpu_info.split('\n') if 'CPU part' in x]
                cpu_part = cpu_part_list[0].split(' ')[-1].lower()
            except Exception as error:
                raise RuntimeError("Failed to identify the CPU with '%s'\nCPU info: %s" % (error, cpu_info))

            if '0xb76' == cpu_part or '0xc07' == cpu_part or '0xd03' == cpu_part or '0xd08' == cpu_part:
                return os.path.join(os.path.dirname(__file__),
                                    contexts_root, 'raspberry-pi', '%s_raspberry-pi.rhn' % context)
            elif '0xd07' == cpu_part:
                return os.path.join(os.path.dirname(__file__),
                                    contexts_root, 'jetson', '%s_jetson.rhn' % context)
            elif '0xc08' == cpu_part:
                return os.path.join(os.path.dirname(__file__),
                                    contexts_root, 'beaglebone', '%s_beaglebone.rhn' % context)
            else:
                raise NotImplementedError("Unsupported CPU: '%s'." % cpu_part)
    elif system == 'Windows':
        return os.path.join(os.path.dirname(__file__), contexts_root, 'windows', '%s_windows.rhn' % context)
    else:
        raise ValueError("Unsupported system '%s'." % system)


def pv_keyword_paths_by_language(language):
    keyword_files_root = __append_language('resources/keyword_files', language)
    relative = '../../resources/porcupine'
    keyword_files_dir = \
        os.path.join(os.path.dirname(__file__), relative, keyword_files_root, pv_keyword_files_subdir())

    res = dict()
    for x in os.listdir(keyword_files_dir):
        res[x.rsplit('_', 1)[0]] = os.path.join(keyword_files_dir, x)

    return res


def pv_rhino_model_path_by_language(language):
    model_path_subdir = __append_language('lib/common/rhino_params', language)
    model_path_subdir = '%s.pv' % model_path_subdir
    return os.path.join(os.path.dirname(__file__), '../../resources/rhino', model_path_subdir)


def pv_porcupine_model_path_by_language(language):
    model_path_subdir = __append_language('lib/common/porcupine_params', language)
    model_path_subdir = '%s.pv' % model_path_subdir
    return os.path.join(os.path.dirname(__file__), '../../resources/porcupine', model_path_subdir)


def load_test_data():
    data_file_path = os.path.join(os.path.dirname(__file__), "../../resources/.test/test_data.json")
    with open(data_file_path, encoding="utf8") as data_file:
        json_test_data = data_file.read()
    test_data = json.loads(json_test_data)['tests']

    test_parameters = [
        (
            t['language'],
            t['wakeword'],
            t['context_name'],
            t['audio_file'],
            t['inference']['intent'],
            t['inference']['slots']
        )
        for t in test_data['parameters']]

    return test_parameters
