#!/bin/bash

echo "Installing Python 3.8.10 for Percussion Analyzer..."

# Check if we're on Ubuntu/Debian
if command -v apt-get &> /dev/null; then
    echo "Detected Ubuntu/Debian system"
    
    # Update package list
    sudo apt-get update
    
    # Install dependencies for building Python
    sudo apt-get install -y software-properties-common
    
    # Add deadsnakes PPA (has older Python versions)
    sudo add-apt-repository ppa:deadsnakes/ppa -y
    sudo apt-get update
    
    # Install Python 3.8
    sudo apt-get install -y python3.8 python3.8-venv python3.8-dev python3.8-distutils
    
    # Verify installation
    if command -v python3.8 &> /dev/null; then
        echo "✓ Python 3.8 installed successfully!"
        python3.8 --version
        echo ""
        echo "Now you can run:"
        echo "./setup.sh"
    else
        echo "✗ Python 3.8 installation failed"
        exit 1
    fi

elif command -v yum &> /dev/null; then
    echo "Detected RHEL/CentOS system"
    echo "Installing Python 3.8 via yum..."
    
    sudo yum install -y python38 python38-devel python38-pip
    
    if command -v python3.8 &> /dev/null; then
        echo "✓ Python 3.8 installed successfully!"
        python3.8 --version
    else
        echo "✗ Python 3.8 installation failed"
        exit 1
    fi

elif command -v brew &> /dev/null; then
    echo "Detected macOS with Homebrew"
    echo "Installing Python 3.8 via Homebrew..."
    
    # Install pyenv to manage Python versions
    brew install pyenv
    
    # Install Python 3.8.10
    pyenv install 3.8.10
    pyenv global 3.8.10
    
    # Add to shell profile
    echo 'export PATH="$HOME/.pyenv/bin:$PATH"' >> ~/.bashrc
    echo 'eval "$(pyenv init -)"' >> ~/.bashrc
    
    echo "✓ Python 3.8.10 installed via pyenv!"
    echo "Please restart your terminal or run: source ~/.bashrc"

else
    echo "Unsupported system. Please install Python 3.8.10 manually."
    echo ""
    echo "Options:"
    echo "1. Use pyenv: https://github.com/pyenv/pyenv"
    echo "2. Download from python.org: https://www.python.org/downloads/release/python-3810/"
    echo "3. Use conda: conda install python=3.8.10"
    exit 1
fi