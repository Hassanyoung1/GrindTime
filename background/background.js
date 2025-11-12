// Background service worker for GrindTime
// Manages persistent timer, streaks, and trash-talk alerts

let focusTimer = null;
let timeLeft = 0;
let timerRunning = false;
let faceDetected = true;
let trashTalkCooldown = false;
let continuousTrashTalkInterval = null; // For repeated trash-talk

// Distraction tracking
let currentDistractionStart = null; // Timestamp when distraction started
let sessionDistractionTime = 0; // Total distraction time in current session (milliseconds)

// Social media tracking
let socialMediaVisits = {}; // Track active social media visits by tab ID
let currentSocialMediaStart = null; // For tracking continuous visits

// Make test function globally accessible for debugging
globalThis.testTrashTalk = function() {
  console.log('=== TRASH-TALK TEST ===');
  console.log('Timer running:', timerRunning);
  console.log('Face detected:', faceDetected);
  console.log('Cooldown active:', trashTalkCooldown);
  
  getRandomTrashTalk().then(message => {
    console.log('Testing TTS with message:', message);
    speak(message);
  });
};

globalThis.testTTSDirect = function() {
  console.log('=== DIRECT TTS TEST ===');
  const testMessage = "Direct TTS test - if you hear this, TTS works!";
  console.log('Test message:', testMessage);
  
  chrome.tts.speak(testMessage, {
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    onEvent: (event) => {
      console.log('Direct TTS Event:', event.type, event);
      if (event.type === 'error') {
        console.error('TTS Error:', event.errorMessage);
      }
    }
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Callback error:', chrome.runtime.lastError);
    } else {
      console.log('TTS call completed successfully');
    }
  });
};

// Test with simple message (no storage needed)
globalThis.testSimple = function() {
  console.log('=== SIMPLE TEST ===');
  chrome.tts.speak("Hello, this is a simple test", {
    rate: 1.0,
    onEvent: (e) => console.log('Event:', e.type)
  });
};

// Test distraction history - adds sample data
globalThis.testDistractionHistory = async function() {
  console.log('=== TESTING DISTRACTION HISTORY ===');
  
  const now = Date.now();
  
  // Simulate a 30-minute timer session that started 15 minutes ago
  const timerStartTime = now - (15 * 60 * 1000); // 15 minutes ago
  const timerDuration = 30 * 60; // 30 minutes in seconds
  
  // Save mock timer state
  await chrome.storage.local.set({
    timerStartTime: timerStartTime,
    timerDuration: timerDuration
  });
  
  const testEvents = [
    { timestamp: timerStartTime + (3 * 60 * 1000), duration: 5000 },   // 3 min into session, 5s distraction
    { timestamp: timerStartTime + (8 * 60 * 1000), duration: 15000 },  // 8 min into session, 15s distraction
    { timestamp: timerStartTime + (12 * 60 * 1000), duration: 30000 }, // 12 min into session, 30s distraction
    { timestamp: timerStartTime + (14 * 60 * 1000), duration: 8000 },  // 14 min into session, 8s distraction
  ];
  
  console.log('Adding', testEvents.length, 'test distraction events to a 30-minute session...');
  
  for (const event of testEvents) {
    await saveDistractionEvent(event.timestamp, event.duration);
  }
  
  // Verify they were saved
  const data = await chrome.storage.sync.get(['distractionHistory']);
  console.log('✅ Total events in storage:', data.distractionHistory?.length || 0);
  console.log('📋 Events:', data.distractionHistory);
  console.log('Now open the history page to see them with timer context!');
};

// Clear distraction history
globalThis.clearDistractionHistory = async function() {
  await chrome.storage.sync.set({ distractionHistory: [] });
  console.log('🗑️ Distraction history cleared');
};

// ===== FACE TRACKING MANAGEMENT =====

async function startFaceTracking() {
  console.log('🎬 Starting face tracking...');
  
  // Face tracking via content script (requires webpage open)
  chrome.storage.local.set({ 
    faceTrackingActive: true,
    lastFaceStatus: null
  });
  
  console.log('✅ Face tracking enabled');
}

async function stopFaceTracking() {
  console.log('🛑 Stopping face tracking...');
  
  chrome.storage.local.set({ 
    faceTrackingActive: false 
  });
  
  console.log('✅ Face tracking stopped');
}

