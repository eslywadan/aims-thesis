// Open browser console and run:
const worker = new Worker('js/workers/monte-carlo-worker.js');
worker.postMessage({
    taskId: 'test',
    data: {
        numScenarios: 100,
        horizonMonths: 18,
        forecast: new Array(18).fill(1000),
        uncertainty: new Array(18).fill(150)
    }
});

worker.addEventListener('message', (e) => {
    console.log('Worker result:', e.data);
});