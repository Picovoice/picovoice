#
# Copyright 2020-2022 Picovoice Inc.
#
# You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
# file accompanying this source.
#
# Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
# an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
# specific language governing permissions and limitations under the License.
#

import os
import struct

HEADER = """
/*
    Copyright 2020-2023 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

#ifndef PV_PARAMS_H
#define PV_PARAMS_H

#include <stdint.h>

"""

FOOTER = """

#endif // PV_PARAMS_H

"""

LANGUAGE_CODE_TO_NAME = {
    "ar": "arabic",
    "de": "german",
    "en": "english",
    "es": "spanish",
    "fa": "farsi",
    "fr": "french",
    "hi": "hindi",
    "it": "italian",
    "ja": "japanese",
    "ko": "korean",
    "nl": "dutch",
    "pl": "polish",
    "pt": "portuguese",
    "ru": "russian",
    "sv": "swedish",
    "vn": "vietnamese",
    "zh": "mandarin",
}


def generate_pv_params(model_files, header_file_folders):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_dir = os.path.join(script_dir, "../..")

    for header_file_path in header_file_folders:
        header_file = os.path.join(os.path.dirname(__file__), header_file_path, "pv_params.h")
        with open(header_file, "w") as f_out:
            f_out.write(HEADER)

            for language, ppn_rhn_models in model_files.items():
                if language == "en":
                    ppn_dir = os.path.join(repo_dir, "resources/porcupine/resources/keyword_files/cortexm")
                    rhn_dir = os.path.join(repo_dir, f"resources/rhino/resources/contexts/cortexm")
                else:
                    ppn_dir = os.path.join(repo_dir, f"resources/porcupine/resources/keyword_files_{language}/cortexm")
                    rhn_dir = os.path.join(repo_dir, f"resources/rhino/resources/contexts_{language}/cortexm")

                f_out.write(f"\n#if defined(__PV_LANGUAGE_{LANGUAGE_CODE_TO_NAME[language].upper()}__)\n\n")

                keyword_file_path = os.path.join(ppn_dir, ppn_rhn_models["wake_word"] + "_cortexm.ppn")
                ppn_c_array = ppn_to_c_array(keyword_file_path)
                f_out.write("// wake-word = %s \n" % ppn_rhn_models["wake_word"])
                f_out.write("static const uint8_t KEYWORD_ARRAY[] = {\n")
                f_out.write("\n".join(ppn_c_array))
                f_out.write("};\n\n")

                context_file_path = os.path.join(rhn_dir, ppn_rhn_models["context"] + "_cortexm.rhn")
                ppn_c_array = ppn_to_c_array(context_file_path)
                f_out.write("// context = %s \n" % ppn_rhn_models["context"])
                f_out.write("static const uint8_t CONTEXT_ARRAY[] = {\n")
                f_out.write("\n".join(ppn_c_array))
                f_out.write("};\n")

                f_out.write(f"\n#endif // __PV_LANGUAGE_{LANGUAGE_CODE_TO_NAME[language].upper()}__\n")

            f_out.write(FOOTER)


def ppn_to_c_array(binary_file_path):
    indent = 8
    line_width = 120
    with open(binary_file_path, "rb") as f:
        array = f.read()
        res = list()
        array = ["0x%s" % z.hex() for z in struct.unpack("%dc" % len(array), array)]
        row = " " * indent
        last_x = 0
        for x in array:
            if len(row) >= line_width:
                row = row.rsplit(", ", maxsplit=1)[0] + ","
                res.append(row)
                row = " " * indent + last_x
            if row != " " * indent:
                row += ", "
            row += x
            last_x = x
        if row != " " * indent:
            res.append(row)
        res.append("")
        return res


if __name__ == "__main__":
    models = {
        "ar": {"wake_word": "مرحبا الكمبيوتر", "context": "simple_context_ar"},
        "de": {"wake_word": "hey computer", "context": "beleuchtung"},
        "en": {"wake_word": "picovoice", "context": "smart_lighting"},
        "es": {"wake_word": "hola computadora", "context": "iluminación_inteligente"},
        "fa": {"wake_word": "سلام رایانه", "context": "simple_context_fa"},
        "fr": {"wake_word": "bonjour ordinateur", "context": "éclairage_intelligent"},
        "hi": {"wake_word": "नमस्ते कंप्यूटर", "context": "simple_context_hi"},
        "it": {"wake_word": "ciao computer", "context": "illuminazione"},
        "ja": {"wake_word": "こんにちは コンピューター", "context": "sumāto_shōmei"},
        "ko": {"wake_word": "안녕 컴퓨터", "context": "seumateu_jomyeong"},
        "nl": {"wake_word": "hallo computer", "context": "simple_context_nl"},
        "pl": {"wake_word": "cześć komputer", "context": "simple_context_pl"},
        "pt": {"wake_word": "olá computador", "context": "luz_inteligente"},
        "ru": {"wake_word": "привет компьютер", "context": "simple_context_ru"},
        "sv": {"wake_word": "hej dator", "context": "simple_context_sv"},
        "vn": {"wake_word": "xin chào máy tính", "context": "simple_context_vn"},
        "zh": {"wake_word": "你好电脑", "context": "simple_context_zh"},
    }
    include_folders = [
        "stm32f411/stm32f411e-disco/Inc/",
    ]

    generate_pv_params(models, include_folders)
