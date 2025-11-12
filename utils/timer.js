// Timer utility functions

/**
 * Format seconds into HH:MM:SS string
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Parse time inputs to total seconds
 * @param {number} hours
 * @param {number} minutes
 * @param {number} seconds
 * @returns {number}
 */
export function parseTimeToSeconds(hours, minutes, seconds) {
  return (hours * 3600) + (minutes * 60) + seconds;
}

/**
 * Convert seconds to minutes (rounded)
 * @param {number} seconds
 * @returns {number}
 */
export function secondsToMinutes(seconds) {
  return Math.round(seconds / 60);
}

/**
 * Timer class for managing countdown
 */
export class Timer {
  constructor(totalSeconds, onTick, onComplete) {
    this.totalSeconds = totalSeconds;
    this.timeLeft = totalSeconds;
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.intervalId = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.timeLeft -= 1;
      
      if (this.onTick) {
        this.onTick(this.timeLeft);
      }
      
      if (this.timeLeft <= 0) {
        this.stop();
        if (this.onComplete) {
          this.onComplete();
        }
      }
    }, 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  reset() {
    this.stop();
    this.timeLeft = this.totalSeconds;
  }

  getTimeLeft() {
    return this.timeLeft;
  }

  isActive() {
    return this.isRunning;
  }
}
