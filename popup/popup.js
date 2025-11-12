document.addEventListener("DOMContentLoaded", () => {
  
  // ---------------- DOM Elements ----------------
  const timerDisplayEl = document.getElementById("timerDisplay");
  const modeLabelEl = document.getElementById("modeLabel");
  const modeIconEl = document.getElementById("modeIcon");
  const streakCountEl = document.getElementById("streakCount");
  const sessionsTodayEl = document.getElementById("sessionsToday");
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");
  const progressRing = document.getElementById("progressRing");
  const faceStatusEl = document.getElementById("faceStatus");
  
  // Time input (HH:MM:SS format)
  const timeInputSection = document.getElementById("timeInputSection");
  const timeInputLabel = document.getElementById("timeInputLabel");
  const hoursInput = document.getElementById("hoursInput");
  const minutesInput = document.getElementById("minutesInput");
  const secondsInput = document.getElementById("secondsInput");
  
  // Mode dots
  const modeDots = document.querySelectorAll(".mode-dot");
  
  // Settings
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsOverlay = document.getElementById("settingsOverlay");
  const closeSettings = document.getElementById("closeSettings");
  
  // History
  const historyBtn = document.getElementById("historyBtn");

  // ---------------- Timer State ----------------
  let currentMode = 'work'; // work, short, long, custom
  let isRunning = false;
  let timeLeft = 25 * 60; // Default 25 minutes
  let totalTime = 25 * 60;
  
  const modeConfig = {
    work: { time: 25 * 60, label: 'Focus Time', icon: '💼', inputLabel: 'Work Duration' },
    short: { time: 5 * 60, label: 'Short Break', icon: '☕', inputLabel: 'Short Break' },
    long: { time: 15 * 60, label: 'Long Break', icon: '🌴', inputLabel: 'Long Break' },
    custom: { time: 10 * 60, label: 'Custom', icon: '⚙️', inputLabel: 'Custom Duration' }
  };


  // ---------------- Load Custom Times from Storage ----------------
  function loadCustomTimes() {
    chrome.storage.sync.get(['workTime', 'shortBreakTime', 'longBreakTime', 'customTime'], (result) => {
      if (result.workTime !== undefined) {
        modeConfig.work.time = result.workTime; // Now stored as seconds
      }
      if (result.shortBreakTime !== undefined) {
        modeConfig.short.time = result.shortBreakTime; // Now stored as seconds
      }
      if (result.longBreakTime !== undefined) {
        modeConfig.long.time = result.longBreakTime; // Now stored as seconds
      }
      if (result.customTime !== undefined) {
        modeConfig.custom.time = result.customTime; // Now stored as seconds
      }
      
      // Update the input value for current mode
      updateTimeInput();
    });
  }
  
  // Update time input based on current mode
  function updateTimeInput() {
    const config = modeConfig[currentMode];
    const totalSeconds = config.time;
    
    timeInputLabel.textContent = config.inputLabel;
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    hoursInput.value = hours;
    minutesInput.value = minutes;
    secondsInput.value = seconds;
  }
  
  // Helper function to get total seconds from inputs
  function getTotalSecondsFromInputs() {
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;
    return (hours * 3600) + (minutes * 60) + seconds;
  }
  
  // Helper function to save current time settings
  function saveTimeSettings() {
    const totalSeconds = getTotalSecondsFromInputs();
    
    // Ensure at least 1 second
    if (totalSeconds < 1) {
      hoursInput.value = 0;
      minutesInput.value = 1;
      secondsInput.value = 0;
      modeConfig[currentMode].time = 60;
    } else {
      modeConfig[currentMode].time = totalSeconds;
    }
    
    // Save to storage based on mode (now storing as seconds)
    const storageKey = {
      work: 'workTime',
      short: 'shortBreakTime',
      long: 'longBreakTime',
      custom: 'customTime'
    }[currentMode];
    
    chrome.storage.sync.set({ [storageKey]: modeConfig[currentMode].time });
    
    // Update timer if not running
    if (!isRunning) {
      setMode(currentMode);
    }
  }
  
  // Add event listeners to all time inputs
  hoursInput.addEventListener("change", saveTimeSettings);
  minutesInput.addEventListener("change", saveTimeSettings);
  secondsInput.addEventListener("change", saveTimeSettings);
  
  // Validate input ranges
  hoursInput.addEventListener("blur", () => {
    let val = parseInt(hoursInput.value) || 0;
    if (val < 0) val = 0;
    if (val > 23) val = 23;
    hoursInput.value = val;
  });
  
  minutesInput.addEventListener("blur", () => {
    let val = parseInt(minutesInput.value) || 0;
    if (val < 0) val = 0;
    if (val > 59) val = 59;
    minutesInput.value = val;
  });
  
  secondsInput.addEventListener("blur", () => {
    let val = parseInt(secondsInput.value) || 0;
    if (val < 0) val = 0;
    if (val > 59) val = 59;
    secondsInput.value = val;
  });

  // ---------------- Load Stats from Storage ----------------
  function loadStats() {
    chrome.storage.sync.get(['streak', 'sessionsToday', 'totalFocusTime'], (result) => {
      const streak = result.streak || 0;
      const sessions = result.sessionsToday || 0;
      
      streakCountEl.textContent = streak;
      
      // Update sessions display if it exists
      if (sessionsTodayEl) {
        sessionsTodayEl.textContent = sessions;
      }
    });

    // Check if timer is running
    chrome.storage.local.get(['timerRunning', 'timeLeft', 'totalTime', 'currentMode'], (result) => {
      if (result.timerRunning) {
        isRunning = true;
        currentMode = result.currentMode || 'work';
        if (result.timeLeft !== undefined) {
          timeLeft = result.timeLeft;
        }
        if (result.totalTime !== undefined) {
          totalTime = result.totalTime;
        }
        updateDisplay();
        updateProgressRing();
        updateButtonStates();
      }
    });
    
    // Check face tracking status
    checkFaceTrackingStatus();
  }
  
  // Update button visibility based on timer state
  function updateButtonStates() {
    if (isRunning) {
      startBtn.style.display = 'none';
      pauseBtn.style.display = 'flex';
    } else {
      startBtn.style.display = 'flex';
      pauseBtn.style.display = 'none';
    }
  }
  
  // Check if face tracking is active
  async function checkFaceTrackingStatus() {
    try {
      // Get status from storage
      chrome.storage.local.get(['faceTrackingActive', 'lastFaceStatus'], (result) => {
        if (result.faceTrackingActive) {
          if (result.lastFaceStatus === true) {
            updateFaceStatus('active', 'Face detected ✓');
          } else if (result.lastFaceStatus === false) {
            updateFaceStatus('lost', 'Face not detected ⚠');
          } else {
            updateFaceStatus('active', 'Face tracking active (open any webpage)');
          }
        } else {
          updateFaceStatus('inactive', 'Face tracking inactive');
        }
      });
    } catch (error) {
      console.error('Error checking face tracking:', error);
      updateFaceStatus('inactive', 'Face tracking inactive');
    }
  }
  
  // Update face status display
  function updateFaceStatus(status, message) {
    faceStatusEl.classList.remove('active', 'lost');
    
    if (status === 'active') {
      faceStatusEl.classList.add('active');
    } else if (status === 'lost') {
      faceStatusEl.classList.add('lost');
    }
    
    const statusText = faceStatusEl.querySelector('.status-text');
    if (statusText) {
      statusText.textContent = message;
    }
  }
  
  // ---------------- Mode Selection ----------------
  function setMode(mode) {
    currentMode = mode;
    const config = modeConfig[mode];
    timeLeft = config.time;
    totalTime = config.time;
    
    // Update UI
    modeLabelEl.textContent = config.label;
    modeIconEl.textContent = config.icon;
    updateDisplay();
    updateProgressRing();
    updateTimeInput();
    
    // Update active dot
    modeDots.forEach((dot, index) => {
      dot.classList.remove('active');
      if ((index === 0 && mode === 'work') ||
          (index === 1 && mode === 'short') ||
          (index === 2 && mode === 'long') ||
          (index === 3 && mode === 'custom')) {
        dot.classList.add('active');
      }
    });
    
    // Toggle rest mode styling
    if (mode === 'short' || mode === 'long') {
      document.body.classList.add('rest-mode');
      progressRing.classList.add('white-stroke');
      timerDisplayEl.classList.add('white-text');
      modeLabelEl.classList.add('white-text');
    } else {
      document.body.classList.remove('rest-mode');
      progressRing.classList.remove('white-stroke');
      timerDisplayEl.classList.remove('white-text');
      modeLabelEl.classList.remove('white-text');
    }
  }
  
  // Mode dot click handlers
  modeDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      if (isRunning) {
        return; // Don't change mode while timer is running
      }
      
      const modes = ['work', 'short', 'long', 'custom'];
      const selectedMode = modes[index];
      setMode(selectedMode);
    });
  });

  // ---------------- Timer Display ----------------
  function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  function updateDisplay() {
    timerDisplayEl.textContent = formatTime(timeLeft);
  }
  
  // ---------------- Progress Ring ----------------
  function updateProgressRing() {
    const radius = 115;
    const circumference = 2 * Math.PI * radius;
    const progress = timeLeft / totalTime;
    const offset = circumference * (1 - progress);
    
    progressRing.style.strokeDashoffset = offset;
  }

  // ---------------- Control Buttons (Start/Pause/Reset) ----------------
  
  // Start Button
  startBtn.addEventListener("click", () => {
    // Start timer
    chrome.runtime.sendMessage({ 
      action: "startTimer", 
      time: timeLeft,
      mode: currentMode
    });

    isRunning = true;
    totalTime = timeLeft;
    updateButtonStates();
  });

  // Pause Button
  pauseBtn.addEventListener("click", () => {
    // Pause timer
    chrome.runtime.sendMessage({ action: "stopTimer" });
    
    isRunning = false;
    updateButtonStates();
  });

  // Reset Button
  resetBtn.addEventListener("click", () => {
    // Stop timer if running
    if (isRunning) {
      chrome.runtime.sendMessage({ action: "stopTimer" });
      isRunning = false;
    }
    
    // Reset to default time for current mode
    timeLeft = modeConfig[currentMode].time;
    totalTime = timeLeft;
    
    updateDisplay();
    updateProgressRing();
    updateButtonStates();
  });


  // ---------------- Settings Modal ----------------
  if (settingsBtn && settingsOverlay && closeSettings) {
    settingsBtn.addEventListener("click", () => {
      settingsOverlay.classList.add('active');
    });
    
    closeSettings.addEventListener("click", () => {
      settingsOverlay.classList.remove('active');
    });
    
    settingsOverlay.addEventListener("click", (e) => {
      if (e.target === settingsOverlay) {
        settingsOverlay.classList.remove('active');
      }
    });
  } else {
    console.error('❌ Settings navigation failed - missing elements:', {
      settingsBtn: !!settingsBtn,
      settingsOverlay: !!settingsOverlay,
      closeSettings: !!closeSettings
    });
  }
  
  // ---------------- History Button ----------------
  if (historyBtn) {
    historyBtn.addEventListener("click", () => {
      // Open history page in a new window
      chrome.windows.create({
        url: chrome.runtime.getURL('popup/history.html'),
        type: 'popup',
        width: 600,
        height: 700
      });
    });
  } else {
    console.error('❌ History button not found!');
  }

  // ---------------- Listen for Background Updates ----------------
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "updateTimer") {
      timeLeft = msg.timeLeft;
      updateDisplay();
      updateProgressRing();
    }

    if (msg.action === "timerDone") {
      isRunning = false;
      timeLeft = modeConfig[currentMode].time;
      totalTime = timeLeft;
      updateDisplay();
      updateProgressRing();
      updateButtonStates();
      
      // Reload stats
      loadStats();
    }

    if (msg.action === "faceStatusUpdate") {
      if (msg.faceDetected) {
        faceStatusEl.classList.remove('lost');
        faceStatusEl.classList.add('active');
        faceStatusEl.querySelector('.status-text').textContent = "Face detected ✓";
      } else {
        faceStatusEl.classList.remove('active');
        faceStatusEl.classList.add('lost');
        faceStatusEl.querySelector('.status-text').textContent = "Face not detected ⚠";
      }
    }
  });


  // ---------------- Voice Settings ----------------
  const toneSelect = document.getElementById("toneSelect");
  const voiceSelect = document.getElementById("voiceSelect");
  const rateSlider = document.getElementById("rateSlider");
  const rateValue = document.getElementById("rateValue");
  const pitchSlider = document.getElementById("pitchSlider");
  const pitchValue = document.getElementById("pitchValue");
  const volumeSlider = document.getElementById("volumeSlider");
  const volumeValue = document.getElementById("volumeValue");
  const testVoiceBtn = document.getElementById("testVoiceBtn");

  // Load available voices
  function loadVoices() {
    chrome.tts.getVoices((voices) => {
      voiceSelect.innerHTML = '<option value="">Default (System Voice)</option>';
      
      voices.forEach((voice) => {
        const option = document.createElement('option');
        option.value = voice.voiceName;
        
        // Create a nice display name with language
        let displayName = voice.voiceName;
        if (voice.lang) {
          displayName += ` (${voice.lang})`;
        }
        
        option.textContent = displayName;
        voiceSelect.appendChild(option);
      });

      // Load saved voice preference
      chrome.storage.sync.get(['voiceName'], (result) => {
        if (result.voiceName) {
          voiceSelect.value = result.voiceName;
        }
      });
    });
  }

  // Load saved settings
  function loadVoiceSettings() {
    chrome.storage.sync.get(['speakingTone', 'voiceName', 'voiceRate', 'voicePitch', 'voiceVolume'], (result) => {
      if (result.speakingTone) {
        toneSelect.value = result.speakingTone;
      }
      if (result.voiceRate !== undefined) {
        rateSlider.value = result.voiceRate;
        rateValue.textContent = result.voiceRate;
      }
      if (result.voicePitch !== undefined) {
        pitchSlider.value = result.voicePitch;
        pitchValue.textContent = result.voicePitch;
      }
      if (result.voiceVolume !== undefined) {
        const volumePercent = Math.round(result.voiceVolume * 100);
        volumeSlider.value = volumePercent;
        volumeValue.textContent = volumePercent;
      }
    });
  }

  // Save tone preference
  toneSelect.addEventListener("change", () => {
    chrome.storage.sync.set({ speakingTone: toneSelect.value });
  });

  // Save voice preference
  voiceSelect.addEventListener("change", () => {
    chrome.storage.sync.set({ voiceName: voiceSelect.value });
  });

  // Rate slider
  rateSlider.addEventListener("input", () => {
    const value = parseFloat(rateSlider.value);
    rateValue.textContent = value.toFixed(1);
    chrome.storage.sync.set({ voiceRate: value });
  });

  // Pitch slider
  pitchSlider.addEventListener("input", () => {
    const value = parseFloat(pitchSlider.value);
    pitchValue.textContent = value.toFixed(1);
    chrome.storage.sync.set({ voicePitch: value });
  });

  // Volume slider
  volumeSlider.addEventListener("input", () => {
    const value = parseInt(volumeSlider.value);
    volumeValue.textContent = value;
    const volumeDecimal = value / 100;
    chrome.storage.sync.set({ voiceVolume: volumeDecimal });
  });

  // Test voice button
  testVoiceBtn.addEventListener("click", () => {
    // Different test messages for each tone
    const testMessages = {
      motivational: "You've got this! Stay focused and crush your goals!",
      roast: "Oh wow, testing the voice? At least you're doing something productive!",
      aggressive: "FOCUS! This is what winners sound like!",
      playful: "Hey buddy! This is me keeping you on track! Pretty cool, right?",
      professional: "Greetings. This is a professional reminder to maintain your focus.",
      chill: "Yo, just checking if this sounds good to you. Pretty chill, right?"
    };
    
    chrome.storage.sync.get(['speakingTone', 'voiceName', 'voiceRate', 'voicePitch', 'voiceVolume'], (result) => {
      const tone = result.speakingTone || 'motivational';
      const testMessage = testMessages[tone] || testMessages.motivational;
      
      const options = {
        rate: result.voiceRate || 1.2,
        pitch: result.voicePitch || 0.9,
        volume: result.voiceVolume || 0.8,
        enqueue: false
      };
      
      if (result.voiceName) {
        options.voiceName = result.voiceName;
      }
      
      chrome.tts.speak(testMessage, options);
    });
  });

  // ---------------- Initialize ----------------
  // Check if all critical elements exist
  if (!startBtn) {
    console.error('Start button not found!');
  }
  if (!pauseBtn) {
    console.error('Pause button not found!');
  }
  if (!resetBtn) {
    console.error('Reset button not found!');
  }
  if (!settingsBtn) {
    console.error('Settings button not found!');
  }
  if (!settingsOverlay) {
    console.error('Settings overlay not found!');
  }
  if (!closeSettings) {
    console.error('Close settings button not found!');
  }
  if (modeDots.length === 0) {
    console.error('Mode dots not found!');
  }
  
  loadCustomTimes();
  loadStats();
  loadVoices();
  loadVoiceSettings();
  setMode('work');
  updateButtonStates(); // Initialize button visibility

  // Reload voices when they change (some browsers load them async)
  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

});