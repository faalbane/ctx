#!/bin/bash
#
# DMG creation script for CTX macOS app distribution
#
# Usage: ./scripts/create-dmg.sh <version> [output-dir]
# Example: ./scripts/create-dmg.sh v1.0.0
# Example: ./scripts/create-dmg.sh v1.0.0 ./releases
#

set -e

VERSION="${1:?Error: Please provide version as first argument (e.g., v1.0.0)}"
OUTPUT_DIR="${2:-.}"
APP_SOURCE="src-tauri/target/release/bundle/macos/CTX.app"
VOLUME_NAME="CTX"
DMG_FILENAME="CTX-${VERSION}-macOS.dmg"
DMG_PATH="${OUTPUT_DIR}/${DMG_FILENAME}"

# Check if app exists
if [ ! -d "$APP_SOURCE" ]; then
    echo "❌ Error: App not found at $APP_SOURCE"
    echo "   Please run: npm run build"
    exit 1
fi

# Create output directory if needed
mkdir -p "$OUTPUT_DIR"

echo "📦 Creating DMG installer for CTX $VERSION..."
echo "   Source: $APP_SOURCE"
echo "   Output: $DMG_PATH"
echo ""

# Clean up any existing DMG
if [ -f "$DMG_PATH" ]; then
    echo "🗑️  Removing existing DMG..."
    rm -f "$DMG_PATH"
fi

# Create temporary directory for DMG contents
TEMP_DIR=$(mktemp -d)
trap "rm -rf '$TEMP_DIR'" EXIT

echo "📁 Preparing DMG contents..."
cp -r "$APP_SOURCE" "$TEMP_DIR/CTX.app"

# Create symlink to Applications folder
ln -s /Applications "$TEMP_DIR/Applications"

# Create background image (optional - simple colored background)
# This creates a simple DMG without a custom background image
# If you want a custom background, you can add it here

# Create DMG
echo "🔨 Building DMG..."
hdiutil create \
    -volname "$VOLUME_NAME" \
    -srcfolder "$TEMP_DIR" \
    -ov \
    -format UDZO \
    -imagekey zlib-level=9 \
    "$DMG_PATH"

if [ ! -f "$DMG_PATH" ]; then
    echo "❌ Failed to create DMG"
    exit 1
fi

echo "✅ DMG created successfully"
echo "   File: $DMG_FILENAME"
echo "   Size: $(du -h "$DMG_PATH" | cut -f1)"

# Create checksum file for verification
CHECKSUM_FILE="${OUTPUT_DIR}/${DMG_FILENAME}.sha256"
echo "🔐 Creating SHA256 checksum..."
shasum -a 256 "$DMG_PATH" > "$CHECKSUM_FILE"
echo "   Checksum: $CHECKSUM_FILE"

# Display contents
echo ""
echo "📋 DMG Contents:"
hdiutil imageinfo "$DMG_PATH" | grep -E "Format|Sectors|Compression" || true

echo ""
echo "✨ Ready for distribution!"
echo "   Download link: github.com/faalbane/ctx/releases/download/${VERSION}/${DMG_FILENAME}"
