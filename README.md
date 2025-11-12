# ⚡ GrindTime - Chrome Extension

**Stay focused, track your presence, and get roasted when you slack!**

GrindTime is a productivity-focused Chrome extension that combines customizable focus timers, daily streak tracking, face detection, and motivating trash-talk alerts to help you stay accountable and engaged during work sessions.

![GrindTime](icons/icon128.svg)

## 🚀 Features

### ⏱️ Smart Focus Timer
- **Customizable Sessions**: Set hours, minutes, and seconds for your focus sessions
- **Persistent Timer**: Runs in the background even when popup is closed
- **Live Updates**: Real-time countdown display
- **Session Tracking**: Monitors completed sessions per day

### 🔥 Daily Streak System
- Track consecutive days of completed focus sessions
- Visual streak counter with fire emoji
- Syncs across devices via Chrome storage
- Automatic streak maintenance and recovery

### 👁️ Face Tracking
- **Canvas-Based Detection**: Simple, reliable face presence detection
- **No External Dependencies**: Works offline, no CDN required
- **Presence Monitoring**: Detects when you're away from the screen
- **Smart Throttling**: Prevents false positives with consecutive detection (3 checks)
- **Visual Indicator**: Always-visible camera status badge (top-right of page)
- **Status Updates**: Real-time feedback on camera and face detection state
- **Fast & Lightweight**: Checks every 500ms using pixel brightness analysis

### 🗣️ Trash-Talk Alerts
- **Text-to-Speech**: Motivating (and sassy) voice reminders
- **15+ Messages**: Randomized trash-talk library
- **Smart Cooldown**: 10-second delay prevents spam
- **Privacy First**: Only triggers during active timer sessions

### 📹 Camera Status Indicator
A sleek badge appears in the top-right corner of every page showing:
- **📹 Camera initializing...** (Orange) - Requesting camera access
- **👁️ Camera active** (Green) - Camera is working, tracking ready
- **✓ Face detected** (Green) - You're visible and focused
- **⚠ Face not detected** (Red) - Step back into view!
- **✗ Camera error** (Red) - Permission denied or hardware issue

**Pro Tip**: Click the indicator to minimize it (only shows the dot)

### 📊 Statistics Dashboard
- Total focus time tracking (hours and minutes)
- Sessions completed today
- Live digital clock
- Clean, modern UI with gradient design

## 📦 Installation

### From Source (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Hassanyoung1/GrindTime.git
   cd GrindTime
   ```

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (top-right toggle)
   - Click "Load unpacked"
   - Select the `GrindTime` folder

3. **Grant Permissions**
   - Allow camera access when prompted (required for face tracking)
   - Enable notifications for session completion alerts

### From Chrome Web Store
*Coming soon!*

## 🎯 Usage

### Starting a Focus Session

1. **Click the GrindTime icon** in your Chrome toolbar
2. **Set your desired time**:
   - Hours: 0-23
   - Minutes: 0-59
   - Seconds: 0-59
3. **Click "Start"** to begin your focus session
4. The timer runs in the background - you can close the popup!

### Face Tracking

Face tracking automatically activates when you:
- Visit any website while the extension is enabled
- Have an active focus timer running

**Camera Status Indicator** (top-right of page):
- 📹 **Orange dot**: Camera initializing
- 👁️ **Green dot**: Camera active and tracking
- ✓ **Green dot**: Face detected - you're focused!
- ⚠️ **Red dot**: Face not detected - get back to work!
- ✗ **Red dot**: Camera error (check permissions)

**Behavior**:
- ✅ Face detected → Extension stays quiet
- ❌ Face not detected → Trash-talk alert after 3 consecutive checks
- 🔇 10-second cooldown between alerts
- 🎯 Click indicator to minimize it (show only dot)

**Privacy**: Your camera feed never leaves your device. All processing is done locally using MediaPipe.

### Managing Your Streak

Your streak increments when you:
- Complete a full focus session
- Complete at least one session per day

Your streak resets if:
- You skip a day without completing a session

## 🛠️ Technical Details

### Architecture

```
GrindTime/
├── manifest.json              # Extension configuration
├── popup/
│   ├── popup.html            # User interface
│   ├── popup.js              # UI logic & messaging
│   └── popup.css             # Modern gradient styling
├── background/
│   └── background.js         # Service worker (timer, TTS, streaks)
├── content/
│   └── faceTracker.js        # MediaPipe face detection
├── utils/
│   ├── storage.js            # Chrome storage helpers
│   ├── timer.js              # Timer utility functions
│   └── speech.js             # TTS & trash-talk library
├── icons/                    # SVG icons (16/48/128)
└── assets/
    └── sounds/
        └── trash_talk/       # (Future: audio files)
