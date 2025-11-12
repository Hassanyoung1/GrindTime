document.addEventListener('DOMContentLoaded', () => {
  
  // DOM Elements
  const backBtn = document.getElementById('backBtn');
  const clearBtn = document.getElementById('clearBtn');
  const historyList = document.getElementById('historyList');
  const emptyState = document.getElementById('emptyState');
  const historyCount = document.getElementById('historyCount');
  
  // Stats elements
  const todayDistraction = document.getElementById('todayDistraction');
  const weekDistraction = document.getElementById('weekDistraction');
  const totalDistraction = document.getElementById('totalDistraction');
  const avgDistraction = document.getElementById('avgDistraction');
  
  // Filter buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  let allDistractions = [];
  let currentFilter = 'all';
  
  // Load history on page load
  loadHistory();
  
  // Back button - close window and reopen popup
  backBtn.addEventListener('click', () => {
    window.close();
  });
  
  // Clear history button
  clearBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all distraction history?')) {
      await chrome.storage.sync.set({ distractionHistory: [] });
      allDistractions = [];
      renderHistory();
      updateStats();
    }
  });
  
  // Filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderHistory();
    });
  });
  
  // Load distraction history from storage
  async function loadHistory() {
    try {
      const data = await chrome.storage.sync.get(['distractionHistory']);
      
      allDistractions = data.distractionHistory || [];
      
      // Sort by timestamp (newest first)
      allDistractions.sort((a, b) => b.timestamp - a.timestamp);
      
      renderHistory();
      updateStats();
    } catch (error) {
      console.error('❌ Failed to load history:', error);
    }
  }
  
  // Render history list based on current filter
  function renderHistory() {
    const filtered = filterDistractions(allDistractions, currentFilter);
    
    historyList.innerHTML = '';
    
    if (filtered.length === 0) {
      emptyState.classList.add('show');
      historyCount.textContent = '0 events';
      return;
    }
    
    emptyState.classList.remove('show');
    historyCount.textContent = `${filtered.length} event${filtered.length !== 1 ? 's' : ''}`;
    
    filtered.forEach(distraction => {
      const item = createHistoryItem(distraction);
      historyList.appendChild(item);
    });
  }
  
  // Filter distractions based on selected filter
  function filterDistractions(distractions, filter) {
    const now = new Date();
    const today = now.toDateString();
    
    switch (filter) {
      case 'today':
        return distractions.filter(d => new Date(d.timestamp).toDateString() === today);
      
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return distractions.filter(d => new Date(d.timestamp) >= weekAgo);
      
      case 'all':
      default:
        return distractions;
    }
  }
  
  // Helper function to escape HTML and prevent XSS
  function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Create a history item element
  function createHistoryItem(distraction) {
    const item = document.createElement('div');
    item.className = 'history-item';
    
    const duration = formatDuration(distraction.duration);
    const date = formatDate(distraction.timestamp);
    const time = formatTime(distraction.timestamp);
    
    // Choose icon and label based on distraction type
    let icon = '👀';
    let typeLabel = '';
    let itemClass = 'history-item';
    
    if (distraction.type === 'social_media') {
      icon = '📱';
      // Sanitize site name to prevent XSS
      typeLabel = escapeHtml(distraction.site) || 'Social Media';
      itemClass = 'history-item social-media-item';
    }
    
    // Format timer context info
    let timerContextHTML = '';
    if (distraction.timeIntoSession !== null && distraction.timeIntoSession !== undefined) {
      const minutesInto = Math.floor(distraction.timeIntoSession / 60);
      const secondsInto = distraction.timeIntoSession % 60;
      const timeIntoStr = minutesInto > 0 
        ? `${minutesInto}m ${secondsInto}s` 
        : `${secondsInto}s`;
      
      const sessionDur = distraction.sessionDurationMinutes || Math.floor(distraction.sessionDuration / 60);
      
      timerContextHTML = `
        <div class="timer-context">
          ⏱️ ${timeIntoStr} into ${sessionDur}min session
        </div>
      `;
    }
    
    // Add site label for social media
    let siteLabelHTML = '';
    if (typeLabel) {
      siteLabelHTML = `<div class="site-label">${typeLabel}</div>`;
    }
    
    item.className = itemClass;
    item.innerHTML = `
      <div class="history-item-left">
        <div class="history-icon">${icon}</div>
        <div class="history-details">
          <div class="history-date">${date}</div>
          <div class="history-time">${time}</div>
          ${siteLabelHTML}
          ${timerContextHTML}
        </div>
      </div>
      <div class="history-duration">${duration}</div>
    `;
    
    
    return item;
  }
  
  // Update statistics
  function updateStats() {
    const now = new Date();
    const today = now.toDateString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Today's distractions
    const todayDistractions = allDistractions.filter(d => 
      new Date(d.timestamp).toDateString() === today
    );
    const todayTotal = todayDistractions.reduce((sum, d) => sum + d.duration, 0);
    todayDistraction.textContent = formatDuration(todayTotal);
    
    // This week's distractions
    const weekDistractions = allDistractions.filter(d => 
      new Date(d.timestamp) >= weekAgo
    );
    const weekTotal = weekDistractions.reduce((sum, d) => sum + d.duration, 0);
    weekDistraction.textContent = formatDuration(weekTotal);
    
    // All time total
    const allTimeTotal = allDistractions.reduce((sum, d) => sum + d.duration, 0);
    totalDistraction.textContent = formatDuration(allTimeTotal);
    
    // Average distraction duration
    const average = allDistractions.length > 0 
      ? allTimeTotal / allDistractions.length 
      : 0;
    avgDistraction.textContent = formatDuration(average);
  }
  
  // Format duration in ms to readable string
  function formatDuration(ms) {
    if (ms < 1000) return '0s';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      const remainingSeconds = seconds % 60;
      if (remainingMinutes > 0) {
        return `${hours}h ${remainingMinutes}m`;
      }
      return `${hours}h`;
    }
    
    if (minutes > 0) {
      const remainingSeconds = seconds % 60;
      if (remainingSeconds > 0) {
        return `${minutes}m ${remainingSeconds}s`;
      }
      return `${minutes}m`;
    }
    
    return `${seconds}s`;
  }
  
  // Format date
  function formatDate(timestamp) {
    const date = new Date(timestamp);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    const dateStr = date.toDateString();
    
    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  }
  
  // Format time
  function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
});