// Trash-talk messages organized by tone/personality
const trashTalkByTone = {
  motivational: [
    "Hey! You've got this! Get back in the game, champion!",
    "Where's that fire I saw earlier? Come on, refocus!",
    "Your goals are waiting! Let's get back to crushing it!",
    "Every second counts! You're stronger than this distraction!",
    "This is your moment! Don't let it slip away!",
    "Come on, warrior! Show me that dedication!",
    "You're building something great here! Stay focused!",
    "Remember why you started! Let's finish strong!",
    "Winners stay focused! And I know you're a winner!",
    "Your future self will thank you for staying on track!",
    "Greatness requires focus! You've got what it takes!",
    "This is where champions are made! Stay with it!",
    "You're so close! Don't give up now!",
    "Believe in yourself! Get back to work, superstar!",
    "Every focused minute is an investment in your success!"
  ],
  
  roast: [
    "Oh look, who decided to take an unscheduled vacation from productivity?",
    "Is scrolling really more important than your dreams? Really?",
    "Wow, I'm impressed... by how easily you get distracted!",
    "Your future self called. They're disappointed.",
    "Breaking news: Local person discovers new way to waste time!",
    "Oh great, another break. What is this, your fifth one?",
    "Congratulations on finding yet another excuse to lose focus!",
    "I see we're practicing the ancient art of procrastination again.",
    "Your goals just got further away. Happy now?",
    "Did your attention span just give up and walk away?",
    "Plot twist: You were supposed to be working, not wandering!",
    "Fantastic job at being consistently inconsistent!",
    "I've seen goldfish with longer attention spans!",
    "Oh, were you distracted by something shiny again?",
    "Your productivity just called. It wants a divorce!"
  ],
  
  aggressive: [
    "GET BACK HERE! NOW!",
    "Where do you think you're going? Move it!",
    "Focus! That's not a request, that's an ORDER!",
    "Stop wasting time and GET BACK TO WORK!",
    "What are you doing?! Eyes on the screen!",
    "This isn't playtime! Focus up RIGHT NOW!",
    "Unacceptable! Get your head back in the game!",
    "You want results? Then STAY FOCUSED!",
    "No excuses! Get back to it IMMEDIATELY!",
    "Pathetic! Show me you're serious about this!",
    "FOCUS! Is that really so hard?!",
    "Your time is MONEY! Stop throwing it away!",
    "Winners don't look away! Are you a winner or not?!",
    "What would make you lose focus during WORK TIME?!",
    "Drop everything and GET FOCUSED! Do it!"
  ],
  
  playful: [
    "Heyyy, where ya going? The party's right here!",
    "Oopsie! Looks like someone's mind went on a little adventure!",
    "Peekaboo! I see someone not focusing!",
    "Uh-oh, spaghetti-o! Time to come back, friend!",
    "Whoops! Your attention just took a field trip without permission!",
    "Hey buddy! The fun stuff is happening right here!",
    "Knock knock! Who's there? Your work, waiting for you!",
    "Aww, did something shiny catch your eye again?",
    "Hey! No wandering off! We're not done playing yet!",
    "Helloooo? Earth to awesome person! Come back!",
    "Boop! Got your attention? Good, let's keep it!",
    "Wait wait wait! Don't leave me hanging here!",
    "Your focus just ghosted you! Time for a reunion!",
    "Nuh-uh! No sneaking away! Back to work, bestie!",
    "Yoo-hoo! Over here! Yeah, your goals are calling!"
  ],
  
  professional: [
    "Pardon the interruption, but I've detected a deviation from your focus timeline.",
    "Attention: Your productivity metrics are declining. Please refocus.",
    "Excuse me, but we have objectives to complete. Let's return to task.",
    "I notice you've stepped away. May I suggest refocusing on your goals?",
    "Your scheduled focus time is still active. Please resume work.",
    "Gentle reminder: We're on a deadline here. Let's stay on track.",
    "Your attention has shifted. Shall we redirect to our primary objective?",
    "Apologies, but this doesn't align with your stated priorities.",
    "Time check: You're currently off-task. Let's correct that.",
    "Professional observation: Your focus has drifted. Please realign.",
    "May I redirect your attention to the matter at hand?",
    "Note: Distractions detected. Recommend immediate course correction.",
    "Your productivity consultant here. Time to refocus, please.",
    "This pause wasn't in the agenda. Let's return to scheduled work.",
    "Friendly reminder: Success requires sustained attention. Let's continue."
  ],
  
  chill: [
    "Hey man, you're drifting off. Let's get back to it, yeah?",
    "Yo, focus is slipping. No biggie, just come back.",
    "Dude, where'd you go? Let's keep the vibe going.",
    "Hey buddy, just checking in. Ready to refocus?",
    "Alright, break time's over. Let's do this thing.",
    "Yo, you with me? Cool, let's get back to work.",
    "Hey friend, noticed you spaced out. All good, let's continue.",
    "Sup? Your attention wandered off. Time to bring it back.",
    "Hey there, just a gentle nudge to stay on track.",
    "Yo, don't lose momentum now. Keep it going!",
    "Hey dude, let's keep this flow state alive, yeah?",
    "Alright, mini-break's done. Back to the grind.",
    "Yo, stay with me here. We're making progress!",
    "Hey, just a reminder to stay locked in. You got this.",
    "Dude, maintain that focus energy. Let's roll!"
  ]
};

