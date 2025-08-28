// ===================================================================
// IBP Core Optimization Models - High-Performance JavaScript Implementation
// File: js/ibp-model.js
// ===================================================================

/**
 * Base class for IBP optimization models with uncertainty handling
 */
class IBPOptimizationModel {
    constructor(config = {}) {
        this.config = {
            horizonMonths: 18,
            numScenarios: 500,
            objectives: ['cost', 'serviceLevel', 'inventoryTurns', 'sustainability'],
            uncertaintyTypes: ['demand', 'supply', 'leadTime', 'cost'],
            ...config
        };
        
        this.initializeDataStructures();
        this.eventListeners = new Map();
        this.isOptimizing = false;
        this.currentSolution = null;
        
        this.log('IBP Model initialized with advanced configuration', 'success');
    }

    initializeDataStructures() {
        const { horizonMonths, numScenarios } = this.config;
        
        // Core IBP data structures using typed arrays for performance
        this.demand = {
            historical: new Float64Array(horizonMonths * 12),
            forecast: new Float64Array(horizonMonths),
            scenarios: new Float64Array(numScenarios * horizonMonths),
            uncertainty: new Float64Array(horizonMonths)
        };
        
        this.supply = {
            capacity: new Float64Array(horizonMonths),
            utilization: new Float64Array(horizonMonths),
            leadTimes: new Float64Array(horizonMonths),
            costs: new Float64Array(horizonMonths)
        };
        
        this.inventory = {
            levels: new Float64Array(horizonMonths),
            safetyStock: new Float64Array(horizonMonths),
            targets: new Float64Array(horizonMonths),
            costs: new Float64Array(horizonMonths)
        };
        
        // Decision variables (to be optimized)
        this.decisions = {
            production: new Float64Array(horizonMonths),
            procurement: new Float64Array(horizonMonths),
            distribution: new Float64Array(horizonMonths)
        };
        
        this.objectives = {};
        this.initializeSampleData();
    }

    initializeSampleData() {
        const { horizonMonths } = this.config;
        
        for (let i = 0; i < horizonMonths; i++) {
            // Seasonal demand pattern with trend
            this.demand.forecast[i] = 1000 + 200 * Math.sin(2 * Math.PI * i / 12) + 50 * i + Math.random() * 100;
            this.demand.uncertainty[i] = this.demand.forecast[i] * (0.12 + Math.random() * 0.08);
            
            // Supply capacity with constraints
            this.supply.capacity[i] = Math.max(800, this.demand.forecast[i] * (1.1 + Math.random() * 0.3));
            this.supply.costs[i] = 45 + 10 * Math.random() + 5 * Math.sin(2 * Math.PI * i / 12);
            this.supply.leadTimes[i] = 2 + Math.random() * 3;
            
            // Inventory parameters
            this.inventory.levels[i] = 150 + Math.random() * 200;
            this.inventory.costs[i] = 4 + Math.random() * 3;
            this.inventory.safetyStock[i] = this.demand.forecast[i] * 0.15;
            this.inventory.targets[i] = this.demand.forecast[i] * 0.25;
        }
        
        this.generateDemandScenarios();
    }

    /**
     * Update demand forecast with uncertainty quantification
     */
    updateDemandForecast(forecastData, uncertaintyData = null) {
        if (forecastData.length !== this.config.horizonMonths) {
            throw new Error(`Forecast data must have ${this.config.horizonMonths} periods`);
        }
        
        // Update base forecast
        for (let i = 0; i < forecastData.length; i++) {
            this.demand.forecast[i] = forecastData[i];
        }
        
        // Update uncertainty if provided
        if (uncertaintyData) {
            for (let i = 0; i < uncertaintyData.length; i++) {
                this.demand.uncertainty[i] = uncertaintyData[i];
            }
        }
        
        // Regenerate scenarios
        this.generateDemandScenarios();
        
        // Emit update event
        this.emit('demandUpdated', {
            forecast: Array.from(this.demand.forecast),
            uncertainty: Array.from(this.demand.uncertainty)
        });
    }

