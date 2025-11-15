// GrindTime Face Tracker - Content Script
// Detects user presence and sends messages to background

console.log('GrindTime face tracker initialized');

let faceDetected = true; // Start as true
let lastFaceState = null;
let detectionInterval = null;

// Debug mode - set to true to see video preview
const DEBUG_MODE = true; // Enable to see what camera sees and debug info

// Face detection state tracking
let consecutiveFaceLost = 0;
let consecutiveFaceDetected = 0;
const THRESHOLD = 3; // Increased back to 3 for better accuracy and stability

// Improved detection parameters (TUNED FOR BETTER ACCURACY)
const DETECTION_PARAMS = {
  minBrightness: 30,        // Minimum acceptable brightness (increased)
  maxBrightness: 230,       // Maximum acceptable brightness
  darkThreshold: 0.75,      // 75% dark pixels = covered camera (more strict)
  brightThreshold: 0.70,    // 70% bright pixels = overexposed (more strict)
  changeThreshold: 0.015,   // 1.5% pixel change = movement (increased sensitivity)
  changePixelDiff: 15,      // Brightness difference to count as changed (more strict)
  noMovementFrames: 6,      // Frames without change = no presence (3 seconds - faster)
  centerWeight: 2.0,        // Weight center region more (face usually centered)
  edgeIgnoreRatio: 0.20,    // Ignore outer 20% edges (focus on center)
  skinToneDetection: true,  // Enable skin tone detection
  minFaceSize: 0.15         // Minimum face size (15% of frame)
};

// Create video element (hidden by default)
const video = document.createElement("video");
video.style.display = DEBUG_MODE ? "block" : "none";
video.style.position = "fixed";
video.style.bottom = "10px";
video.style.left = "10px";
video.style.width = "160px";
video.style.height = "120px";
video.style.zIndex = "999999";
video.style.border = "2px solid #6366f1";
video.style.borderRadius = "8px";
video.autoplay = true;
video.playsInline = true;
video.muted = true;
document.body.appendChild(video);

// Create camera status indicator (always visible)
const cameraIndicator = document.createElement("div");
cameraIndicator.id = "grindtime-camera-indicator";
cameraIndicator.style.position = "fixed";
cameraIndicator.style.top = "10px";
cameraIndicator.style.right = "10px";
cameraIndicator.style.zIndex = "999999";
cameraIndicator.style.background = "rgba(15, 23, 42, 0.95)";
cameraIndicator.style.backdropFilter = "blur(10px)";
cameraIndicator.style.border = "2px solid rgba(99, 102, 241, 0.5)";
cameraIndicator.style.borderRadius = "12px";
cameraIndicator.style.padding = "8px 12px";
cameraIndicator.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
cameraIndicator.style.fontSize = "13px";
cameraIndicator.style.fontWeight = "600";
cameraIndicator.style.color = "#f1f5f9";
cameraIndicator.style.display = "flex";
cameraIndicator.style.alignItems = "center";
cameraIndicator.style.gap = "8px";
cameraIndicator.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.3)";
cameraIndicator.style.transition = "all 0.3s ease";
cameraIndicator.style.cursor = "pointer";

// Create status dot
const statusDot = document.createElement("div");
statusDot.id = "grindtime-status-dot";
statusDot.style.width = "10px";
statusDot.style.height = "10px";
statusDot.style.borderRadius = "50%";
statusDot.style.background = "#64748b";
statusDot.style.boxShadow = "0 0 8px currentColor";
statusDot.style.animation = "grindtime-pulse 2s ease-in-out infinite";

// Create status text
const statusText = document.createElement("span");
statusText.id = "grindtime-status-text";
statusText.textContent = "Camera initializing...";

// Add keyframes for pulse animation
const style = document.createElement("style");
style.textContent = `
  @keyframes grindtime-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.2); }
  }
  #grindtime-camera-indicator:hover {
    transform: scale(1.05);
  }
`;
document.head.appendChild(style);

cameraIndicator.appendChild(statusDot);
cameraIndicator.appendChild(statusText);
document.body.appendChild(cameraIndicator);

// Add click handler to toggle between showing/hiding the indicator
let indicatorHidden = false;
cameraIndicator.addEventListener("click", () => {
  indicatorHidden = !indicatorHidden;
  if (indicatorHidden) {
    cameraIndicator.style.opacity = "0.3";
    cameraIndicator.style.transform = "scale(0.8)";
    statusText.style.display = "none";
  } else {
    cameraIndicator.style.opacity = "1";
    cameraIndicator.style.transform = "scale(1)";
    statusText.style.display = "block";
  }
});