// Trash-talk messages (keeping original for backwards compatibility)
const trashTalkMessages = trashTalkByTone.motivational; // Default to motivational

// Initialize storage on install
chrome.runtime.onInstalled.addListener(async () => {
  console.log('GrindTime extension installed');
  
  // Initialize default values
  const data = await chrome.storage.sync.get(['streak', 'lastSessionDate', 'totalFocusTime', 'sessionsToday', 'distractionHistory']);
  
  if (!data.streak) {
    await chrome.storage.sync.set({
      streak: 0,
      lastSessionDate: null,
      totalFocusTime: 0,
      sessionsToday: 0,
      distractionHistory: []
    });
  }
  
  // Initialize distraction history if it doesn't exist
  if (!data.distractionHistory) {
    await chrome.storage.sync.set({ distractionHistory: [] });
  }
});

// Save a distraction event to history
async function saveDistractionEvent(startTime, durationMs) {
  try {
    const data = await chrome.storage.sync.get(['distractionHistory']);
    const localData = await chrome.storage.local.get(['timerStartTime', 'timerDuration']);
    let history = data.distractionHistory || [];
    
    console.log('💾 Saving distraction event...');
    console.log('  Timer Start Time:', localData.timerStartTime);
    console.log('  Timer Duration:', localData.timerDuration);
    console.log('  Distraction Start Time:', startTime);
    
    // Calculate time elapsed in the timer session when distraction occurred
    const timerStartTime = localData.timerStartTime;
    const timerDuration = localData.timerDuration;
    let timeIntoSession = null;
    let sessionDurationMinutes = null;
    
    if (timerStartTime && timerDuration) {
      // Time from when timer started to when distraction started (in ms)
      const elapsedMs = startTime - timerStartTime;
      timeIntoSession = Math.max(0, Math.floor(elapsedMs / 1000)); // in seconds
      sessionDurationMinutes = Math.floor(timerDuration / 60); // timer duration in minutes
      console.log('  ✅ Timer context calculated:');
      console.log('    - Elapsed:', elapsedMs, 'ms');
      console.log('    - Time into session:', timeIntoSession, 'seconds');
      console.log('    - Session duration:', sessionDurationMinutes, 'minutes');
    } else {
      console.log('  ⚠️ No timer context (timer not running or data missing)');
    }
    
    // Add new distraction event
    const event = {
      timestamp: startTime,
      duration: durationMs,
      date: new Date(startTime).toLocaleDateString(),
      time: new Date(startTime).toLocaleTimeString(),
      timeIntoSession: timeIntoSession, // seconds into the timer session
      sessionDuration: timerDuration, // total timer duration in seconds
      sessionDurationMinutes: sessionDurationMinutes // for display
    };
    
    history.push(event);
    
    // Keep only last 100 distractions to avoid storage limits
    if (history.length > 100) {
      history = history.slice(-100);
    }
    
    await chrome.storage.sync.set({ distractionHistory: history });
    console.log('💾 Saved distraction event:', event);
  } catch (error) {
    console.error('Failed to save distraction event:', error);
  }
}

