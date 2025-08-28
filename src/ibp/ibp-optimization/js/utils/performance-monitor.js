// ===================================================================
// FILE 1: js/utils/performance-monitor.js
// REPLACE THE ENTIRE FILE WITH ONLY THIS CONTENT
// ===================================================================

class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.startTimes = new Map();
        console.log('PerformanceMonitor initialized');
    }

    startTimer(operationName) {
        this.startTimes.set(operationName, performance.now());
    }

    endTimer(operationName) {
        const startTime = this.startTimes.get(operationName);
        if (startTime) {
            const duration = performance.now() - startTime;
            this.record(operationName, duration);
            this.startTimes.delete(operationName);
            return duration;
        }
        return 0;
    }

    record(operationName, duration) {
        if (!this.metrics.has(operationName)) {
            this.metrics.set(operationName, {
                count: 0,
                totalTime: 0,
                minTime: Infinity,
                maxTime: 0,
                avgTime: 0
            });
        }

        const metric = this.metrics.get(operationName);
        metric.count++;
        metric.totalTime += duration;
        metric.minTime = Math.min(metric.minTime, duration);
        metric.maxTime = Math.max(metric.maxTime, duration);
        metric.avgTime = metric.totalTime / metric.count;
    }

    getStats() {
        const stats = {};
        for (const [name, metric] of this.metrics) {
            stats[name] = {
                ...metric,
                avgTime: Math.round(metric.avgTime * 100) / 100,
                minTime: Math.round(metric.minTime * 100) / 100,
                maxTime: Math.round(metric.maxTime * 100) / 100
            };
        }
        return stats;
    }

    reset() {
        this.metrics.clear();
        this.startTimes.clear();
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.PerformanceMonitor = PerformanceMonitor;
}