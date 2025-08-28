// ===================================================================
// IBP Test Suite - Comprehensive Testing Framework
// File: js/test-suite.js
// ===================================================================

/**
 * IBP Test Suite - Professional testing framework for IBP optimization models
 * Requires: IBPOptimizationModel, IBPModelFactory from ibp-model.js
 * Requires: Chart.js for visualizations
 */

class IBPTestSuite {
    constructor() {
        this.ibpModel = null;
        this.charts = {};
        this.testResults = [];
        this.isRunning = false;
        
        // Initialize event listeners
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // DOM ready handler
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
        } else {
            this.onDOMReady();
        }
    }

    onDOMReady() {
        this.log('🚀 IBP Test Suite loaded successfully', 'success');
        this.log('📋 Project Structure: Organized and optimized', 'info');
        this.log('🎯 Ready for comprehensive testing', 'info');
        
        // Add keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Add helpful keyboard shortcut hints
        setTimeout(() => {
            this.log('💡 Keyboard shortcuts: Ctrl+I (Initialize), Ctrl+B (Basic), Ctrl+A (Advanced), Ctrl+L (Clear)', 'info');
        }, 2000);

        // Setup window resize handler for responsive charts
        window.addEventListener('resize', () => this.handleWindowResize());
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey || event.metaKey) {
                switch(event.key) {
                    case 'i':
                        event.preventDefault();
                        this.initializeModel();
                        break;
                    case 'b':
                        event.preventDefault();
                        if (!document.getElementById('basicTestBtn')?.disabled) {
                            this.runBasicTest();
                        }
                        break;
                    case 'a':
                        event.preventDefault();
                        if (!document.getElementById('advancedTestBtn')?.disabled) {
                            this.runAdvancedTest();
                        }
                        break;
                    case 'l':
                        event.preventDefault();
                        this.clearResults();
                        break;
                }
            }
        });
    }

    handleWindowResize() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }

    // ===================================================================
    // Utility Functions
    // ===================================================================

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logDiv = document.getElementById('testLog');
        
        if (logDiv) {
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            entry.innerHTML = `<span class="log-timestamp">[${timestamp}]</span> <span class="log-${type}">${message}</span>`;
            logDiv.appendChild(entry);
            logDiv.scrollTop = logDiv.scrollHeight;
        }
        
        // Also log to console for debugging
        console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
    }

    showLoading(show = true) {
        const loadingElement = document.getElementById('loading');
        const resultsElement = document.getElementById('results');
        
        if (loadingElement) loadingElement.style.display = show ? 'block' : 'none';
        if (resultsElement) resultsElement.style.display = show ? 'none' : 'grid';
    }

    updateButtons(enabled = true) {
        const buttons = ['basicTestBtn', 'advancedTestBtn', 'scenarioTestBtn', 'performanceTestBtn'];
        buttons.forEach(id => {
            const button = document.getElementById(id);
            if (button) button.disabled = !enabled;
        });
    }

    updatePerformanceMetrics(avgTime, throughput) {
        const avgTimeElement = document.getElementById('avgTime');
        const throughputElement = document.getElementById('throughput');
        const metricsElement = document.getElementById('performanceMetrics');
        
        if (avgTimeElement) avgTimeElement.textContent = avgTime.toFixed(2);
        if (throughputElement) throughputElement.textContent = throughput.toFixed(1);
        if (metricsElement) metricsElement.style.display = 'grid';
    }

    // ===================================================================
    // Core Test Functions
    // ===================================================================

    async initializeModel() {
        if (this.isRunning) {
            this.log('⚠️ Another operation is running, please wait...', 'warning');
            return;
        }

        try {
            this.isRunning = true;
            this.log('🚀 Initializing IBP Optimization Model...', 'info');
            this.showLoading(true);
            
            await this.delay(800);
            
            // Check if IBPModelFactory is available
            if (typeof IBPModelFactory === 'undefined') {
                throw new Error('IBPModelFactory not found. Please ensure ibp-model.js is loaded first.');
            }
            
            this.ibpModel = IBPModelFactory.createManufacturingModel({
                horizonMonths: 18,
                numScenarios: 500
            });
            
            // Set up event listeners
            this.ibpModel.on('demandUpdated', (data) => {
                this.log('📊 Demand forecast updated successfully', 'success');
            });
            
            this.ibpModel.on('optimizationComplete', (data) => {
                this.log('✅ Optimization completed', 'success');
            });
            
            // Update status
            const statusElement = document.getElementById('modelStatus');
            if (statusElement) {
                statusElement.innerHTML = 
                    '<p><span class="status-indicator status-success"></span>Model initialized and ready for testing</p>' +
                    '<p><strong>Configuration:</strong> Manufacturing Model</p>' +
                    '<p><strong>Horizon:</strong> 18 months | <strong>Scenarios:</strong> 500</p>' +
                    '<p><strong>Objectives:</strong> Cost, Service Level, Inventory Turns, Sustainability</p>';
            }
            
            this.log('✅ Model initialization completed successfully', 'success');
            this.updateButtons(true);
            this.showLoading(false);
            
            // Create initial visualizations
            this.createDemandChart();
            
        } catch (error) {
            this.log('❌ Error initializing model: ' + error.message, 'error');
            this.showLoading(false);
        } finally {
            this.isRunning = false;
        }
    }

    async runBasicTest() {
        if (!this.ibpModel) {
            this.log('⚠️ Please initialize the model first', 'warning');
            return;
        }

        if (this.isRunning) {
            this.log('⚠️ Another operation is running, please wait...', 'warning');
            return;
        }
        
        try {
            this.isRunning = true;
            this.log('🔬 Running basic functionality test...', 'info');
            this.showLoading(true);
            
            await this.delay(1200);
            
            // Generate and evaluate a solution
            const solution = this.ibpModel.generateRandomSolution();
            this.log('📋 Generated random solution', 'info');
            
            // Validate solution
            const validation = this.ibpModel.validateSolution(solution);
            if (validation.isValid) {
                this.log('✅ Solution validation passed', 'success');
            } else {
                this.log(`⚠️ Solution has ${validation.violations.length} constraint violations`, 'warning');
            }
            
            const objectives = this.ibpModel.evaluateObjectives(solution);
            this.log('📊 Evaluated objectives for solution', 'info');
            
            // Store test result
            this.testResults.push({
                test: 'basic',
                solution,
                objectives,
                validation,
                timestamp: new Date()
            });
            
            // Update UI
            this.updateObjectiveMetrics(objectives);
            this.createObjectivesChart(objectives);
            this.createSolutionChart(solution);
            
            this.log('✅ Basic test completed successfully', 'success');
            this.showLoading(false);
            
        } catch (error) {
            this.log('❌ Error in basic test: ' + error.message, 'error');
            this.showLoading(false);
        } finally {
            this.isRunning = false;
        }
    }

    async runAdvancedTest() {
        if (!this.ibpModel) {
            this.log('⚠️ Please initialize the model first', 'warning');
            return;
        }

        if (this.isRunning) {
            this.log('⚠️ Another operation is running, please wait...', 'warning');
            return;
        }
        
        try {
            this.isRunning = true;
            this.log('⚡ Starting advanced multi-solution analysis...', 'info');
            this.showLoading(true);
            
            const numSolutions = 20;
            const solutions = [];
            const allObjectives = [];
            
            for (let i = 0; i < numSolutions; i++) {
                await this.delay(100);
                
                const solution = this.ibpModel.generateRandomSolution();
                const objectives = this.ibpModel.evaluateObjectives(solution);
                
                solutions.push(solution);
                allObjectives.push(objectives);
                
                this.log(`📊 Evaluated solution ${i + 1}/${numSolutions}`, 'info');
            }
            
            // Multi-objective analysis
            const bestCost = allObjectives.reduce((best, current) => 
                current.cost.mean < best.cost.mean ? current : best);
            const bestService = allObjectives.reduce((best, current) => 
                current.serviceLevel.mean > best.serviceLevel.mean ? current : best);
            const bestTurns = allObjectives.reduce((best, current) => 
                current.inventoryTurns.mean > best.inventoryTurns.mean ? current : best);
            const bestSustainability = allObjectives.reduce((best, current) => 
                current.sustainability.mean > best.sustainability.mean ? current : best);
            
            this.log(`🏆 Best cost solution: ${bestCost.cost.mean.toFixed(0)}`, 'success');
            this.log(`🏆 Best service solution: ${(bestService.serviceLevel.mean * 100).toFixed(1)}%`, 'success');
            this.log(`🏆 Best turns solution: ${bestTurns.inventoryTurns.mean.toFixed(2)}`, 'success');
            this.log(`🏆 Best sustainability: ${(bestSustainability.sustainability.mean * 100).toFixed(1)}%`, 'success');
            
            // Weighted scoring for overall best solution
            const bestOverall = allObjectives.reduce((best, current) => {
                const currentScore = 
                    -current.cost.mean/100000 + 
                    current.serviceLevel.mean * 2 + 
                    current.inventoryTurns.mean/5 + 
                    current.sustainability.mean;
                const bestScore = 
                    -best.cost.mean/100000 + 
                    best.serviceLevel.mean * 2 + 
                    best.inventoryTurns.mean/5 + 
                    best.sustainability.mean;
                return currentScore > bestScore ? current : best;
            });
            
            // Store advanced test results
            this.testResults.push({
                test: 'advanced',
                solutions,
                objectives: allObjectives,
                bestSolutions: { bestCost, bestService, bestTurns, bestSustainability, bestOverall },
                timestamp: new Date()
            });
            
            this.updateObjectiveMetrics(bestOverall);
            this.createObjectivesChart(bestOverall);
            
            this.log('✅ Advanced test completed with comprehensive analysis', 'success');
            this.showLoading(false);
            
        } catch (error) {
            this.log('❌ Error in advanced test: ' + error.message, 'error');
            this.showLoading(false);
        } finally {
            this.isRunning = false;
        }
    }

    async runScenarioAnalysis() {
        if (!this.ibpModel) {
            this.log('⚠️ Please initialize the model first', 'warning');
            return;
        }

        if (this.isRunning) {
            this.log('⚠️ Another operation is running, please wait...', 'warning');
            return;
        }
        
        try {
            this.isRunning = true;
            this.log('📈 Starting comprehensive scenario analysis...', 'info');
            this.showLoading(true);
            
            await this.delay(1500);
            
            const solution = this.ibpModel.generateRandomSolution();
            const objectives = this.ibpModel.evaluateObjectives(solution);
            
            this.log('📊 Analyzing uncertainty across all scenarios...', 'info');
            
            // Detailed scenario statistics
            for (const [objName, objData] of Object.entries(objectives)) {
                const cvScore = (objData.stdDev / objData.mean) * 100;
                const robustnessScore = 100 - Math.min(100, cvScore);
                
                this.log(`📊 ${objName}:`, 'info');
                this.log(`   Mean: ${objData.mean.toFixed(2)} | Std: ${objData.stdDev.toFixed(2)}`, 'info');
                this.log(`   Range: [${objData.min.toFixed(2)}, ${objData.max.toFixed(2)}]`, 'info');
                this.log(`   CVaR 95%: ${objData.cvar95.toFixed(2)} | Robustness: ${robustnessScore.toFixed(1)}%`, 'info');
            }
            
            // Risk analysis
            const riskMetrics = {};
            for (const [objName, objData] of Object.entries(objectives)) {
                const scenarios = Array.from(objData.scenarios);
                const worstCase5 = scenarios.sort((a, b) => b - a).slice(0, Math.floor(scenarios.length * 0.05));
                const avgWorstCase = worstCase5.reduce((sum, val) => sum + val, 0) / worstCase5.length;
                
                riskMetrics[objName] = {
                    worstCase: objData.max,
                    avgWorstCase5Percent: avgWorstCase,
                    volatility: objData.stdDev / objData.mean
                };
            }
            
            this.log('⚠️ Risk Analysis Complete:', 'warning');
            this.log(`💰 Cost volatility: ${(riskMetrics.cost.volatility * 100).toFixed(1)}%`, 'warning');
            this.log(`📦 Service risk (worst 5%): ${(riskMetrics.serviceLevel.avgWorstCase5Percent * 100).toFixed(1)}%`, 'warning');
            
            this.updateObjectiveMetrics(objectives);
            this.createObjectivesChart(objectives);
            
            this.testResults.push({
                test: 'scenario',
                solution,
                objectives,
                riskMetrics,
                timestamp: new Date()
            });
            
            this.log('✅ Scenario analysis completed with risk assessment', 'success');
            this.showLoading(false);
            
        } catch (error) {
            this.log('❌ Error in scenario analysis: ' + error.message, 'error');
            this.showLoading(false);
        } finally {
            this.isRunning = false;
        }
    }

    async runPerformanceTest() {
        if (!this.ibpModel) {
            this.log('⚠️ Please initialize the model first', 'warning');
            return;
        }

        if (this.isRunning) {
            this.log('⚠️ Another operation is running, please wait...', 'warning');
            return;
        }
        
        try {
            this.isRunning = true;
            this.log('🏃 Starting performance benchmarking...', 'info');
            this.showLoading(true);
            
            const numTests = 100;
            const times = [];
            
            this.log(`⏱️ Running ${numTests} optimization evaluations...`, 'info');
            
            for (let i = 0; i < numTests; i++) {
                const startTime = performance.now();
                
                const solution = this.ibpModel.generateRandomSolution();
                this.ibpModel.evaluateObjectives(solution);
                
                const endTime = performance.now();
                times.push(endTime - startTime);
                
                if (i % 20 === 0) {
                    this.log(`📊 Completed ${i + 1}/${numTests} evaluations`, 'info');
                }
                
                // Small delay to prevent blocking
                if (i % 10 === 0) {
                    await this.delay(10);
                }
            }
            
            // Performance statistics
            const totalTime = times.reduce((sum, time) => sum + time, 0);
            const avgTime = totalTime / numTests;
            const minTime = Math.min(...times);
            const maxTime = Math.max(...times);
            const stdDev = Math.sqrt(times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / numTests);
            const throughput = 1000 / avgTime; // evaluations per second
            
            this.log('🏁 Performance Benchmarking Results:', 'success');
            this.log(`⚡ Average time: ${avgTime.toFixed(2)}ms`, 'success');
            this.log(`⚡ Min time: ${minTime.toFixed(2)}ms | Max time: ${maxTime.toFixed(2)}ms`, 'info');
            this.log(`⚡ Standard deviation: ${stdDev.toFixed(2)}ms`, 'info');
            this.log(`🚀 Throughput: ${throughput.toFixed(1)} evaluations/second`, 'success');
            
            // Memory usage estimate
            const memoryEstimate = (this.ibpModel.config.numScenarios * this.ibpModel.config.horizonMonths * 8) / 1024; // KB
            this.log(`💾 Estimated memory usage: ${memoryEstimate.toFixed(1)} KB`, 'info');
            
            this.updatePerformanceMetrics(avgTime, throughput);
            
            this.testResults.push({
                test: 'performance',
                numTests,
                avgTime,
                minTime,
                maxTime,
                stdDev,
                throughput,
                memoryEstimate,
                timestamp: new Date()
            });
            
            this.log('✅ Performance test completed successfully', 'success');
            this.showLoading(false);
            
        } catch (error) {
            this.log('❌ Error in performance test: ' + error.message, 'error');
            this.showLoading(false);
        } finally {
            this.isRunning = false;
        }
    }

    clearResults() {
        const logElement = document.getElementById('testLog');
        if (logElement) {
            logElement.innerHTML = 
                '<div class="log-entry"><span class="log-timestamp">[Cleared]</span> <span class="log-info">🧹 Log cleared - Ready for new tests</span></div>';
        }
        
        // Clear metrics
        ['costMetric', 'serviceMetric', 'turnsMetric', 'sustainabilityMetric'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = '-';
        });
        
        // Hide performance metrics
        const metricsElement = document.getElementById('performanceMetrics');
        if (metricsElement) metricsElement.style.display = 'none';
        
        // Clear charts
        Object.values(this.charts).forEach(chart => {
            try {
                chart.destroy();
            } catch (e) {
                console.warn('Error destroying chart:', e);
            }
        });
        this.charts = {};
        
        // Clear test results
        this.testResults = [];
        
        this.log('🧹 Results cleared successfully', 'info');
    }

    // ===================================================================
    // Chart Creation Functions
    // ===================================================================

    updateObjectiveMetrics(objectives) {
        if (!objectives) return;
        
        const updates = [
            { id: 'costMetric', value: objectives.cost ? `${objectives.cost.mean.toFixed(0)}` : '-' },
            { id: 'serviceMetric', value: objectives.serviceLevel ? `${(objectives.serviceLevel.mean * 100).toFixed(1)}%` : '-' },
            { id: 'turnsMetric', value: objectives.inventoryTurns ? objectives.inventoryTurns.mean.toFixed(1) : '-' },
            { id: 'sustainabilityMetric', value: objectives.sustainability ? `${(objectives.sustainability.mean * 100).toFixed(1)}%` : '-' }
        ];

        updates.forEach(({ id, value }) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    createObjectivesChart(objectives) {
        if (!objectives || typeof Chart === 'undefined') return;
        
        const ctx = document.getElementById('objectivesChart')?.getContext('2d');
        if (!ctx) return;
        
        if (this.charts.objectives) {
            this.charts.objectives.destroy();
        }
        
        const data = {
            labels: ['Cost (k$)', 'Service Level (%)', 'Inventory Turns', 'Sustainability (%)'],
            datasets: [{
                label: 'Mean Values',
                data: [
                    objectives.cost.mean / 1000,
                    objectives.serviceLevel.mean * 100,
                    objectives.inventoryTurns.mean,
                    objectives.sustainability.mean * 100
                ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 2
            }, {
                label: 'Uncertainty Bands (±1σ)',
                data: [
                    objectives.cost.stdDev / 1000,
                    objectives.serviceLevel.stdDev * 100,
                    objectives.inventoryTurns.stdDev,
                    objectives.sustainability.stdDev * 100
                ],
                backgroundColor: 'rgba(128, 128, 128, 0.3)',
                borderColor: 'rgba(128, 128, 128, 0.8)',
                borderWidth: 1,
                type: 'line'
            }]
        };
        
        this.charts.objectives = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Multi-Objective Performance with Uncertainty',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Normalized Performance Values'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    createDemandChart() {
        if (!this.ibpModel || typeof Chart === 'undefined') return;
        
        const ctx = document.getElementById('demandChart')?.getContext('2d');
        if (!ctx) return;
        
        if (this.charts.demand) {
            this.charts.demand.destroy();
        }
        
        const periods = Array.from({length: this.ibpModel.config.horizonMonths}, (_, i) => `M${i + 1}`);
        const forecastData = Array.from(this.ibpModel.demand.forecast);
        const uncertaintyData = Array.from(this.ibpModel.demand.uncertainty);
        
        this.charts.demand = new Chart(ctx, {
            type: 'line',
            data: {
                labels: periods,
                datasets: [{
                    label: 'Demand Forecast',
                    data: forecastData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                    pointBorderColor: 'rgba(255, 255, 255, 2)',
                    pointBorderWidth: 2
                }, {
                    label: 'Upper Bound (95%)',
                    data: forecastData.map((val, i) => val + 1.96 * uncertaintyData[i]),
                    borderColor: 'rgba(255, 99, 132, 0.6)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    fill: '+1',
                    tension: 0.4,
                    pointRadius: 0,
                    borderDash: [5, 5]
                }, {
                    label: 'Lower Bound (95%)',
                    data: forecastData.map((val, i) => Math.max(0, val - 1.96 * uncertaintyData[i])),
                    borderColor: 'rgba(255, 99, 132, 0.6)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    borderDash: [5, 5]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Demand Forecast with 95% Confidence Intervals',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Demand Units'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Planning Periods (Months)'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                animation: {
                    duration: 1200,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    createSolutionChart(solution) {
        if (!solution || !this.ibpModel || typeof Chart === 'undefined') return;
        
        const ctx = document.getElementById('solutionChart')?.getContext('2d');
        if (!ctx) return;
        
        if (this.charts.solution) {
            this.charts.solution.destroy();
        }
        
        const periods = Array.from({length: this.ibpModel.config.horizonMonths}, (_, i) => `M${i + 1}`);
        const productionData = Array.from(solution.production);
        const procurementData = Array.from(solution.procurement);
        const demandData = Array.from(this.ibpModel.demand.forecast);
        const capacityData = Array.from(this.ibpModel.supply.capacity);
        
        this.charts.solution = new Chart(ctx, {
            type: 'line',
            data: {
                labels: periods,
                datasets: [{
                    label: 'Production Plan',
                    data: productionData,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }, {
                    label: 'Procurement Plan',
                    data: procurementData,
                    borderColor: 'rgba(255, 205, 86, 1)',
                    backgroundColor: 'rgba(255, 205, 86, 0.1)',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }, {
                    label: 'Demand Forecast',
                    data: demandData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.05)',
                    fill: false,
                    tension: 0.4,
                    borderDash: [8, 4],
                    pointRadius: 3
                }, {
                    label: 'Capacity Limit',
                    data: capacityData,
                    borderColor: 'rgba(255, 99, 132, 0.8)',
                    backgroundColor: 'rgba(255, 99, 132, 0.05)',
                    fill: false,
                    tension: 0.2,
                    borderDash: [3, 3],
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Optimized Production & Procurement Solution',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Units'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Planning Periods (Months)'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    // ===================================================================
    // Utility Methods
    // ===================================================================

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ===================================================================
    // Public API for External Access
    // ===================================================================

    getTestResults() {
        return this.testResults;
    }

    getModel() {
        return this.ibpModel;
    }

    exportResults() {
        return {
            model: this.ibpModel ? this.ibpModel.exportState() : null,
            testResults: this.testResults,
            timestamp: new Date(),
            version: '1.0.0'
        };
    }

    // Integration methods for optimization algorithms
    generateTrainingData(numSamples = 1000) {
        if (!this.ibpModel) {
            throw new Error('Model not initialized');
        }

        const trainingData = [];
        this.log(`🔬 Generating ${numSamples} training samples...`, 'info');

        for (let i = 0; i < numSamples; i++) {
            const solution = this.ibpModel.generateRandomSolution();
            const objectives = this.ibpModel.evaluateObjectives(solution);
            
            trainingData.push({
                input: [
                    ...Array.from(solution.production),
                    ...Array.from(solution.procurement),
                    ...Array.from(solution.distribution),
                    ...Array.from(this.ibpModel.demand.forecast),
                    ...Array.from(this.ibpModel.supply.capacity)
                ],
                output: [
                    objectives.cost.mean,
                    objectives.serviceLevel.mean,
                    objectives.inventoryTurns.mean,
                    objectives.sustainability.mean
                ]
            });

            if (i % 100 === 0) {
                this.log(`📊 Generated ${i + 1}/${numSamples} samples`, 'info');
            }
        }

        this.log('✅ Training data generation completed', 'success');
        return trainingData;
    }

    generateParetoFront(numSolutions = 100) {
        if (!this.ibpModel) {
            throw new Error('Model not initialized');
        }

        const solutions = [];
        this.log(`🎯 Generating Pareto front with ${numSolutions} solutions...`, 'info');

        for (let i = 0; i < numSolutions; i++) {
            const solution = this.ibpModel.generateRandomSolution();
            const objectives = this.ibpModel.evaluateObjectives(solution);
            
            solutions.push({
                solution,
                fitness: [
                    objectives.cost.mean,
                    -objectives.serviceLevel.mean,  // Minimize negative service level
                    -objectives.inventoryTurns.mean,
                    -objectives.sustainability.mean
                ]
            });
        }

        // Simple Pareto front identification (non-dominated sorting)
        const paretoFront = solutions.filter(sol1 => {
            return !solutions.some(sol2 => {
                return sol2.fitness.every((f2, i) => f2 <= sol1.fitness[i]) &&
                       sol2.fitness.some((f2, i) => f2 < sol1.fitness[i]);
            });
        });

        this.log(`✅ Pareto front generated with ${paretoFront.length} non-dominated solutions`, 'success');
        return paretoFront;
    }
}

// Create global instance
const ibpTestSuite = new IBPTestSuite();

// Export for Node.js or expose globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { IBPTestSuite, ibpTestSuite };
} else if (typeof window !== 'undefined') {
    // Expose global functions for UI interaction
    window.IBPTestSuite = IBPTestSuite;
    window.ibpTestSuite = ibpTestSuite;
    window.log = (message, type) => ibpTestSuite.log(message, type);
    window.initializeModel = () => ibpTestSuite.initializeModel();
    window.runBasicTest = () => ibpTestSuite.runBasicTest();
    window.runAdvancedTest = () => ibpTestSuite.runAdvancedTest();
    window.runScenarioAnalysis = () => ibpTestSuite.runScenarioAnalysis();
    window.runPerformanceTest = () => ibpTestSuite.runPerformanceTest();
    window.clearResults = () => ibpTestSuite.clearResults();
    
    // Expose test results and model for external access
    window.testResults = ibpTestSuite.testResults;
    window.getIBPModel = () => ibpTestSuite.getModel();
}