```

### Technology Stack

- **Manifest V3**: Latest Chrome extension standard
- **MediaPipe Face Mesh**: ML-powered face detection
- **Chrome Storage API**: Sync & local storage
- **Chrome TTS API**: Text-to-speech synthesis
- **Vanilla JavaScript**: No frameworks, lightweight & fast

### Permissions

| Permission | Purpose |
|------------|---------|
| `storage` | Save streaks, stats, and timer state |
| `activeTab` | Inject face tracking on active tabs |
| `scripting` | Run content scripts |
| `tts` | Speak trash-talk alerts |
| `alarms` | (Future) Background timer persistence |
| `notifications` | Session completion notifications |

**Note**: Camera/microphone permissions are requested at runtime via `getUserMedia()`, not in the manifest.

## 🎨 Customization

### Disable Face Tracking

In `content/faceTracker.js`, change:
```javascript
const DEBUG_MODE = false; // Set to true to see video preview
```

### Add Your Own Trash-Talk

In `background/background.js`, edit the `trashTalkMessages` array:
```javascript
const trashTalkMessages = [
  "Your custom message here!",
  // ... add more
];
```

### Change Timer Defaults

In `popup/popup.html`, modify the input values:
```html
<input type="number" id="minutes" value="25" /> <!-- Change 25 to your preferred default -->
```

## 🧪 Development

### Project Structure

See `GrindTime_DEV_GUIDE.md` for comprehensive developer documentation including:
- Detailed architecture diagrams
- Message flow protocols
- Development roadmap
- Testing guidelines

### Building New Features

1. **Utility Functions**: Add to `/utils/` directory
2. **Background Logic**: Extend `background/background.js`
3. **UI Components**: Update `popup/` files
4. **Face Tracking**: Modify `content/faceTracker.js`

### Testing

1. **Load Extension**: Use Chrome's Developer Mode
2. **Check Console**: 
   - Background: `chrome://extensions/` → "Service worker" link
   - Content: Browser DevTools on any tab
   - Popup: Right-click popup → "Inspect"
3. **Test Timer**: Set 10 seconds, verify countdown and completion
4. **Test Face Tracking**: Cover camera, check for alerts
5. **Test Streaks**: Complete sessions on consecutive days

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Known Issues

- Face tracking requires HTTPS or localhost (browser security)
- MediaPipe scripts load from CDN (requires internet connection)
- TTS voice quality varies by system

## 🗺️ Roadmap

- [ ] Pause/resume timer functionality
- [ ] Custom timer presets
- [ ] Pomodoro mode (25/5 work/break cycles)
- [ ] Export statistics to CSV
- [ ] Achievement badges system
- [ ] Dark/light theme toggle
- [ ] Offline MediaPipe support
- [ ] Multiple face detection profiles
- [ ] Integration with task managers (Todoist, Trello)

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/Hassanyoung1/GrindTime/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Hassanyoung1/GrindTime/discussions)
- **Email**: hassanyoung1@example.com

## 🙏 Acknowledgments

- [MediaPipe](https://mediapipe.dev/) for face detection
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/) docs
- All contributors and beta testers

---

**Built with 💪 and ☕ by Hassan Young**

*Remember: The grind never stops!*
