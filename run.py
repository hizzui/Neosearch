#!/usr/bin/env python
"""
Railway startup script - runs the FastAPI app
"""
import subprocess
import sys
import os

# Ensure we're in the backend directory
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
if os.path.exists(backend_path):
    os.chdir(backend_path)

# Run uvicorn
port = os.environ.get('PORT', '8000')
subprocess.run([
    sys.executable, '-m', 'uvicorn',
    'main:app',
    '--host', '0.0.0.0',
    '--port', port
])
