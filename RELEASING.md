# Release Guide for CTX

This guide explains how to build, sign, notarize, and release CTX for distribution.

## Prerequisites

### For Local Testing & Building
- Node.js 18+
- Rust 1.70+
- macOS 10.13+

### For Code Signing & Notarization
- Apple Developer account ($99/year)
- Developer ID Application certificate
- App-specific password

## Quick Release Checklist

- [ ] Update version in `package.json`
- [ ] Update version in `src-tauri/tauri.conf.json`
- [ ] Update `CHANGELOG.md` with new version
- [ ] Commit: `git commit -m "Release v1.0.0"`
- [ ] Create tag: `git tag v1.0.0`
- [ ] Push to GitHub: `git push origin main && git push origin v1.0.0`
- [ ] GitHub Actions will build automatically
- [ ] Download DMG from GitHub release page
- [ ] Manually notarize (or CI will do it)
- [ ] Publish release

## Step 1: Prepare Release

### Update Version Numbers

Update version in **package.json**:
```json
{
  "version": "1.0.0"
}
```

Update version in **src-tauri/tauri.conf.json**:
```json
{
  "version": "1.0.0"
}
```

### Update Changelog

Edit **CHANGELOG.md** and add your new version:
```markdown
## [1.0.0] - 2026-02-04

### Added
- Feature 1
- Feature 2

### Fixed
- Bug fix 1
```

### Commit Release Changes

```bash
git add package.json src-tauri/tauri.conf.json CHANGELOG.md
git commit -m "Release v1.0.0"
```

## Step 2: Build for Release

### Local Build

```bash
npm run build
```

This creates:
- `src-tauri/target/release/bundle/macos/CTX.app`

### Create DMG

```bash
./scripts/create-dmg.sh v1.0.0
```

This creates:
- `CTX-v1.0.0-macOS.dmg`
- `CTX-v1.0.0-macOS.dmg.sha256`

## Step 3: Code Signing & Notarization

### Setup (One-time)

1. **Enroll in Apple Developer Program**
   - Go to https://developer.apple.com/programs/
   - Enroll ($99/year)
   - Verify your identity

2. **Create Developer ID Certificate**
   - Open Xcode
   - Preferences → Accounts → Add Apple ID
   - Manage Certificates → Create "Developer ID Application"
   - This creates a certificate for app distribution

3. **Get App-Specific Password**
   - Go to https://appleid.apple.com/account/manage
   - Security → App-Specific Passwords
   - Create password for "CTX Notarization"
   - Save this securely (you'll need it for notarization)

4. **Find Your Team ID**
   - In Xcode, create a dummy project
   - Select project → Signing & Capabilities
   - View your Team ID (displayed as "XXXXX" after your name)

### Notarize the App

Before distributing to users, submit the app for notarization:

```bash
export APPLE_ID="your-email@example.com"
export TEAM_ID="XXXXX"  # From step above
export APP_PASSWORD="xxxx-xxxx-xxxx"  # App-specific password

./scripts/notarize.sh "src-tauri/target/release/bundle/macos/CTX.app"
```

The script will:
1. Submit the app to Apple Notary Service
2. Wait for approval (usually 5-15 minutes)
3. Staple the notarization ticket to the app
4. Verify the notarization

**After notarization**, re-create the DMG:

```bash
./scripts/create-dmg.sh v1.0.0
```

The new DMG will contain the notarized app.

### Verify Notarization

Users can verify notarization on their machine with:

```bash
spctl -a -vv CTX.app
```

Should show: `accepted`

## Step 4: GitHub Release

### Option A: Automatic (Recommended)

1. Create and push git tag:
   ```bash
   git tag v1.0.0
   git push origin main
   git push origin v1.0.0
   ```

2. GitHub Actions will automatically:
   - Build the app
   - Create DMG
   - Create GitHub Release
   - Upload artifacts

3. Review and publish the release on GitHub

### Option B: Manual

1. Create tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. Go to GitHub → Releases → Create Release

3. Fill in details:
   - **Tag**: v1.0.0
   - **Title**: CTX v1.0.0
   - **Description**: Copy from CHANGELOG.md
   - **Attach files**:
     - `CTX-v1.0.0-macOS.dmg`
     - `CTX-v1.0.0-macOS.dmg.sha256`

4. Click "Publish Release"

## Step 5: Verify Release

### Test Download & Installation

1. Go to https://github.com/faalbane/ctx/releases
2. Download the DMG
3. Mount the DMG
4. Drag CTX.app to Applications
5. Launch CTX from Applications
6. Verify it works without Gatekeeper warnings

### Share Release

- Post on GitHub Discussions
- Share with users who requested features
- Update website to link to latest release

## CI/CD with GitHub Actions

The repository includes a GitHub Actions workflow (`.github/workflows/release.yml`) that automates builds on tag pushes.

### Current Workflow

When you push a tag `v*.*.*`:
1. GitHub Actions checks out code
2. Builds CTX for both aarch64 and x86_64
3. Creates DMG packages
4. Calculates SHA256 checksums
5. Creates GitHub Release with artifacts

### Limitations

The current workflow **does not include notarization** automatically. You must:
1. Let GitHub Actions build and create the release
2. Download the DMG locally
3. Run the notarization script manually
4. Re-upload the notarized DMG to the release

To fully automate notarization, you would need to:
- Store Apple credentials securely in GitHub Secrets
- Add notarization step to the workflow
- This requires special handling for security

## Version Numbering

CTX follows [Semantic Versioning](https://semver.org/):

- **Major** (X.0.0): Breaking changes or major features
- **Minor** (0.X.0): New features, backwards compatible
- **Patch** (0.0.X): Bug fixes only

Examples:
- `v1.0.0` - First major release
- `v1.1.0` - Add new feature
- `v1.0.1` - Bug fix

## Troubleshooting

### Build Fails
```bash
# Clean build artifacts
rm -rf src-tauri/target
npm run build
```

### Notarization Takes Too Long
- Default timeout: 60 minutes
- Edit `scripts/notarize.sh` and change `NOTARY_TIMEOUT`
- Apple's service can take 5-30 minutes

### Notarization Rejected
- Check error message in script output
- Common issues: Invalid certificate, wrong Team ID
- Verify credentials are correct
- Re-run with correct credentials

### DMG Creation Fails
```bash
# Check if app was built
ls -la "src-tauri/target/release/bundle/macos/CTX.app"

# Ensure script is executable
chmod +x scripts/create-dmg.sh

# Run with verbose output
bash -x scripts/create-dmg.sh v1.0.0
```

## Updating Website

After releasing a new version:

1. Update landing page: `docs/index.html`
2. Add screenshot or video of new features
3. Update feature list
4. Update version number in download button
5. Commit and push: `git push origin main`

Website updates automatically via GitHub Pages.

## Auto-Updates (Future)

Once auto-update system is implemented:

1. Create `latest.json` manifest:
```json
{
  "version": "1.0.0",
  "notes": "Bug fixes and new features",
  "pub_date": "2026-02-04T12:00:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "...",
      "url": "https://github.com/faalbane/ctx/releases/download/v1.0.0/CTX.app.tar.gz"
    }
  }
}
```

2. Users will be notified of updates automatically
3. App will download and install new version on next launch

## References

- [Tauri Documentation](https://tauri.app/)
- [Tauri Code Signing Guide](https://tauri.app/v1/guides/distribution/sign-macos/)
- [Apple Notarization Guide](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)
- [xcrun notarytool Documentation](https://help.apple.com/xcode/mac/current/#/dev82a6b3766)
