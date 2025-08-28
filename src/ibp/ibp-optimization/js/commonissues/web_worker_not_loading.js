// Check if file exists and path is correct
fetch('js/workers/monte-carlo-worker.js')
    .then(response => console.log('Worker file accessible:', response.ok))
    .catch(error => console.error('Worker file not found:', error));