#!/bin/bash
# ==========================================
# Sys_Logger Installer - Mac/Linux
# ==========================================

set -e

echo ""
echo "🚀 Starting Sys_Logger Installer..."
echo "------------------------------------------"

# Get the absolute script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Ensure setup script exists
SETUP_SCRIPT="$SCRIPT_DIR/setup_linux_mac.sh"
if [ ! -f "$SETUP_SCRIPT" ]; then
    echo "❌ ERROR: Cannot find setup_linux_mac.sh"
    echo "   Current directory: $(pwd)"
    echo "   Looked in: $SCRIPT_DIR"
    echo "   Ensure you are running 'bash src/install.sh' from the root folder."
    exit 1
fi

# Ensure setup script is executable
echo "📦 Setting permissions..."
chmod +x "$SETUP_SCRIPT"

# Run setup script
echo "⚡ Launching setup process..."
"$SETUP_SCRIPT"
