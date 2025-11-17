// Offscreen document for face tracking
// Runs in background, no webpage needed!

console.log('🎥 GrindTime Face Tracker (Offscreen) initialized');

let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d', { willReadFrequently: true });
let detectionInterval = null;
let isTracking = false;

// Face detection state
let lastFaceState = null;
let consecutiveFaceDetected = 0;
let consecutiveFaceLost = 0;
const THRESHOLD = 3;
let previousFrame = null;
let noChangeFrames = 0;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('📩 Offscreen received message:', msg.action);
  
  if (msg.action === 'startFaceTracking') {
    console.log('🎬 Starting face tracking...');
    startFaceTracking().then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      console.error('❌ Failed to start face tracking:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep channel open for async response
  }
  
  if (msg.action === 'stopFaceTracking') {
    console.log('🛑 Stopping face tracking...');
    stopFaceTracking();
    sendResponse({ success: true });
    return true;
  }
  
  if (msg.action === 'playAlarmSound') {
    console.log('🔔 Playing alarm sound:', msg.soundType || 'success');
    playAlarmSound(msg.soundType || 'success').then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      console.error('❌ Failed to play alarm:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep channel open for async response
  }
  
  if (msg.action === 'getFaceStatus') {
    sendResponse({ 
      isTracking: isTracking,
      faceDetected: lastFaceState 
    });
    return true;
  }
});

// Start face tracking
async function startFaceTracking() {
  if (isTracking) {
    console.log('⚠️ Face tracking already running');
    return;
  }
  
  try {
    console.log('📹 Requesting camera access...');
    
    // Request camera
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user'
      }
    });
    
    console.log('✅ Camera access granted');
    
    // Set up video
    video.srcObject = stream;
    await video.play();
    
    // Set up canvas
    canvas.width = 160;
    canvas.height = 120;
    
    isTracking = true;
    
    // Notify background that we're ready
    chrome.runtime.sendMessage({
      action: 'faceTrackingReady',
      status: 'Camera initialized'
    });
    
    // Start detection loop
    startDetectionLoop();
    
    console.log('🎥 Face tracking started successfully');
    
  } catch (error) {
    console.error('❌ Camera error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      constraint: error.constraint
    });
    isTracking = false;
    
    let errorMessage = 'Camera access failed';
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Camera permission denied - Please allow camera access in browser settings';
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'No camera found on this device';
    } else if (error.name === 'NotReadableError') {
      errorMessage = 'Camera in use by another app - Please close other camera apps';
    } else if (error.name === 'TypeError') {
      errorMessage = 'Camera not supported in this context';
    } else {
      errorMessage = `Camera error: ${error.message || 'Unknown error'}`;
    }
    
    // Notify background of error
    chrome.runtime.sendMessage({
      action: 'faceTrackingError',
      error: errorMessage,
      errorName: error.name
    });
    
    throw error;
  }
}

// Stop face tracking
function stopFaceTracking() {
  console.log('🛑 Stopping face tracking...');
  
  // Stop detection loop
  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }
  
  // Stop video stream
  if (video.srcObject) {
    const tracks = video.srcObject.getTracks();
    tracks.forEach(track => {
      track.stop();
      console.log('📹 Camera track stopped');
    });
    video.srcObject = null;
  }
  
  // Reset state
  isTracking = false;
  lastFaceState = null;
  consecutiveFaceDetected = 0;
  consecutiveFaceLost = 0;
  previousFrame = null;
  noChangeFrames = 0;
  
  // Notify background
  chrome.runtime.sendMessage({
    action: 'faceTrackingStopped'
  });
  
  console.log('✅ Face tracking stopped');
}

// Detection loop
function startDetectionLoop() {
  console.log('🔍 Starting detection loop...');
  
  detectionInterval = setInterval(() => {
    if (!isTracking) {
      clearInterval(detectionInterval);
      return;
    }
    
    detectFace();
  }, 500); // Check every 500ms
}

