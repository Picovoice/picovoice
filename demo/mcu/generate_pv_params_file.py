#
# Copyright 2020-2021 Picovoice Inc.
#
# You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
# file accompanying this source.
#
# Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
# an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
# specific language governing permissions and limitations under the License.
#

import os
import shutil
import struct
import subprocess
import sys

HEADER = """
/*
    Copyright 2020-2021 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

#include <stdint.h>

"""


def generate_pv_params(ppn_file, rhn_file, header_file_folders):

    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_dir = os.path.join(script_dir, '../..')
    ppn_dir = os.path.join(repo_dir, 'resources/porcupine/resources/keyword_files/cortexm')
    rhn_dir = os.path.join(repo_dir, 'resources/rhino/resources/contexts/cortexm')
    
    for header_file_path in header_file_folders:
        header_file = os.path.join(header_file_path, 'pv_params.h')
        with open(header_file, 'w') as f_out:
            f_out.write(HEADER)

            keyword_file_path = os.path.join(ppn_dir, ppn_file + '_cortexm.ppn')
            ppn_c_array = ppn_to_c_array(keyword_file_path)
            f_out.write('// wake-word = %s \n' % ppn_file)
            f_out.write('static const uint8_t KEYWORD_ARRAY[] = {\n')
            f_out.write('\n'.join(ppn_c_array))
            f_out.write('};\n\n')

            context_file_path = os.path.join(rhn_dir, rhn_file + '_cortexm.rhn')
            ppn_c_array = ppn_to_c_array(context_file_path)
            f_out.write('// context = %s \n' % rhn_file)
            f_out.write('static const uint8_t CONTEXT_ARRAY[] = {\n')
            f_out.write('\n'.join(ppn_c_array))
            f_out.write('};\n\n')
        


def ppn_to_c_array(binary_file_path):
    indent = 8
    line_width = 120
    with open(binary_file_path, 'rb') as f:
        array = f.read()
        res = list()
        array = ['0x%s' % z.hex() for z in struct.unpack('%dc' % len(array), array)]
        row = ' ' * indent
        last_x = 0
        for x in array:
            if len(row) >= line_width:
                row = row.rsplit(', ', maxsplit=1)[0] + ','
                res.append(row)
                row = ' ' * indent + last_x
            if row != ' ' * indent:
                row += ', '
            row += x
            last_x = x
        if row != ' ' * indent:
            res.append(row)
        res.append('')
        return res


if __name__ == '__main__':
    wake_word = 'picovoice'
    context = 'smart_lighting'
    include_folders = ('stm32h747/stm32h747i-disco/CM7/Inc/',
    			'stm32f469/stm32f469i-disco/Inc/',
    			'stm32f411/stm32f411e-disco/Inc/',
    			'stm32f407/stm32f407g-disc1/Inc/',
    			'imxrt1050/imxrt1050-evkb/inc',)

    generate_pv_params(wake_word, context, include_folders)
