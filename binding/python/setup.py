import os
import shutil

import setuptools

os.system('git clean -dfx')

package_folder = os.path.join(os.path.dirname(__file__), 'picovoice')
os.mkdir(package_folder)

shutil.copy(os.path.join(os.path.dirname(__file__), 'picovoice.py'), os.path.join(package_folder, 'picovoice.py'))
shutil.copy(os.path.join(os.path.dirname(__file__), '../../LICENSE'), package_folder)

INIT_SCRIPT = """
from .picovoice import Picovoice
"""

with open(os.path.join(package_folder, '__init__.py'), 'w') as f:
    f.write(INIT_SCRIPT.strip('\n '))
    f.write('\n')

MANIFEST_IN = """
include picovoice/LICENSE
include picovoice/__init__.py
include picovoice/picovoice.py
"""

with open(os.path.join(os.path.dirname(__file__), 'MANIFEST.in'), 'w') as f:
    f.write(MANIFEST_IN.strip('\n '))

LONG_DESCRIPTION = """
TODO
"""

setuptools.setup(
    name="picovoice",
    version="0.7.0",
    author="Picovoice",
    author_email="hello@picovoice.ai",
    description="On-Device end-to-end voice recognition powered by deep learning.",
    long_description=LONG_DESCRIPTION,
    long_description_content_type="text/markdown",
    url="https://github.com/Picovoice/picovoice",
    packages=["picovoice"],
    install_requires=[
        "pvporcupine",
        "pvrhino",
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
    python_requires='>=3',
)
