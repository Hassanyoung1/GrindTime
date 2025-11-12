// Test version of popup.js (no Chrome API dependencies)
document.addEventListener("DOMContentLoaded", () => {
  
  const testLog = document.getElementById('testLog');
  function log(message, type = 'info') {
    const span = document.createElement('span');
    span.className = type;
    span.textContent = message;
    testLog.appendChild(document.createElement('br'));
    testLog.appendChild(span);
    testLog.scrollTop = testLog.scrollHeight;
    console.log(`[${type.toUpperCase()}]`, message);
  }
  
  log('✅ DOM Content Loaded', 'success');
  
  // ---------------- DOM Elements ----------------
  const timerDisplayEl = document.getElementById("timerDisplay");
  const modeLabelEl = document.getElementById("modeLabel");
  const modeIconEl = document.getElementById("modeIcon");
  const streakCountEl = document.getElementById("streakCount");
  const sessionsTodayEl = document.getElementById("sessionsToday");
  const controlBtn = document.getElementById("controlBtn");
  const controlIcon = document.getElementById("controlIcon");
  const controlLabel = document.getElementById("controlLabel");
  const progressRing = document.getElementById("progressRing");
  const faceStatusEl = document.getElementById("faceStatus");
  
  const timeInputSection = document.getElementById("timeInputSection");
  const timeInputLabel = document.getElementById("timeInputLabel");
  const timeInput = document.getElementById("timeInput");
  
  const modeDots = document.querySelectorAll(".mode-dot");
  
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsOverlay = document.getElementById("settingsOverlay");
  const closeSettings = document.getElementById("closeSettings");
  
  // Check elements
  const elements = {
    timerDisplay: !!timerDisplayEl,
    modeLabel: !!modeLabelEl,
    modeIcon: !!modeIconEl,
    streakCount: !!streakCountEl,
    sessionsToday: !!sessionsTodayEl,
    controlBtn: !!controlBtn,
    controlIcon: !!controlIcon,
    controlLabel: !!controlLabel,
    progressRing: !!progressRing,
    timeInput: !!timeInput,
    modeDots: modeDots.length,
    settingsBtn: !!settingsBtn
  };
  
  log('🔍 Element Check:', 'info');
  for (const [key, value] of Object.entries(elements)) {
    if (value === false || (key === 'modeDots' && value === 0)) {
      log(`  ❌ ${key}: ${value}`, 'error');
    } else {
      log(`  ✓ ${key}: ${value}`, 'success');
    }
  }
  
  // ---------------- Timer State ----------------
  let currentMode = 'work';
  let isRunning = false;
  let timeLeft = 25 * 60;
  let totalTime = 25 * 60;
  let timerInterval = null;
  
  const modeConfig = {
    work: { time: 25 * 60, label: 'Focus Time', icon: '💼', inputLabel: 'Work Duration (minutes)' },
    short: { time: 5 * 60, label: 'Short Break', icon: '☕', inputLabel: 'Short Break (minutes)' },
    long: { time: 15 * 60, label: 'Long Break', icon: '🌴', inputLabel: 'Long Break (minutes)' },
    custom: { time: 10 * 60, label: 'Custom', icon: '⚙️', inputLabel: 'Custom Duration (minutes)' }
  };
  
  log('✅ Timer state initialized', 'success');
  
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
  
  function updateProgressRing() {
    const radius = 115;
    const circumference = 2 * Math.PI * radius;
    const progress = timeLeft / totalTime;
    const offset = circumference * (1 - progress);
    
    progressRing.style.strokeDashoffset = offset;
  }
  
  function updateTimeInput() {
    const config = modeConfig[currentMode];
    timeInputLabel.textContent = config.inputLabel;
    timeInput.value = Math.floor(config.time / 60);
  }
  
  log('✅ Display functions ready', 'success');
  
  // ---------------- Mode Selection ----------------
  function setMode(mode) {
    log(`🔄 Switching to mode: ${mode}`, 'info');
    currentMode = mode;
    const config = modeConfig[mode];
    timeLeft = config.time;
    totalTime = config.time;
    
    modeLabelEl.textContent = config.label;
    modeIconEl.textContent = config.icon;
    updateDisplay();
    updateProgressRing();
    updateTimeInput();
    
    modeDots.forEach((dot, index) => {
      dot.classList.remove('active');
      if ((index === 0 && mode === 'work') ||
          (index === 1 && mode === 'short') ||
          (index === 2 && mode === 'long') ||
          (index === 3 && mode === 'custom')) {
        dot.classList.add('active');
      }
    });
    
    if (mode === 'short' || mode === 'long') {
      document.body.classList.add('rest-mode');
      progressRing.classList.add('white-stroke');
      timerDisplayEl.classList.add('white-text');
      modeLabelEl.classList.add('white-text');
      controlLabel.classList.add('white-text');
      controlBtn.classList.add('white-bg');
      log('  ✨ Rest mode styling applied', 'info');
    } else {
      document.body.classList.remove('rest-mode');
      progressRing.classList.remove('white-stroke');
      timerDisplayEl.classList.remove('white-text');
      modeLabelEl.classList.remove('white-text');
      controlLabel.classList.remove('white-text');
      controlBtn.classList.remove('white-bg');
    }
    
    log(`✅ Mode set to ${config.label}`, 'success');
  }
  
  // Mode dot click handlers
  modeDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      log(`🖱️ Mode dot ${index} clicked`, 'info');
      if (isRunning) {
        log('  ⚠️ Cannot change mode while running', 'warn');
        return;
      }
      
      const modes = ['work', 'short', 'long', 'custom'];
      setMode(modes[index]);
    });
  });
  
  log('✅ Mode selector ready', 'success');
  
  // ---------------- Control Button ----------------
  controlBtn.addEventListener("click", () => {
    log(`🖱️ Control button clicked (running: ${isRunning})`, 'info');
    
    if (!isRunning) {
      // Start timer
      isRunning = true;
      totalTime = timeLeft;
      controlIcon.textContent = '⏸';
      controlLabel.textContent = 'PAUSE';
      
      log('▶️ Timer started', 'success');
      
      // Simulate timer countdown
      timerInterval = setInterval(() => {
        if (timeLeft > 0) {
          timeLeft--;
          updateDisplay();
          updateProgressRing();
        } else {
          clearInterval(timerInterval);
          isRunning = false;
          controlIcon.textContent = '▶';
          controlLabel.textContent = 'START';
          log('🎉 Timer complete!', 'success');
        }
      }, 1000);
    } else {
      // Pause timer
      clearInterval(timerInterval);
      isRunning = false;
      controlIcon.textContent = '▶';
      controlLabel.textContent = 'START';
      log('⏸️ Timer paused', 'info');
    }
  });
  
  log('✅ Control button ready', 'success');
  
  // ---------------- Time Input ----------------
  timeInput.addEventListener("change", () => {
    const minutes = parseInt(timeInput.value) || 1;
    modeConfig[currentMode].time = minutes * 60;
    log(`💾 ${currentMode} duration set to ${minutes} minutes`, 'success');
    
    if (!isRunning) {
      setMode(currentMode);
    }
  });
  
  log('✅ Time input ready', 'success');
  
  // ---------------- Settings Modal ----------------
  settingsBtn.addEventListener("click", () => {
    log('🖱️ Settings button clicked', 'info');
    settingsOverlay.classList.add('active');
    log('✅ Settings modal opened', 'success');
  });
  
  closeSettings.addEventListener("click", () => {
    log('🖱️ Close settings clicked', 'info');
    settingsOverlay.classList.remove('active');
    log('✅ Settings modal closed', 'success');
  });
  
  settingsOverlay.addEventListener("click", (e) => {
    if (e.target === settingsOverlay) {
      log('🖱️ Overlay background clicked', 'info');
      settingsOverlay.classList.remove('active');
    }
  });
  
  log('✅ Settings modal ready', 'success');
  
  // ---------------- Voice Settings (Simplified) ----------------
  const toneSelect = document.getElementById("toneSelect");
  const rateSlider = document.getElementById("rateSlider");
  const rateValue = document.getElementById("rateValue");
  const pitchSlider = document.getElementById("pitchSlider");
  const pitchValue = document.getElementById("pitchValue");
  const volumeSlider = document.getElementById("volumeSlider");
  const volumeValue = document.getElementById("volumeValue");
  const testVoiceBtn = document.getElementById("testVoiceBtn");
  
  toneSelect.addEventListener("change", () => {
    log(`🎭 Tone changed to: ${toneSelect.value}`, 'success');
  });
  
  rateSlider.addEventListener("input", () => {
    const value = parseFloat(rateSlider.value);
    rateValue.textContent = value.toFixed(1);
  });
  
  pitchSlider.addEventListener("input", () => {
    const value = parseFloat(pitchSlider.value);
    pitchValue.textContent = value.toFixed(1);
  });
  
  volumeSlider.addEventListener("input", () => {
    const value = parseInt(volumeSlider.value);
    volumeValue.textContent = value;
  });
  
  testVoiceBtn.addEventListener("click", () => {
    log('🔊 Test voice button clicked', 'info');
    alert('Voice test would play here (needs Speech Synthesis API)');
  });
  
  log('✅ Voice settings ready', 'success');
  
  // ---------------- Initialize ----------------
  setMode('work');
  streakCountEl.textContent = '5';
  sessionsTodayEl.textContent = '3';
  
  // Simulate face tracking status changes
  setTimeout(() => {
    faceStatusEl.classList.add('active');
    faceStatusEl.querySelector('.status-text').textContent = 'Face detected ✓';
    log('📹 Face tracking simulated: Active', 'success');
  }, 2000);
  
  log('🎉 Initialization complete!', 'success');
  log('', 'info');
  log('Try these actions:', 'info');
  log('  • Click mode dots to switch modes', 'info');
  log('  • Click play button to start timer', 'info');
  log('  • Change time input value', 'info');
  log('  • Click settings button', 'info');
  
});
