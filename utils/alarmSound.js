// Alarm sound utility for timer completion
// Uses Web Audio API to generate pleasant alarm sounds

/**
 * Play a pleasant alarm sound when timer completes
 * @param {string} soundType - 'chime', 'bell', 'success', or 'classic'
 */
export async function playAlarmSound(soundType = 'success') {
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Play based on sound type
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
    
    // Close context after a delay to ensure sound completes
    setTimeout(() => {
      audioContext.close();
    }, 3000);
    
  } catch (error) {
    console.error('Failed to play alarm sound:', error);
  }
}

/**
 * Play a pleasant chime sound (C-E-G chord)
 */
async function playChime(audioContext) {
  const now = audioContext.currentTime;
  
  // Create three oscillators for a chord (C-E-G major)
  const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
  
  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = 'sine';
    
    // Fade in and out for smooth sound
    gainNode.gain.setValueAtTime(0, now + (index * 0.15));
    gainNode.gain.linearRampToValueAtTime(0.3, now + (index * 0.15) + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + (index * 0.15) + 0.8);
    
    oscillator.start(now + (index * 0.15));
    oscillator.stop(now + (index * 0.15) + 0.8);
  });
}

/**
 * Play a bell-like sound
 */
async function playBell(audioContext) {
  const now = audioContext.currentTime;
  
  // Bell sound using multiple harmonics
  const fundamentalFreq = 523.25; // C5
  const harmonics = [1, 2.76, 5.4, 8.93]; // Bell-like harmonic ratios
  
  harmonics.forEach((ratio, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = fundamentalFreq * ratio;
    oscillator.type = 'sine';
    
    // Volume decreases with harmonic number
    const volume = 0.25 / (index + 1);
    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
    
    oscillator.start(now);
    oscillator.stop(now + 1.5);
  });
}

/**
 * Play an uplifting success sound (ascending notes)
 */
async function playSuccess(audioContext) {
  const now = audioContext.currentTime;
  
  // Ascending major scale (C-E-G-C)
  const notes = [
    { freq: 523.25, duration: 0.15 }, // C5
    { freq: 659.25, duration: 0.15 }, // E5
    { freq: 783.99, duration: 0.15 }, // G5
    { freq: 1046.50, duration: 0.4 }  // C6 (held longer)
  ];
  
  let startTime = now;
  
  notes.forEach((note, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = note.freq;
    oscillator.type = 'sine';
    
    // Quick attack, gradual release
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.35, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + note.duration);
    
    startTime += note.duration - 0.05; // Slight overlap
  });
}

/**
 * Play classic alarm sound (alternating tones)
 */
async function playClassicAlarm(audioContext) {
  const now = audioContext.currentTime;
  
  // Alternating frequencies for classic alarm
  const freq1 = 800;  // High
  const freq2 = 600;  // Low
  const beepDuration = 0.2;
  const beepCount = 4;
  
  for (let i = 0; i < beepCount; i++) {
    const startTime = now + (i * beepDuration * 2);
    
    // First tone
    createBeep(audioContext, freq1, startTime, beepDuration);
    
    // Second tone
    createBeep(audioContext, freq2, startTime + beepDuration, beepDuration);
  }
}

/**
 * Helper function to create a beep
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

/**
 * Play alarm with user preference
 */
export async function playTimerCompletionAlarm() {
  // Get user preference from storage
  const data = await chrome.storage.local.get(['alarmSoundType', 'alarmEnabled']);
  
  // Default to enabled with 'success' sound
  const soundType = data.alarmSoundType || 'success';
  const enabled = data.alarmEnabled !== false; // Enabled by default
  
  if (enabled) {
    console.log('🔔 Playing alarm sound:', soundType);
    await playAlarmSound(soundType);
  } else {
    console.log('🔕 Alarm sound disabled');
  }
}
