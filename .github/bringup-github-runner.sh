#!/bin/bash
set -e
set -o pipefail

echo "#####################################################################"
echo "Pre-setup:"
echo "- Install the OS and go through it's initial installation prompts."
echo "- Set locale to 'en-us.utf8'"
echo "- Set timezone to Vancouver"
echo "- Change the password"
echo "Have you done this pre-setup and is the device connected to the internet? [y/N]:"
read DONE_PRE_SETUP
if ! [[ "$DONE_PRE_SETUP" =~ ^([yY])$ ]]
then
    exit 1
fi
echo "---------------------------------------------------------------------"

echo "#####################################################################"
echo "Is this for a 32bit system or a 64bit system? [64/32]:"
read SYSTEM_BITS
if ! [[ "$SYSTEM_BITS" =~ ^(64|32)$ ]]
then
    echo "Please enter '64' or '32' exactly"
    exit 1
fi
if [[ "$SYSTEM_BITS" =~ ^(64)$ ]]
then
    echo "Using 64bit packages and sources"
    DOTNET_SDK5_FILENAME=dotnet-sdk-5.0.404-linux-arm64.tar.gz
    DOTNET_SDK3_FILENAME=dotnet-sdk-3.1.416-linux-arm64.tar.gz
    DOTNET_SDK5_URL=https://download.visualstudio.microsoft.com/download/pr/21bf6b86-84a9-4cc4-9713-c812c18b1504/8ef52712e25b5075b91dd51b85ae170d/${DOTNET_SDK5_FILENAME}
    DOTNET_SDK3_URL=https://download.visualstudio.microsoft.com/download/pr/d3aaa7cc-a603-4693-871b-53b1537a4319/5981099ca17a113b3ce1c080462c50ef/${DOTNET_SDK3_FILENAME}
    GOLANG_ARCH=arm64
    GH_ACTIONS_ARCH=arm64
else
    echo "Using 32bit packages and sources"
    DOTNET_ARCH=arm
    DOTNET_SDK5_FILENAME=dotnet-sdk-5.0.404-linux-arm.tar.gz
    DOTNET_SDK3_FILENAME=dotnet-sdk-3.1.416-linux-arm.tar.gz
    DOTNET_SDK5_URL=https://download.visualstudio.microsoft.com/download/pr/bbc6105c-07b4-4cda-b438-91afa4e4f2f3/61411defdb5fff3736a9263718bca37b/${DOTNET_SDK5_FILENAME}
    DOTNET_SDK3_URL=https://download.visualstudio.microsoft.com/download/pr/1b2a2fb1-b04b-485b-8a25-caed97ebe601/0c6024a3814f664558dc39fc85b34192/${DOTNET_SDK3_FILENAME}
    GOLANG_ARCH=armv6l
    GH_ACTIONS_ARCH=arm
fi
echo "---------------------------------------------------------------------"

echo "#####################################################################"
echo "Performing an apt update and upgrade..."
sudo apt update && sudo apt upgrade -y
echo "---------------------------------------------------------------------"

echo "#####################################################################"
echo "Installing required and useful software..."
sudo apt install -y vim wget curl git file
echo "---------------------------------------------------------------------"

echo "#####################################################################"
echo "Generating an SSH key pair..."
ssh-keygen -N "" -f /home/$(whoami)/.ssh/id_ed25519 -t ed25519
echo "---------------------------------------------------------------------"

echo "#####################################################################"
echo "Enabling SSH..."
sudo systemctl enable ssh
sudo systemctl start ssh
sudo systemctl status ssh
echo "---------------------------------------------------------------------"

echo "#####################################################################"
echo "Setting static IP address..."
echo "Please enter the IPv4 address you'd like this device to have:"
read STATIC_IP_ADDR
echo "Please enter the IPv4 gateway you'd like this device to have:"
read STATIC_IP_GATEWAY
if [ -f "/etc/dhcpcd.conf" ]; then
    echo "Using '/etc/dhcpcd.conf' to set static IP"
    echo "" | sudo tee -a /etc/dhcpcd.conf
    echo "# Static IP set by Picovoice setup script" | sudo tee -a /etc/dhcpcd.conf
    echo "interface eth0" | sudo tee -a /etc/dhcpcd.conf
    echo "static ip_address=${STATIC_IP_ADDR}/24" | sudo tee -a /etc/dhcpcd.conf
    echo "static routers=${STATIC_IP_GATEWAY}" | sudo tee -a /etc/dhcpcd.conf
    echo "static domain_name_servers=1.1.1.1 1.0.0.1" | sudo tee -a /etc/dhcpcd.conf
    sudo systemctl enable dhcpcd
    sudo systemctl start dhcpcd
    sudo systemctl status dhcpcd
