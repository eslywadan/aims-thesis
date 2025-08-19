# Mixed Integer Programming Models for Job Shop Scheduling: A Computational Analysis

- text [10.1016@j.cor.2016.04.006](../texts/10.1016@j.cor.2016.04.006.pdf)

## Scheduling Problems widly used general MIP formulations
Based on the provided paper, here are the descriptions of the three widely used general MIP formulations for scheduling problems: the time-indexed formulation, the rank-based formulation, and the disjunctive formulation.

### Disjunctive Formulation

[cite_start]The disjunctive model is based on the work of Manne[cite: 69]. The decision variables in this formulation are:

* [cite_start]$x_{ij}$ : The integer start time of job *j* on machine *i*[cite: 70].
* [cite_start]$z_{ijk}$ : A binary variable equal to 1 if job *j* precedes job *k* on machine *i*[cite: 70].

[cite_start]The model's constraints include precedence constraints to ensure operations of a job are executed in order, and disjunctive constraints to prevent two jobs from being scheduled on the same machine at the same time[cite: 74, 75]. [cite_start]The objective is to minimize the makespan, which is the maximum completion time of any job's last operation[cite: 79].

***

### Time-Indexed Formulation

[cite_start]The time-indexed model used in the paper is based on Kondili's work, which is considered more computationally efficient than Bowman's original proposal[cite: 87]. The core decision variable is:

* [cite_start]$x_{ijt}$ : A binary variable equal to 1 if job *j* starts at time *t* on machine *i*[cite: 88].

[cite_start]The formulation includes constraints to ensure each job starts exactly once on each machine, that the machine is not over-capacitated at any time, and that precedence constraints are followed[cite: 91, 92, 93]. [cite_start]The objective is to minimize the makespan, which is calculated based on the completion times of all jobs' last operations[cite: 92]. [cite_start]The paper notes that a disadvantage of this formulation is that the number of variables and constraints is proportional to the number of time points, which can lead to a large model size and significant memory requirements[cite: 133, 135].

***

### Rank-Based Formulation

[cite_start]The rank-based model is attributed to Wagner[cite: 94]. The decision variables are defined as:

* [cite_start]$x_{ijk}$ : A binary variable equal to 1 if job *j* is scheduled at the *k*-th position on machine *i*[cite: 95].
* [cite_start]$h_{ik}$ : The start time of the job at the *k*-th position on machine *i*[cite: 96].

[cite_start]The model includes constraints to ensure that each position on a machine is assigned to exactly one job and that each job is assigned one position on a machine[cite: 99, 100]. [cite_start]A key constraint ensures that the start time of a job on a machine is later than the completion time of the job in the previous position on that machine[cite: 101]. [cite_start]It also contains precedence constraints to maintain the correct order of operations for each job[cite: 102]. [cite_start]The objective, like the other formulations, is to minimize the makespan[cite: 98, 103].

## google's ort tools

For integer linear problems (ILP), that is problems without continuous variables, we recommend using the CP-SAT solver.

For mixed integer problems (MIP), that is problem with both integer and continuous variables, we recommend using the SCIP solver.

- CP-SAT solver example
```python
from ortools.sat.python import cp_model

def main():
    # Creates the model.
    model = cp_model.CpModel()

    # Creates the variables.
    var_upper_bound = max(50, 45, 37)
    x = model.new_int_var(0, var_upper_bound, "x")
    y = model.new_int_var(0, var_upper_bound, "y")
    z = model.new_int_var(0, var_upper_bound, "z")

    # Creates the constraints.
    model.add(2 * x + 7 * y + 3 * z <= 50)
    model.add(3 * x - 5 * y + 7 * z <= 45)
    model.add(5 * x + 2 * y - 6 * z <= 37)

    # Creates the objective function.
    model.maximize(2 * x + 2 * y + 3 * z)

    # Creates a solver and solves the model.
    solver = cp_model.CpSolver()
    status = solver.solve(model)

    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        print(f"Maximum of objective function: {solver.objective_value}\n")
        print(f"x = {solver.value(x)}")
        print(f"y = {solver.value(y)}")
        print(f"z = {solver.value(z)}")
    else:
        print("No solution found.")

if __name__ == "__main__":
    main()
```

- SCIP solver example
```python
from ortools.linear_solver import pywraplp

def main():
    # Create the MIP solver with the SCIP backend.
    solver = pywraplp.Solver.CreateSolver("SCIP")
    if not solver:
        return

    infinity = solver.infinity()

    # Create the variables.
    # x is a continuous variable.
    x = solver.NumVar(0.0, infinity, "x")
    # y is an integer variable.
    y = solver.IntVar(0.0, infinity, "y")

    print("Number of variables =", solver.NumVariables())

    # Create constraints.
    # x + 7y <= 17.5
    solver.Add(x + 7 * y <= 17.5)
    # x <= 3.5
    solver.Add(x <= 3.5)

    print("Number of constraints =", solver.NumConstraints())

    # Define the objective function: Maximize x + 10y.
    solver.Maximize(x + 10 * y)

    # Solve the problem.
    status = solver.Solve()

    # Display the solution.
    if status == pywraplp.Solver.OPTIMAL:
        print("Solution:")
        print("Objective value =", solver.Objective().Value())
        print("x =", x.solution_value())
        print("y =", y.solution_value())
    else:
        print("The problem does not have an optimal solution.")

if __name__ == "__main__":
    main()
```