// Create debug indicator (optional visual feedback)
const indicator = document.createElement("div");
indicator.style.position = "fixed";
indicator.style.bottom = "10px";
indicator.style.right = "10px";
indicator.style.width = "12px";
indicator.style.height = "12px";
indicator.style.borderRadius = "50%";
indicator.style.background = "#64748b";
indicator.style.zIndex = "999999";
indicator.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
indicator.style.border = "2px solid white";
indicator.style.display = DEBUG_MODE ? "block" : "none";
document.body.appendChild(indicator);

// Helper function to update camera indicator
function updateCameraIndicator(status, message) {
  const dot = document.getElementById('grindtime-status-dot');
  const text = document.getElementById('grindtime-status-text');
  
  if (!dot || !text) return;
  
  switch(status) {
    case 'initializing':
      dot.style.background = "#f59e0b"; // Orange
      text.textContent = message || "📹 Camera initializing...";
      break;
    case 'active':
      dot.style.background = "#22c55e"; // Green
      text.textContent = message || "👁️ Camera active";
      break;
    case 'face-detected':
      dot.style.background = "#22c55e"; // Green
      text.textContent = message || "✓ Face detected";
      break;
    case 'face-lost':
      dot.style.background = "#ef4444"; // Red
      text.textContent = message || "⚠ Face not detected";
      break;
    case 'error':
      dot.style.background = "#ef4444"; // Red
      text.textContent = message || "✗ Camera error";
      break;
  }
}

// Send face status to background
function sendFaceStatus(detected) {
  if (detected === lastFaceState) return;
  
  lastFaceState = detected;
  
  // Check if extension context is still valid
  if (!chrome.runtime?.id) {
    console.log('Extension context invalidated - stopping face tracking');
    cleanupFaceTracking();
    return;
  }
  
  if (detected) {
    console.log('Face detected - sending message to background');
    chrome.runtime.sendMessage({ action: "faceDetected" }).catch(err => {
      if (err.message.includes('Extension context invalidated')) {
        console.log('Extension was reloaded - cleaning up');
        cleanupFaceTracking();
      }
    });
    updateCameraIndicator('face-detected');
    if (DEBUG_MODE) indicator.style.background = "#22c55e";
  } else {
    console.log('Face lost - sending message to background');
    chrome.runtime.sendMessage({ action: "faceLost" }).catch(err => {
      if (err.message.includes('Extension context invalidated')) {
        console.log('Extension was reloaded - cleaning up');
        cleanupFaceTracking();
      }
    });
    updateCameraIndicator('face-lost');
    if (DEBUG_MODE) indicator.style.background = "#ef4444";
  }
}

// Initialize Face Detection using simpler approach
async function initFaceDetection() {
  try {
    updateCameraIndicator('initializing', '📹 Requesting camera...');
    
    // Request camera access
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user'
      } 
    });
    
    video.srcObject = stream;
    await video.play();
    
    console.log('Camera initialized successfully');
    updateCameraIndicator('active', '👁️ Camera active');
    
    // Check if extension context is valid before sending messages
    if (!chrome.runtime?.id) {
      console.warn('Extension context not available - face tracking will work locally only');
      updateCameraIndicator('error', '⚠ Extension not responding');
      return;
    }
    
    // Notify background that face tracking is initialized
    chrome.runtime.sendMessage({ 
      action: "faceTrackingInitialized" 
    }).catch(err => {
      console.log('Failed to notify background:', err);
      if (err.message.includes('Extension context invalidated')) {
        updateCameraIndicator('error', '✗ Extension reloaded - refresh page');
        cleanupFaceTracking();
        return;
      }
    });
    
    // Also store in local storage directly
    try {
      chrome.storage.local.set({ 
        faceTrackingActive: true,
        lastFaceStatus: null 
      });
    } catch (err) {
      console.log('Failed to set storage:', err);
    }
    
    // Load TensorFlow.js and Face Detection model
    await loadTensorFlowScripts();
    
    console.log('Starting face detection...');
    startSimpleFaceDetection();
    
  } catch (error) {
    console.error('Failed to initialize face detection:', error);
    
    if (error.name === 'NotAllowedError') {
      console.log('Camera permission denied - face tracking disabled');
      updateCameraIndicator('error', '✗ Camera permission denied');
    } else if (error.name === 'NotFoundError') {
      updateCameraIndicator('error', '✗ No camera found');
    } else if (error.name === 'NotReadableError') {
      updateCameraIndicator('error', '✗ Camera in use by another app');
    } else {
      updateCameraIndicator('error', `✗ ${error.message || 'Camera error'}`);
    }
  }
}

