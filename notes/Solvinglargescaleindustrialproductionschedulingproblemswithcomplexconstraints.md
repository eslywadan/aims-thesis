# Solving large scale industrial production scheduling problems with complex constraints: an overview of the state-of-the-art


## citation
`Solving large scale industrial production scheduling problems with complex constraints: an overview of the state-of-the-art January2023 Procedia Computer Science 217:1028-1037 DOI:10.1016/j.procs.2022.12.301`

## key points
- From the paper “Solving large scale industrial production scheduling problems with complex constraints”, the key points are:

⸻

`Problems Encountered in Large-Scale Industrial Production Scheduling`
###	1.	Huge Combinatorial Search Space
	•	Industrial problems involve many production lines, numerous orders, and complex sequencing rules, creating an explosion of possible schedules.
	•	The search space grows exponentially, making straightforward mathematical programming approaches computationally prohibitive.
###	2.	Complex and Heterogeneous Constraints
	•	Real-world production imposes diverse constraints:
	•	Sequence-dependent setup times
	•	Limited machine availability and maintenance
	•	Changeover rules (e.g., due to hygiene, quality, or product compatibility)
	•	Resource sharing between tasks
	•	Many constraints are non-linear, discontinuous, or conditional, making them difficult to express and solve directly with linear programming.
###	3.	Multiple and Conflicting Objectives
	•	Goals like minimizing lateness, maximizing throughput, and reducing costs can conflict, requiring trade-offs.
	4.	Dynamic and Uncertain Environment
	•	Orders may change, machines may fail, and supply delays occur — schedules must be adaptable.
	5.	Scalability Limits of Traditional Mathematical Programming
	•	Pure MILP/MIP formulations can be too large and slow to solve exactly for realistic plant sizes within acceptable time limits.

⸻

`Why Constraint Programming (CP) Can Solve It`
###	1.	Rich Expressiveness for Complex Constraints
	•	CP can naturally model sequence-dependent setups, alternative resources, cumulative capacity limits, and conditional constraints without requiring linearization.
###	2.	Constraint Propagation & Domain Reduction
	•	CP engines reduce the search space by eliminating infeasible options early via propagation, making large, complex problems more tractable.
###	3.	Flexibility in Problem Changes
	•	Modifications (e.g., new constraints, updated orders) can be integrated without redesigning the entire model.
###	4.	Combination with Heuristics and Decomposition
	•	CP supports hybrid methods, such as combining constraint solving with local search or metaheuristics, to improve scalability.
###	5.	Ability to Handle Multiple Objectives and Complex Decision Logic
	•	CP can optimize with lexicographic ordering, weighted sums, or custom search strategies, fitting real industrial preferences.
###	6.	Better Performance on Scheduling-Specific Problems
	•	Because CP’s global constraints (e.g., cumulative, disjunctive) are designed for scheduling, it can solve many real-world instances faster than general MILP formulations.


⸻

## Mathematical Programming (MP) vs. Constraint Programming (CP) in Large-Scale Industrial Scheduling

Aspect |	Mathematical Programming (MILP / MIP)	| Constraint Programming (CP)
-------| -------------------------------------------| ---------------------------
Modeling Complex Constraints |	Struggles with non-linear, sequence-dependent, and conditional constraints — often requires linearization or approximations, which increases model size and complexity.	|Naturally models sequence-dependent setups, cumulative capacity, alternative resources, precedence, and conditional rules without reformulation.
Scalability| Large-scale industrial problems lead to huge MILP models with millions of variables and constraints — often unsolved within practical time limits.	|CP uses constraint propagation to prune infeasible options early, reducing the search space before exploring solutions.
Adaptability to Change|	Model changes (new constraints, resource availability changes) often require significant re-modeling and re-solving from scratch.|	CP models are modular — new constraints or resources can be added without major re-structuring.
Handling Multiple Objectives|	Typically modeled as weighted sums or goal programming; can require complex reformulations to reflect priority rules.|	Can natively handle lexicographic optimization (priority-based) or other multi-objective search strategies.
Search Strategy	| Relies heavily on solver’s branch-and-bound; improvements require advanced cutting planes or decomposition.|	Allows custom search heuristics, domain-specific branching, and hybrid methods (CP + local search or CP + MILP).
Best Fit Problems |	Problems with mostly linear constraints and large continuous decision variables (e.g., blending, allocation).	| Scheduling-heavy problems with rich combinatorial constraints and discrete decision variables.
Performance on Scheduling|	May solve small to medium scheduling instances, but large real-world instances with many constraints are often intractable.	|Often faster for complex scheduling because of specialized global scheduling constraints like disjunctive and cumulative.

⸻

### Paper’s Core Reasoning
	•	Large-scale industrial scheduling involves many discrete decisions + complex interdependent rules → MILP alone struggles because it must encode these rules in large, rigid linear forms.
	•	CP excels because it:
	•	Understands scheduling semantics through global constraints.
	•	Can prune infeasible options aggressively via propagation.
	•	Allows flexible and modular modeling for changing industrial environments.

