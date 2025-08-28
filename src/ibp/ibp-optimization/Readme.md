# IBP Optimization Model - Professional Test Suite

A comprehensive **Integrated Business Planning (IBP)** optimization model with multi-objective evaluation under uncertainty, featuring professional test suite and sample data integration.

## 🏗️ Project Structure

```
ibp-optimization/
├── index.html                 # Main UI application
├── README.md                  # This documentation
├── js/
│   ├── ibp-model.js          # Core IBP optimization model
│   ├── test-suite.js         # Professional testing framework
│   └── data-loader.js        # Data integration module
├── data/
│   ├── sample-demand.json    # Sample demand forecast data
│   └── test-scenarios.json   # Comprehensive test scenarios
├── css/
│   └── styles.css           # Optional: External styling
└── docs/
    ├── api-reference.md     # API documentation
    └── user-guide.md        # Detailed user guide
```

## 🚀 Quick Start

### 1. Setup
```bash
# Clone or download the project
cd ibp-optimization

# Optional: Use a local server (recommended)
python -m http.server 8080
# OR
npm install -g live-server && live-server
```

### 2. Open Application
- Navigate to `http://localhost:8080` (or open `index.html` directly)
- Click **"🚀 Initialize Model"** to start

### 3. Load Sample Data
- Click **"📊 Load Sample Data"** to load realistic demand forecasts
- Select a scenario from the dropdown menu
- Click **"🎯 Run Scenario"** to test with specific conditions

## 📊 Sample Data Files

### `data/sample-demand.json`
Contains realistic manufacturing demand data including:

- **Base Forecast**: 18 months of demand projections (1000-1850 units)
- **Uncertainty Data**: Volatility and confidence intervals
- **Supply Constraints**: Capacity limits, lead times, cost structures
- **External Factors**: Economic indicators, promotional calendar
- **Risk Factors**: Demand and supply risk scenarios

**Key Features:**
- Seasonal demand patterns with 42% monthly growth
- 12-23% demand volatility 
- Multiple cost components (variable, fixed, holding)
- Promotional impacts (15-35% uplift)
- Economic indicators integration

### `data/test-scenarios.json`
Eight comprehensive test scenarios:

| Scenario | Complexity | Description |
|----------|------------|-------------|
| `scenario_001` | Basic | Stable demand baseline |
| `scenario_002` | Intermediate | High growth (8% monthly) |
| `scenario_003` | Intermediate | Strong seasonality (40%) |
| `scenario_004` | Advanced | Supply disruption (30% capacity loss) |
| `scenario_005` | Advanced | Volatile market (45% volatility) |
| `scenario_006` | Advanced | Economic downturn (-5% decline) |
| `scenario_007` | Advanced | New product launch |
| `scenario_008` | Stress Test | Perfect storm (multiple crises) |

## 🎯 Core Features

### Multi-Objective Optimization
- **Cost Minimization**: Production, procurement, inventory, shortage costs
- **Service Level Maximization**: Demand fulfillment optimization
- **Inventory Turns**: Working capital efficiency
- **Sustainability**: Resource utilization and waste reduction

### Uncertainty Handling
- **Monte Carlo Simulation**: 500+ demand scenarios
- **Robust Metrics**: Mean, std deviation, CVaR at 90% and 95%
- **Risk Analysis**: Worst-case and sensitivity analysis
- **Temporal Correlation**: Realistic demand patterns

### Professional Testing
- **Basic Tests**: Functionality validation
- **Advanced Tests**: Multi-solution analysis
- **Scenario Testing**: Predefined challenging conditions
- **Performance Benchmarking**: Speed and throughput metrics

## 🔧 Usage Examples

### Basic Usage
```javascript
// Initialize model
const ibpModel = IBPModelFactory.createManufacturingModel();

// Generate and evaluate solution
const solution = ibpModel.generateRandomSolution();
const objectives = ibpModel.evaluateObjectives(solution);

console.log('Service Level:', objectives.serviceLevel.mean);
console.log('Total Cost:', objectives.cost.mean);
```

### With Sample Data
```javascript
// Load and apply sample data
const dataLoader = new IBPDataLoader();
await dataLoader.loadAllData();

const ibpModel = IBPModelFactory.createManufacturingModel();
dataLoader.applySampleDemandData(ibpModel);

// Now model uses realistic demand patterns
const objectives = ibpModel.evaluateObjectives();
```

### Scenario Testing
```javascript
// Test specific scenario
const { model, scenario } = dataLoader.createModelWithScenario('scenario_004');
const result = await dataLoader.runScenarioTest('scenario_004');

console.log('Scenario:', result.scenario.name);
console.log('Validation:', result.validation.passed ? 'PASSED' : 'FAILED');
```

