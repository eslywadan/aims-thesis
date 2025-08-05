// ===================================================================
// IBP Data Integration Module
// File: js/data-loader.js
// ===================================================================

/**
 * Data Integration Module for IBP Optimization Model
 * Handles loading and processing of sample data and test scenarios
 */
class IBPDataLoader {
    constructor() {
        this.sampleData = null;
        this.testScenarios = null;
        this.isLoaded = false;
    }

    /**
     * Load all data files
     */
    async loadAllData() {
        try {
            console.log('🔄 Loading IBP data files...');
            
            const [sampleDataResponse, testScenariosResponse] = await Promise.all([
                fetch('./data/sample-demand.json'),
                fetch('./data/test-scenarios.json')
            ]);

            if (!sampleDataResponse.ok) {
                throw new Error(`Failed to load sample-demand.json: ${sampleDataResponse.status}`);
            }
            if (!testScenariosResponse.ok) {
                throw new Error(`Failed to load test-scenarios.json: ${testScenariosResponse.status}`);
            }

            this.sampleData = await sampleDataResponse.json();
            this.testScenarios = await testScenariosResponse.json();
            this.isLoaded = true;

            console.log('✅ IBP data files loaded successfully');
            console.log(`📊 Loaded ${this.sampleData.demand_forecast.base_forecast.length} months of demand data`);
            console.log(`🧪 Loaded ${this.testScenarios.test_scenarios.length} test scenarios`);

            return { sampleData: this.sampleData, testScenarios: this.testScenarios };
        } catch (error) {
            console.error('❌ Error loading data files:', error.message);
            throw error;
        }
    }

    /**
     * Apply sample demand data to IBP model
     */
    applySampleDemandData(ibpModel) {
        if (!this.isLoaded) {
            throw new Error('Data not loaded. Call loadAllData() first.');
        }

        const demandData = this.sampleData.demand_forecast;
        const uncertaintyData = this.sampleData.uncertainty_data;
        const supplyData = this.sampleData.supply_constraints;

        // Update demand forecast
        ibpModel.updateDemandForecast(
            demandData.base_forecast,
            demandData.base_forecast.map((demand, i) => demand * uncertaintyData.demand_volatility[i])
        );

        // Update supply constraints
        for (let i = 0; i < supplyData.capacity_limits.length; i++) {
            ibpModel.supply.capacity[i] = supplyData.capacity_limits[i];
            ibpModel.supply.costs[i] = supplyData.cost_structure.variable_costs[i];
            ibpModel.supply.leadTimes[i] = supplyData.lead_times.raw_materials[i] + 
                                          supplyData.lead_times.production[i] + 
                                          supplyData.lead_times.distribution[i];
        }

        // Update inventory parameters
        for (let i = 0; i < demandData.base_forecast.length; i++) {
            ibpModel.inventory.costs[i] = supplyData.cost_structure.holding_costs[i];
            ibpModel.inventory.safetyStock[i] = demandData.base_forecast[i] * 0.15; // 15% safety stock
            ibpModel.inventory.targets[i] = demandData.base_forecast[i] * 0.25; // 25% target stock
        }

        console.log('✅ Sample demand data applied to IBP model');
        return ibpModel;
    }
    /**
     * Get list of available test scenarios
     * @returns {Array} Array of scenario objects with id, name, and complexity
     */
    getAvailableScenarios() {
        if (!this.isLoaded || !this.testScenarios) {
            throw new Error('Data not loaded. Call loadAllData() first.');
        }
        return this.testScenarios.test_scenarios.map(scenario => ({
            id: scenario.id,
            name: scenario.name,
            complexity: scenario.complexity
        }));
    }
    /**
     * Run a scenario test by scenarioId and return results
     * @param {string} scenarioId
     * @param {object} testSuite - (optional) IBPTestSuite instance for evaluation and charting
     * @returns {Promise<object>} Result object with objectives, solution, validation, performance, scenario
     */
    async runScenarioTest(scenarioId, testSuite = null) {
        if (!this.isLoaded) {
            throw new Error('Data not loaded. Call loadAllData() first.');
        }

        // Create model with scenario
        const { model, scenario } = this.createModelWithScenario(scenarioId);

        // Generate and evaluate solution
        const solution = model.generateRandomSolution();
        const objectives = model.evaluateObjectives(solution);

        // Optionally validate results if scenario has expected_results
        let validation = { passed: true, details: [] };
        if (scenario.expected_results) {
            validation = this.validateScenarioResults(objectives, scenario.expected_results);
        }

        // Optionally calculate performance metrics
        const performance = {
            service_level: objectives.serviceLevel?.mean ?? 0,
            total_cost: objectives.cost?.mean ?? 0,
            inventory_turns: objectives.inventoryTurns?.mean ?? 0,
            sustainability: objectives.sustainability?.mean ?? 0
        };

        // Optionally update charts if testSuite is provided
        if (testSuite) {
            testSuite.updateObjectiveMetrics(objectives);
            testSuite.createObjectivesChart(objectives);
            testSuite.createSolutionChart(solution);
        }

        return {
            objectives,
            solution,
            validation,
            performance,
            scenario
        };
    }

    /**
     * Validate scenario results against expected results
     * @param {object} objectives
     * @param {object} expected
     * @returns {object} validation result
     */
    validateScenarioResults(objectives, expected) {
        const details = [];
        let passed = true;

        if (expected.service_level_min !== undefined) {
            const actual = objectives.serviceLevel?.mean ?? 0;
            const ok = actual >= expected.service_level_min;
            details.push({
                metric: 'Service Level',
                actual,
                expected: expected.service_level_min,
                status: ok ? 'PASS' : 'FAIL'
            });
            if (!ok) passed = false;
        }
        if (expected.cost_range) {
            const actual = objectives.cost?.mean ?? 0;
            const [min, max] = expected.cost_range;
            const ok = actual >= min && actual <= max;
            details.push({
                metric: 'Total Cost',
                actual,
                expected: `[${min}, ${max}]`,
                status: ok ? 'PASS' : 'FAIL'
            });
            if (!ok) passed = false;
        }
        // Add more checks as needed

        return { passed, details };
    }    
    /**
     * Create IBP model with specific test scenario
     */
    createModelWithScenario(scenarioId, baseConfig = {}) {
        if (!this.isLoaded) {
            throw new Error('Data not loaded. Call loadAllData() first.');
        }

        const scenario = this.testScenarios.test_scenarios.find(s => s.id === scenarioId);
        if (!scenario) {
            throw new Error(`Scenario ${scenarioId} not found`);
        }

        console.log(`🎯 Creating model with scenario: ${scenario.name}`);

        // Create model with scenario-specific configuration
        const modelConfig = {
            horizonMonths: scenario.duration_months,
            numScenarios: 500,
            ...baseConfig
        };

        const ibpModel = new IBPOptimizationModel(modelConfig);

        // Apply scenario parameters
        this.applyScenarioToModel(ibpModel, scenario);

        console.log(`✅ Model created with scenario: ${scenario.name} (${scenario.complexity})`);
        return { model: ibpModel, scenario: scenario };
    }

    /**
     * Apply specific scenario parameters to model
     */
    applyScenarioToModel(ibpModel, scenario) {
        const params = scenario.parameters;
        const demandPattern = scenario.demand_pattern;

        // Update demand forecast with scenario data
        const adjustedDemand = demandPattern.base_values.map((value, i) => 
            value * params.demand_multiplier * demandPattern.seasonal_adjustment[i]
        );
    }
}