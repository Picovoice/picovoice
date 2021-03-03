if [ ! -d "./res/contexts/linux" ]
then 
    echo "Creating Linux context directory..."
    mkdir -p ./res/contexts/linux
fi
echo "Copying Linux context..."
cp ../../resources/rhino/resources/contexts/linux/smart_lighting_linux.rhn ./res/contexts/linux/smart_lighting_linux.rhn

if [ ! -d "./res/contexts/mac" ]
then 
    echo "Creating Mac context directory..."
    mkdir -p ./res/contexts/mac
fi
echo "Copying Mac context..."
cp ../../resources/rhino/resources/contexts/mac/smart_lighting_mac.rhn ./res/contexts/mac/smart_lighting_mac.rhn

if [ ! -d "./res/contexts/windows" ]
then 
    echo "Creating Windows context directory..."
    mkdir -p ./res/contexts/windows
fi
echo "Copying Windows context..."
cp ../../resources/rhino/resources/contexts/windows/smart_lighting_windows.rhn ./res/contexts/windows/smart_lighting_windows.rhn

if [ ! -d "./res/keyword_files/linux" ]
then 
    echo "Creating Linux keyword directory..."
    mkdir -p ./res/keyword_files/linux
fi
echo "Copying Linux keyword file..."
cp ../../resources/porcupine/resources/keyword_files/linux/jarvis_linux.ppn ./res/keyword_files/linux/jarvis_linux.ppn

if [ ! -d "./res/keyword_files/mac" ]
then 
    echo "Creating Mac keyword directory..."
    mkdir -p ./res/keyword_files/mac
fi
echo "Copying Mac keyword file..."
cp ../../resources/porcupine/resources/keyword_files/mac/jarvis_mac.ppn ./res/keyword_files/mac/jarvis_mac.ppn

if [ ! -d "./res/keyword_files/windows" ]
then 
    echo "Creating Windows keyword directory..."
    mkdir -p ./res/keyword_files/windows
fi
echo "Copying Windows keyword file..."
cp ../../resources/porcupine/resources/keyword_files/windows/jarvis_windows.ppn ./res/keyword_files/windows/jarvis_windows.ppn