    /**
     * Generate demand scenarios for uncertainty analysis using Monte Carlo simulation
     */
    generateDemandScenarios() {
        const { numScenarios, horizonMonths } = this.config;
        
        for (let scenario = 0; scenario < numScenarios; scenario++) {
            for (let period = 0; period < horizonMonths; period++) {
                const baseIndex = scenario * horizonMonths + period;
                const mean = this.demand.forecast[period];
                const stdDev = this.demand.uncertainty[period];
                
                // Advanced scenario generation with temporal correlation
                const u1 = Math.random();
                const u2 = Math.random();
                const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
                
                // Add temporal correlation for realistic scenarios
                const correlation = period > 0 ? 0.3 : 0;
                const prevScenario = period > 0 ? this.demand.scenarios[baseIndex - 1] : mean;
                const correlatedMean = mean + correlation * (prevScenario - mean);
                
                this.demand.scenarios[baseIndex] = Math.max(0, correlatedMean + stdDev * z);
            }
        }
    }

    /**
     * Generate random feasible solution
     */
    generateRandomSolution() {
        const { horizonMonths } = this.config;
        const solution = {
            production: new Float64Array(horizonMonths),
            procurement: new Float64Array(horizonMonths),
            distribution: new Float64Array(horizonMonths)
        };
        
        for (let i = 0; i < horizonMonths; i++) {
            // Smart random generation based on constraints
            const demandForecast = this.demand.forecast[i];
            const maxCapacity = this.supply.capacity[i];
            
            solution.production[i] = Math.min(maxCapacity, demandForecast * (0.7 + Math.random() * 0.6));
            solution.procurement[i] = demandForecast * (0.1 + Math.random() * 0.3);
            solution.distribution[i] = solution.production[i] * (0.85 + Math.random() * 0.15);
        }
        
        return solution;
    }

    /**
     * Multi-objective evaluation under uncertainty
     */
    evaluateObjectives(solution = null) {
        if (solution) {
            this.updateDecisions(solution);
        }
        
        // Evaluate each objective across all scenarios
        const objectives = {
            cost: this.evaluateCostObjective(),
            serviceLevel: this.evaluateServiceLevelObjective(),
            inventoryTurns: this.evaluateInventoryTurnsObjective(),
            sustainability: this.evaluateSustainabilityObjective()
        };
        
        // Calculate robust metrics (mean, std, CVaR)
        const robustObjectives = this.calculateRobustMetrics(objectives);
        
        this.objectives = robustObjectives;
        return robustObjectives;
    }

    /**
     * Cost objective evaluation across scenarios
     */
    evaluateCostObjective() {
        const { numScenarios, horizonMonths } = this.config;
        const scenarioCosts = new Float64Array(numScenarios);
        
        for (let scenario = 0; scenario < numScenarios; scenario++) {
            let totalCost = 0;
            let currentInventory = this.inventory.levels[0];
            
            for (let period = 0; period < horizonMonths; period++) {
                const demandIndex = scenario * horizonMonths + period;
                const scenarioDemand = this.demand.scenarios[demandIndex];
                
                // Production cost
                const productionCost = this.decisions.production[period] * this.supply.costs[period];
                
                // Procurement cost
                const procurementCost = this.decisions.procurement[period] * this.supply.costs[period] * 0.9;
                
                // Update inventory
                currentInventory = currentInventory + this.decisions.production[period] + this.decisions.procurement[period] - scenarioDemand;
                
                // Inventory holding cost
                const holdingCost = Math.max(0, currentInventory) * this.inventory.costs[period] * 0.02;
                
                // Shortage cost
                const shortageCost = Math.max(0, -currentInventory) * this.supply.costs[period] * 8;
                
                // Safety stock violation penalty
                const safetyViolation = Math.max(0, this.inventory.safetyStock[period] - currentInventory) * this.supply.costs[period] * 2;
                
                totalCost += productionCost + procurementCost + holdingCost + shortageCost + safetyViolation;
                
                // Ensure non-negative inventory for next period
                currentInventory = Math.max(0, currentInventory);
            }
            
            scenarioCosts[scenario] = totalCost;
        }
        
        return scenarioCosts;
    }

