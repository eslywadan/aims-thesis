# PyJobShop Solving scheduling problems with constraint programming in Python

- [2502.13483v1](../texts/2502.13483v1.pdf)


# Key differences between PyJobShop and the underlying solvers

After reading the PyJobShop paper, here are the key differences between PyJobShop and the underlying solvers (Google OR-Tools and IBM CP Optimizer):

## **PyJobShop vs. The Underlying Solvers**

### **1. Abstraction Level**
**PyJobShop**: 
- **High-level modeling interface** - Users don't need to understand CP implementation details
- **Domain-specific language** for scheduling problems
- **Unified interface** for multiple problem types

**OR-Tools/CP Optimizer**:
- **Low-level constraint programming** interfaces
- Require deep understanding of CP concepts (interval variables, constraints, etc.)
- **Solver-specific syntax** and implementation details

### **2. Problem Coverage**
**PyJobShop**:
- **Single interface** supports both machine scheduling AND project scheduling
- **9 machine scheduling variants**: JSP, FJSP, PFSP, HFSP, etc.
- **3 project scheduling variants**: RCPSP, MMRCPSP, RCMPSP
- **Unified modeling approach** across problem domains

**OR-Tools/CP Optimizer**:
- **General-purpose** constraint programming solvers
- Require **custom implementation** for each scheduling variant
- No built-in scheduling problem abstractions

### **3. Solver Integration**
**PyJobShop**:
- **Dual solver support**: Integrates both OR-Tools CP-SAT AND CP Optimizer
- **Solver-agnostic modeling**: Same model works with both solvers
- **Automatic translation** of high-level model to solver-specific implementations

**OR-Tools/CP Optimizer**:
- **Single solver** per implementation
- **Incompatible interfaces** - models written for one don't work with the other
- Manual translation required between solvers

### **4. Ease of Use**
**PyJobShop**:
```python
# Simple, intuitive interface
model = Model()
job = model.add_job()
task = model.add_task(job=job)
machine = model.add_machine()
model.add_mode(task, machine, processing_time=5)
result = model.solve()
```

**Raw OR-Tools/CP Optimizer**:
```python
# Complex, low-level implementation
model = cp_model.CpModel()
start_var = model.NewIntVar(0, horizon, 'start')
interval_var = model.NewIntervalVar(start_var, duration, end_var, 'interval')
model.AddNoOverlap([interval_var1, interval_var2])
# Much more complex setup required...
```

### **5. Built-in Problem Types**
**PyJobShop**:
- **Pre-implemented scheduling models**:
  - Job shop, Flow shop, Flexible job shop
  - Resource-constrained project scheduling
  - Multi-mode variants
- **Built-in constraints**: precedence, resource capacity, setup times
- **Standard objectives**: makespan, tardiness, flow time

**OR-Tools/CP Optimizer**:
- **Generic constraint types**: NoOverlap, Cumulative, etc.
- **Manual assembly** required for scheduling problems
- **Custom objective implementation** needed

### **6. Research and Benchmarking Features**
**PyJobShop**:
- **Built-in benchmark reader** for 9,280+ instances
- **Standardized performance metrics** (RPD, optimality gap)
- **Comparative analysis tools** between solvers
- **Reproducible experimental framework**

**OR-Tools/CP Optimizer**:
- **No built-in benchmarking**
- Manual implementation of performance metrics
- No standardized comparison framework

### **7. Documentation and Accessibility**
**PyJobShop**:
- **Comprehensive documentation** at pyjobshop.org
- **Extensive examples** for different problem types
- **Gantt chart visualization** built-in
- **MIT License** - fully open source

**OR-Tools/CP Optimizer**:
- **Technical documentation** focused on solver capabilities
- **Steep learning curve** for scheduling applications
- CP Optimizer is **commercial** (expensive licensing)

## **Key Innovation: Bridging the Gap**

The paper highlights a critical insight from their experiments:

> **"We reviewed the OR-Tools implementation used in their [Naderi et al. 2023] experiments and found that their models for FJSP and HFSP were inefficiently formulated... When we used their implementation... we obtained an average RPD of 7.55%. In contrast, our optimized OR-Tools model achieved an average RPD of just 0.68%."**

This shows that **PyJobShop's main innovation** is:

### **Efficient, Optimized Implementations**
- **Expert-level CP modeling** accessible to non-experts
- **Optimized formulations** that novice users wouldn't discover
- **Performance parity** between OR-Tools and CP Optimizer through better modeling

### **Democratizing Advanced CP**
- **Removes the expertise barrier** to using CP for scheduling
- **Enables fair comparisons** between solvers
- **Accelerates research** by providing tested, optimized implementations

## **Bottom Line**

PyJobShop is **not a new solver** - it's a **sophisticated wrapper** that:
1. **Abstracts complexity** of constraint programming
2. **Optimizes performance** through expert formulations  
3. **Unifies interfaces** across solvers and problem types
4. **Enables reproducible research** with standardized benchmarks

It transforms constraint programming for scheduling from a **specialist tool** requiring deep CP expertise into an **accessible tool** for researchers and practitioners, while maintaining the performance advantages that make CP superior to traditional approaches like MILP.