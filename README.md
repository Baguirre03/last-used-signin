# Last Used Login Helper - Chrome Extension

A Chrome extension that remembers your last used signin option for each website, helping you quickly identify which login method you used previously.

## Features

- 🌟 **Visual Markers**: Adds a "⭐ Last used" indicator next to login buttons you've used before
- 🏠 **Per-Website Storage**: Remembers different login preferences for each domain
- 🔍 **Smart Detection**: Automatically detects login buttons for popular providers (Google, Facebook, GitHub, Apple, Microsoft, Twitter, LinkedIn, Discord, Amazon, Yahoo)
- 📊 **Popup Interface**: View and manage your login history across all websites
- 🧹 **Data Management**: Clear login preferences for individual sites or all sites

## How It Works

1. **Automatic Detection**: The extension scans web pages for login buttons from supported providers
2. **Click Tracking**: When you click a login button, it remembers that choice for the current website
3. **Visual Feedback**: On future visits, your last used login method is marked with a star
4. **Cross-Tab Sync**: Your preferences are synced across all browser tabs

## Supported Login Providers

- Google (including Gmail, G+)
- Facebook (including Meta)
- GitHub
- Apple (including iCloud, Sign in with Apple)
- Microsoft (including Outlook, Hotmail, Live, MSN)
- Twitter (including X.com)
- LinkedIn
- Discord
- Amazon
- Yahoo

## Installation

### For Development/Testing:

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the extension folder
4. The extension icon should appear in your browser toolbar

### Building the Extension:

```bash
# Install dependencies
npm install

# Compile TypeScript to JavaScript
npx tsc
```

The compiled files will be in the `dist/` folder.

## Usage

1. **Browse websites with login options**: The extension automatically scans for login buttons
2. **Click your preferred login method**: The extension remembers your choice
3. **Return to the site**: Your last used method will show a ⭐ marker
4. **Manage preferences**: Click the extension icon to view and manage your login history

## Extension Popup Features

- **Current Site**: Shows the login preference for the current website
- **All Sites**: Browse your complete login history with search functionality
- **Individual Clear**: Remove login preference for specific sites
- **Clear All**: Reset all login preferences (with confirmation)

## Privacy

- All data is stored locally in your browser using Chrome's storage API
- No data is sent to external servers
- Login preferences are stored per-domain for better privacy
- Automatic cleanup keeps only the most recent 100 domain preferences

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension format)
- **Permissions**: `storage` and `activeTab`
- **Content Script**: Runs on all websites to detect and mark login buttons
- **Background Script**: Handles cross-tab communication and data cleanup
- **Popup Interface**: Provides management UI for login preferences

## File Structure

```
├── manifest.json          # Extension configuration
├── popup/
│   ├── index.html         # Popup interface HTML
│   └── popup.css          # Popup styling
├── src/
│   ├── background.ts      # Background service worker
│   ├── content.ts         # Content script for web pages
│   ├── popup.ts           # Popup interface logic
│   └── tsconfig.json      # TypeScript configuration
├── dist/                  # Compiled JavaScript files
└── package.json           # Project dependencies
```

## Contributing

The extension is built with TypeScript for better code quality and maintainability. To modify:

1. Edit files in the `src/` directory
2. Run `npx tsc` to compile changes
3. Reload the extension in Chrome's extension management page

## Troubleshooting

- **Extension not working**: Make sure it's enabled in `chrome://extensions/`
- **Login buttons not detected**: The extension looks for common keywords and selectors
- **Markers not appearing**: Check that you've actually clicked login buttons on the site
- **Data not syncing**: Try refreshing the popup or reloading the extension
