# Phase 1 Implementation Guide - Performance Optimization

## Overview
Phase 1 focuses on performance optimization through Web Workers, caching, error handling, and progress tracking. We'll implement these changes incrementally to avoid breaking existing functionality.

## Step-by-Step Implementation

### Step 1: Project Structure Enhancement

First, let's enhance your project structure to support the new features:

```
ibp-optimization/
├── index.html                 # Enhanced main UI
├── README.md                  
├── js/
│   ├── core/                  # NEW: Core modules
│   │   ├── ibp-model-enhanced.js
│   │   ├── worker-manager.js
│   │   └── error-handler.js
│   ├── workers/               # NEW: Web Workers
│   │   ├── monte-carlo-worker.js
│   │   └── optimization-worker.js
│   ├── utils/                 # NEW: Utilities
│   │   ├── cache-manager.js
│   │   ├── progress-manager.js
│   │   └── performance-monitor.js
│   ├── ibp-model.js          # Original (keep for compatibility)
│   ├── data-loader.js        # Will be enhanced
│   └── test-suite.js         # Will be enhanced
├── data/
│   ├── sample-demand.json
│   └── test-scenarios.json
└── css/
    └── styles.css            # Enhanced with progress indicators
```

### Step 2: Create Web Worker for Monte Carlo Simulations

**File: `js/workers/monte-carlo-worker.js`**
```javascript
// Monte Carlo Worker - Handles expensive simulations in background
self.addEventListener('message', function(e) {
    const { taskId, data } = e.data;
    
    try {
        const result = runMonteCarloSimulation(data);
        self.postMessage({
            taskId,
            success: true,
            result
        });
    } catch (error) {
        self.postMessage({
            taskId,
            success: false,
            error: error.message
        });
    }
});

function runMonteCarloSimulation(data) {
    const { numScenarios, horizonMonths, forecast, uncertainty } = data;
    const scenarios = new Float64Array(numScenarios * horizonMonths);
    
    // Progress reporting
    let progressCount = 0;
    const progressStep = Math.max(1, Math.floor(numScenarios / 100));
    
    for (let scenario = 0; scenario < numScenarios; scenario++) {
        for (let period = 0; period < horizonMonths; period++) {
            const baseIndex = scenario * horizonMonths + period;
            const mean = forecast[period];
            const stdDev = uncertainty[period];
            
            // Box-Muller transformation for normal distribution
            const u1 = Math.random();
            const u2 = Math.random();
            const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            
            // Add temporal correlation
            const correlation = period > 0 ? 0.3 : 0;
            const prevScenario = period > 0 ? scenarios[baseIndex - 1] : mean;
            const correlatedMean = mean + correlation * (prevScenario - mean);
            
            scenarios[baseIndex] = Math.max(0, correlatedMean + stdDev * z);
        }
        
        // Report progress periodically
        if (scenario % progressStep === 0) {
            self.postMessage({
                type: 'progress',
                progress: scenario / numScenarios,
                completed: scenario,
                total: numScenarios
            });
        }
    }
    
    return {
        scenarios: Array.from(scenarios),
        numScenarios,
        horizonMonths
    };
}
```

### Step 3: Create Worker Manager

**File: `js/core/worker-manager.js`**
```javascript
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
```

### Step 4: Create Cache Manager

