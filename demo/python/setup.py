import os
import shutil

import setuptools

os.system('git clean -dfx')

package_folder = os.path.join(os.path.dirname(__file__), 'picovoicedemo')
os.mkdir(package_folder)

shutil.copy(
    os.path.join(os.path.dirname(__file__), 'picovoice_demo_file.py'),
    os.path.join(package_folder, 'picovoice_demo_file.py'))

shutil.copy(
    os.path.join(os.path.dirname(__file__), 'picovoice_demo_mic.py'),
    os.path.join(package_folder, 'picovoice_demo_mic.py'))

shutil.copy(os.path.join(os.path.dirname(__file__), '../../LICENSE'), package_folder)

MANIFEST_IN = """
include picovoicedemo/LICENSE
include picovoicedemo/picovoice_demo_file.py
include picovoicedemo/picovoice_demo_mic.py
"""

with open(os.path.join(os.path.dirname(__file__), 'MANIFEST.in'), 'w') as f:
    f.write(MANIFEST_IN.strip('\n '))

LONG_DESCRIPTION = """
TODO
"""

setuptools.setup(
    name="picovoicedemo",
    version="0.6.0",
    author="Picovoice",
    author_email="hello@picovoice.ai",
    description="On-Device end-to-end voice recognition powered by deep learning.",
    long_description=LONG_DESCRIPTION,
    long_description_content_type="text/markdown",
    url="https://github.com/Picovoice/picovoice",
    packages=["picovoicedemo"],
    install_requires=[
        "numpy",
        "picovoice==0.8.0",
        "pyaudio",
        "pysoundfile>=0.9.0",
    ],
    include_package_data=True,
    classifiers=[
        "Development Status :: 4 - Beta",
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
    python_requires='>=3',
)
