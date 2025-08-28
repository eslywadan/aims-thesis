# Research Plan: Master's Thesis on Hybrid Hierarchical Optimization for TFT-LCD Manufacturing

## 1. Scope for Thesis

### 1.1 Research Objective

**Scope**: Proof-of-concept implementation focusing on **one specific aspect** of the hierarchical framework with validation on simplified test cases

### 1.2 Problem Statement

**Core Question**: Can a hybrid hierarchical approach effectively coordinate between enterprise-level planning and site-level scheduling in a simplified TFT-LCD manufacturing scenario?

**Focused Sub-problems**:
1. Develop a working prototype of two-level coordination (top + middle)
2. Implement basic surrogate model for one resource type
3. Demonstrate feasibility on small-scale test cases

**Advanced Question**: The enterprise-level planning will condider the financial goals

## 2. Architecture

```
┌─────────────────────────────────────────┐
│   Top Level: Simplified Allocation      │
│   Method: GA or Simple MIP              │
│   Scope: 2-3 products, 2 sites          │
└────────────┬────────────────────────────┘
             │ 
             ▼
┌─────────────────────────────────────────┐
│   Middle Level: Site Scheduling         │
│   ┌───────────┐         ┌──────────┐    │
│   │ Site 1    │         │ Site 2   │    │
│   │(Front-end)│         │(Back-end)│    │
│   └───────────┘         └──────────┘    │
│   Method: CP-SAT (OR-Tools)             │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   Simplified Resource Model             │
│   One surrogate for critical resource   │
│   Method: Simple Neural Network         │
└─────────────────────────────────────────┘
```

## 3. Research Plan (4-6 months)

### 3.1 Phase 1: Foundation (Months 1-2)

#### **Literature Review (Month 1-2)**
Focus on:
- Hierarchical production planning (5-10 key papers)
- CP for scheduling (5-10 papers)
- Basic surrogate modeling (5-10 papers)

#### **Problem Formulation (Month 1-2)**
Simplified model:
```python
# Master's scope: 2 sites, 3 product types, 20-50 jobs
class SimplifiedTFTModel:
    def __init__(self):
        self.n_sites = 2  # Fixed
        self.n_products = 3  # TV, Monitor, Handheld
        self.n_jobs_max = 50  # Limited scale
        
    def define_top_level(self):
        # Simple allocation model
        # Decision: Which site produces which product
        pass
        
    def define_site_level(self):
        # Basic CP model for job shop
        # Focus on makespan minimization
        pass
```

### 3.2 Phase 2: Implementation (Months 1-2)

#### **Top Level Implementation**
```python
def simplified_top_level():
    """
    Use simple GA with small population
    Or basic MIP if problem is small enough
    """
    # 10-20 allocation strategies
    population_size = 20
    generations = 50
    
    # Simple fitness: makespan + transport cost
    return best_allocation
```

#### Middle Level Implementation**
```python
def site_scheduler_cp():
    """
    Focus on one scheduling approach
    Use OR-Tools CP-SAT solver
    """
    model = cp_model.CpModel()
    
    # Basic JSSP constraints
    # No complex features initially
    
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 60  # Time limit
    
    return schedule
```

#### Basic Surrogate Model**
```python
class SimpleResourceSurrogate:
    """
    Predict only one metric: completion time
    Based on historical data or simulation
    """
    def __init__(self):
        # Simple 3-layer neural network
        self.model = MLPRegressor(hidden_layer_sizes=(10, 10))
        
    def predict_completion_time(self, job_features):
        return self.model.predict(job_features)
```

### 3.3 Phase 3: Integration & Testing (Months 1-1.5)

#### **Simple Coordination Protocol**
```python
def basic_coordination(max_iterations=10):
    """
    Simple iterative coordination
    No complex convergence analysis
    """
    for i in range(max_iterations):
        # Top allocates products to sites
        allocation = top_level_allocate()
        
        # Each site schedules independently
        schedules = {}
        for site in [1, 2]:
            schedules[site] = cp_schedule(allocation[site])
        
        # Simple feedback: total makespan
        feedback = evaluate_schedules(schedules)
        
        # Update top level (basic gradient)
        if feedback_improved():
            break
            
    return allocation, schedules
```

