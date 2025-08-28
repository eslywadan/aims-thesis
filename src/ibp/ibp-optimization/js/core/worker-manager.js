// js/core/worker-manager.js
// FIXED VERSION - Added missing getStats() method

class WorkerManager {
    constructor() {
        this.workers = new Map();
        this.taskQueue = [];
        this.activeTasks = new Map();
        this.maxWorkers = navigator.hardwareConcurrency || 4;
        this.taskIdCounter = 0;
        this.stats = {
            tasksCompleted: 0,
            tasksFailed: 0,
            totalExecutionTime: 0,
            workersInitialized: false
        };
    }

    // Initialize workers
    async initialize() {
        try {
            // Create Monte Carlo worker
            await this.createWorker('monte-carlo', 'js/workers/monte-carlo-worker.js');
            this.stats.workersInitialized = true;
            console.log('✅ Worker Manager initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Worker Manager:', error);
            this.stats.workersInitialized = false;
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
                this.stats.tasksFailed++;
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
            const executionTime = Date.now() - task.startTime;
            this.stats.totalExecutionTime += executionTime;
            
            this.activeTasks.delete(taskId);
            
            if (success) {
                this.stats.tasksCompleted++;
                task.resolve(result);
            } else {
                this.stats.tasksFailed++;
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
                    this.stats.tasksFailed++;
                    reject(new Error('Task timeout after 60 seconds'));
                }
            }, 60000);
        });
    }

    generateTaskId() {
        return `task_${++this.taskIdCounter}_${Date.now()}`;
    }

    // NEW METHOD: Get statistics about worker performance
    getStats() {
        const avgExecutionTime = this.stats.tasksCompleted > 0 
            ? this.stats.totalExecutionTime / this.stats.tasksCompleted 
            : 0;
        
        return {
            supported: typeof Worker !== 'undefined',
            initialized: this.stats.workersInitialized,
            workersActive: this.workers.size,
            maxWorkers: this.maxWorkers,
            tasksCompleted: this.stats.tasksCompleted,
            tasksFailed: this.stats.tasksFailed,
            tasksActive: this.activeTasks.size,
            avgExecutionTime: Math.round(avgExecutionTime * 100) / 100,
            totalExecutionTime: this.stats.totalExecutionTime
        };
    }

    // Cleanup method
    terminate() {
        this.workers.forEach(worker => worker.terminate());
        this.workers.clear();
        this.activeTasks.clear();
        this.stats.workersInitialized = false;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.WorkerManager = WorkerManager;
}