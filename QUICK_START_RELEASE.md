# Quick Start: Release CTX v1.0.0

## 5-Minute Setup (One-Time)

### 1. Enroll in Apple Developer Program
- Visit: https://developer.apple.com/programs/
- Enroll ($99/year)
- Wait for verification email (5-30 minutes)

### 2. Create Developer ID Certificate
- Open Xcode → Preferences → Accounts
- Add your Apple ID
- Click "Manage Certificates"
- Create "Developer ID Application" certificate
- Note the Team ID shown (you'll need this)

### 3. Get App-Specific Password
- Go to: https://appleid.apple.com/account/manage
- Sign in
- Security → App-Specific Passwords
- Create password, label: "CTX Notarization"
- Save securely (you'll use this for releases)

## Release Checklist

```bash
# 1. Update version numbers
# Edit package.json: "version": "1.0.0"
# Edit src-tauri/tauri.conf.json: "version": "1.0.0"

# 2. Update changelog
# Edit CHANGELOG.md - add v1.0.0 section

# 3. Commit
git add .
git commit -m "Release v1.0.0"

# 4. Create tag and push (triggers GitHub Actions)
git tag v1.0.0
git push origin main
git push origin v1.0.0

# 5. Wait for GitHub Actions to build (~10 minutes)
# Monitor at: https://github.com/faalbane/ctx/actions

# 6. Notarize the app (requires Apple credentials)
export APPLE_ID="your-email@apple.com"
export TEAM_ID="XXXXX"  # From Xcode (after your name in Manage Certificates)
export APP_PASSWORD="xxxx-xxxx-xxxx"  # From Apple ID app passwords

npm run build
./scripts/notarize.sh "src-tauri/target/release/bundle/macos/CTX.app"
./scripts/create-dmg.sh v1.0.0

# 7. Upload notarized DMG to GitHub Release
# - Go to https://github.com/faalbane/ctx/releases
# - Find the v1.0.0 release (may be draft)
# - Upload: CTX-v1.0.0-macOS.dmg
# - Publish release

# Done! Users can now download from:
# https://github.com/faalbane/ctx/releases
# https://faalbane.github.io/ctx
```

## Verify Release

```bash
# Test DMG mounting
hdiutil attach CTX-v1.0.0-macOS.dmg
# Drag CTX.app to Applications
# Launch CTX - should work without warnings
```

## Troubleshooting

**"Team ID not found"**
- Open Xcode → Preferences → Accounts
- Select your Apple ID
- Click "View Details"
- Look for Team ID in the list

**Notarization fails**
- Check APPLE_ID is correct (should be Apple ID email)
- Check TEAM_ID is correct (from Xcode)
- Check APP_PASSWORD is correct (from Apple ID app passwords)
- Check app was built: `ls "src-tauri/target/release/bundle/macos/CTX.app"`

**DMG creation fails**
- Ensure app exists: `ls "src-tauri/target/release/bundle/macos/CTX.app"`
- Run with debugging: `bash -x ./scripts/create-dmg.sh v1.0.0`

## Next Releases (v1.0.1, v1.1.0, etc.)

Same process, but faster:
1. Update versions and changelog
2. Commit and tag: `git tag v1.0.1 && git push origin v1.0.1`
3. Wait for GitHub Actions
4. Notarize and upload DMG
5. Publish release

Estimated time: 30-45 minutes per release

## Resources

- Full guide: [RELEASING.md](./RELEASING.md)
- Implementation details: [PRODUCTIZATION_SUMMARY.md](./PRODUCTIZATION_SUMMARY.md)
- Website: https://faalbane.github.io/ctx
- GitHub: https://github.com/faalbane/ctx