**File: `js/utils/cache-manager.js`**
```javascript
class CacheManager {
    constructor(maxSize = 100, ttl = 300000) { // 5 minutes default TTL
        this.cache = new Map();
        this.timestamps = new Map();
        this.maxSize = maxSize;
        this.ttl = ttl; // Time to live in milliseconds
        this.hits = 0;
        this.misses = 0;
    }

    set(key, value, customTTL = null) {
        // Check if cache is full
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            this.evictOldest();
        }

        this.cache.set(key, value);
        this.timestamps.set(key, {
            created: Date.now(),
            ttl: customTTL || this.ttl
        });
    }

    get(key) {
        if (!this.cache.has(key)) {
            this.misses++;
            return null;
        }

        const timestamp = this.timestamps.get(key);
        const age = Date.now() - timestamp.created;

        // Check if expired
        if (age > timestamp.ttl) {
            this.cache.delete(key);
            this.timestamps.delete(key);
            this.misses++;
            return null;
        }

        this.hits++;
        return this.cache.get(key);
    }

    has(key) {
        return this.get(key) !== null;
    }

    delete(key) {
        this.cache.delete(key);
        this.timestamps.delete(key);
    }

    clear() {
        this.cache.clear();
        this.timestamps.clear();
        this.hits = 0;
        this.misses = 0;
    }

    evictOldest() {
        let oldestKey = null;
        let oldestTime = Date.now();

        for (const [key, timestamp] of this.timestamps) {
            if (timestamp.created < oldestTime) {
                oldestTime = timestamp.created;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.delete(oldestKey);
        }
    }

    getStats() {
        const total = this.hits + this.misses;
        return {
            hits: this.hits,
            misses: this.misses,
            hitRate: total > 0 ? (this.hits / total) * 100 : 0,
            size: this.cache.size,
            maxSize: this.maxSize
        };
    }

    // Create hash key for complex objects
    createKey(...args) {
        return args.map(arg => {
            if (typeof arg === 'object') {
                return JSON.stringify(arg);
            }
            return String(arg);
        }).join('|');
    }
}

if (typeof window !== 'undefined') {
    window.CacheManager = CacheManager;
}
```

### Step 5: Create Progress Manager

**File: `js/utils/progress-manager.js`**
```javascript
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
```

### Step 6: Create Enhanced IBP Model