// Handle social media visit tracking
async function handleSocialMediaVisit(msg, sender) {
  if (!timerRunning) {
    console.log('📱 Social media visit ignored - timer not running');
    return;
  }
  
  const { visitAction, site, url, duration, timestamp } = msg;
  
  if (visitAction === 'started') {
    // User landed on social media
    currentSocialMediaStart = timestamp;
    console.log('📱 Social media distraction started:', site);
    
    // Optional: trigger trash talk
    if (!trashTalkCooldown) {
      const message = `Yo! ${site}? Really? Get back to work!`;
      speak(message);
      trashTalkCooldown = true;
      setTimeout(() => { trashTalkCooldown = false; }, 30000); // 30s cooldown
    }
    
  } else if (visitAction === 'ended' && duration) {
    // User left social media or timer stopped
    console.log(`📱 Social media distraction ended: ${site} (${Math.floor(duration/1000)}s)`);
    
    // Save as distraction event
    if (currentSocialMediaStart) {
      await saveSocialMediaDistraction(currentSocialMediaStart, duration, site, url);
      currentSocialMediaStart = null;
    }
  }
}

// Save social media distraction to history
async function saveSocialMediaDistraction(startTime, durationMs, siteName, siteUrl) {
  try {
    const data = await chrome.storage.sync.get(['distractionHistory']);
    const localData = await chrome.storage.local.get(['timerStartTime', 'timerDuration']);
    let history = data.distractionHistory || [];
    
    console.log('💾 Saving social media distraction...');
    console.log('  Site:', siteName);
    console.log('  Duration:', Math.floor(durationMs/1000), 'seconds');
    
    // Calculate time into session
    const timerStartTime = localData.timerStartTime;
    const timerDuration = localData.timerDuration;
    let timeIntoSession = null;
    let sessionDurationMinutes = null;
    
    if (timerStartTime && timerDuration) {
      const elapsedMs = startTime - timerStartTime;
      timeIntoSession = Math.max(0, Math.floor(elapsedMs / 1000));
      sessionDurationMinutes = Math.floor(timerDuration / 60);
      console.log('  ✅ Timer context:', timeIntoSession, 'seconds into', sessionDurationMinutes, 'min session');
    }
    
    // Create distraction event
    const event = {
      timestamp: startTime,
      duration: durationMs,
      date: new Date(startTime).toLocaleDateString(),
      time: new Date(startTime).toLocaleTimeString(),
      timeIntoSession: timeIntoSession,
      sessionDuration: timerDuration,
      sessionDurationMinutes: sessionDurationMinutes,
      type: 'social_media', // Mark as social media distraction
      site: siteName,
      url: siteUrl
    };
    
    history.push(event);
    
    // Keep only last 100 distractions
    if (history.length > 100) {
      history = history.slice(-100);
    }
    
    await chrome.storage.sync.set({ distractionHistory: history });
    console.log('💾 Saved social media distraction:', event);
    
    // Update session distraction time
    sessionDistractionTime += durationMs;
    console.log('📊 Total session distraction:', Math.floor(sessionDistractionTime / 1000), 'seconds');
    
  } catch (error) {
    console.error('Failed to save social media distraction:', error);
  }
}

// Helper: Get random trash-talk message based on selected tone

// Helper: Get random trash-talk message based on selected tone
async function getRandomTrashTalk() {
  const settings = await chrome.storage.sync.get(['speakingTone']);
  const tone = settings.speakingTone || 'motivational';
  const messages = trashTalkByTone[tone] || trashTalkByTone.motivational;
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}

// Helper: Add SSML tags for more human-like speech
function addSSMLEmphasis(message, tone) {
  // Add natural pauses and emphasis based on tone
  let enhanced = message;
  
  switch(tone) {
    case 'aggressive':
      // Add strong emphasis and shorter pauses
      enhanced = enhanced.replace(/!/g, '! <break time="200ms"/>');
      enhanced = `<prosody rate="fast" volume="loud">${enhanced}</prosody>`;
      break;
      
    case 'motivational':
      // Add inspiring emphasis with moderate pauses
      enhanced = enhanced.replace(/!/g, '! <break time="300ms"/>');
      enhanced = enhanced.replace(/\?/g, '? <break time="250ms"/>');
      break;
      
    case 'playful':
      // Add varied pitch and fun pauses
      enhanced = enhanced.replace(/!/g, '! <break time="200ms"/>');
      enhanced = `<prosody pitch="+10%">${enhanced}</prosody>`;
      break;
      
    case 'roast':
      // Add sarcastic pauses
      enhanced = enhanced.replace(/\./g, '. <break time="400ms"/>');
      enhanced = enhanced.replace(/\?/g, '? <break time="350ms"/>');
      break;
      
    case 'professional':
      // Add formal pauses
      enhanced = enhanced.replace(/\./g, '. <break time="300ms"/>');
      enhanced = enhanced.replace(/,/g, ', <break time="200ms"/>');
      break;
      
    case 'chill':
      // Add relaxed pauses
      enhanced = enhanced.replace(/\./g, '. <break time="350ms"/>');
      enhanced = enhanced.replace(/,/g, ', <break time="250ms"/>');
      break;
  }
  
  return `<speak>${enhanced}</speak>`;
}