### Integration with Optimization Algorithms
```javascript
// For NSGA-III Multi-Objective Optimization
const population = [];
for (let i = 0; i < 100; i++) {
    const solution = ibpModel.generateRandomSolution();
    const objectives = ibpModel.evaluateObjectives(solution);
    
    population.push({
        solution: solution,
        fitness: [
            objectives.cost.mean,
            -objectives.serviceLevel.mean,  // Minimize negative
            -objectives.inventoryTurns.mean,
            -objectives.sustainability.mean
        ]
    });
}

// For Bayesian Optimization
const trainingData = dataLoader.generateTrainingData(1000);
// Use trainingData with Gaussian Process models

// For Deep Learning
const neuralNetData = trainingData.map(sample => ({
    input: sample.input,    // Decision variables + context
    output: sample.output   // Objective values
}));
```

## 📈 Performance Metrics

### Expected Performance (Manufacturing Model)
- **Evaluation Speed**: ~2-5ms per solution
- **Throughput**: 200-500 evaluations/second
- **Memory Usage**: ~150KB for 500 scenarios
- **Accuracy**: 85%+ forecast accuracy

### Validation Thresholds
| Complexity | Service Level | Cost Efficiency | Max Time |
|------------|---------------|-----------------|----------|
| Basic | 90%+ | 85%+ | 5s |
| Intermediate | 85%+ | 80%+ | 10s |
| Advanced | 75%+ | 70%+ | 20s |
| Stress Test | 60%+ | 60%+ | 30s |

## 🎛️ User Interface

### Main Controls
- **🚀 Initialize Model**: Create new IBP model instance
- **📊 Load Sample Data**: Apply realistic demand data
- **🎯 Run Scenario**: Test with predefined scenarios
- **🔬 Basic Test**: Simple functionality validation
- **⚡ Advanced Test**: Multi-solution analysis
- **📈 Scenario Analysis**: Comprehensive uncertainty study
- **🏃 Performance Test**: Speed benchmarking

### Keyboard Shortcuts
- `Ctrl+I`: Initialize Model
- `Ctrl+B`: Basic Test
- `Ctrl+A`: Advanced Test  
- `Ctrl+L`: Clear Results

### Visual Analytics
- **Objective Metrics**: Real-time performance indicators
- **Demand Charts**: Forecast with confidence intervals
- **Solution Analysis**: Production vs demand comparison
- **Performance Dashboard**: Speed and efficiency metrics

## 🔗 Integration Points

### Optimization Algorithms
The model provides clean integration points for:

- **Evolutionary Algorithms** (NSGA-II/III, MOGA)
- **Bayesian Optimization** (Gaussian Processes)
- **Deep Learning** (Neural Networks, Reinforcement Learning)
- **Metaheuristics** (Particle Swarm, Genetic Algorithms)
- **Mathematical Programming** (MILP, NLP solvers)

### External Systems
- **ERP Integration**: SAP, Oracle, Microsoft Dynamics
- **Demand Planning**: Blue Yonder, Oracle Demantra
- **Supply Chain**: Kinaxis, Anaplan, o9 Solutions
- **Analytics Platforms**: Tableau, Power BI, Qlik

## 🧪 Testing Framework

### Test Categories
1. **Unit Tests**: Individual component validation
2. **Integration Tests**: Module interaction verification
3. **Scenario Tests**: Real-world condition simulation
4. **Performance Tests**: Speed and memory benchmarking
5. **Stress Tests**: Extreme condition handling

### Running Tests
```bash
# All tests via UI
Open index.html → Run tests via buttons

# Programmatic testing
const testSuite = new IBPTestSuite();
await testSuite.runAllScenarios();

# Custom scenario
const result = await dataLoader.runScenarioTest('scenario_005');
```

## 📋 Data Schema

### Demand Data Structure
```json
{
  "demand_forecast": {
    "base_forecast": [1000, 1100, ...],
    "forecast_accuracy": [0.85, 0.87, ...],
    "seasonal_factors": [0.95, 1.02, ...]
  },
  "uncertainty_data": {
    "demand_volatility": [0.15, 0.14, ...],
    "confidence_intervals": { "lower_95": [...], "upper_95": [...] }
  }
}
```

### Scenario Structure
```json
{
  "id": "scenario_001",
  "name": "Stable Demand",
  "complexity": "basic",
  "parameters": {
    "demand_multiplier": 1.0,
    "demand_volatility": 0.10,
    "supply_reliability": 0.98
  },
  "expected_results": {
    "service_level_min": 0.92,
    "cost_range": [80000, 120000]
  }
}
```

## 🚨 Troubleshooting

### Common Issues

**1. "IBPModelFactory not found" Error**
```bash
# Ensure correct file loading order in HTML:
<script src="js/ibp-model.js"></script>     <!-- First -->
<script src="js/data-loader.js"></script>   <!-- Second -->
<script src="js/test-suite.js"></script>    <!-- Third -->
```

**2. Data Files Not Loading**
```bash
# Check file structure:
ibp-optimization/
├── index.html
└── data/
    ├── sample-demand.json
    └── test-scenarios.json

# Use local server (avoid CORS issues):
python -m http.server 8080
```

**3. Charts Not Displaying**
```bash
# Ensure Chart.js is loaded:
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
```

**4. Performance Issues**
```javascript
// Reduce scenario count for faster testing:
const ibpModel = new IBPOptimizationModel({
    numScenarios: 100  // Instead of 500
});
```

