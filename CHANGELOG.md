# GrindTime Changelog

All notable changes to GrindTime will be documented in this file.

---

## [v1.0.2] - 2025-11-17

### � Added
- **Alarm Sound on Timer Completion**
  - Pleasant audio notification when focus session ends
  - 4 sound types: Success (default), Chime, Bell, Classic
  - Uses Web Audio API for generated sounds (no files needed!)
  - Works even when window is minimized
  - User preference support for sound type and enable/disable

### 🔧 Technical
- Created alarm sound utility with Web Audio API
- Integrated alarm playback through offscreen document
- Added `playCompletionAlarm()` to background service worker
- Sound generation functions in offscreen.js

---

## [v1.0.1] - 2025-11-17

### 🐛 Fixed
- **Critical: Chrome Runtime Error in Social Media Tracker**
  - Extension no longer crashes on reload or updates
  - Added proper chrome.runtime context validation
  - Graceful shutdown when extension reloads
  - Better error handling prevents console spam

### 🎯 Improved
- **Face Detection Accuracy**
  - Added skin tone detection using RGB analysis (works for all skin tones)
  - Increased stability threshold (2 → 3 consecutive frames)
  - Better lighting tolerance (30-230 brightness range)
  - Stricter detection thresholds (75%/70% dark/bright ratios)
  - Reduced false positives from quick movements
  - Reduced false negatives when sitting still
  - Faster idle detection (3 seconds vs 4 seconds)
  - Multi-factor detection (lighting + movement + skin + camera state)

### 🔧 Technical
- Enhanced debug logging with skin tone metrics
- Center-weighted face detection algorithm
- Safe initialization with retry logic
- Extension context validation on all chrome.runtime calls

---

## [v1.0.0] - 2025-11-16

### 🎉 Initial Release

### ⏱️ Timer System
- Multiple timer modes: Focus (25min), Short Break (5min), Long Break (15min)
- Keyboard shortcuts: Space (pause/resume), R (reset), M (mode switch)
- Persistent state across browser restarts
- Visual feedback with clean, modern interface

### 👁️ Face Detection
- Automatic face tracking when timer starts
- Camera-based attention detection
- Works in background via offscreen document
- Visual indicator for camera status
- Privacy-first: all processing local, no data sent

### 🔥 Motivation System
- 450+ unique aggressive trash talk messages
- 8 categories: Brutal Reality, Aggressive Motivation, No-Pity Zone, Harsh Truth Bombs, Competitive Fire, Ultimate Grind, Savage Reality, Direct & Harsh
- Smart anti-repetition (tracks last 50 messages)
- Context-aware messaging
- Optional text-to-speech

### 📱 Social Media Tracking
- Monitors 20+ platforms (Facebook, YouTube, Twitter/X, Instagram, TikTok, Reddit, LinkedIn, etc.)
- Distraction history with timestamps
- Timer context tracking
- Duration tracking per visit
- Site breakdown analytics

### 📊 Analytics
- Detailed distraction history
- Site breakdown by platform
- Duration insights
- Timer mode correlation
- Export functionality

### 🛡️ Security & Privacy
- Local processing only
- No data collection or tracking
- XSS protection with input sanitization
- Strict Content Security Policy
- Open source transparency

### 🔧 Technical Features
- Chrome Extension Manifest V3
- Service worker architecture
- Offscreen Documents API for face tracking
- Web Audio API for sounds
- Canvas-based detection algorithms
- Efficient storage with chrome.storage API

---

## Development Notes

### Architecture
- **Manifest V3** - Modern Chrome extension format
- **Service Worker** - Background script for persistence
- **Offscreen Document** - Face tracking and audio playback
- **Content Scripts** - Social media tracking and page integration

### File Structure
```
grindtime/
├── manifest.json           # Extension configuration
├── background/
│   └── background.js       # Service worker (timer, tracking, notifications)
├── content/
│   ├── content.js          # Page content script
│   ├── faceTracker.js      # Face detection (content)
│   └── socialMediaTracker.js # Social media monitoring
├── offscreen/
│   ├── offscreen.html      # Offscreen document
│   └── offscreen.js        # Face tracking & audio (background)
├── popup/
│   ├── popup.html          # Extension popup UI
│   ├── popup.js            # Popup logic
│   ├── popup.css           # Popup styles
│   ├── history.html        # Distraction history page
│   └── history.js          # History logic
├── utils/
│   ├── timer.js            # Timer utilities
│   ├── speech.js           # Trash talk messages
│   ├── storage.js          # Storage helpers
│   └── alarmSound.js       # Alarm sound utility
└── icons/                  # Extension icons
```

---

## Roadmap

### v1.1 (Planned)
- [ ] Settings UI for alarm preferences
- [ ] Custom timer durations
- [ ] Volume control for alarm
- [ ] Sound preview button
- [ ] Pomodoro streak visualization
- [ ] Weekly/monthly analytics dashboard

### v1.2 (Future)
- [ ] Custom trash talk messages
- [ ] Dark mode toggle
- [ ] Different alarms per timer mode
- [ ] Achievement system
- [ ] Export/import settings

### v2.0 (Long-term)
- [ ] Firefox support
- [ ] Edge support
- [ ] Mobile app companion
- [ ] Cloud sync (optional)
- [ ] Team challenges
- [ ] Advanced analytics

---

## License

MIT License - Free to use, modify, and distribute

---

**Stay Focused. Stay Grinding. No Excuses.** 🔥
- ✅ Session statistics
- ✅ Circular timer UI with HH:MM:SS
- ✅ Green gradient theme
- ✅ Control buttons (START/PAUSE/RESET)
- ✅ Face status monitoring

---

## Upgrade Instructions

### For Users:
1. Go to `chrome://extensions/`
2. Find GrindTime
3. Click 🔄 reload button
4. Open GrindTime popup
5. Click START
6. Grant camera permission (first time only)
7. ✅ Done! Enjoy automatic face tracking!

### What to Expect:
- First time: Camera permission prompt
- Subsequently: Instant activation
- No webpage requirements
- Works everywhere!

---

## Breaking Changes:
- Content script (`content/faceTracker.js`) is now deprecated
- Will be removed in future version
- All users should upgrade to v2.0 for better experience

---

## Bug Fixes:
- Fixed: Face tracking requiring specific webpages
- Fixed: Timer text touching circle edges (reduced font size)
- Fixed: Face status card overlap issues
- Fixed: Complex tab dependency logic

---

## Coming Soon:
- [ ] Visual camera indicator in toolbar
- [ ] Manual face tracking toggle
- [ ] Sensitivity settings
- [ ] Camera selection (multi-camera support)
- [ ] Battery saver mode
- [ ] Stats dashboard improvements

---

**Note:** This is a significant architectural improvement that makes GrindTime truly seamless!
