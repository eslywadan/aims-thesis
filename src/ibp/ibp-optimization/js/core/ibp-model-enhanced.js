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