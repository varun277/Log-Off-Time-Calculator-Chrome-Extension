document.addEventListener('DOMContentLoaded', () => {
  const startTimeInput = document.getElementById('startTime');
  const workHoursInput = document.getElementById('workHours');
  const workMinutesInput = document.getElementById('workMinutes');
  const notifyCheckbox = document.getElementById('notify');
  const calculateBtn = document.getElementById('calculateBtn');
  const resetBtn = document.getElementById('resetBtn');
  const testNotifyBtn = document.getElementById('testNotifyBtn');
  const resultDiv = document.getElementById('result');
  const logoutTimeDisplay = document.getElementById('logoutTime');

  // Load saved state
  chrome.storage.local.get(['startTime', 'workHours', 'workMinutes', 'notify', 'logoutTimestamp'], (data) => {
    if (data.startTime) startTimeInput.value = data.startTime;
    if (data.workHours) workHoursInput.value = data.workHours;
    if (data.workMinutes) workMinutesInput.value = data.workMinutes;
    if (data.notify !== undefined) notifyCheckbox.checked = data.notify;
    
    // RETAIN THE RESULT unless reset is clicked
    if (data.logoutTimestamp) {
      showResult(data.logoutTimestamp);
    } else {
      // Set default start time to now if nothing is saved
      const now = new Date();
      startTimeInput.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
  });

  calculateBtn.addEventListener('click', () => {
    const startTime = startTimeInput.value;
    const hours = parseInt(workHoursInput.value) || 0;
    const minutes = parseInt(workMinutesInput.value) || 0;
    const shouldNotify = notifyCheckbox.checked;

    if (!startTime || (hours === 0 && minutes === 0)) {
      alert('Please fill in arrival time and shift duration.');
      return;
    }

    const [startH, startM] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(startH, startM, 0, 0);

    const durationMs = (hours * 3600000) + (minutes * 60000);
    const logoutDate = new Date(startDate.getTime() + durationMs);
    const logoutTimestamp = logoutDate.getTime();

    chrome.storage.local.set({
      startTime,
      workHours: hours,
      workMinutes: minutes,
      notify: shouldNotify,
      logoutTimestamp
    });

    // Reset Alarms
    chrome.alarms.clear('workLogoutAlarm');
    if (shouldNotify && logoutTimestamp > Date.now()) {
      chrome.alarms.create('workLogoutAlarm', { when: logoutTimestamp });
    }

    showResult(logoutTimestamp);
  });

  resetBtn.addEventListener('click', () => {
    chrome.storage.local.clear(() => {
      resultDiv.classList.add('hidden');
      workHoursInput.value = '';
      workMinutesInput.value = '';
      const now = new Date();
      startTimeInput.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      chrome.alarms.clearAll();
    });
  });

  function showResult(timestamp) {
    const date = new Date(timestamp);
    logoutTimeDisplay.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    resultDiv.classList.remove('hidden');
  }
});