**File: `js/core/ibp-model-enhanced.js`**
```javascript
class IBPOptimizationModelEnhanced extends IBPOptimizationModel {
    constructor(config = {}) {
        super(config);
        
        // Enhanced features
        this.cache = new CacheManager(200, 600000); // 10 minutes cache
        this.workerManager = new WorkerManager();
        this.performanceMonitor = new PerformanceMonitor();
        this.isWorkerSupported = typeof Worker !== 'undefined';
        
        // Initialize enhanced features
        this.initialize();
    }

    async initialize() {
        try {
            if (this.isWorkerSupported) {
                const initialized = await this.workerManager.initialize();
                if (initialized) {
                    this.log('🚀 Enhanced model with Web Workers initialized', 'success');
                } else {
                    this.log('⚠️ Fallback to synchronous processing', 'warning');
                }
            } else {
                this.log('⚠️ Web Workers not supported, using synchronous processing', 'warning');
            }
        } catch (error) {
            this.log('❌ Error initializing enhanced model: ' + error.message, 'error');
        }
    }

    // Enhanced demand scenario generation with Web Workers
    async generateDemandScenariosAsync(onProgress = null) {
        const cacheKey = this.cache.createKey(
            'scenarios',
            this.config.numScenarios,
            this.config.horizonMonths,
            Array.from(this.demand.forecast),
            Array.from(this.demand.uncertainty)
        );

        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached) {
            this.log('📦 Using cached demand scenarios', 'info');
            return cached;
        }

        this.log('⚡ Generating demand scenarios with Web Worker...', 'info');
        
        const startTime = performance.now();
        
        try {
            let scenarios;
            
            if (this.isWorkerSupported && this.workerManager.workers.has('monte-carlo')) {
                // Use Web Worker for large scenario generation
                scenarios = await this.workerManager.runMonteCarloSimulation({
                    numScenarios: this.config.numScenarios,
                    horizonMonths: this.config.horizonMonths,
                    forecast: Array.from(this.demand.forecast),
                    uncertainty: Array.from(this.demand.uncertainty)
                }, onProgress);
                
                // Update internal scenarios array
                for (let i = 0; i < scenarios.scenarios.length; i++) {
                    this.demand.scenarios[i] = scenarios.scenarios[i];
                }
            } else {
                // Fallback to synchronous generation
                this.generateDemandScenarios();
                scenarios = {
                    scenarios: Array.from(this.demand.scenarios),
                    numScenarios: this.config.numScenarios,
                    horizonMonths: this.config.horizonMonths
                };
            }

            const endTime = performance.now();
            const duration = endTime - startTime;
            
            this.log(`✅ Scenarios generated in ${duration.toFixed(2)}ms`, 'success');
            
            // Cache the result
            this.cache.set(cacheKey, scenarios);
            
            // Record performance
            this.performanceMonitor.record('generateDemandScenarios', duration);
            
            return scenarios;
            
        } catch (error) {
            this.log('❌ Error generating scenarios: ' + error.message, 'error');
            
            // Fallback to synchronous method
            this.generateDemandScenarios();
            return {
                scenarios: Array.from(this.demand.scenarios),
                numScenarios: this.config.numScenarios,
                horizonMonths: this.config.horizonMonths
            };
        }
    }

    // Memoized objective evaluation
    async evaluateObjectivesEnhanced(solution = null, onProgress = null) {
        const startTime = performance.now();
        
        if (solution) {
            this.updateDecisions(solution);
        }

        const solutionKey = this.cache.createKey(
            'objectives',
            solution ? this.hashSolution(solution) : 'current',
            Array.from(this.decisions.production),
            Array.from(this.decisions.procurement)
        );

        // Check cache
        const cached = this.cache.get(solutionKey);
        if (cached) {
            this.log('📦 Using cached objective evaluation', 'info');
            return cached;
        }

        // Create progress tracker if callback provided
        let progressTracker = null;
        if (onProgress) {
            progressTracker = window.progressManager?.createTracker('evaluation', {
                total: 4 // 4 objectives
            });
            progressTracker.onProgress = onProgress;
        }

        try {
            // Evaluate objectives with progress tracking
            const objectives = {
                cost: await this.evaluateCostObjectiveAsync(progressTracker),
                serviceLevel: await this.evaluateServiceLevelObjectiveAsync(progressTracker),
                inventoryTurns: await this.evaluateInventoryTurnsObjectiveAsync(progressTracker),
                sustainability: await this.evaluateSustainabilityObjectiveAsync(progressTracker)
            };

            // Calculate robust metrics
            const robustObjectives = this.calculateRobustMetrics(objectives);
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Cache result
            this.cache.set(solutionKey, robustObjectives);
            
            // Record performance
            this.performanceMonitor.record('evaluateObjectives', duration);
            
            this.log(`📊 Objectives evaluated in ${duration.toFixed(2)}ms`, 'success');
            
            if (progressTracker) {
                progressTracker.complete();
                window.progressManager?.removeTracker('evaluation');
            }
            
            return robustObjectives;
            
        } catch (error) {
            this.log('❌ Error evaluating objectives: ' + error.message, 'error');
            
            if (progressTracker) {
                window.progressManager?.removeTracker('evaluation');
            }
            
            // Fallback to synchronous evaluation
            return this.evaluateObjectives(solution);
        }
    }

    // Async objective evaluation methods (with small delays to prevent blocking)
    async evaluateCostObjectiveAsync(progressTracker = null) {
        const result = this.evaluateCostObjective();
        if (progressTracker) progressTracker.increment();
        await this.delay(1); // Prevent blocking
        return result;
    }

    async evaluateServiceLevelObjectiveAsync(progressTracker = null) {
        const result = this.evaluateServiceLevelObjective();
        if (progressTracker) progressTracker.increment();
        await this.delay(1);
        return result;
    }

    async evaluateInventoryTurnsObjectiveAsync(progressTracker = null) {
        const result = this.evaluateInventoryTurnsObjective();
        if (progressTracker) progressTracker.increment();
        await this.delay(1);
        return result;
    }

    async evaluateSustainabilityObjectiveAsync(progressTracker = null) {
        const result = this.evaluateSustainabilityObjective();
        if (progressTracker) progressTracker.increment();
        await this.delay(1);
        return result;
    }

    // Utility methods
    hashSolution(solution) {
        // Create a hash of the solution for caching
        const combined = [
            ...Array.from(solution.production || []),
            ...Array.from(solution.procurement || []),
            ...Array.from(solution.distribution || [])
        ];
        
        return combined.reduce((hash, value) => {
            return ((hash << 5) - hash) + (value * 1000 | 0);
        }, 0).toString();
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get performance statistics
    getPerformanceStats() {
        return {
            cache: this.cache.getStats(),
            performance: this.performanceMonitor.getStats(),
            workerSupport: this.isWorkerSupported
        };
    }

    // Cleanup method
    cleanup() {
        if (this.workerManager) {
            this.workerManager.terminate();
        }
        this.cache.clear();
        this.performanceMonitor.reset();
    }
}

// Factory enhancement
class IBPModelFactoryEnhanced {
    static createManufacturingModelEnhanced(config = {}) {
        const manufacturingConfig = {
            horizonMonths: 18,
            numScenarios: 500,
            objectives: ['cost', 'serviceLevel', 'inventoryTurns', 'sustainability'],
            uncertaintyTypes: ['demand', 'supply', 'leadTime'],
            industryType: 'manufacturing',
            ...config
        };
        
        return new IBPOptimizationModelEnhanced(manufacturingConfig);
    }
}

// Export for browser use
if (typeof window !== 'undefined') {
    window.IBPOptimizationModelEnhanced = IBPOptimizationModelEnhanced;
    window.IBPModelFactoryEnhanced = IBPModelFactoryEnhanced;
}
```