    /**
     * Service level objective evaluation
     */
    evaluateServiceLevelObjective() {
        const { numScenarios, horizonMonths } = this.config;
        const scenarioServiceLevels = new Float64Array(numScenarios);
        
        for (let scenario = 0; scenario < numScenarios; scenario++) {
            let totalDemand = 0;
            let metDemand = 0;
            let currentInventory = this.inventory.levels[0];
            
            for (let period = 0; period < horizonMonths; period++) {
                const demandIndex = scenario * horizonMonths + period;
                const scenarioDemand = this.demand.scenarios[demandIndex];
                
                // Available supply
                const availableSupply = currentInventory + this.decisions.production[period] + this.decisions.procurement[period];
                
                // Met demand calculation
                const actualMetDemand = Math.min(scenarioDemand, Math.max(0, availableSupply));
                
                totalDemand += scenarioDemand;
                metDemand += actualMetDemand;
                
                // Update inventory for next period
                currentInventory = Math.max(0, availableSupply - scenarioDemand);
            }
            
            scenarioServiceLevels[scenario] = totalDemand > 0 ? metDemand / totalDemand : 1.0;
        }
        
        return scenarioServiceLevels;
    }

    /**
     * Inventory turns objective evaluation
     */
    evaluateInventoryTurnsObjective() {
        const { numScenarios, horizonMonths } = this.config;
        const scenarioTurns = new Float64Array(numScenarios);
        
        for (let scenario = 0; scenario < numScenarios; scenario++) {
            let totalSales = 0;
            let totalInventory = 0;
            let currentInventory = this.inventory.levels[0];
            
            for (let period = 0; period < horizonMonths; period++) {
                const demandIndex = scenario * horizonMonths + period;
                const scenarioDemand = this.demand.scenarios[demandIndex];
                
                const availableSupply = currentInventory + this.decisions.production[period] + this.decisions.procurement[period];
                const sales = Math.min(scenarioDemand, Math.max(0, availableSupply));
                
                totalSales += sales;
                totalInventory += currentInventory;
                
                currentInventory = Math.max(0, availableSupply - scenarioDemand);
            }
            
            const avgInventory = totalInventory / horizonMonths;
            scenarioTurns[scenario] = avgInventory > 0 ? (totalSales / avgInventory) * (12 / horizonMonths) : 0;
        }
        
        return scenarioTurns;
    }

    /**
     * Sustainability objective evaluation
     */
    evaluateSustainabilityObjective() {
        const { numScenarios, horizonMonths } = this.config;
        const scenarioSustainability = new Float64Array(numScenarios);
        
        for (let scenario = 0; scenario < numScenarios; scenario++) {
            let sustainabilityScore = 0;
            
            for (let period = 0; period < horizonMonths; period++) {
                // Efficiency score (capacity utilization)
                const efficiency = this.decisions.production[period] / this.supply.capacity[period];
                const efficiencyScore = Math.min(1.0, efficiency) * 0.4;
                
                // Waste reduction score (minimal overproduction)
                const demandIndex = scenario * horizonMonths + period;
                const scenarioDemand = this.demand.scenarios[demandIndex];
                const totalSupply = this.decisions.production[period] + this.decisions.procurement[period];
                const wasteRatio = Math.max(0, (totalSupply - scenarioDemand) / scenarioDemand);
                const wasteScore = Math.max(0, 1.0 - wasteRatio) * 0.35;
                
                // Supply chain responsiveness
                const responsivenessScore = 0.25; // Simplified metric
                
                sustainabilityScore += efficiencyScore + wasteScore + responsivenessScore;
            }
            
            scenarioSustainability[scenario] = sustainabilityScore / horizonMonths;
        }
        
        return scenarioSustainability;
    }