// Detect face in current frame
function detectFace() {
  try {
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Calculate metrics
    let totalBrightness = 0;
    let darkPixels = 0;
    let veryBrightPixels = 0;
    let totalPixels = data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      
      totalBrightness += brightness;
      
      if (brightness < 20) darkPixels++;
      if (brightness > 240) veryBrightPixels++;
    }
    
    const avgBrightness = totalBrightness / totalPixels;
    const darkRatio = darkPixels / totalPixels;
    const brightRatio = veryBrightPixels / totalPixels;
    
    // Motion detection
    let changePixels = 0;
    let significantChange = false;
    
    if (previousFrame) {
      for (let i = 0; i < data.length; i += 4) {
        const currBrightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const prevBrightness = (previousFrame[i] + previousFrame[i + 1] + previousFrame[i + 2]) / 3;
        const diff = Math.abs(currBrightness - prevBrightness);
        
        if (diff > 15) changePixels++;
      }
      
      const changeRatio = changePixels / totalPixels;
      significantChange = changeRatio > 0.01;
      
      if (!significantChange) {
        noChangeFrames++;
      } else {
        noChangeFrames = 0;
      }
    }
    
    // Store current frame
    previousFrame = new Uint8ClampedArray(data);
    
    // Detection logic
    const cameraCovered = darkRatio > 0.70;
    const cameraBlank = brightRatio > 0.70;
    const noMovement = noChangeFrames > 6;
    const goodLighting = avgBrightness > 30 && avgBrightness < 230;
    
    const facePresent = (
      video.readyState === 4 &&
      !cameraCovered &&
      !cameraBlank &&
      goodLighting &&
      (significantChange || noChangeFrames < 6)
    );
    
    // Threshold system
    if (facePresent) {
      consecutiveFaceDetected++;
      consecutiveFaceLost = 0;
      
      if (consecutiveFaceDetected >= THRESHOLD && lastFaceState !== true) {
        lastFaceState = true;
        sendFaceStatus(true);
      }
    } else {
      consecutiveFaceLost++;
      consecutiveFaceDetected = 0;
      
      if (consecutiveFaceLost >= THRESHOLD && lastFaceState !== false) {
        lastFaceState = false;
        sendFaceStatus(false);
      }
    }
    
    // Debug logging (optional)
    if (Math.random() < 0.1) { // Log 10% of the time
      console.log('🔍 Detection:', {
        avgBright: avgBrightness.toFixed(0),
        movement: significantChange,
        face: facePresent ? '✓' : '✗'
      });
    }
    
  } catch (error) {
    console.error('❌ Detection error:', error);
  }
}

// Send face status to background
function sendFaceStatus(detected) {
  console.log(detected ? '✅ Face detected' : '⚠️ Face lost');
  
  chrome.runtime.sendMessage({
    action: detected ? 'faceDetected' : 'faceLost',
    timestamp: Date.now()
  }).catch(err => {
    console.error('Failed to send status:', err);
  });
}

// ============================================
// ALARM SOUND FUNCTIONS
// ============================================

/**
 * Play alarm sound using Web Audio API
 */
async function playAlarmSound(soundType = 'success') {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    switch(soundType) {
      case 'chime':
        await playChime(audioContext);
        break;
      case 'bell':
        await playBell(audioContext);
        break;
      case 'success':
        await playSuccess(audioContext);
        break;
      case 'classic':
        await playClassicAlarm(audioContext);
        break;
      default:
        await playSuccess(audioContext);
    }
    
    // Close context after sound completes
    setTimeout(() => {
      audioContext.close();
    }, 3000);
    
  } catch (error) {
    console.error('❌ Alarm sound error:', error);
    throw error;
  }
}

/**
 * Play pleasant chime (C-E-G chord)
 */
async function playChime(audioContext) {
  const now = audioContext.currentTime;
  const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
  
  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, now + (index * 0.15));
    gainNode.gain.linearRampToValueAtTime(0.3, now + (index * 0.15) + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + (index * 0.15) + 0.8);
    
    oscillator.start(now + (index * 0.15));
    oscillator.stop(now + (index * 0.15) + 0.8);
  });
}

/**
 * Play bell sound
 */
async function playBell(audioContext) {
  const now = audioContext.currentTime;
  const fundamentalFreq = 523.25;
  const harmonics = [1, 2.76, 5.4, 8.93];
  
  harmonics.forEach((ratio, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = fundamentalFreq * ratio;
    oscillator.type = 'sine';
    
    const volume = 0.25 / (index + 1);
    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
    
    oscillator.start(now);
    oscillator.stop(now + 1.5);
  });
}

/**
 * Play success sound (ascending C-E-G-C)
 */
async function playSuccess(audioContext) {
  const now = audioContext.currentTime;
  const notes = [
    { freq: 523.25, duration: 0.15 },
    { freq: 659.25, duration: 0.15 },
    { freq: 783.99, duration: 0.15 },
    { freq: 1046.50, duration: 0.4 }
  ];
  
  let startTime = now;
  
  notes.forEach((note) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = note.freq;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.35, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + note.duration);
    
    startTime += note.duration - 0.05;
  });
}

/**
 * Play classic alarm (alternating beeps)
 */
async function playClassicAlarm(audioContext) {
  const now = audioContext.currentTime;
  const freq1 = 800;
  const freq2 = 600;
  const beepDuration = 0.2;
  const beepCount = 4;
  
  for (let i = 0; i < beepCount; i++) {
    const startTime = now + (i * beepDuration * 2);
    createBeep(audioContext, freq1, startTime, beepDuration);
    createBeep(audioContext, freq2, startTime + beepDuration, beepDuration);
  }
}

/**
 * Helper to create a beep
 */
function createBeep(audioContext, frequency, startTime, duration) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = 'square';
  
  gainNode.gain.setValueAtTime(0.3, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
  
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

console.log('📡 Offscreen face tracker ready');
