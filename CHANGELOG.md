# GrindTime Changelog

## Version 2.0 - November 12, 2025

### 🚀 MAJOR UPDATE: Automatic Face Tracking

#### What's New:
- **Face tracking now starts automatically when you start the timer!**
- **No webpage required** - works directly from extension
- **Universal compatibility** - works on all pages (including chrome://)
- **Simplified user experience** - just click START and go!

#### Technical Changes:
- Implemented Chrome Offscreen Documents API
- Created isolated background context for camera access
- Removed webpage dependency
- Added automatic lifecycle management

#### Files Added:
- `offscreen/offscreen.html` - Offscreen document HTML
- `offscreen/offscreen.js` - Face tracking engine
- `OFFSCREEN_FACE_TRACKING.md` - Full documentation
- `FACE_TRACKING_AUTO_START.md` - Quick reference

#### Files Modified:
- `background/background.js` - Auto-start/stop face tracking
- `popup/popup.js` - Simplified status checking
- `manifest.json` - Added "offscreen" permission

#### User Experience:
**Before:**
1. Open a webpage
2. Wait for face tracking to initialize
3. Refresh page after extension reload
4. Hope it works on that specific page
5. Start timer

**After:**
1. Click START
2. Everything works automatically!

---

## Version 1.0 - Previous Release

### Features:
- ✅ Pomodoro timer with custom modes
- ✅ 6 personality voice system (90+ messages)
- ✅ Face tracking (webpage-based)
- ✅ Streak tracking
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
