#!/bin/bash
#
# Notarization script for CTX macOS app
# This script submits the app for notarization and staples the ticket
#
# Usage: ./scripts/notarize.sh <path-to-app>
# Example: ./scripts/notarize.sh "src-tauri/target/release/bundle/macos/CTX.app"
#
# Prerequisites:
# 1. Apple Developer account
# 2. Developer ID Application certificate installed
# 3. App-specific password for notarization
#
# Required environment variables (or edit below):
# - APPLE_ID: Your Apple ID email
# - TEAM_ID: Your Team ID (found in Apple Developer Account)
# - APP_PASSWORD: App-specific password from Apple ID settings
#

set -e

# Configuration
APP_PATH="${1:?Error: Please provide app path as argument}"
BUNDLE_ID="com.ctx.app"
NOTARY_TIMEOUT=3600  # 60 minutes

# Check if app exists
if [ ! -d "$APP_PATH" ]; then
    echo "❌ Error: App not found at $APP_PATH"
    exit 1
fi

# Check for required credentials
if [ -z "$APPLE_ID" ] || [ -z "$TEAM_ID" ] || [ -z "$APP_PASSWORD" ]; then
    echo "❌ Error: Missing required credentials"
    echo ""
    echo "Please set environment variables:"
    echo "  export APPLE_ID='your-apple-id@email.com'"
    echo "  export TEAM_ID='YOUR_TEAM_ID'"
    echo "  export APP_PASSWORD='xxxx-xxxx-xxxx-xxxx'"
    echo ""
    echo "Team ID can be found in Apple Developer Account settings"
    echo "App-specific password: https://appleid.apple.com/account/manage"
    exit 1
fi

echo "🔐 Notarizing $APP_PATH..."
echo "   Bundle ID: $BUNDLE_ID"
echo "   Apple ID: $APPLE_ID"
echo ""

# Create a ZIP file of the app for notarization
# (Tauri may also build a .app.tar.gz, but ZIP is more compatible)
TEMP_ZIP=$(mktemp).zip
echo "📦 Creating temporary ZIP for notarization..."
ditto -c -k --sequesterRsrc "$APP_PATH" "$TEMP_ZIP"

# Submit for notarization
echo "📤 Submitting to Apple Notary Service..."
NOTARY_REQUEST_ID=$(xcrun notarytool submit "$TEMP_ZIP" \
    --apple-id "$APPLE_ID" \
    --team-id "$TEAM_ID" \
    --password "$APP_PASSWORD" \
    --output-format json \
    2>&1 | jq -r '.id')

if [ -z "$NOTARY_REQUEST_ID" ] || [ "$NOTARY_REQUEST_ID" == "null" ]; then
    echo "❌ Failed to submit for notarization"
    rm -f "$TEMP_ZIP"
    exit 1
fi

echo "✅ Submitted with ID: $NOTARY_REQUEST_ID"
echo "⏳ Waiting for notarization (this may take several minutes)..."

# Wait for notarization to complete
START_TIME=$(date +%s)
while true; do
    NOTARY_STATUS=$(xcrun notarytool info "$NOTARY_REQUEST_ID" \
        --apple-id "$APPLE_ID" \
        --team-id "$TEAM_ID" \
        --password "$APP_PASSWORD" \
        --output-format json 2>&1)

    STATUS=$(echo "$NOTARY_STATUS" | jq -r '.status // .message')

    if [ "$STATUS" == "Accepted" ]; then
        echo "✅ Notarization successful!"
        break
    elif [ "$STATUS" == "In Progress" ]; then
        echo "   Still processing..."
        sleep 30
    elif [ "$STATUS" == "Invalid" ] || [ "$STATUS" == "Rejected" ]; then
        echo "❌ Notarization rejected"
        echo "Details:"
        echo "$NOTARY_STATUS" | jq .
        rm -f "$TEMP_ZIP"
        exit 1
    else
        echo "⚠️  Unknown status: $STATUS"
        echo "$NOTARY_STATUS" | jq .
    fi

    # Timeout check
    CURRENT_TIME=$(date +%s)
    if [ $((CURRENT_TIME - START_TIME)) -gt $NOTARY_TIMEOUT ]; then
        echo "❌ Notarization timed out after $(($NOTARY_TIMEOUT / 60)) minutes"
        rm -f "$TEMP_ZIP"
        exit 1
    fi
done

# Staple the notarization ticket to the app
echo "📌 Stapling notarization ticket..."
xcrun stapler staple "$APP_PATH"

if [ -f "$APP_PATH/Contents/CodeResources" ]; then
    echo "✅ Ticket stapled successfully"
else
    echo "⚠️  Warning: Could not verify ticket stapling"
fi

# Verify notarization
echo ""
echo "🔍 Verifying notarization..."
spctl -a -vv "$APP_PATH" 2>&1 | head -5 || true

# Cleanup
rm -f "$TEMP_ZIP"

echo ""
echo "✨ Notarization complete!"
echo "   App: $APP_PATH"
echo "   You can now distribute this app to users"
