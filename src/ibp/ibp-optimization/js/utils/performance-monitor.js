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

// ===================================================================
// FILE 2: js/core/ibp-model-enhanced.js
// REPLACE THE ENTIRE FILE WITH THIS CONTENT
// ===================================================================

class IBPOptimizationModelEnhanced extends IBPOptimizationModel {
    constructor(config = {}) {
        super(config);
        
        // Enhanced features with error handling
        this.cache = null;
        this.workerManager = null;
        this.performanceMonitor = null;
        this.isWorkerSupported = typeof Worker !== 'undefined';
        this.enhancedFeatures = {
            asyncScenarios: true,
            caching: true,
            progressTracking: true
        };
        
        // Initialize enhanced features with error handling
        this.initializeEnhancedComponents();
        this.log('🚀 Enhanced IBP Model created', 'info');
    }

    initializeEnhancedComponents() {
        try {
            // Initialize cache manager
            if (typeof CacheManager !== 'undefined') {
                this.cache = new CacheManager(200, 600000); // 10 minutes cache
                this.log('✅ Cache Manager initialized', 'info');
            } else {
                this.log('⚠️ CacheManager not available, caching disabled', 'warning');
                this.enhancedFeatures.caching = false;
            }

            // Initialize worker manager
            if (typeof WorkerManager !== 'undefined') {
                this.workerManager = new WorkerManager();
                this.log('✅ Worker Manager initialized', 'info');
            } else {
                this.log('⚠️ WorkerManager not available, using synchronous processing', 'warning');
                this.enhancedFeatures.asyncScenarios = false;
            }

            // Initialize performance monitor
            if (typeof PerformanceMonitor !== 'undefined') {
                this.performanceMonitor = new PerformanceMonitor();
                this.log('✅ Performance Monitor initialized', 'info');
            } else {
                this.log('⚠️ PerformanceMonitor not available, performance tracking disabled', 'warning');
                // Create a dummy performance monitor to prevent errors
                this.performanceMonitor = {
                    record: () => {},
                    startTimer: () => {},
                    endTimer: () => 0,
                    getStats: () => ({}),
                    reset: () => {}
                };
            }

        } catch (error) {
            this.log('❌ Error initializing enhanced components: ' + error.message, 'error');
            // Fallback to basic functionality
            this.enhancedFeatures = {
                asyncScenarios: false,
                caching: false,
                progressTracking: false
            };
        }
    }

    async initialize() {
        try {
            if (this.isWorkerSupported && this.workerManager) {
                const initialized = await this.workerManager.initialize();
                if (initialized) {
                    this.log('✅ Enhanced model with Web Workers ready', 'success');
                    return true;
                } else {
                    this.log('⚠️ Web Workers failed, using fallback mode', 'warning');
                }
            } else {
                this.log('⚠️ Web Workers not supported, using synchronous mode', 'warning');
            }
            return false;
        } catch (error) {
            this.log('❌ Error initializing enhanced model: ' + error.message, 'error');
            return false;
        }
    }

    // Enhanced demand scenario generation with Web Workers and progress
    async generateDemandScenariosAsync(onProgress = null) {
        let cacheKey = null;
        
        // Try to use cache if available
        if (this.cache) {
            cacheKey = this.createScenarioCacheKey();
            const cached = this.cache.get(cacheKey);
            if (cached) {
                this.log('📦 Using cached demand scenarios', 'info');
                if (onProgress) {
                    onProgress({ progress: 1.0, completed: cached.numScenarios, total: cached.numScenarios });
                }
                return cached;
            }
        }

        if (this.performanceMonitor) {
            this.performanceMonitor.startTimer('generateDemandScenarios');
        }
        
        this.log('⚡ Generating demand scenarios...', 'info');
        
        try {
            let scenarios;
            
            if (this.enhancedFeatures.asyncScenarios && 
                this.isWorkerSupported && 
                this.workerManager && 
                this.workerManager.workers.has('monte-carlo')) {
                
                // Use Web Worker for async generation
                scenarios = await this.workerManager.runMonteCarloSimulation({
                    numScenarios: this.config.numScenarios,
                    horizonMonths: this.config.horizonMonths,
                    forecast: Array.from(this.demand.forecast),
                    uncertainty: Array.from(this.demand.uncertainty)
                }, (progress) => {
                    if (onProgress) onProgress(progress);
                    this.log(`📊 Scenario generation: ${(progress.progress * 100).toFixed(1)}%`, 'info');
                });
                
                // Update internal scenarios array
                for (let i = 0; i < scenarios.scenarios.length; i++) {
                    this.demand.scenarios[i] = scenarios.scenarios[i];
                }
            } else {
                // Fallback to synchronous generation with simulated progress
                if (onProgress) {
                    onProgress({ progress: 0.0, completed: 0, total: this.config.numScenarios });
                }
                
                this.generateDemandScenarios();
                
                scenarios = {
                    scenarios: Array.from(this.demand.scenarios),
                    numScenarios: this.config.numScenarios,
                    horizonMonths: this.config.horizonMonths,
                    metadata: {
                        generatedAt: Date.now(),
                        method: 'synchronous'
                    }
                };
                
                if (onProgress) {
                    onProgress({ progress: 1.0, completed: this.config.numScenarios, total: this.config.numScenarios });
                }
            }

            const duration = this.performanceMonitor ? this.performanceMonitor.endTimer('generateDemandScenarios') : 0;
            this.log(`✅ Scenarios generated in ${duration.toFixed(2)}ms`, 'success');
            
            // Cache the result if available
            if (this.cache && cacheKey) {
                this.cache.set(cacheKey, scenarios);
            }
            
            return scenarios;
            
        } catch (error) {
            if (this.performanceMonitor) {
                this.performanceMonitor.endTimer('generateDemandScenarios');
            }
            this.log('❌ Error generating scenarios: ' + error.message, 'error');
            
            // Fallback to synchronous method
            this.generateDemandScenarios();
            return {
                scenarios: Array.from(this.demand.scenarios),
                numScenarios: this.config.numScenarios,
                horizonMonths: this.config.horizonMonths,
                metadata: { method: 'fallback' }
            };
        }
    }

    // Enhanced objective evaluation with progress tracking
    async evaluateObjectivesEnhanced(solution = null, onProgress = null) {
        if (this.performanceMonitor) {
            this.performanceMonitor.startTimer('evaluateObjectives');
        }
        
        if (solution) {
            this.updateDecisions(solution);
        }

        let cacheKey = null;
        if (this.cache) {
            cacheKey = this.createObjectiveCacheKey(solution);
            const cached = this.cache.get(cacheKey);
            if (cached) {
                this.log('📦 Using cached objective evaluation', 'info');
                if (onProgress) {
                    onProgress({ percentage: 100, message: 'Retrieved from cache' });
                }
                return cached;
            }
        }

        try {
            // Create progress tracker
            const progressSteps = 4; // 4 objectives
            let completed = 0;
            
            const updateProgress = (message) => {
                completed++;
                const percentage = (completed / progressSteps) * 100;
                if (onProgress) {
                    onProgress({ percentage, message, current: completed, total: progressSteps });
                }
            };

            // Evaluate objectives with progress updates
            this.log('📊 Evaluating objectives...', 'info');
            
            const costScenarios = this.evaluateCostObjective();
            updateProgress('Cost evaluation completed');