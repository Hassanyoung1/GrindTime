// Storage utility functions for GrindTime extension

/**
 * Get stored data from chrome.storage.sync
 * @param {string[]} keys - Array of keys to retrieve
 * @returns {Promise} Resolves with stored data
 */
export function getStorageData(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * Set data in chrome.storage.sync
 * @param {Object} data - Object with key-value pairs to store
 * @returns {Promise}
 */
export function setStorageData(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Get data from chrome.storage.local (for runtime state)
 * @param {string[]} keys - Array of keys to retrieve
 * @returns {Promise}
 */
export function getLocalData(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * Set data in chrome.storage.local
 * @param {Object} data - Object with key-value pairs to store
 * @returns {Promise}
 */
export function setLocalData(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Initialize default storage values if they don't exist
 */
export async function initializeStorage() {
  const data = await getStorageData(['streak', 'lastSessionDate', 'totalFocusTime', 'sessionsToday']);
  
  const defaults = {
    streak: data.streak || 0,
    lastSessionDate: data.lastSessionDate || null,
    totalFocusTime: data.totalFocusTime || 0,
    sessionsToday: data.sessionsToday || 0
  };

  await setStorageData(defaults);
  return defaults;
}

/**
 * Update streak based on session completion
 */
export async function updateStreak() {
  const data = await getStorageData(['streak', 'lastSessionDate']);
  const today = new Date().toDateString();
  const lastDate = data.lastSessionDate;
  
  let newStreak = data.streak || 0;
  
  if (lastDate === today) {
    // Already completed a session today, don't increment
    return newStreak;
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  
  if (lastDate === yesterdayStr || lastDate === null) {
    // Consecutive day or first session
    newStreak += 1;
  } else {
    // Streak broken, reset to 1
    newStreak = 1;
  }
  
  await setStorageData({
    streak: newStreak,
    lastSessionDate: today
  });
  
  return newStreak;
}

/**
 * Increment sessions today count
 */
export async function incrementSessionsToday() {
  const data = await getStorageData(['sessionsToday', 'lastSessionDate']);
  const today = new Date().toDateString();
  
  let sessions = data.sessionsToday || 0;
  
  // Reset if it's a new day
  if (data.lastSessionDate !== today) {
    sessions = 0;
  }
  
  sessions += 1;
  
  await setStorageData({ sessionsToday: sessions });
  return sessions;
}

/**
 * Add focus time to total
 * @param {number} minutes - Minutes to add
 */
export async function addFocusTime(minutes) {
  const data = await getStorageData(['totalFocusTime']);
  const total = (data.totalFocusTime || 0) + minutes;
  await setStorageData({ totalFocusTime: total });
  return total;
}
