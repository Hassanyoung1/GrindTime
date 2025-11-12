# GrindTime Chrome Extension - Roadmap

## 1. Objective

Build a Chrome extension that helps users **stay focused**, **track attention**, and **maintain productivity streaks**, using timers, face-tracking, and interactive alerts.

---

## 2. Phases

### **Phase 1: Core MVP – Timer + Streak**

**Goal:** Launch a minimal working version of GrindTime.

**Tasks:**

1. Create Chrome extension repo and manifest.
2. Implement **popup UI**:

   * Live clock
   * Countdown timer (hours, minutes, seconds)
   * Start/Stop buttons
   * Streak display
3. Implement **background timer**:

   * Timer continues even if popup is closed
   * Send updates to popup
4. Implement **streak tracking**:

   * Increment streak upon timer completion
   * Persist streak via `chrome.storage.sync`
5. Test timer and streak system across popup open/close cycles.

**Deliverables:**

* Fully functional timer with streak system
* Popup interface displaying live countdown and streak

---

### **Phase 2: Face Tracking**

**Goal:** Monitor user presence to prevent slacking.

**Tasks:**

1. Add **content script** for face-tracking using MediaPipe FaceMesh.
2. Set up **webcam access**:

   * Ask user permission
   * Create hidden or debug video feed
3. Detect **face lost/face detected** events.
4. Connect face-tracking to **background script messaging**.
5. Add **visual indicator** (green/red dot) for debugging.

**Deliverables:**

* Face-tracking running on all pages
* Console logs for detection events
* Optional overlay showing detection status

---

### **Phase 3: Trash-Talk Alerts**

**Goal:** Keep users accountable using voice prompts.

**Tasks:**

1. Implement **SpeechSynthesis** in background script.
2. Define **trash-talk message pool**:

   * Randomly select messages when face is lost
3. Connect **face tracking → background → TTS alerts**
4. Test alerts trigger reliably when user leaves screen.
5. Optional: allow **user-defined custom messages**.

**Deliverables:**

* Audible trash-talk alerts on distraction
* Face-tracking and timer fully integrated

---

### **Phase 4: Timer Enhancements**

**Goal:** Make the timer more flexible and user-friendly.

**Tasks:**

1. Support **hours input** in addition to minutes and seconds.
2. Add **pause/resume functionality**.
3. Visual improvements:

   * Smooth countdown animation
   * Highlight running timer vs stopped
4. Optional: **notification alerts** when timer finishes if popup is closed.

**Deliverables:**

* Flexible, user-friendly timer
* Countdown visible even if popup closed

---

### **Phase 5: Gamification & Analytics**

**Goal:** Motivate users with streaks, stats, and achievements.

**Tasks:**

1. Track **total focus hours**.
2. Introduce **streak milestones**:

   * Badge or celebratory notification for 3/7/14/30 days
3. Display **stats dashboard** in popup:

   * Total focus sessions
   * Average session duration
   * Longest streak
4. Optional: **user achievements** (unlockable levels, badges)

**Deliverables:**

* Gamified experience with stats and streak badges
* Popup dashboard showing progress

---

### **Phase 6: UX & Accessibility**

**Goal:** Make GrindTime user-friendly and accessible.

**Tasks:**

1. Refine **popup UI** with clean styling.
2. Optimize **performance**:

   * Minimal CPU usage for face-tracking
   * Efficient background timer
3. Accessibility improvements:

   * Keyboard shortcuts for start/stop
   * High-contrast visual indicators
4. Optional: **mobile-friendly design** via Chrome for Android

**Deliverables:**

* Polished UI with performance optimizations
* Accessible to users with visual/interaction limitations

---

### **Phase 7: Future Enhancements**

**Goal:** Expand GrindTime’s capabilities for long-term growth.

**Ideas:**

* Integration with **calendar or task managers** for scheduling focus sessions.
* AI-driven **distraction analysis**: detect smartphone usage or multiple tabs.
* Cloud sync for **cross-device streaks and settings**.
* Multi-language support for international users.
* Integration with browser notifications or push alerts.

---

## 3. Recommended Development Timeline

| Phase   | Duration | Notes                               |
| ------- | -------- | ----------------------------------- |
| Phase 1 | 1 week   | Core timer and streak functionality |
| Phase 2 | 1 week   | Face-tracking implementation        |
| Phase 3 | 1 week   | Trash-talk TTS alerts               |
| Phase 4 | 3-5 days | Timer enhancements & pause/resume   |
| Phase 5 | 1 week   | Gamification and stats dashboard    |
| Phase 6 | 3-5 days | UI polish & accessibility           |
| Phase 7 | Ongoing  | Future enhancements & analytics     |

---

This roadmap provides a **clear, structured path from MVP to advanced GrindTime features**, ensuring incremental progress while maintaining focus on core user value.

---