// Helper: Speak message using TTS
async function speak(message) {
  console.log('🔊 Attempting to speak:', message);
  
  if (!chrome.tts) {
    console.error('❌ chrome.tts API not available');
    return;
  }
  
  if (!chrome.tts.speak) {
    console.error('❌ chrome.tts.speak not available');
    return;
  }
  
  // Get voice settings from storage
  const settings = await chrome.storage.sync.get(['voiceName', 'voiceRate', 'voicePitch', 'voiceVolume', 'speakingTone']);
  const tone = settings.speakingTone || 'motivational';
  
  console.log('🎭 Voice settings:', {
    voice: settings.voiceName || 'default',
    tone: tone,
    rate: settings.voiceRate || 1.2,
    pitch: settings.voicePitch || 0.9,
    volume: settings.voiceVolume || 0.8
  });
  
  const options = {
    rate: settings.voiceRate || 1.2,
    pitch: settings.voicePitch || 0.9,
    volume: settings.voiceVolume || 0.8,
    enqueue: false, // Don't queue, speak immediately
    onEvent: (event) => {
      console.log('🎤 TTS Event:', event.type, 'at char', event.charIndex);
      if (event.type === 'start') {
        console.log('✅ TTS started speaking');
      }
      if (event.type === 'end') {
        console.log('✅ TTS finished speaking');
      }
      if (event.type === 'error') {
        console.error('❌ TTS error:', event.errorMessage);
      }
      if (event.type === 'interrupted') {
        console.warn('⚠️ TTS interrupted');
      }
      if (event.type === 'cancelled') {
        console.warn('⚠️ TTS cancelled');
      }
    }
  };
  
  // Add voice name if one is selected
  if (settings.voiceName && settings.voiceName !== 'default') {
    options.voiceName = settings.voiceName;
    console.log('🎙️ Using voice:', settings.voiceName);
  } else {
    console.log('🎙️ Using default system voice');
  }
  
  // Use plain text (SSML can cause issues)
  console.log('📢 Calling chrome.tts.speak...');
  chrome.tts.speak(message, options, () => {
    if (chrome.runtime.lastError) {
      console.error('❌ TTS error:', chrome.runtime.lastError.message);
    } else {
      console.log('✅ TTS speak() called successfully');
    }
  });
}

// Helper: Update streak
async function updateStreak() {
  const data = await chrome.storage.sync.get(['streak', 'lastSessionDate']);
  const today = new Date().toDateString();
  const lastDate = data.lastSessionDate;
  
  let newStreak = data.streak || 0;
  
  if (lastDate === today) {
    return newStreak;
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  
  if (lastDate === yesterdayStr || lastDate === null) {
    newStreak += 1;
  } else {
    newStreak = 1;
  }
  
  await chrome.storage.sync.set({
    streak: newStreak,
    lastSessionDate: today
  });
  
  return newStreak;
}

// Helper: Increment sessions today
async function incrementSessionsToday() {
  const data = await chrome.storage.sync.get(['sessionsToday', 'lastSessionDate']);
  const today = new Date().toDateString();
  
  let sessions = data.sessionsToday || 0;
  
  if (data.lastSessionDate !== today) {
    sessions = 0;
  }
  
  sessions += 1;
  await chrome.storage.sync.set({ sessionsToday: sessions });
  return sessions;
}

// Helper: Add focus time
async function addFocusTime(seconds) {
  const minutes = Math.round(seconds / 60);
  const data = await chrome.storage.sync.get(['totalFocusTime']);
  const total = (data.totalFocusTime || 0) + minutes;
  await chrome.storage.sync.set({ totalFocusTime: total });
  return total;
}

// Broadcast timer update to all tabs/popups
function broadcastTimerUpdate(timeLeft) {
  chrome.runtime.sendMessage({ 
    action: "updateTimer", 
    timeLeft 
  }).catch(() => {
    // Popup may be closed, ignore error
  });
}

// Notify all tabs about timer state change
async function notifyTabsTimerStateChanged(running) {
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'timerStateChanged',
        timerRunning: running
      }).catch(() => {
        // Tab may not have content script, ignore
      });
    }
    console.log(`📢 Notified ${tabs.length} tabs: timer ${running ? 'started' : 'stopped'}`);
  } catch (error) {
    console.error('Failed to notify tabs:', error);
  }
}