### Step 7: Update HTML to Include New Files

**Update your `index.html`** to include the new modules:

```html
<!-- Add these script tags before the existing ones -->
<script src="js/utils/cache-manager.js"></script>
<script src="js/utils/progress-manager.js"></script>
<script src="js/core/worker-manager.js"></script>

<!-- Add after existing scripts -->
<script src="js/core/ibp-model-enhanced.js"></script>
```

### Step 8: Update Your Main Application Code

**Add this to your existing JavaScript in `index.html`:**

```javascript
// Enhanced initialization function
async function initializeEnhancedModel() {
    try {
        window.log('🚀 Initializing Enhanced IBP Model...', 'info');
        showLoading(true);
        
        // Create enhanced model
        const enhancedModel = IBPModelFactoryEnhanced.createManufacturingModelEnhanced({
            horizonMonths: 18,
            numScenarios: 500
        });
        
        // Wait for worker initialization
        await enhancedModel.initialize();
        
        // Generate scenarios with progress tracking
        const progressTracker = window.progressManager.createTracker('initialization', {
            total: 100
        });
        
        progressTracker.onProgress = (progress) => {
            window.log(`📊 Initialization progress: ${progress.percentage.toFixed(1)}%`, 'info');
        };
        
        await enhancedModel.generateDemandScenariosAsync((progress) => {
            progressTracker.setProgress(progress.progress * 100);
            progressTracker.setMessage(`Generating scenarios: ${progress.completed}/${progress.total}`);
        });
        
        progressTracker.complete();
        window.progressManager.removeTracker('initialization');
        
        // Replace the global model
        window.ibpModel = enhancedModel;
        window.ibpTestSuite.ibpModel = enhancedModel;
        
        // Update status
        const statusElement = document.getElementById('modelStatus');
        if (statusElement) {
            const stats = enhancedModel.getPerformanceStats();
            statusElement.innerHTML = 
                '<p><span class="status-indicator status-success"></span>Enhanced Model initialized successfully</p>' +
                `<p><strong>Performance:</strong> Worker Support: ${stats.workerSupport ? 'Yes' : 'No'}</p>` +
                `<p><strong>Cache:</strong> Hit Rate: ${stats.cache.hitRate.toFixed(1)}%</p>` +
                '<p><strong>Features:</strong> Async Processing, Caching, Progress Tracking</p>';
        }
        
        window.log('✅ Enhanced model initialization completed', 'success');
        updateButtons(true);
        showLoading(false);
        
        // Create initial visualizations
        window.ibpTestSuite.createDemandChart();
        
    } catch (error) {
        window.log('❌ Error initializing enhanced model: ' + error.message, 'error');
        showLoading(false);
        
        // Fallback to original model
        window.log('🔄 Falling back to original model...', 'warning');
        initializeModel();
    }
}

// Enhanced test functions
async function runEnhancedBasicTest() {
    if (!window.ibpModel) {
        window.log('⚠️ Please initialize the model first', 'warning');
        return;
    }

    try {
        window.log('🔬 Running enhanced basic test...', 'info');
        showLoading(true);
        
        const solution = window.ibpModel.generateRandomSolution();
        
        // Use enhanced evaluation with progress
        const objectives = await window.ibpModel.evaluateObjectivesEnhanced(
            solution,
            (progress) => {
                window.log(`📊 Evaluation progress: ${progress.percentage.toFixed(1)}%`, 'info');
            }
        );
        
        // Update UI
        window.ibpTestSuite.updateObjectiveMetrics(objectives);
        window.ibpTestSuite.createObjectivesChart(objectives);
        window.ibpTestSuite.createSolutionChart(solution);
        
        // Show performance stats
        const stats = window.ibpModel.getPerformanceStats();
        window.log(`📈 Performance: Cache hit rate ${stats.cache.hitRate.toFixed(1)}%`, 'info');
        
        window.log('✅ Enhanced basic test completed', 'success');
        showLoading(false);
        
    } catch (error) {
        window.log('❌ Error in enhanced basic test: ' + error.message, 'error');
        showLoading(false);
    }
}
```