### Node.js Deprecation Warning
```bash
# The warning is from development server, not the IBP code
# Solutions:
npm install -g live-server && live-server    # Use modern server
python -m http.server 8080                   # Use Python server
node --no-deprecation server.js              # Suppress warnings
```

## 🔧 Configuration Options

### Model Configuration
```javascript
const config = {
    horizonMonths: 18,        // Planning horizon
    numScenarios: 500,        // Monte Carlo scenarios
    objectives: ['cost', 'serviceLevel', 'inventoryTurns', 'sustainability'],
    uncertaintyTypes: ['demand', 'supply', 'leadTime', 'cost'],
    industryType: 'manufacturing'  // or 'retail', 'distribution'
};

const ibpModel = new IBPOptimizationModel(config);
```

### Factory Presets
```javascript
// Manufacturing (18 months, 500 scenarios)
const mfgModel = IBPModelFactory.createManufacturingModel();

// Retail (12 months, 750 scenarios)  
const retailModel = IBPModelFactory.createRetailModel();

// Distribution (24 months, 400 scenarios)
const distModel = IBPModelFactory.createDistributionModel();
```

## 📊 Sample Data Details

### Demand Patterns
- **Seasonality**: 35% strength with peaks in months 6, 9, 12, 15, 18
- **Growth Trend**: 4.2% monthly average growth
- **Volatility**: 12-23% coefficient of variation
- **Promotions**: 6 major promotional events with 15-35% uplift

### Supply Constraints  
- **Capacity**: 1200-1650 units/month (growing with demand)
- **Lead Times**: 4-8 weeks total (materials + production + distribution)
- **Costs**: $45-55/unit variable, $5000-5900/month fixed
- **Reliability**: 98% baseline with scenario-specific disruptions

### Risk Scenarios
- **Economic Risks**: Downturn (15% prob, -25% impact), Market expansion (25% prob, +20%)
- **Supply Risks**: Disruption (8% prob, -30%), Material shortage (12% prob, -20%)
- **Operational**: Capacity expansion opportunities, technology disruptions

## 🎯 Use Cases

### 1. Academic Research
- **Multi-objective optimization** algorithm development
- **Uncertainty quantification** in supply chains
- **Robust optimization** under multiple scenarios
- **Performance benchmarking** of solution methods

### 2. Industry Applications
- **Demand planning** and forecasting validation
- **Supply chain optimization** with real constraints
- **Risk assessment** and contingency planning
- **Investment planning** for capacity expansion

### 3. Algorithm Development
- **Training data generation** for ML models
- **Benchmark problem** for optimization algorithms
- **Performance testing** of solution approaches
- **Integration testing** with external systems

## 🔮 Future Extensions

### Planned Features
- **Multi-echelon supply networks** (supplier → manufacturer → distributor → retailer)
- **Transportation optimization** with routing and scheduling
- **Capacity planning** with investment decisions
- **Sustainability metrics** with carbon footprint tracking
- **Real-time optimization** with streaming data integration

### Integration Roadmap
- **REST API** for external system integration
- **Database connectivity** (PostgreSQL, MongoDB)
- **Cloud deployment** (AWS, Azure, GCP)
- **Real-time dashboards** with WebSocket updates
- **Mobile app** for on-the-go monitoring

## 📚 References & Resources

### Academic Literature
- "Multi-Objective Optimization in Supply Chain Management" (2023)
- "Robust Optimization Under Uncertainty" - Ben-Tal & Nemirovski
- "Supply Chain Analytics" - Chopra & Meindl
- "Integrated Business Planning" - Oliver Wight methodology

### Technical Documentation
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [JavaScript Optimization Algorithms](https://github.com/optimization-js)
- [Monte Carlo Methods](https://en.wikipedia.org/wiki/Monte_Carlo_method)
- [Multi-Objective Optimization](https://en.wikipedia.org/wiki/Multi-objective_optimization)

### Industry Standards
- **SCOR Model**: Supply Chain Operations Reference
- **APICS**: Association for Supply Chain Management standards
- **IBF**: Institute of Business Forecasting best practices
- **ISM**: Institute for Supply Management guidelines

## 🤝 Contributing

### Development Setup
```bash
git clone <repository-url>
cd ibp-optimization
npm install  # if using Node.js dependencies

# Run tests
open index.html
# OR
live-server --port=8080
```

### Code Style
- **ES6+ JavaScript** with modern syntax
- **JSDoc comments** for all public methods
- **Error handling** with try-catch blocks
- **Performance optimization** with typed arrays
- **Modular design** with clear separation of concerns

### Testing Requirements
- All new features must include test scenarios
- Performance tests for optimization changes
- Validation against expected results
- Documentation updates for API changes

## 📄 License

MIT License - see LICENSE file for details.

## 📞 Support

- **Issues**: Create GitHub issues for bugs/features
- **Documentation**: Check docs/ folder for detailed guides
- **Performance**: Use performance test suite for optimization
- **Integration**: See integration examples in code comments

---

**Built with ❤️ for the supply chain optimization community**

*Last updated: Aug, 2025