// Start the focus timer
function startTimer(totalSeconds) {
  if (timerRunning) {
    stopTimer();
  }
  
  timeLeft = totalSeconds;
  timerRunning = true;
  
  // Reset session distraction tracking
  currentDistractionStart = null;
  sessionDistractionTime = 0;
  currentSocialMediaStart = null;
  console.log('📊 Reset distraction tracking for new session');
  
  console.log('Timer started. Duration:', totalSeconds, 'seconds. Timer running:', timerRunning);
  
  // Notify all tabs that timer started
  notifyTabsTimerStateChanged(true);
  
  // Start face tracking automatically when timer starts
  startFaceTracking();
  
  // Save state
  chrome.storage.local.set({ 
    timerRunning: true, 
    timeLeft: timeLeft,
    timerStartTime: Date.now(),
    timerDuration: totalSeconds
  });
  
  focusTimer = setInterval(() => {
    timeLeft--;
    
    // Save current state
    chrome.storage.local.set({ timeLeft: timeLeft });
    
    // Broadcast update
    broadcastTimerUpdate(timeLeft);
    
    if (timeLeft <= 0) {
      completeTimer();
    }
  }, 1000);
}

// Stop the timer
function stopTimer() {
  if (focusTimer) {
    clearInterval(focusTimer);
    focusTimer = null;
  }
  
  timerRunning = false;
  console.log('Timer stopped. Timer running:', timerRunning);
  
  // Notify all tabs that timer stopped
  notifyTabsTimerStateChanged(false);
  
  // Stop face tracking when timer stops
  stopFaceTracking();
  
  chrome.storage.local.set({ 
    timerRunning: false,
    timeLeft: 0
  });
}

// Complete timer and update stats
async function completeTimer() {
  stopTimer();
  
  // Get timer duration
  const data = await chrome.storage.local.get(['timerDuration']);
  const duration = data.timerDuration || 0;
  
  // Update streak and stats
  await updateStreak();
  await incrementSessionsToday();
  await addFocusTime(duration);
  
  // Notify completion
  chrome.runtime.sendMessage({ action: "timerDone" }).catch(() => {});
  
  // Show notification (iconUrl omitted - Chrome will use extension icon automatically)
  chrome.notifications.create({
    type: 'basic',
    title: 'Focus Session Complete! 🎉',
    message: 'Great work! Your streak has been updated.',
    priority: 2
  });
}

// Handle face tracking events
function handleFaceLost() {
  console.log('Face lost detected. Timer running:', timerRunning, 'Cooldown:', trashTalkCooldown);
  
  if (!timerRunning) {
    console.log('Trash-talk skipped: Timer not running');
    // Still update status even if timer isn't running
    chrome.storage.local.set({ 
      faceTrackingActive: true,
      lastFaceStatus: false 
    });
    
    chrome.runtime.sendMessage({ 
      action: "faceStatusUpdate", 
      faceDetected: false 
    }).catch(() => {});
    return;
  }
  
  // Start tracking distraction time
  if (!currentDistractionStart) {
    currentDistractionStart = Date.now();
    console.log('📊 Distraction started at:', new Date(currentDistractionStart).toLocaleTimeString());
  }
  
  // Store face status in storage
  chrome.storage.local.set({ 
    faceTrackingActive: true,
    lastFaceStatus: false 
  });
  
  // Start continuous trash-talk until face returns
  if (!continuousTrashTalkInterval) {
    console.log('Starting continuous trash-talk mode');
    
    // Speak immediately (async)
    getRandomTrashTalk().then(message => {
      console.log('Speaking trash-talk:', message);
      speak(message);
    });
    
    // Then repeat every 8 seconds until face returns
    continuousTrashTalkInterval = setInterval(() => {
      if (!faceDetected && timerRunning) {
        getRandomTrashTalk().then(msg => {
          console.log('Continuous trash-talk:', msg);
          speak(msg);
        });
      } else {
        // Face detected or timer stopped, stop continuous mode
        console.log('Stopping continuous trash-talk');
        clearInterval(continuousTrashTalkInterval);
        continuousTrashTalkInterval = null;
      }
    }, 8000); // Every 8 seconds
  }
  
  // Notify popup
  chrome.runtime.sendMessage({ 
    action: "faceStatusUpdate", 
    faceDetected: false 
  }).catch(() => {});
}

