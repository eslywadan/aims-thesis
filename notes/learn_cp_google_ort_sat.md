# Learn CP via Google OR Tools

- [The CP-SAT Primer](https://d-krupke.github.io/cpsat-primer/05_parameters.html)

```bash
pip install -U ortools
```

```python
from ortools.sat.python import cp_model  # pip install -U ortools

# Specifying the input
weights = [395, 658, 113, 185, 336, 494, 294, 295, 256, 530, 311, 321, 602, 855, 209, 647, 520, 387, 743, 26, 54, 420, 667, 971, 171, 354, 962, 454, 589, 131, 342, 449, 648, 14, 201, 150, 602, 831, 941, 747, 444, 982, 732, 350, 683, 279, 667, 400, 441, 786, 309, 887, 189, 119, 209, 532, 461, 420, 14, 788, 691, 510, 961, 528, 538, 476, 49, 404, 761, 435, 729, 245, 204, 401, 347, 674, 75, 40, 882, 520, 692, 104, 512, 97, 713, 779, 224, 357, 193, 431, 442, 816, 920, 28, 143, 388, 23, 374, 905, 942]
values = [71, 15, 100, 37, 77, 28, 71, 30, 40, 22, 28, 39, 43, 61, 57, 100, 28, 47, 32, 66, 79, 70, 86, 86, 22, 57, 29, 38, 83, 73, 91, 54, 61, 63, 45, 30, 51, 5, 83, 18, 72, 89, 27, 66, 43, 64, 22, 23, 22, 72, 10, 29, 59, 45, 65, 38, 22, 68, 23, 13, 45, 34, 63, 34, 38, 30, 82, 33, 64, 100, 26, 50, 66, 40, 85, 71, 54, 25, 100, 74, 96, 62, 58, 21, 35, 36, 91, 7, 19, 32, 77, 70, 23, 43, 78, 98, 30, 12, 76, 38]
capacity = 2000

# Now we solve the problem
model = cp_model.CpModel()
xs = [model.new_bool_var(f"x_{i}") for i in range(len(weights))]

model.add(sum(x * w for x, w in zip(xs, weights)) <= capacity)
model.maximize(sum(x * v for x, v in zip(xs, values)))

solver = cp_model.CpSolver()
solver.solve(model)

print("Optimal selection:", [i for i, x in enumerate(xs) if solver.value(x)])
print("Total packed value:", solver.objective_value)

```
## Explanation of above code
This code is solving a 0/1 knapsack problem using Google OR-Tools’ CP-SAT solver (cp_model).
Let’s break it down step by step.
⸻

1. Importing OR-Tools

from ortools.sat.python import cp_model  # pip install -U ortools

	•	cp_model is part of OR-Tools’ Constraint Programming (CP-SAT) solver.
	•	It’s designed for solving integer and combinatorial optimization problems.

⸻

2. Problem Data

weights = [395, 658, 113, 185, ...]
values = [71, 15, 100, 37, ...]
capacity = 2000

	•	weights[i] = weight of item i
	•	values[i] = value of item i
	•	capacity = maximum total weight allowed (2000)

This is exactly the setup for the 0/1 Knapsack problem:

“Pick some items to maximize total value without exceeding capacity.”

⸻

3. Create the Model

model = cp_model.CpModel()

	•	This creates a constraint programming model where you’ll declare:
	•	Decision variables
	•	Constraints
	•	Objective function

⸻

4. Decision Variables

xs = [model.new_bool_var(f"x_{i}") for i in range(len(weights))]

	•	x_i is a binary decision variable:
	•	1 means item i is selected
	•	0 means it is not
	•	.new_bool_var() tells the solver it can only take True/False (1/0) values.

⸻

5. Weight Constraint

model.add(sum(x * w for x, w in zip(xs, weights)) <= capacity)

	•	Ensures total weight of chosen items ≤ capacity
	•	x * w works because if x = 0 → 0, if x = 1 → item weight included.

⸻

6. Objective Function

model.maximize(sum(x * v for x, v in zip(xs, values)))

	•	The solver will maximize total value of selected items.
	•	Again, x * v is value contributed by item i if chosen.

⸻

7. Solve the Model

solver = cp_model.CpSolver()
solver.solve(model)

	•	CpSolver() runs the constraint programming solver.
	•	.solve(model) finds the optimal set of items.

⸻

8. Extract and Print Results

print("Optimal selection:", [i for i, x in enumerate(xs) if solver.value(x)])
print("Total packed value:", solver.objective_value)

	•	solver.value(x) returns the chosen value of variable x (0 or 1).
	•	solver.objective_value is the maximum value found.

⸻

Summary

This code is:
	1.	Defining binary decision variables for each item
	2.	Adding a capacity constraint on weight
	3.	Maximizing total value
	4.	Solving the 0/1 knapsack problem optimally

⸻


## 0/1 Knapsack problem

The 0/1 Knapsack problem is a classic optimization problem in computer science and operations research.

It goes like this:

⸻

Story Version

Imagine you have:
	•	A backpack (knapsack) that can only carry up to a certain weight capacity.
	•	A bunch of items, each with:
	•	A weight
	•	A value (profit, utility, etc.)

Your goal:
	•	Pick a subset of items to put in the backpack
	•	Maximize the total value of items inside
	•	Do not exceed the backpack’s weight capacity.

⸻

Why “0/1”?
	•	For each item, you have only two choices:
	•	1 → take it
	•	0 → leave it
	•	You cannot take half of an item (no fractional items).
	•	This is different from the fractional knapsack problem where you can take part of an item.

⸻

Mathematical Formulation

Let:
	•	n = number of items
	•	w[i] = weight of item i
	•	v[i] = value of item i
	•	C = maximum capacity of the knapsack
	•	x[i] = decision variable (1 if we take item i, else 0)

Objective:
\text{Maximize} \quad \sum_{i=1}^n v[i] \cdot x[i]

Constraint:
\sum_{i=1}^n w[i] \cdot x[i] \le C

Decision variables:
x[i] \in \{0,1\}

⸻

Example

Items:

Item	Weight	Value
1	2	40
2	3	50
3	4	70
4	5	80

Capacity: 5

Best choice:
	•	Take Item 2 and Item 1 → weight = 2 + 3 = 5, value = 40 + 50 = 90
	•	Any other combination is worse.

⸻

Why is it important?
	•	It appears in resource allocation problems: picking projects, scheduling jobs, cargo loading, budgeting, etc.
	•	It’s NP-complete, meaning no known algorithm can solve it quickly for very large inputs — so it’s a benchmark problem for optimization methods.

⸻

If you like, I can make a visual diagram showing how the decision tree for the 0/1 knapsack works — it makes the “take it or leave it” idea very intuitive.