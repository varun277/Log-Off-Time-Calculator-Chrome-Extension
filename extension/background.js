// Service Worker for Alarms & Notifications
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'workLogoutAlarm') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon48.png'),
      title: 'Hurray! Shift Completed',
      message: 'Time to log out and relax. Great job today!',
      priority: 2,
      requireInteraction: true,
    });
    
    // We keep the storage data so the UI retains the time until manually reset
  }
});

chrome.notifications.onClicked.addListener((id) => {
  chrome.notifications.clear(id);
});