function handleFaceDetected() {
  console.log('Face detected. Timer running:', timerRunning);
  
  // Record distraction time if we were tracking one
  if (currentDistractionStart && timerRunning) {
    const distractionDuration = Date.now() - currentDistractionStart;
    sessionDistractionTime += distractionDuration;
    
    console.log('📊 Distraction ended. Duration:', Math.floor(distractionDuration / 1000), 'seconds');
    console.log('📊 Total session distraction:', Math.floor(sessionDistractionTime / 1000), 'seconds');
    
    // Save distraction event to history
    saveDistractionEvent(currentDistractionStart, distractionDuration);
    
    currentDistractionStart = null;
  }
  
  // Stop continuous trash-talk immediately
  if (continuousTrashTalkInterval) {
    console.log('Face returned - stopping continuous trash-talk');
    clearInterval(continuousTrashTalkInterval);
    continuousTrashTalkInterval = null;
  }
  
  // Store face status in storage
  chrome.storage.local.set({ 
    faceTrackingActive: true,
    lastFaceStatus: true 
  });
  
  // Stop any ongoing speech
  if (chrome.tts && chrome.tts.stop) {
    chrome.tts.stop();
    console.log('Stopped ongoing TTS speech');
  }
  
  // Notify popup
  chrome.runtime.sendMessage({ 
    action: "faceStatusUpdate", 
    faceDetected: true 
  }).catch(() => {});
}

// Message listener
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('Background received message:', msg.action);
  
  if (msg.action === "startTimer") {
    startTimer(msg.time);
    sendResponse({ status: "started" });
  }
  
  if (msg.action === "stopTimer") {
    stopTimer();
    sendResponse({ status: "stopped" });
  }
  
  if (msg.action === "getTimerStatus") {
    sendResponse({ 
      timerRunning: timerRunning,
      timeLeft: timeLeft 
    });
  }
  
  if (msg.action === "socialMediaVisit") {
    handleSocialMediaVisit(msg, sender);
    sendResponse({ status: "received" });
  }
  
  if (msg.action === "faceTrackingInitialized") {
    console.log('Face tracking initialized');
    // Store that face tracking is active
    chrome.storage.local.set({ 
      faceTrackingActive: true,
      lastFaceStatus: null 
    });
    sendResponse({ status: "initialized" });
  }
  
  if (msg.action === "faceLost") {
    console.log('Received faceLost message');
    faceDetected = false;
    handleFaceLost();
    sendResponse({ status: "received" });
  }
  
  if (msg.action === "faceDetected") {
    console.log('Received faceDetected message');
    faceDetected = true;
    handleFaceDetected();
    sendResponse({ status: "received" });
  }
  
  return true; // Keep channel open for async response
});

// Restore timer state on startup
chrome.storage.local.get(['timerRunning', 'timeLeft', 'timerStartTime', 'timerDuration'], (data) => {
  if (data.timerRunning && data.timeLeft > 0) {
    // Calculate elapsed time since last update
    const elapsed = Math.floor((Date.now() - data.timerStartTime) / 1000);
    const remainingTime = data.timeLeft - elapsed;
    
    if (remainingTime > 0) {
      // Resume timer
      startTimer(remainingTime);
      console.log('Timer restored with', remainingTime, 'seconds remaining');
    } else {
      // Timer should have completed while extension was inactive
      chrome.storage.local.set({ timerRunning: false, timeLeft: 0 });
    }
  }
});

console.log('GrindTime background service worker initialized');
