// Social Media Tracker - Detects visits to social media sites during focus sessions

(function() {
  'use strict';

  // List of social media domains to track
  const SOCIAL_MEDIA_SITES = [
    // Social Networks
    'facebook.com',
    'twitter.com',
    'x.com',
    'instagram.com',
    'linkedin.com',
    'snapchat.com',
    'tiktok.com',
    'reddit.com',
    'pinterest.com',
    'tumblr.com',
    
    // Video/Entertainment
    'youtube.com',
    'twitch.tv',
    'vimeo.com',
    'dailymotion.com',
    
    // Messaging
    'discord.com',
    'whatsapp.com',
    'telegram.org',
    'messenger.com',
    
    // Professional but distracting
    'medium.com',
    'quora.com',
    'stackoverflow.com' // Can be work-related, but often distracting
  ];

  let visitStartTime = null;
  let isTimerRunning = false;
  let currentSite = null;
  let checkInterval = null;

  // Check if current site is a social media site
  function isSocialMediaSite() {
    const hostname = window.location.hostname.toLowerCase();
    return SOCIAL_MEDIA_SITES.some(site => {
      return hostname === site || hostname.endsWith('.' + site);
    });
  }

  // Get friendly site name
  function getSiteName() {
    const hostname = window.location.hostname.toLowerCase();
    
    // Remove 'www.' prefix
    let siteName = hostname.replace(/^www\./, '');
    
    // Extract main domain (e.g., 'youtube' from 'youtube.com')
    const parts = siteName.split('.');
    if (parts.length >= 2) {
      siteName = parts[parts.length - 2];
    }
    
    // Capitalize first letter
    return siteName.charAt(0).toUpperCase() + siteName.slice(1);
  }

  // Notify background script of social media visit
  function notifySocialMediaVisit(action, duration = null) {
    const message = {
      action: 'socialMediaVisit',
      visitAction: action, // 'started' or 'ended'
      site: getSiteName(),
      url: window.location.hostname,
      duration: duration,
      timestamp: Date.now()
    };
    
    console.log('📱 Social media visit:', action, getSiteName(), duration ? `(${duration}ms)` : '');
    chrome.runtime.sendMessage(message).catch(() => {
      // Extension context may be invalid, ignore
    });
  }

  // Start tracking when user lands on social media
  function startTracking() {
    if (!visitStartTime && isSocialMediaSite()) {
      visitStartTime = Date.now();
      currentSite = window.location.hostname;
      console.log('📱 Started tracking social media visit:', getSiteName());
      notifySocialMediaVisit('started');
    }
  }

  // Stop tracking when user leaves or timer stops
  function stopTracking() {
    if (visitStartTime) {
      const duration = Date.now() - visitStartTime;
      console.log('📱 Stopped tracking social media visit:', getSiteName(), `${Math.floor(duration/1000)}s`);
      notifySocialMediaVisit('ended', duration);
      visitStartTime = null;
      currentSite = null;
    }
  }

  // Check timer status periodically
  function checkTimerStatus() {
    chrome.runtime.sendMessage({ action: 'getTimerStatus' }, (response) => {
      if (chrome.runtime.lastError) return;
      
      const wasRunning = isTimerRunning;
      isTimerRunning = response?.timerRunning || false;
      
      // Timer state changed
      if (wasRunning && !isTimerRunning) {
        // Timer stopped, end tracking
        stopTracking();
      } else if (!wasRunning && isTimerRunning) {
        // Timer started, start tracking if on social media
        if (isSocialMediaSite()) {
          startTracking();
        }
      }
      
      // If timer running and we're on social media but not tracking yet
      if (isTimerRunning && isSocialMediaSite() && !visitStartTime) {
        startTracking();
      }
      
      // If timer running but we left the social media site
      if (isTimerRunning && visitStartTime && currentSite !== window.location.hostname) {
        stopTracking();
        // If still on social media (different site), start tracking again
        if (isSocialMediaSite()) {
          startTracking();
        }
      }
    });
  }

  // Listen for page visibility changes (tab switching)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // User switched away from this tab
      if (visitStartTime) {
        stopTracking();
      }
    } else {
      // User came back to this tab
      checkTimerStatus();
    }
  });

  // Listen for navigation within the same page (SPA)
  let lastUrl = window.location.href;
  new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      
      // URL changed, check if we're still on social media
      if (visitStartTime && !isSocialMediaSite()) {
        stopTracking();
      } else if (!visitStartTime && isSocialMediaSite() && isTimerRunning) {
        startTracking();
      }
    }
  }).observe(document, { subtree: true, childList: true });

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'timerStateChanged') {
      const wasRunning = isTimerRunning;
      isTimerRunning = message.timerRunning;
      
      if (!isTimerRunning && wasRunning) {
        // Timer stopped
        stopTracking();
      } else if (isTimerRunning && !wasRunning) {
        // Timer started
        if (isSocialMediaSite()) {
          startTracking();
        }
      }
    }
    
    if (message.action === 'checkSocialMedia') {
      sendResponse({
        isSocialMedia: isSocialMediaSite(),
        tracking: !!visitStartTime,
        site: getSiteName()
      });
    }
  });

  // Initial check
  checkTimerStatus();
  
  // Check timer status every 2 seconds
  checkInterval = setInterval(checkTimerStatus, 2000);
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    stopTracking();
    if (checkInterval) {
      clearInterval(checkInterval);
    }
  });

  console.log('📱 Social Media Tracker initialized');
})();