// Simple face detection using canvas and pixel analysis
async function startSimpleFaceDetection() {
  // Create canvas for face detection with willReadFrequently optimization
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  canvas.width = 160;
  canvas.height = 120;
  
  // Store previous frame for motion/change detection
  let previousFrame = null;
  let noChangeFrames = 0; // Count frames with no significant change
  let previousFacePresent = null;
  
  // Calculate regions for center-weighted detection
  const edgeMargin = Math.floor(canvas.width * DETECTION_PARAMS.edgeIgnoreRatio);
  const centerStartX = edgeMargin;
  const centerEndX = canvas.width - edgeMargin;
  const centerStartY = edgeMargin;
  const centerEndY = canvas.height - edgeMargin;
  
  updateCameraIndicator('active', '👁️ Tracking active');
  
  console.log('Face detection started with improved accuracy');
  console.log('Detection params:', DETECTION_PARAMS);
  
  // Check for face every 500ms
  detectionInterval = setInterval(() => {
    try {
      // Check if extension context is still valid
      if (!chrome.runtime?.id) {
        console.log('Extension context lost during detection');
        cleanupFaceTracking();
        return;
      }
      
      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;
      
      // Calculate metrics with center-weighting
      let totalBrightness = 0;
      let darkPixels = 0;
      let veryBrightPixels = 0;
      let centerBrightness = 0;
      let centerPixelCount = 0;
      let edgePixelCount = 0;
      let skinTonePixels = 0; // NEW: Skin tone detection
      let totalPixels = data.length / 4;
      
      // Enhanced pass: Calculate statistics with region awareness + skin tone
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r + g + b) / 3;
          
          totalBrightness += brightness;
          
          // Check if pixel is in center region (where face usually is)
          const isCenter = x >= centerStartX && x < centerEndX && y >= centerStartY && y < centerEndY;
          
          if (isCenter) {
            centerBrightness += brightness;
            centerPixelCount++;
            
            // NEW: Improved skin tone detection (works for all skin tones)
            // Skin characteristics: R > G > B, moderate brightness, specific ratios
            if (r > g && g > b && brightness > 40 && brightness < 220) {
              const rg_diff = r - g;
              const gb_diff = g - b;
              // Skin tone ranges (adjusted for diversity)
              if (rg_diff > 8 && rg_diff < 100 && gb_diff > 3 && gb_diff < 60) {
                skinTonePixels++;
              }
            }
          } else {
            edgePixelCount++;
          }
          
          if (brightness < 20) {
            darkPixels++; // Very dark = covered camera or absence
          } else if (brightness > 240) {
            veryBrightPixels++; // Overexposed
          }
        }
      }
      
      const avgBrightness = totalBrightness / totalPixels;
      const avgCenterBrightness = centerPixelCount > 0 ? centerBrightness / centerPixelCount : avgBrightness;
      const darkRatio = darkPixels / totalPixels;
      const brightRatio = veryBrightPixels / totalPixels;
      const skinToneRatio = skinTonePixels / centerPixelCount; // Skin tone presence
      
      // Enhanced motion/change detection with center focus
      let changePixels = 0;
      let centerChangePixels = 0;
      let significantChange = false;
      let centerMovement = false;
      
      if (previousFrame) {
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const currBrightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const prevBrightness = (previousFrame[i] + previousFrame[i + 1] + previousFrame[i + 2]) / 3;
            const diff = Math.abs(currBrightness - prevBrightness);
            
            if (diff > DETECTION_PARAMS.changePixelDiff) {
              changePixels++;
              
              // Track center region changes separately (more important)
              const isCenter = x >= centerStartX && x < centerEndX && y >= centerStartY && y < centerEndY;
              if (isCenter) {
                centerChangePixels++;
              }
            }
          }
        }
        
        const changeRatio = changePixels / totalPixels;
        const centerChangeRatio = centerPixelCount > 0 ? centerChangePixels / centerPixelCount : 0;
        
        // Movement is significant if overall change OR center region change
        significantChange = changeRatio > DETECTION_PARAMS.changeThreshold;
        centerMovement = centerChangeRatio > (DETECTION_PARAMS.changeThreshold * 0.8); // Slightly lower threshold for center
        
        if (!significantChange && !centerMovement) {
          noChangeFrames++;
        } else {
          noChangeFrames = 0;
        }
      }
      
      // Store current frame for next comparison
      previousFrame = new Uint8ClampedArray(data);
      
      // Enhanced detection logic with multiple factors
      const cameraCovered = darkRatio > DETECTION_PARAMS.darkThreshold;
      const cameraBlank = brightRatio > DETECTION_PARAMS.brightThreshold;
      const noMovement = noChangeFrames > DETECTION_PARAMS.noMovementFrames;
      const goodLighting = avgBrightness > DETECTION_PARAMS.minBrightness && 
                          avgBrightness < DETECTION_PARAMS.maxBrightness;
      const centerGoodLighting = avgCenterBrightness > DETECTION_PARAMS.minBrightness && 
                                avgCenterBrightness < DETECTION_PARAMS.maxBrightness;
      const hasSkinTone = DETECTION_PARAMS.skinToneDetection && skinToneRatio > 0.10; // 10%+ skin pixels = likely face
      
      // Face is present if:
      // - Camera not covered (not too dark)
      // - Camera not blank/overexposed
      // - Good lighting conditions (overall OR center)
      // - Has movement (overall OR in center region) OR just started
      // - Has skin tone pixels (NEW: strong indicator of face presence)
      // - Video is ready
      const hasRecentMovement = significantChange || centerMovement || noChangeFrames < 4;
      const lightingOK = goodLighting || centerGoodLighting;
      
      const facePresent = (
        video.readyState === 4 &&
        !cameraCovered &&
        !cameraBlank &&
        lightingOK &&
        (hasRecentMovement || hasSkinTone) && // NEW: Skin tone can bypass movement requirement
        !noMovement
      );
      
      // Log detection metrics for debugging
      if (DEBUG_MODE) {
        console.log('🔍 Detection:', {
          avgBright: avgBrightness.toFixed(0),
          centerBright: avgCenterBrightness.toFixed(0),
          darkRatio: (darkRatio * 100).toFixed(1) + '%',
          skinTone: (skinToneRatio * 100).toFixed(1) + '%', // NEW: Skin tone %
          changePixels: changePixels,
          centerChange: centerChangePixels,
          changeRatio: ((changePixels / totalPixels) * 100).toFixed(2) + '%',
          noChangeFrames: noChangeFrames,
          movement: significantChange ? 'YES' : 'no',
          centerMove: centerMovement ? 'YES' : 'no',
          hasSkin: hasSkinTone ? '✓ YES' : '✗ no', // NEW
          covered: cameraCovered,
          blank: cameraBlank,
          lighting: lightingOK ? 'OK' : 'bad',
          face: facePresent ? '✓ YES' : '✗ NO',
          confidence: facePresent ? '🟢' : '🔴'
        });
      }
      
      if (facePresent) {
        consecutiveFaceDetected++;
        consecutiveFaceLost = 0;
        
        if (consecutiveFaceDetected >= THRESHOLD && lastFaceState !== true) {
          sendFaceStatus(true);
        }
      } else {
        consecutiveFaceLost++;
        consecutiveFaceDetected = 0;
        
        if (consecutiveFaceLost >= THRESHOLD && lastFaceState !== false) {
          sendFaceStatus(false);
        }
      }
    } catch (err) {
      console.error('Face detection error:', err);
      
      // Check if extension context was invalidated
      if (err.message && err.message.includes('Extension context invalidated')) {
        console.log('Extension context invalidated during detection - cleaning up');
        cleanupFaceTracking();
      }
    }
  }, 500);
  
  console.log('Simple face detection started');
}

// Cleanup function to stop face tracking gracefully
function cleanupFaceTracking() {
  console.log('Cleaning up face tracking...');
  
  // Stop detection interval
  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }
  
  // Stop video stream
  if (video.srcObject) {
    const tracks = video.srcObject.getTracks();
    tracks.forEach(track => {
      track.stop();
      console.log('Camera track stopped');
    });
    video.srcObject = null;
  }
  
  // Update indicator
  updateCameraIndicator('error', '✗ Extension reloaded - refresh page');
  
  console.log('Face tracking cleanup complete');
}

// Load TensorFlow.js scripts (optional, for better detection)
async function loadTensorFlowScripts() {
  return new Promise((resolve) => {
    // For now, use simple detection. Can add TensorFlow later if needed
    console.log('Using simple face detection algorithm');
    resolve();
  });
}

// Initialize after page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFaceDetection);
} else {
  // DOM already loaded
  setTimeout(initFaceDetection, 1000); // Small delay to ensure page is ready
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanupFaceTracking);

console.log('GrindTime face tracker loaded and ready');