### Step 9: Update UI Controls

**Add new buttons to your controls section:**

```html
<div class="controls">
    <!-- Existing buttons -->
    <button class="btn btn-primary" onclick="initializeEnhancedModel()">🚀 Initialize Enhanced Model</button>
    <button class="btn btn-success" onclick="runEnhancedBasicTest()" id="enhancedTestBtn" disabled>⚡ Enhanced Test</button>
    <!-- Keep existing buttons for backward compatibility -->
</div>
```

## Testing Your Implementation

### Step 10: Test Each Component

1. **Test Web Worker:**
```javascript
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
```

2. **Test Cache Manager:**
```javascript
// In browser console:
const cache = new CacheManager();
cache.set('test', { data: 'test' });
console.log('Cached:', cache.get('test'));
console.log('Stats:', cache.getStats());
```

3. **Test Progress Manager:**
```javascript
// In browser console:
const tracker = window.progressManager.createTracker('test', { total: 100 });
tracker.onProgress = (progress) => console.log('Progress:', progress);
tracker.increment(25);
```

## Common Issues & Solutions

### Issue 1: Web Worker Not Loading
```javascript
// Check if file exists and path is correct
fetch('js/workers/monte-carlo-worker.js')
    .then(response => console.log('Worker file accessible:', response.ok))
    .catch(error => console.error('Worker file not found:', error));
```

### Issue 2: CORS Issues (if using file://)
- Use a local server: `python -m http.server 8080`
- Or use Live Server extension in VS Code

### Issue 3: Performance Not Improved
- Check browser DevTools → Performance tab
- Verify Web Workers are being used
- Check cache hit rates

## Next Steps After Phase 1

Once Phase 1 is working:
1. **Monitor Performance**: Use browser DevTools to verify improvements
2. **Test Thoroughly**: Run all existing tests to ensure compatibility
3. **Gather Metrics**: Check cache hit rates and worker usage
4. **Prepare for Phase 2**: Data persistence and PWA features

## Verification Checklist

- [ ] Web Workers are loading and executing
- [ ] Cache is working and showing hit rates
- [ ] Progress indicators appear during long operations
- [ ] Performance is improved (check DevTools)
- [ ] Original functionality still works
- [ ] No console errors
- [ ] UI remains responsive during heavy computations

Would you like me to create any specific files or help you with any particular step?