    /**
     * Calculate robust metrics from scenario-based evaluations
     */
    calculateRobustMetrics(objectiveScenarios) {
        const robustMetrics = {};
        
        for (const [objName, scenarios] of Object.entries(objectiveScenarios)) {
            const sorted = Array.from(scenarios).sort((a, b) => a - b);
            const n = sorted.length;
            
            // Calculate statistics
            const mean = sorted.reduce((sum, val) => sum + val, 0) / n;
            const variance = sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
            const stdDev = Math.sqrt(variance);
            
            // Risk metrics
            const cvar95Index = Math.floor(0.95 * n);
            const cvar95 = sorted.slice(cvar95Index).reduce((sum, val) => sum + val, 0) / (n - cvar95Index);
            
            const cvar90Index = Math.floor(0.90 * n);
            const cvar90 = sorted.slice(cvar90Index).reduce((sum, val) => sum + val, 0) / (n - cvar90Index);
            
            robustMetrics[objName] = {
                mean,
                stdDev,
                min: sorted[0],
                max: sorted[n - 1],
                median: sorted[Math.floor(n / 2)],
                q25: sorted[Math.floor(n * 0.25)],
                q75: sorted[Math.floor(n * 0.75)],
                cvar90,
                cvar95,
                scenarios: scenarios
            };
        }
        
        return robustMetrics;
    }

    /**
     * Update decision variables
     */
    updateDecisions(decisions) {
        const { horizonMonths } = this.config;
        
        ['production', 'procurement', 'distribution'].forEach(decisionType => {
            if (decisions[decisionType] && decisions[decisionType].length === horizonMonths) {
                for (let i = 0; i < horizonMonths; i++) {
                    this.decisions[decisionType][i] = decisions[decisionType][i];
                }
            }
        });
    }

    /**
     * Validate solution feasibility
     */
    validateSolution(solution) {
        const { horizonMonths } = this.config;
        const violations = [];
        
        for (let i = 0; i < horizonMonths; i++) {
            // Capacity constraints
            if (solution.production[i] > this.supply.capacity[i]) {
                violations.push({
                    type: 'capacity_violation',
                    period: i,
                    value: solution.production[i],
                    limit: this.supply.capacity[i]
                });
            }
            
            // Non-negativity constraints
            ['production', 'procurement', 'distribution'].forEach(var_name => {
                if (solution[var_name][i] < 0) {
                    violations.push({
                        type: 'non_negativity',
                        period: i,
                        variable: var_name,
                        value: solution[var_name][i]
                    });
                }
            });
        }
        
        return {
            isValid: violations.length === 0,
            violations,
            score: Math.max(0, 1 - violations.length / (horizonMonths * 3))
        };
    }

    /**
     * Event system for real-time updates
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    log(message, type = 'info') {
        if (typeof window !== 'undefined' && window.log) {
            window.log(message, type);
        }
    }

    /**
     * Export current state for analysis
     */
    exportState() {
        return {
            config: this.config,
            demand: {
                forecast: Array.from(this.demand.forecast),
                uncertainty: Array.from(this.demand.uncertainty)
            },
            supply: {
                capacity: Array.from(this.supply.capacity),
                costs: Array.from(this.supply.costs),
                leadTimes: Array.from(this.supply.leadTimes)
            },
            inventory: {
                levels: Array.from(this.inventory.levels),
                targets: Array.from(this.inventory.targets),
                safetyStock: Array.from(this.inventory.safetyStock)
            },
            decisions: {
                production: Array.from(this.decisions.production),
                procurement: Array.from(this.decisions.procurement),
                distribution: Array.from(this.decisions.distribution)
            },
            objectives: this.objectives
        };
    }

    /**
     * Import state from external source
     */
    importState(state) {
        // Update configuration
        this.config = { ...this.config, ...state.config };
        
        // Update data structures
        if (state.demand) {
            if (state.demand.forecast) {
                for (let i = 0; i < state.demand.forecast.length; i++) {
                    this.demand.forecast[i] = state.demand.forecast[i];
                }
            }
            if (state.demand.uncertainty) {
                for (let i = 0; i < state.demand.uncertainty.length; i++) {
                    this.demand.uncertainty[i] = state.demand.uncertainty[i];
                }
            }
        }
        
        // Regenerate scenarios with new data
        this.generateDemandScenarios();
        
        // Emit state update event
        this.emit('stateImported', this.exportState());
    }
}

/**
 * Factory function to create IBP optimization model with predefined configurations
 */
