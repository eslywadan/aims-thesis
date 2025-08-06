// =================================================================
// FILE 6: js/core/ibp-model-enhanced.js
// CREATE THIS SIXTH (Enhanced IBP Model)
// =================================================================

class IBPOptimizationModelEnhanced extends IBPOptimizationModel {
    constructor(config = {}) {
        super(config);
        
        // Enhanced features
        this.cache = new CacheManager(200, 600000); // 10 minutes cache
        this.workerManager = new WorkerManager();
        this.performanceMonitor = new PerformanceMonitor();
        this.isWorkerSupported = typeof Worker !== 'undefined';
        this.enhancedFeatures = {
            asyncScenarios: true,
            caching: true,
            progressTracking: true
        };
        
        this.log('🚀 Enhanced IBP Model created', 'info');
    }

    async initialize() {
        try {
            if (this.isWorkerSupported) {
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
        const cacheKey = this.createScenarioCacheKey();
        
        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached) {
            this.log('📦 Using cached demand scenarios', 'info');
            if (onProgress) {
                onProgress({ progress: 1.0, completed: cached.numScenarios, total: cached.numScenarios });
            }
            return cached;
        }

        this.performanceMonitor.startTimer('generateDemandScenarios');
        this.log('⚡ Generating demand scenarios...', 'info');
        
        try {
            let scenarios;
            
            if (this.isWorkerSupported && this.workerManager.workers.has('monte-carlo')) {
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

            const duration = this.performanceMonitor.endTimer('generateDemandScenarios');
            this.log(`✅ Scenarios generated in ${duration.toFixed(2)}ms`, 'success');
            
            // Cache the result
            this.cache.set(cacheKey, scenarios);
            
            return scenarios;
            
        } catch (error) {
            this.performanceMonitor.endTimer('generateDemandScenarios');
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
        this.performanceMonitor.startTimer('evaluateObjectives');
        
        if (solution) {
            this.updateDecisions(solution);
        }

        const cacheKey = this.createObjectiveCacheKey(solution);
        const cached = this.cache.get(cacheKey);
        if (cached) {
            this.log('📦 Using cached objective evaluation', 'info');
            if (onProgress) {
                onProgress({ percentage: 100, message: 'Retrieved from cache' });
            }
            return cached;
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
            
            const duration = this.performanceMonitor.endTimer('evaluateObjectives');
            this.log(`📊 Objectives evaluated in ${duration.toFixed(2)}ms`, 'success');
            
            // Cache result
            this.cache.set(cacheKey, robustObjectives);
            
            return robustObjectives;
            
        } catch (error) {
            this.performanceMonitor.endTimer('evaluateObjectives');
            this.log('❌ Error evaluating objectives: ' + error.message, 'error');
            
            // Fallback to synchronous evaluation
            return this.evaluateObjectives(solution);
        }
    }

    // Utility methods for enhanced model
    createScenarioCacheKey() {
        return this.cache.createKey(
            'scenarios',
            this.config.numScenarios,
            this.config.horizonMonths,
            Array.from(this.demand.forecast).join(','),
            Array.from(this.demand.uncertainty).join(',')
        );
    }

    createObjectiveCacheKey(solution) {
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
            cache: this.cache.getStats(),
            performance: this.performanceMonitor.getStats(),
            worker: this.workerManager.getStats(),
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
        this.cache.clear();
        this.performanceMonitor.reset();
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
