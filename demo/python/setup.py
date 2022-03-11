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

import setuptools

os.system('git clean -dfx')

package_folder = os.path.join(os.path.dirname(__file__), 'picovoicedemo')
os.mkdir(package_folder)

shutil.copy(os.path.join(os.path.dirname(__file__), '../../LICENSE'), package_folder)

shutil.copy(
    os.path.join(os.path.dirname(__file__), 'picovoice_demo_file.py'),
    os.path.join(package_folder, 'picovoice_demo_file.py'))

shutil.copy(
    os.path.join(os.path.dirname(__file__), 'picovoice_demo_mic.py'),
    os.path.join(package_folder, 'picovoice_demo_mic.py'))

with open(os.path.join(os.path.dirname(__file__), 'MANIFEST.in'), 'w') as f:
    f.write('include picovoicedemo/LICENSE\n')
    f.write('include picovoicedemo/picovoice_demo_file.py\n')
    f.write('include picovoicedemo/picovoice_demo_mic.py\n')

with open(os.path.join(os.path.dirname(__file__), 'README.md'), 'r') as f:
    long_description = f.read()

setuptools.setup(
    name="picovoicedemo",
    version="2.1.2",
    author="Picovoice Inc.",
    author_email="hello@picovoice.ai",
    description="Picovoice demos.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/Picovoice/picovoice",
    packages=["picovoicedemo"],
    install_requires=["picovoice==2.1.2", "pvrecorder==1.0.2"],
    include_package_data=True,
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: Apache Software License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Topic :: Multimedia :: Sound/Audio :: Speech"
    ],
    entry_points=dict(
        console_scripts=[
            'picovoice_demo_file=picovoicedemo.picovoice_demo_file:main',
            'picovoice_demo_mic=picovoicedemo.picovoice_demo_mic:main',
        ],
    ),
    python_requires='>=3.5',
    keywords="wake word, voice control, speech recognition, voice recognition, natural language understanding",
)