class IBPModelFactory {
    static createManufacturingModel(config = {}) {
        const manufacturingConfig = {
            horizonMonths: 18,
            numScenarios: 500,
            objectives: ['cost', 'serviceLevel', 'inventoryTurns', 'sustainability'],
            uncertaintyTypes: ['demand', 'supply', 'leadTime'],
            industryType: 'manufacturing',
            ...config
        };
        
        return new IBPOptimizationModel(manufacturingConfig);
    }
    
    static createRetailModel(config = {}) {
        const retailConfig = {
            horizonMonths: 12,
            numScenarios: 750,
            objectives: ['cost', 'serviceLevel', 'inventoryTurns'],
            uncertaintyTypes: ['demand', 'leadTime', 'cost'],
            industryType: 'retail',
            ...config
        };
        
        return new IBPOptimizationModel(retailConfig);
    }
    
    static createDistributionModel(config = {}) {
        const distributionConfig = {
            horizonMonths: 24,
            numScenarios: 400,
            objectives: ['cost', 'serviceLevel', 'sustainability'],
            uncertaintyTypes: ['demand', 'supply', 'transportation'],
            industryType: 'distribution',
            ...config
        };
        
        return new IBPOptimizationModel(distributionConfig);
    }
}

// Export for Node.js or browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { IBPOptimizationModel, IBPModelFactory };
} else if (typeof window !== 'undefined') {
    window.IBPOptimizationModel = IBPOptimizationModel;
    window.IBPModelFactory = IBPModelFactory;
}

// ===================================================================
// Usage Examples and Integration Points
// ===================================================================

/*
// Basic Usage Example:
const ibpModel = IBPModelFactory.createManufacturingModel({
    horizonMonths: 18,
    numScenarios: 1000
});

// Set up event listeners
ibpModel.on('demandUpdated', (data) => {
    console.log('Demand forecast updated:', data);
});

// Update with real data
const demandForecast = [1000, 1100, 1200, 1150, 1300, 1250, 1400, 1350, 1500, 1450, 1600, 1550, 1700, 1650, 1800, 1750, 1900, 1850];
const demandUncertainty = demandForecast.map(d => d * 0.15);

ibpModel.updateDemandForecast(demandForecast, demandUncertainty);

// Generate and evaluate solutions
const solution = ibpModel.generateRandomSolution();
const validation = ibpModel.validateSolution(solution);

if (validation.isValid) {
    const objectives = ibpModel.evaluateObjectives(solution);
    console.log('Objective values:', objectives);
} else {
    console.log('Solution violations:', validation.violations);
}

// Integration with optimization algorithms:

// For NSGA-III (Evolutionary Multi-Objective)
const population = [];
for (let i = 0; i < 100; i++) {
    const solution = ibpModel.generateRandomSolution();
    const objectives = ibpModel.evaluateObjectives(solution);
    population.push({ 
        solution, 
        fitness: [
            objectives.cost.mean,
            -objectives.serviceLevel.mean,  // Minimize negative service level
            -objectives.inventoryTurns.mean,
            -objectives.sustainability.mean
        ]
    });
}

// For Bayesian Optimization
const observedSolutions = [];
const observedObjectives = [];
for (let i = 0; i < 50; i++) {
    const solution = ibpModel.generateRandomSolution();
    const objectives = ibpModel.evaluateObjectives(solution);
    
    observedSolutions.push(Object.values(solution).flat());
    observedObjectives.push([
        objectives.cost.mean,
        objectives.serviceLevel.mean,
        objectives.inventoryTurns.mean,
        objectives.sustainability.mean
    ]);
}

// For Deep Learning / Neural Network Training
const trainingData = [];
for (let i = 0; i < 10000; i++) {
    const solution = ibpModel.generateRandomSolution();
    const objectives = ibpModel.evaluateObjectives(solution);
    
    trainingData.push({
        input: [
            ...Array.from(solution.production),
            ...Array.from(solution.procurement),
            ...Array.from(solution.distribution),
            ...Array.from(ibpModel.demand.forecast),
            ...Array.from(ibpModel.supply.capacity)
        ],
        output: [
            objectives.cost.mean,
            objectives.serviceLevel.mean,
            objectives.inventoryTurns.mean,
            objectives.sustainability.mean
        ]
    });
}
*/