else
    echo "Using 'connmanctl' to set static IP"
    SERVICE=$(sudo connmanctl services | grep Wired | awk '{print $3}')
    sudo connmanctl config ${SERVICE} --ipv4 manual ${STATIC_IP_ADDR} 255.255.255.0 ${STATIC_IP_GATEWAY} --nameservers 1.1.1.1 1.0.0.1
fi
echo "---------------------------------------------------------------------"

echo "#####################################################################"
echo "Installing required software and build tools for GitHub actions..."
mkdir -p $HOME/Downloads
echo "---------------------------------------------------------------------"

echo "#####################################################################"
echo "Installing C (tools)..."
sudo apt install -y cmake
echo "---------------------------------------------------------------------"

echo "#####################################################################"
echo "Installing PYTHON..."
sudo apt install python3 python3-pip
echo "---------------------------------------------------------------------"

echo "#####################################################################"
echo "Installing DOTNET..."
cd $HOME/Downloads
wget ${DOTNET_SDK5_URL} ${DOTNET_SDK3_URL}
rm -rf $HOME/dotnet
mkdir -p $HOME/dotnet
tar zxf ./${DOTNET_SDK5_URL} -C $HOME/dotnet
tar zxf ./${DOTNET_SDK3_URL} -C $HOME/dotnet
echo "" | tee -a $HOME/.bashrc
echo "# Microsoft .NET (Added by Picovoice setup script)" | tee -a $HOME/.bashrc
echo 'export DOTNET_ROOT=$HOME/dotnet' | tee -a $HOME/.bashrc
echo 'export PATH=$PATH:$HOME/dotnet' | tee -a $HOME/.bashrc
echo "---------------------------------------------------------------------"

echo "#####################################################################"
echo "Installing GO..."
cd $HOME/Downloads
wget https://go.dev/dl/go1.17.6.linux-${GOLANG_ARCH}.tar.gz
rm -rf /usr/local/go
sudo tar xzf ./go1.17.6.linux-${GOLANG_ARCH}.tar.gz -C /usr/local
echo "" | tee -a $HOME/.bashrc
echo "# GO (Added by Picovoice setup script)" | tee -a $HOME/.bashrc
echo 'export PATH=$PATH:/usr/local/go/bin' | tee -a $HOME/.bashrc
echo "---------------------------------------------------------------------"

echo "#####################################################################"
echo "Installing JAVA..."
sudo apt install -y openjdk-11-jdk
echo "---------------------------------------------------------------------"

echo "#####################################################################"
echo "Installing NODEJS..."
echo "" | tee -a $HOME/.bashrc
echo "# NVM/NodeJS (Added by Picovoice setup script)" | tee -a $HOME/.bashrc
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source $HOME/.bashrc
nvm install --lts
echo "---------------------------------------------------------------------"

echo "#####################################################################"
echo "Installing RUST..."
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
echo "---------------------------------------------------------------------"

echo "#####################################################################"
echo "Updating path with newly installed languages"
source $HOME/.bashrc
echo "---------------------------------------------------------------------"

echo "#####################################################################"
echo "Installing GitHub actions runner..."
cd $HOME
mkdir actions-runner && cd actions-runner
curl -o actions-runner-linux-${GH_ACTIONS_ARCH}-2.286.1.tar.gz \
     -L https://github.com/actions/runner/releases/download/v2.286.1/actions-runner-linux-${GH_ACTIONS_ARCH}-2.286.1.tar.gz
tar xzf ./actions-runner-linux-${GH_ACTIONS_ARCH}-2.286.1.tar.gz
echo "Please enter the GitHub actions token:"
read GITHUB_ACTIONS_TOKEN
./config.sh --url https://github.com/Picovoice --token ${GITHUB_ACTIONS_TOKEN}
sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
echo "---------------------------------------------------------------------"

echo "#####################################################################"
echo "Restarting in 1 minute..."
sudo shutdown -r +1
echo "---------------------------------------------------------------------"
