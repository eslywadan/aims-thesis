class ProgressManager {
    constructor() {
        this.activeTrackers = new Map();
        this.callbacks = new Map();
    }

    createTracker(id, config = {}) {
        const tracker = new ProgressTracker(id, config);
        this.activeTrackers.set(id, tracker);
        
        // Set up callbacks
        tracker.onProgress = (progress) => {
            this.notifyCallbacks(id, progress);
        };
        
        return tracker;
    }

    getTracker(id) {
        return this.activeTrackers.get(id);
    }

    removeTracker(id) {
        const tracker = this.activeTrackers.get(id);
        if (tracker) {
            tracker.complete();
            this.activeTrackers.delete(id);
            this.callbacks.delete(id);
        }
    }

    onProgress(trackerId, callback) {
        if (!this.callbacks.has(trackerId)) {
            this.callbacks.set(trackerId, []);
        }
        this.callbacks.get(trackerId).push(callback);
    }

    notifyCallbacks(trackerId, progress) {
        const callbacks = this.callbacks.get(trackerId) || [];
        callbacks.forEach(callback => {
            try {
                callback(progress);
            } catch (error) {
                console.error('Progress callback error:', error);
            }
        });
    }
}

class ProgressTracker {
    constructor(id, config = {}) {
        this.id = id;
        this.total = config.total || 100;
        this.current = 0;
        this.startTime = Date.now();
        this.lastUpdate = this.startTime;
        this.isComplete = false;
        this.onProgress = null;
        this.message = '';
    }

    setTotal(total) {
        this.total = total;
        this.update();
    }

    increment(amount = 1) {
        this.current = Math.min(this.current + amount, this.total);
        this.update();
    }

    setProgress(current) {
        this.current = Math.min(Math.max(0, current), this.total);
        this.update();
    }

    setMessage(message) {
        this.message = message;
        this.update();
    }

    update() {
        const now = Date.now();
        const elapsed = now - this.startTime;
        const percentage = (this.current / this.total) * 100;
        const rate = this.current / (elapsed / 1000); // items per second
        const eta = this.current > 0 ? (this.total - this.current) / rate : 0;

        const progress = {
            id: this.id,
            current: this.current,
            total: this.total,
            percentage: Math.round(percentage * 100) / 100,
            elapsed: elapsed,
            eta: Math.round(eta * 1000), // in milliseconds
            rate: Math.round(rate * 100) / 100,
            message: this.message,
            isComplete: this.current >= this.total
        };

        if (this.onProgress) {
            this.onProgress(progress);
        }

        this.lastUpdate = now;
        
        if (progress.isComplete && !this.isComplete) {
            this.complete();
        }
    }

    complete() {
        this.isComplete = true;
        this.current = this.total;
        this.update();
    }
}

// Global progress manager instance
if (typeof window !== 'undefined') {
    window.ProgressManager = ProgressManager;
    window.ProgressTracker = ProgressTracker;
    window.progressManager = new ProgressManager();
}