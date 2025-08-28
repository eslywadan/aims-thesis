# Multi-objective evolutionary search strategies in constraint programming

- text [10.1016@j.orp.2020.100177](../texts/10.1016@j.orp.2020.100177.pdf)

The paper describes a hybrid approach where NSGA-II handles the multi-objective search while Constraint Programming (CP) ensures that each candidate solution is feasible with respect to complex scheduling constraints (in this case, Job Shop Scheduling Problems).

Let’s build a mini demonstration of that idea.

⸻

1️⃣ Concept from the paper
	•	NSGA-II → explores the trade-offs between multiple objectives (e.g., minimize makespan, minimize total tardiness).
	•	CP solver → acts as a feasibility oracle:
	•	Given a set of decision variables from NSGA-II (e.g., job orderings or machine assignments), CP constructs and solves a schedule.
	•	If CP can find a valid schedule, NSGA-II gets its objective values.
	•	If not feasible, NSGA-II discards or penalizes the solution.

This separation lets NSGA-II handle the search across the Pareto front and CP handle constraint satisfaction.

⸻

2️⃣ Mini Example — Hybrid NSGA-II + CP

We’ll use:
	•	pymoo → for NSGA-II
	•	ortools.sat.python.cp_model → for CP feasibility check and objective calculation

Problem:
	•	3 jobs, 2 machines
	•	Objectives:
	1.	Minimize makespan
	2.	Minimize total tardiness vs due dates

⸻

Python Code

```python
import numpy as np
from pymoo.algorithms.moo.nsga2 import NSGA2
from pymoo.core.problem import Problem
from pymoo.termination import get_termination
from pymoo.optimize import minimize
from ortools.sat.python import cp_model


# CP function: given job sequence, compute makespan and total tardiness
def evaluate_schedule(order):
    model = cp_model.CpModel()
    
    # Data
    M = 2  # machines
    J = 3  # jobs
    processing_times = [
        [3, 2],  # Job 0
        [2, 1],  # Job 1
        [4, 3],  # Job 2
    ]
    due_dates = [5, 6, 7]
    
    # Start time variables
    start = {}
    end = {}
    for j in range(J):
        for m in range(M):
            start[(j, m)] = model.NewIntVar(0, 50, f"start_{j}_{m}")
            end[(j, m)]   = model.NewIntVar(0, 50, f"end_{j}_{m}")
            model.Add(end[(j, m)] == start[(j, m)] + processing_times[j][m])
    
    # Precedence within jobs
    for j in range(J):
        for m in range(M-1):
            model.Add(end[(j, m)] <= start[(j, m+1)])
    
    # No-overlap per machine according to order
    for m in range(M):
        for i in range(len(order)-1):
            j1 = order[i]
            j2 = order[i+1]
            model.Add(start[(j2, m)] >= end[(j1, m)])
    
    # Makespan variable
    makespan = model.NewIntVar(0, 100, "makespan")
    model.AddMaxEquality(makespan, [end[(j, M-1)] for j in range(J)])
    
    # Total tardiness
    tardiness_vars = []
    for j in range(J):
        t_var = model.NewIntVar(0, 100, f"tard_{j}")
        model.Add(t_var >= end[(j, M-1)] - due_dates[j])
        tardiness_vars.append(t_var)
    total_tardiness = model.NewIntVar(0, 100, "total_tard")
    model.Add(total_tardiness == sum(tardiness_vars))
    
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 1
    status = solver.Solve(model)
    
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        return solver.Value(makespan), solver.Value(total_tardiness)
    else:
        return 9999, 9999  # infeasible/penalized


# Define the pymoo Problem class
class JSSP_CP_Problem(Problem):
    def __init__(self):
        super().__init__(n_var=3, n_obj=2, n_constr=0, xl=0, xu=2, type_var=int)
    
    def _evaluate(self, X, out, *args, **kwargs):
        F = []
        for row in X:
            order = list(row)
            ms, tt = evaluate_schedule(order)
            F.append([ms, tt])
        out["F"] = np.array(F)


# Run NSGA-II
problem = JSSP_CP_Problem()
algorithm = NSGA2(pop_size=10)
termination = get_termination("n_gen", 5)

res = minimize(problem, algorithm, termination, verbose=True)

print("Pareto front solutions (order, makespan, tardiness):")
for x, f in zip(res.X, res.F):
    print(x, f)
```

⸻

How this matches the paper’s approach:
	•	NSGA-II evolves the sequence/order of jobs.
	•	For each sequence, CP model is built to:
	•	Enforce job precedence
	•	Enforce machine no-overlap
	•	Compute both objectives
	•	CP returns (makespan, total tardiness) back to NSGA-II
	•	NSGA-II sorts candidates into Pareto fronts and evolves towards better trade-offs

⸻
