#!/bin/bash

echo "========================================"
echo "  ASTEROID IMPACT SIMULATOR"
echo "  NASA Hackathon 2025"
echo "========================================"
echo

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt --quiet

# Run the application
echo
echo "Starting server..."
echo "Open your browser at: http://localhost:5000"
echo
python app.py


