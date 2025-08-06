class WorkerManager {
    constructor() {
        this.workers = new Map();
        this.taskQueue = [];
        this.activeTasks = new Map();
        this.maxWorkers = navigator.hardwareConcurrency || 4;
        this.taskIdCounter = 0;
    }

    // Initialize workers
    async initialize() {
        try {
            // Create Monte Carlo worker
            await this.createWorker('monte-carlo', 'js/workers/monte-carlo-worker.js');
            console.log('✅ Worker Manager initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Worker Manager:', error);
            return false;
        }
    }

    async createWorker(workerType, scriptPath) {
        try {
            const worker = new Worker(scriptPath);
            
            worker.addEventListener('message', (event) => {
                this.handleWorkerMessage(workerType, event);
            });
            
            worker.addEventListener('error', (error) => {
                console.error(`Worker ${workerType} error:`, error);
            });
            
            this.workers.set(workerType, worker);
            return worker;
        } catch (error) {
            throw new Error(`Failed to create worker ${workerType}: ${error.message}`);
        }
    }

    handleWorkerMessage(workerType, event) {
        const { taskId, type, success, result, error, progress } = event.data;
        
        if (type === 'progress') {
            // Handle progress updates
            const task = this.activeTasks.get(taskId);
            if (task && task.onProgress) {
                task.onProgress(progress);
            }
            return;
        }
        
        // Handle task completion
        const task = this.activeTasks.get(taskId);
        if (task) {
            this.activeTasks.delete(taskId);
            
            if (success) {
                task.resolve(result);
            } else {
                task.reject(new Error(error));
            }
        }
    }

    async runMonteCarloSimulation(params, onProgress = null) {
        return this.executeTask('monte-carlo', params, onProgress);
    }

    async executeTask(workerType, data, onProgress = null) {
        const worker = this.workers.get(workerType);
        if (!worker) {
            throw new Error(`Worker ${workerType} not found`);
        }

        const taskId = this.generateTaskId();
        
        return new Promise((resolve, reject) => {
            // Store task for tracking
            this.activeTasks.set(taskId, {
                resolve,
                reject,
                onProgress,
                startTime: Date.now()
            });
            
            // Send task to worker
            worker.postMessage({ taskId, data });
            
            // Set timeout
            setTimeout(() => {
                if (this.activeTasks.has(taskId)) {
                    this.activeTasks.delete(taskId);
                    reject(new Error('Task timeout after 60 seconds'));
                }
            }, 60000);
        });
    }

    generateTaskId() {
        return `task_${++this.taskIdCounter}_${Date.now()}`;
    }

    // Cleanup method
    terminate() {
        this.workers.forEach(worker => worker.terminate());
        this.workers.clear();
        this.activeTasks.clear();
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.WorkerManager = WorkerManager;
}