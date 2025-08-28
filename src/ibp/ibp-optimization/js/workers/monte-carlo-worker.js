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