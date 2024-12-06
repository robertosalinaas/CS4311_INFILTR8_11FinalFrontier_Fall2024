#!/bin/bash

# Function to handle cleanup on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    deactivate
    exit 0
}

# Trap the SIGINT signal (Ctrl + C) to run the cleanup function
trap cleanup SIGINT

# Step 1: Install necessary packages for virtual environment
echo "Installing necessary packages for virtual environment..."
sudo apt update
sudo apt install -y python3.12-venv pypy3-venv

# Step 2: Create and activate a virtual environment for the backend
echo "Creating virtual environment for the backend..."
python3 -m venv backend/venv

echo "Activating virtual environment for the backend..."
source backend/venv/bin/activate

# Step 3: Install dependencies for the backend
echo "Installing backend dependencies..."
pip install -r backend/requirements.txt

# Step 4: Install Node.js dependencies for the backend
echo "Installing backend Node.js dependencies..."
npm install --prefix backend

# Step 5: Start the backend server
echo "Starting the backend server..."
npm run dev --prefix backend &
BACKEND_PID=$!

# Step 6: Wait for the backend server to start
echo "Waiting for the backend server to start..."
sleep 10

# Step 7: Install dependencies for the frontend
echo "Installing frontend dependencies..."
npm install --prefix frontend

# Step 8: Start the frontend server
echo "Starting the frontend server..."
npm run dev --prefix frontend &
FRONTEND_PID=$!

# Step 9: Open the browser with the frontend project
echo "Opening the browser with the frontend project..."
xdg-open http://localhost:5173

echo "Done! Your backend and frontend servers are running. Press Ctrl + C to stop."

# Wait indefinitely until Ctrl + C is pressed
while true; do
    sleep 1
done