#### **Test Cases (Scaled Down)**

| Test Case | Products | Sites | Jobs | Purpose |
|-----------|----------|-------|------|---------|
| Toy | 2 | 2 | 10 | Algorithm debugging |
| Small | 3 | 2 | 20 | Basic validation |
| Medium | 3 | 2 | 50 | Performance testing |

### 3.4 Phase 4: Validation & Writing (Months 1-1.5)

#### **Simplified Validation**
- Compare against:
  - Monolithic CP solver (if tractable)
  - Greedy heuristics
  - Random allocation baseline

- Metrics:
  - Solution quality (makespan)
  - Computation time
  - Number of iterations to convergence

#### **Case Study (Simplified)**
- Use public dataset or synthetic data
- Focus on one specific scenario (e.g., rush order handling)
- No need for full industrial validation

## 4. Adjusted Deliverables

### 4.1 Core Deliverables

1. **Working Prototype**
   - Python implementation (~2000-3000 lines)
   - Basic GUI or command-line interface
   - Docker container for reproducibility

2. **Master's Thesis** (60-80 pages)
   - Chapter 1: Introduction (5-8 pages)
   - Chapter 2: Literature Review (10-15 pages)
   - Chapter 3: Methodology (15-20 pages)
   - Chapter 4: Implementation (10-15 pages)
   - Chapter 5: Results (10-15 pages)
   - Chapter 6: Conclusion (5-8 pages)

3. **One Conference Paper** (optional but recommended)
   - Target: Local or regional conference
   - Focus: Preliminary results or methodology

### 4.2 Optional Extensions (if time permits)

Choose ONE:
- Add third site
- Implement second resource surrogate
- Add uncertainty handling (basic)
- Develop simple visualization dashboard

## 5. Simplified Evaluation Plan

### 5.1 Experimental Design

```python
experiments = {
    'baseline': {
        'method': 'sequential',  # Top then middle
        'coordination': False
    },
    'proposed': {
        'method': 'hierarchical',
        'coordination': True,
        'iterations': 10
    },
    'benchmark': {
        'method': 'monolithic_cp',  # If feasible
        'time_limit': 300
    }
}
```

### 5.2 Success Criteria

| Criterion | Target | Minimum Acceptable |
|-----------|--------|-------------------|
| Implementation completeness | 100% | 80% |
| Test case solved | 3 | 2 |
| Improvement over baseline | 20% | 10% |
| Computation time | <5 min | <10 min |
| Thesis pages | 70 | 60 |

## 6. Risk Management (Simplified)

| Risk | Probability | Mitigation |
|------|------------|------------|
| CP solver too slow | Medium | Pre-compute schedules, use time limits |
| Coordination doesn't converge | Low | Fix maximum iterations |
| Surrogate model inaccurate | Medium | Use simple linear model as fallback |
| Implementation bugs | High | Start with toy problems, unit testing |

## 7. Realistic Timeline

```
Month 1-2:  Literature review, problem definition
Month 1-2:  Detailed design, tool selection
Month 1-2:  Top-level implementation
Month 2-3:  Site-level CP implementation  
Month 2-3:  Basic surrogate model
Month 2-3:  Integration
Month 2-3:  Testing and debugging
Month 2-3:  Experiments and analysis
Month 4-5:  Thesis writing
Month 6:    Revision and defense preparation
```

## 9. Thesis Committee Expectations

### What to Demonstrate:
- **Feasibility**: The approach works on small problems
- **Understanding**: Clear grasp of hierarchical optimization
- **Implementation**: Working code with documentation
- **Analysis**: Basic performance comparison

### What NOT Expected:
- Theoretical proofs
- Industrial-scale problems
- Novel algorithms (using existing tools is fine)
- Perfect optimization (good enough is acceptable)
