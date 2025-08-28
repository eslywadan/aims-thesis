// In browser console:
const tracker = window.progressManager.createTracker('test', { total: 100 });
tracker.onProgress = (progress) => console.log('Progress:', progress);
tracker.increment(25);