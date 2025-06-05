import os
import sys
import shutil
from pathlib import Path
import subprocess

def build_exe():
    """Build Sasha's executable using PyInstaller."""
    try:
        # Install PyInstaller if not already installed
        subprocess.run([sys.executable, "-m", "pip", "install", "pyinstaller"], check=True)
        
        # Get the directory of this script
        script_dir = Path(__file__).parent
        
        # Create spec file content
        spec_content = f"""
# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['agent_gui.py'],
    pathex=['{script_dir}'],
    binaries=[],
    datas=[
        ('*.env', '.'),
        ('*.json', '.'),
        ('*.py', '.'),
        ('screenshots', 'screenshots'),
    ],
    hiddenimports=[
        'PyQt6',
        'google.generativeai',
        'selenium',
        'PIL',
        'keyring',
        'cryptography',
    ],
    hookspath=[],
    hooksconfig={{}},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='sasha',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='sasha.ico'
)
"""
        
        # Write spec file
        spec_path = script_dir / "sasha.spec"
        with open(spec_path, "w") as f:
            f.write(spec_content)
            
        # Create dist directory if it doesn't exist
        dist_dir = script_dir / "dist"
        dist_dir.mkdir(exist_ok=True)
        
        # Build the executable
        subprocess.run([
            sys.executable,
            "-m",
            "PyInstaller",
            "--clean",
            "--noconfirm",
            str(spec_path)
        ], check=True)
        
        print("Sasha executable built successfully!")
        print(f"Executable location: {dist_dir / 'sasha.exe'}")
        
    except Exception as e:
        print(f"Error building executable: {e}")
        sys.exit(1)

if __name__ == "__main__":
    build_exe() 