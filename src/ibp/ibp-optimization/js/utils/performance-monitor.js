// ===================================================================
// FILE 1: js/utils/performance-monitor.js
// REPLACE THE EMPTY FILE WITH THIS CONTENT
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
// UPDATED VERSION WITH BETTER ERROR HANDLING
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
            await this.delay(10); // Prevent blocking
            
            const serviceLevelScenarios = this.evaluateServiceLevelObjective();
            updateProgress('Service level evaluation completed');
            await this.delay(10);
            
            const inventoryTurnsScenarios = this.evaluateInventoryTurnsObjective();
            updateProgress('Inventory turns evaluation completed');
            await this.delay(10);
            
            const sustainabilityScenarios = this.evaluateSustainabilityObjective();
            updateProgress('Sustainability evaluation completed');

            const objectives = {
                cost: costScenarios,
                serviceLevel: serviceLevelScenarios,
                inventoryTurns: inventoryTurnsScenarios,
                sustainability: sustainabilityScenarios
            };

            // Calculate robust metrics
            const robustObjectives = this.calculateRobustMetrics(objectives);
            
            const duration = this.performanceMonitor ? this.performanceMonitor.endTimer('evaluateObjectives') : 0;
            this.log(`📊 Objectives evaluated in ${duration.toFixed(2)}ms`, 'success');
            
            // Cache result if available
            if (this.cache && cacheKey) {
                this.cache.set(cacheKey, robustObjectives);
            }
            
            return robustObjectives;
            
        } catch (error) {
            if (this.performanceMonitor) {
                this.performanceMonitor.endTimer('evaluateObjectives');
            }
            this.log('❌ Error evaluating objectives: ' + error.message, 'error');
            
            // Fallback to synchronous evaluation
            return this.evaluateObjectives(solution);
        }
    }

    // Utility methods for enhanced model
    createScenarioCacheKey() {
        if (!this.cache) return null;
        
        return this.cache.createKey(
            'scenarios',
            this.config.numScenarios,
            this.config.horizonMonths,
            Array.from(this.demand.forecast).join(','),
            Array.from(this.demand.uncertainty).join(',')
        );
    }

    createObjectiveCacheKey(solution) {
        if (!this.cache) return null;
        
        const solutionData = solution ? [
            Array.from(solution.production || []).join(','),
            Array.from(solution.procurement || []).join(','),
            Array.from(solution.distribution || []).join(',')
        ].join('|') : 'current';
        
        return this.cache.createKey(
            'objectives',
            solutionData,
            Array.from(this.decisions.production).join(','),
            Array.from(this.decisions.procurement).join(',')
        );
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get comprehensive performance statistics
    getPerformanceStats() {
        return {
            cache: this.cache ? this.cache.getStats() : { hitRate: 0, size: 0, maxSize: 0 },
            performance: this.performanceMonitor ? this.performanceMonitor.getStats() : {},
            worker: this.workerManager ? this.workerManager.getStats() : { supported: false },
            features: this.enhancedFeatures,
            model: {
                horizonMonths: this.config.horizonMonths,
                numScenarios: this.config.numScenarios,
                objectives: this.config.objectives
            }
        };
    }

    // Cleanup resources
    cleanup() {
        if (this.workerManager) {
            this.workerManager.terminate();
        }
        if (this.cache) {
            this.cache.clear();
        }
        if (this.performanceMonitor) {
            this.performanceMonitor.reset();
        }
        this.log('🧹 Enhanced model cleanup completed', 'info');
    }
}

// Enhanced Factory
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
    
    static createRetailModelEnhanced(config = {}) {
        const retailConfig = {
            horizonMonths: 12,
            numScenarios: 750,
            objectives: ['cost', 'serviceLevel', 'inventoryTurns'],
            uncertaintyTypes: ['demand', 'leadTime', 'cost'],
            industryType: 'retail',
            ...config
        };
        
        return new IBPOptimizationModelEnhanced(retailConfig);
    }
}

// Export for browser use
if (typeof window !== 'undefined') {
    window.IBPOptimizationModelEnhanced = IBPOptimizationModelEnhanced;
    window.IBPModelFactoryEnhanced = IBPModelFactoryEnhanced;
}

// ===================================================================
// DIAGNOSTIC SCRIPT - Add this to your browser console to check dependencies
// ===================================================================

/*
// COPY AND PASTE THIS INTO BROWSER CONSOLE TO DIAGNOSE ISSUES:

console.log('=== IBP Enhanced Model Dependency Check ===');
console.log('CacheManager:', typeof CacheManager !== 'undefined' ? '✅ Available' : '❌ Missing');
console.log('ProgressManager:', typeof ProgressManager !== 'undefined' ? '✅ Available' : '❌ Missing');
console.log('WorkerManager:', typeof WorkerManager !== 'undefined' ? '✅ Available' : '❌ Missing');
console.log('PerformanceMonitor:', typeof PerformanceMonitor !== 'undefined' ? '✅ Available' : '❌ Missing');
console.log('IBPOptimizationModel:', typeof IBPOptimizationModel !== 'undefined' ? '✅ Available' : '❌ Missing');
console.log('IBPModelFactory:', typeof IBPModelFactory !== 'undefined' ? '✅ Available' : '❌ Missing');
console.log('IBPOptimizationModelEnhanced:', typeof IBPOptimizationModelEnhanced !== 'undefined' ? '✅ Available' : '❌ Missing');
console.log('IBPModelFactoryEnhanced:', typeof IBPModelFactoryEnhanced !== 'undefined' ? '✅ Available' : '❌ Missing');

// Test Web Worker support
console.log('Web Worker Support:', typeof Worker !== 'undefined' ? '✅ Supported' : '❌ Not Supported');

// Test if worker file exists
if (typeof Worker !== 'undefined') {
    fetch('js/workers/monte-carlo-worker.js')
        .then(response => console.log('Monte Carlo Worker File:', response.ok ? '✅ Accessible' : '❌ Not Found'))
        .catch(error => console.log('Monte Carlo Worker File: ❌ Error:', error.message));
}

console.log('=== End Dependency Check ===');
*/