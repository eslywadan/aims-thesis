

# **Mixed Integer Programming in Multi-Objective Optimization: Methodologies, Challenges, and Applications**

## **1\. Introduction to Optimization Fundamentals**

Optimization, at its core, is the process of finding the best solution from a set of alternatives, balancing various objectives and constraints.1 This fundamental concept forms the bedrock of operations research and decision science, enabling systematic approaches to complex real-world challenges. Within this domain, Mixed Integer Programming (MIP) and Multi-Objective Optimization (MOO) represent two critical paradigms that, when combined, address some of the most intricate decision-making scenarios.

### **1.1. Mixed Integer Programming (MIP): Core Concepts and Components**

Mixed Integer Programming (MIP) is a sophisticated mathematical optimization technique specifically designed to solve problems that involve a blend of variable types. These include continuous variables, which can take any real value (e.g., decimals or fractions); discrete variables, which are restricted to countable whole numbers; and binary variables, which are limited to values of 0 or 1\.3 This versatility makes MIP an exceptionally powerful tool for addressing complex optimization problems, particularly those characterized by inherent constraints, limited resources, and the necessity for discrete choices.

The structure of a MIP model is defined by several key components:

* **Decision Variables:** These elements represent the choices that must be determined by the optimization process. They are categorized based on their nature:  
  * **Binary variables** (0 or 1\) are used for "yes/no" decisions, such as whether to open a new facility or not.
  * **Discrete variables** represent countable integer quantities, for instance, the exact number of items to produce.
  * **Continuous variables** can take any real value, like the precise amount of raw material to be utilized. The number and type of these variables significantly influence the overall complexity of the problem.
* **Objective Function:** This component quantifies the explicit goal of the optimization. In a single-objective context, the aim is either to maximize a desired outcome (e.g., profit or revenue) or to minimize an undesirable one (e.g., cost or time). For problems with multiple objectives, these can be handled by prioritizing one objective over others, combining them into a single aggregate numeric objective, or framing them as constraints on target goals.
* **Constraints:** These define the boundaries, limitations, or rules that the decision variables must satisfy. Constraints can be:  
  * **Logical**, such as ensuring the total number of stored items does not exceed warehouse capacity.  
  * **Physical**, reflecting limitations on material availability or space.  
  * **Capacity-based**, like limits on labor hours or machine capacity.  
  * **Policy-driven**, ensuring adherence to company rules or regulatory requirements.

The process of solving MIP problems typically involves advanced algorithms, with the branch-and-bound method being a prominent example. This algorithm systematically explores the solution space. It begins by relaxing the integrality restrictions, transforming the problem into a more easily solvable linear programming (LP) relaxation. Subsequently, it iteratively branches on fractional integer variables and applies bounding techniques to converge towards optimal integer solutions.4 For instance, if an original MIP problem, P0, has an integer variable that is fractional in its LP relaxation, the branch-and-bound algorithm creates two new sub-MIPs (e.g., P1 and P2) by imposing new constraints (e.g., x ≤ 5.0 and x ≥ 6.0 for a fractional x=5.5). This process generates a search tree, where each MIP generated is a node. The optimal solution for P0 can then be found by taking the better of the optimal solutions from P1 and P2.4 The field of mixed integer programming has also seen significant improvements in algorithm capabilities through techniques such as presolve, cutting planes, heuristics, and parallelism.4 The output from a MIP solver provides crucial information, including the optimal values for the decision variables (e.g., the best production quantities or resource allocations), the optimal value of the objective function (e.g., maximum profit or minimum cost), and the solver's status (e.g., optimal, infeasible, or unbounded).3

MIP serves as a strategic framework, translating intricate real-world scenarios into clear, actionable insights. It facilitates optimized decisions under various real-world constraints, such as budget allocation, workflow design, or logistics optimization.3 The capacity of MIP to model discrete decisions is fundamental for addressing complex decision-making problems across a wide array of industries.6

A significant advantage of MIP models lies in their inherent transparency and interpretability, a quality that distinguishes them from many contemporary artificial intelligence models, such as deep neural networks, which often function as "black boxes." In MIP, every decision variable, objective function, and constraint directly corresponds to a real-world element or rule. When a MIP solver produces an optimal solution, the rationale underpinning that solution is fully traceable and explainable through the model's explicit structure and the mathematical optimization process. This intrinsic clarity is particularly valuable in high-stakes environments—including healthcare, finance, or critical infrastructure management—where comprehending *why* a decision was made is as crucial as the decision itself, thereby fostering auditing, compliance, and trust in the system.

Furthermore, MIP's unique ability to integrate continuous, discrete, and binary variables within a single, coherent mathematical framework allows for a more accurate and realistic representation of complex real-world systems. Many practical optimization problems are not exclusively continuous (e.g., resource allocation where quantities can be fractional) nor purely discrete (e.g., selecting which projects to fund). Instead, they involve a combination of both, such as determining the number of factories to build (discrete) and the production volume at each (continuous). This holistic modeling approach enables the optimization of problems that would otherwise be intractable or inaccurately represented by methods limited to purely continuous or discrete variables.

### **1.2. Multi-Objective Optimization (MOO): Principles and Pareto Optimality**

Multi-objective optimization (MOO), also known as Pareto optimization, multi-objective programming, or multicriteria optimization, is a specialized domain within mathematical optimization dedicated to problems involving the simultaneous optimization of more than one objective function.1 A defining characteristic of MOO problems is that these objectives are frequently in conflict; improving one objective's value typically leads to a degradation in the value of at least one other.1 A common illustration of this conflict is the desire to maximize system performance while simultaneously minimizing its cost.9

The inherent challenge of conflicting objectives means that, unlike single-objective optimization which seeks a unique global optimum, MOO problems generally do not possess a single solution that simultaneously optimizes every objective function.7 This fundamental conflict necessitates a shift from traditional notions of "optimality" towards the concept of a set of compromise solutions.

A solution is considered **non-dominated**, **Pareto optimal**, **Pareto efficient**, or **noninferior** if it is impossible to improve the value of any one of its objective functions without simultaneously worsening the value of at least one of the other objectives.1 These solutions represent the best possible trade-offs available. The

**Pareto front** (also known as the Pareto frontier or Pareto boundary) is the collection of all such Pareto optimal outcomes in the objective space.1 It serves as a visual representation of the set of optimal compromises available to the decision-maker.1 The primary goals in MOO research and application often include finding a representative set of these Pareto optimal solutions, quantifying the trade-offs involved in satisfying different objectives, or identifying a single solution that best aligns with the subjective preferences of a human decision-maker.7

The boundaries of the Pareto front are conceptually defined by two extreme points: the **ideal objective vector** and the **nadir objective vector**.7 The ideal vector represents the best possible value for each objective when optimized individually, while the nadir vector defines the worst value for each objective among all Pareto optimal solutions.7 These vectors establish the theoretical lower and upper bounds for the objective function values of Pareto optimal solutions. In practice, the ideal vector is often unattainable, and the nadir vector can typically only be approximated because the entire Pareto optimal set is usually unknown.7 Mathematically, a multi-objective optimization problem is typically formulated as the minimization (or maximization, by minimizing its negative) of a vector-valued objective function, subject to a set of constraint functions that define the feasible set of decision vectors.1

The fundamental output of MOO is not a single "optimal" solution, but rather a *set* of Pareto optimal solutions, each embodying a distinct balance of the conflicting objectives. This inherently shifts the focus from a purely computational task to a more strategic, human-centric decision-making process. The true utility of MOO lies in its capacity to illuminate the inherent trade-offs, thereby empowering decision-makers to make informed choices grounded in their subjective preferences, risk tolerance, or evolving organizational priorities. This acknowledges that in complex real-world scenarios, "optimality" is frequently a nuanced compromise rather than a singular, universally superior point, transforming the optimization process into a robust decision support system.

As the number of objectives increases, a distinction emerges between "multi-objective" problems (typically involving 2-3 objectives) and "many-objective" problems (more than 3 objectives).10 In many-objective scenarios, a critical challenge arises: almost all solutions within a given population tend to become non-dominated by each other. This phenomenon significantly compromises the selection pressure of traditional Pareto dominance-based methods. Intuitively, with a greater number of criteria to satisfy simultaneously, it becomes increasingly improbable for one solution to be strictly superior across

*all* objectives compared to another. This leads to a "flat" Pareto front, where a vast number of solutions are non-dominated, making it computationally challenging to identify a truly representative set and difficult for decision-makers to navigate. To address this scalability issue, advanced techniques such as "relaxed forms of Pareto dominance" (e.g., α-dominance, ϵ-dominance) have been developed. These methods strategically expand what constitutes a "dominated" solution, thereby enhancing the discriminative power and selection pressure of MOO algorithms towards the true Pareto front. This area of research is crucial for applying MOO effectively to highly complex, real-world problems characterized by numerous performance indicators.10

## **2\. The Intersection: Multi-Objective Mixed Integer Programming (MOMIP)**

Multi-Objective Mixed Integer Programming (MOMIP) represents a particularly challenging yet highly practical intersection of Multi-Objective Optimization (MOO) and Mixed Integer Programming (MIP). These problems are characterized by the simultaneous optimization of multiple, often conflicting, objective functions, where some or all of the decision variables are constrained to take on integer or binary values.11 MOMIP is considered the general case where integrality constraints are imposed on a subset or all of the decision variables.11 A typical MOMIP problem involves minimizing (or maximizing) a vector of objective functions, subject to a set of linear or nonlinear constraints, with the crucial additional condition that specific decision variables must assume integer values.11

### **2.1. The Role of Integer and Binary Variables in Discrete Decision-Making**

Integer and binary variables are indispensable for accurately capturing the discrete, "all-or-nothing," or countable nature of many real-world decisions within optimization models.2

* **Binary Variables (0 or 1):** These variables are specifically designed to model yes/no or selection decisions. For example, they can represent whether to open a new facility (1 for open, 0 for closed), whether to purchase a new piece of equipment, or whether to include a specific item in a selection.3 They are particularly crucial for formulating combinatorial optimization problems, where the core task involves selecting the optimal subset of elements from a larger collection.13  
* **Discrete Variables (Countable Whole Numbers):** These variables represent quantities that must be integers. Common applications include determining the exact number of items to produce, the number of vehicles to dispatch in a logistics network, or the precise number of personnel to assign to a shift.3

The introduction of integer variables inherently transforms an optimization problem into a combinatorial one. This implies that the problem involves finding the best solution from a finite, but often astronomically large, set of possible alternatives.2 The divisibility constraints imposed by integer variables restrict the feasible alternatives to a discrete set, making exhaustive enumeration computationally infeasible for problems of realistic size.13

The ability to model discrete decisions using integer variables makes MOMIP applicable across a wide array of fields. In **operations management**, this includes complex tasks such as production planning, workforce scheduling (e.g., optimizing airline crew or hospital nurse schedules), inventory control, and strategic facility location and layout decisions.3 In

**engineering design**, examples range from the optimal design of transportation networks to the intricate layout of integrated circuits.13 In

**finance**, binary variables can represent which assets to include or exclude from a portfolio.7 In

**logistics**, MOMIP is used for optimizing complex supply chain networks, including decisions on routing, transportation modes, and warehouse placement.3

The presence of integer constraints fundamentally alters the nature of the problem's feasible region. Unlike continuous linear programming (LP) problems, where the feasible region is a convex polyhedron, the introduction of integer variables results in a feasible set composed of discrete points, rendering the overall feasible region non-convex.11 This non-convexity is a primary source of the increased computational difficulty in MOMIP.

The essentiality of integer variables for realistic and practical modeling cannot be overstated. In many real-world scenarios, decisions are not infinitely divisible. For instance, one cannot construct 0.7 of a factory, assign 1.5 nurses to a shift, or produce a fractional number of certain items. Integer variables are not merely a mathematical abstraction; they are a critical modeling construct that ensures the "optimal" solutions generated by the model are actually feasible and meaningful in practice. Without them, an optimization model might yield continuous solutions that, when rounded, become suboptimal or even infeasible. This capacity elevates MIP from a theoretical tool to an indispensable practical framework for accurate and actionable decision-making in discrete environments.

However, the power of integer variables in enabling realistic modeling comes at a significant computational cost. The transformation of the feasible region from a continuous space to a set of discrete points introduces non-convexity 11, which means that gradient-based or convex optimization methods cannot directly guarantee a global optimum. This necessitates combinatorial search algorithms like Branch-and-Bound 4, which explore a potentially exponential number of discrete possibilities. This inherent computational difficulty is a central challenge in MOMIP, driving the need for increasingly sophisticated algorithms, specialized solvers, and, in many cases, a reliance on approximation methods to find solutions within practical timeframes.

**Table 1: Role of Integer and Binary Variables in MOMIP Modeling**

| Variable Type | Description in Real-World Decisions | Example Applications in MOMIP | Impact on Model |
| :---- | :---- | :---- | :---- |
| **Binary (0/1)** | Represents "yes/no," "on/off," or selection decisions (e.g., whether to build, buy, or select an item). | Facility location (build/not build) 3, equipment purchase 4, project selection 13, portfolio asset inclusion.7 | Creates discrete points in the feasible region, leading to non-convexity. Essential for combinatorial problems. |
| **General Integer** | Represents countable whole numbers (e.g., number of units, number of people, number of trips). | Production quantities 3, workforce scheduling (number of nurses/doctors) 13, vehicle dispatch 13, number of transmission lines to be built.20 | Restricts solutions to integer values, making the feasible space a set of isolated points. Increases computational complexity significantly. |

### **2.2. Inherent Challenges in MOMIP (e.g., Non-Convexity)**

One of the most significant challenges in MOMIP stems from the introduction of integer variables, which renders the feasible set non-convex.11 This stands in stark contrast to Multi-Objective Linear Programming (MOLP) problems, where the feasible region is a continuous convex polyhedron.12 The discrete nature of the decision variables means that feasible solutions no longer form a continuous space but rather a set of isolated points, rendering standard continuous optimization techniques inapplicable without modification.12

Problems incorporating discrete variables are inherently "more difficult to tackle" than their purely continuous counterparts, even when objective functions and constraints remain linear.11 The complexities introduced by integrality constraints in MOMIP extend beyond those encountered when transitioning from single-objective linear programming to integer programming alone.11 This compounding difficulty means that MOMIP problems are notoriously hard to solve, and the development of efficient algorithms has historically been a significant research challenge.19 The task of generating the entire set, or even a sufficiently large and representative subset, of non-dominated objective vectors for MOMIP problems can demand excessive computational resources. This often renders exact enumeration approaches impractical or "inappropriate for dealing with large problems".11

As the number of objective functions increases (a scenario often termed "many-objective optimization" when there are more than three objectives), the concept of Pareto dominance can become less effective. In such high-dimensional objective spaces, a large proportion of solutions may appear non-dominated by each other, which significantly compromises the selection pressure of Pareto dominance-based algorithms. To address this, advanced techniques such as relaxed Pareto dominance criteria are employed to enhance the discriminative power and selection pressure.10 The conflicting nature of multiple objectives, coupled with the discrete choices inherent in MIP, makes the problem of identifying and presenting the optimal set of solutions particularly challenging. Each optimal solution on the Pareto front represents a unique trade-off and may not be individually optimal for any single objective.1

The difficulties in MOMIP are not merely an additive combination of the complexities of MOO and MIP; they arise from a compounding effect. The introduction of integer variables already makes single-objective MIP problems significantly more complex than their continuous counterparts due to the non-convexity of the feasible region. When this complexity is combined with the multi-objective paradigm—which seeks to identify an entire *set* of non-dominated solutions (the Pareto front) rather than a single optimal point—the computational challenge escalates dramatically. MOMIP presents unique complexities stemming from the interaction of discrete decision spaces with multi-criteria optimality, requiring specialized algorithmic approaches that can navigate both challenges simultaneously. This is why MOMIP is considered "even harder" than single-objective MIP.19

Given the inherent NP-hardness and extreme computational demands of finding the *exact* Pareto front for many large-scale MOMIP instances, practical applications often necessitate a pragmatic shift towards approximation methods. The computational burden means that generating the "whole set, or a large subset, of non-dominated objective vectors may require an excessive amount of computational resources, which may make it inappropriate for dealing with large problems".11 This implies that while the theoretical goal is to find all Pareto optimal solutions, the practical reality often involves settling for a "good enough" representative approximation of the Pareto front within acceptable computational time. This trade-off between solution exactness (global optimality versus near-optimality) and computational feasibility is a critical consideration for researchers and practitioners, driving the development and adoption of heuristic and meta-heuristic approaches in MOMIP.

## **3\. Methodologies for Solving Multi-Objective MIP Problems**

Solving Multi-Objective Mixed Integer Programming (MOMIP) problems requires specialized approaches due to their inherent complexity. These methodologies generally fall into two broad categories: transforming the multi-objective problem into a series of solvable single-objective problems (scalarization) or employing advanced algorithms designed to handle multiple objectives directly within the integer programming framework.

### **3.1. Scalarization Techniques**

Scalarization methods are among the most common and widely used approaches for solving multi-objective optimization problems, including MOMIP. The core idea is to convert the multi-objective problem into a single-objective problem, which can then be solved using well-established single-objective MIP solvers.7 The solution obtained from each scalarized problem typically yields a Pareto optimal solution.7

#### **3.1.1. Weighted Sum Method**

The Weighted Sum Method is a traditional, popular, and straightforward *a priori* scalarization technique.7 It aggregates all objective functions into a single composite objective by assigning a specific weight to each individual objective.7 The optimization then proceeds by minimizing (or maximizing) this weighted sum.7

The mathematical formulation for minimization is:  
min (x ∈ X) Σ (i=1 to k) wi \* fi(x)  
where:

* x is the decision vector.  
* X is the feasible set of decision vectors.  
* fi(x) represents the i-th objective function.  
* wi are the weights assigned to each objective, with wi \> 0\.7

This method offers several advantages: its **simplicity** makes it easy to understand and implement, often serving as a popular choice for initial analyses.7 It is also

**computationally efficient**, as solving the weighted sum problem requires equivalent computational effort to solving a single-objective version of the problem.15 Furthermore, the assigned weights can directly

**reflect the relative importance or preference** of the decision-maker among the various objectives.9

Despite its simplicity, the weighted sum method has notable disadvantages. A significant limitation, particularly critical for MOMIP problems with their inherently non-convex feasible sets 11, is its

**inability to find Pareto optimal solutions that lie in non-convex regions of the Pareto front**.7 It primarily identifies "supported solutions," which are points on the convex hull of the objective set.7 This implies that a substantial portion of the true Pareto front, especially concave or disconnected segments, may be systematically missed. Even with an even distribution of weights, this method does not guarantee an even distribution of solutions across the Pareto front; solutions often tend to concentrate in certain areas, leaving other parts unexplored.9 The weighted sum approach cannot find solutions on non-convex parts of the Pareto front, even if such non-dominated solutions exist, because it is often implemented as a convex combination of objectives where the sum of all weights is constant and negative weights are not allowed.9 Increasing the number of weights by reducing the step size does not resolve this problem, potentially leading to the selection of an inferior solution by missing important solutions in non-convex regions.9 The method is also highly

**sensitive to weight selection**, which can be challenging, especially when objectives have different scales or units.15 Incorrect weight assignments can lead to suboptimal or biased solutions.15 In some complex cases, it may not even guarantee Pareto optimality.15

The fundamental drawback of the weighted sum method in the context of MOMIP is its inability to explore the entire Pareto front. Because MOMIP problems introduce discrete variables, their feasible regions (and consequently their Pareto fronts in the objective space) are often non-convex. The weighted sum method, by combining objectives linearly, can only identify solutions that lie on the convex hull of the objective space. This creates a "convexity gap," meaning that a significant portion of the true Pareto front, particularly the concave or disconnected segments, will be systematically missed. This limitation implies that while computationally simple, the weighted sum method may provide an incomplete and potentially misleading representation of the available trade-offs for MOMIP, potentially leading decision-makers to overlook truly optimal compromise solutions.

#### **3.1.2. Epsilon-Constraint Method**

The Epsilon-Constraint Method is another widely recognized *a priori* scalarization technique used in multi-objective optimization.7 This method transforms the multi-objective problem into a single-objective one by selecting one primary objective function to minimize (or maximize) and converting all other objective functions into additional constraints.7 The upper bounds for these newly constrained objectives are set as parameters, denoted by

εi.7 By systematically varying these

εi values across a range, a diverse set of Pareto optimal solutions can be generated.16

The mathematical formulation for minimizing objective j is typically expressed as:  
min fj(x)  
s.t. x ∈ X  
fi(x) ≤ εi for i ∈ {1,..., k} \\ {j}  
where fj(x) is the objective function chosen to be minimized, X is the feasible set, and fi(x) are the other objective functions constrained by the εi upper bounds.7  
This method offers several advantages: a key strength is its ability to **guarantee Pareto optimality** for the solutions it obtains, ensuring they are efficient and non-dominated.15 It is widely recognized for its capability to identify all efficient solutions.23 It effectively handles

**multiple objective functions**, making it suitable for problems with conflicting goals.15 Decision-makers also have the

**flexibility to choose the epsilon values**, which allows for targeted exploration of specific regions of interest on the Pareto front and obtaining desired solutions.15 This approach provides a

**systematic and flexible way to generate Pareto optimal solutions**, leading to a clear understanding of the trade-offs between different objectives.16

However, the epsilon-constraint method also has limitations. It can be **computationally expensive**, particularly when applied to large-scale problems.15 The

**difficulty in choosing appropriate epsilon values** can be a challenge, as incorrect choices may lead to suboptimal solutions.15 The method is also

**sensitive to the formulation of constraints**, with small changes potentially impacting the solution significantly.15 Furthermore, handling non-linear objective functions and constraints, or dealing with uncertainty and stochasticity, can pose additional challenges.15

The epsilon-constraint method's systematic variation of epsilon values allows for a more comprehensive mapping of the Pareto front, including non-convex regions, which is especially important for MOMIP problems. Unlike the weighted sum method, which is limited to the convex hull of the objective space, the epsilon-constraint method can systematically explore the entire Pareto front by adjusting the bounds on the constrained objectives. This provides decision-makers with a more complete understanding of the available trade-offs in discrete decision spaces, capturing solutions that might be missed by simpler scalarization techniques. This systematic exploration capacity is a significant advantage in capturing the full trade-off landscape for problems with integer variables.16

#### **3.1.3. Goal Programming**

Goal Programming is an *a priori* method where the decision-maker's preferences are expressed by setting specific target or goal values for each objective function.24 The method then aims to minimize the deviations from these desired goal values.24

The general formulation of a weighted goal programming model is:  
min Σ (i=1 to n) (w+i d+i \+ w-i d-i)  
s.t. fi(x) \+ d-i \- d+i \= gi, i \= 1, 2,..., n  
x ∈ X, d+i, d-i ≥ 0, i \= 1, 2,..., n  
In this formulation, w+i and w-i are the weights assigned to the positive (d+i, overachievement) and negative (d-i, underachievement) deviational variables, respectively. fi(x) is the i-th objective function, gi is the i-th goal, and X is the feasible region.25  
Several variants of goal programming exist, including:

* **Weighted Goal Programming**, which assigns weights to deviational variables based on objective importance.25  
* **Preemptive Goal Programming**, used when objectives have different priorities, solving problems hierarchically.25  
* **Fuzzy Goal Programming**, which handles uncertainty in goals and constraints using fuzzy sets.25

The advantages of goal programming include its **simplicity and ease of use**, allowing even large problems to be solved with linear programming software.24 It provides a

**flexible framework** for handling multiple objectives and allows decision-makers to **prioritize objectives** based on their relative importance.25 Its

**real-world applicability** is broad, extending to financial portfolio optimization, supply chain management, and healthcare resource allocation.25

However, a debated weakness is its potential to **produce solutions that are not Pareto efficient**, which can violate fundamental concepts of decision theory.24 The process of appropriately setting weights can also be a point of contention.24

#### **3.1.4. Other Scalarization Methods**

Beyond the widely used weighted sum, epsilon-constraint, and goal programming methods, several other scalarization techniques are employed in multi-objective optimization, including for MOMIP:

* **Global Criterion Method:** This method transforms a multi-objective problem into a single-objective one by minimizing the distance between multiple reference points and viable destination areas.21  
* **Pascoletti–Serafini Scalarization (Goal-Attainment Method):** This approach formulates a problem that minimizes a new variable α subject to constraints that ensure the objective functions are within α of a reference point or ideal vector.23  
* **Normal Boundary Intersection (NBI) and Modified NBI (mNBI):** NBI aims to find evenly distributed Pareto optimal points and is independent of objective function scales. The modified version (mNBI) addresses the original NBI's limitation of not always guaranteeing Pareto optimality.7  
* **Normal Constraint (NC) and Normalized Normal Constraint (NNC):** These methods are designed to generate a set of evenly spaced solutions on a Pareto frontier, addressing scaling issues and ensuring the generation of only Pareto solutions.7  
* **Directed Search Domain (DSD):** This algorithm shrinks the search domain to obtain a Pareto solution in a selected area of the objective space, aiming for a quasi-evenly distributed Pareto set.7

### **3.2. Specialized Algorithms for MOMIP**

Given that Multi-Objective Mixed Integer Programming (MOMIP) is inherently more challenging to solve than single-objective MIP problems, specialized algorithms, beyond simple scalarization, are often required, especially when seeking exact solutions.19

#### **3.2.1. Multi-Objective Branch-and-Bound (MOBB)**

Multi-Objective Branch-and-Bound (MOBB) is an extension of the traditional single-objective branch-and-bound algorithm, specifically adapted to handle multiple objectives. It involves modifications to how feasible regions are bounded and how the search tree is pruned to account for the multi-objective nature.19 A key component is

**objective branching**, which involves creating smaller, disjoint subproblems directly in the objective space, derived from the partial dominance of lower bound sets by upper bound sets.31 While effective in biobjective branch-and-bound, applying objective branching becomes more complex when dealing with three or more objective functions, and its benefits have not always been clear.31

However, applying objective branching becomes more complex when dealing with three or more objective functions, and its benefits have not always been clear.31 A significant challenge in MOBB is that

**bounding and pruning are considerably weaker** in multi-objective contexts compared to single-objective problems, often leading to more extensive searches of the branch-and-bound tree.31

To enhance MOBB's efficiency, several advancements have been explored:

* **Probing and its Coupling with Objective Branching:** Extended probing techniques, particularly for 0-1 integer problems, when coupled with objective branching, have demonstrated significant speedups in computational times. This approach can also be adapted for general integer cases.31  
* **Cut Generation:** Research investigates generating cuts based on objective branching constraints. These cutting planes can further tighten the problem formulation and improve the efficiency of the branch-and-bound algorithm.31  
* **Generalized Node Selection Rules:** The "best bound" idea for node selection has been generalized to multiple objectives. These proposed rules have shown to outperform common strategies like depth-first and breadth-first search in multi-objective literature, indicating that a more informed node selection strategy, guided by multi-objective considerations, can lead to better performance.31  
* **Problem-Specific Branching Rules:** Tailoring branching decisions to the characteristics of the specific problem class can further enhance algorithmic efficiency.31  
* **Warm-starting Lower Bound Computations:** Addressing the computational effort required to obtain lower bound sets with increasing numbers of objectives, techniques like warm-starting Benson's-like algorithms using information from parent nodes in the branch-and-bound tree can significantly reduce CPU time across various problem classes.31

These enhancements contribute to MOBB's potential for efficient solutions, with some parallelized MOBB algorithms even achieving super-linear speedup.19

#### **3.2.2. Criterion Space Search Methods**

Criterion space search methods are a class of algorithms that organize and bound their search directly in the space of feasible objective vectors.32 These methods aim to systematically explore the objective space to identify the Pareto front. They often involve solving a series of single-objective MIPs, where the objective function or constraints are parametrically varied to trace the Pareto front. For instance, the epsilon-constraint method can be viewed as a criterion space search method, as it explores the objective space by varying the

ε parameters.30 This approach is particularly useful for computing the entire set of non-dominated images for multi-objective mixed-integer and integer linear optimization problems.32

#### **3.2.3. Meta-heuristics and Evolutionary Algorithms**

Given that exact methods can be computationally prohibitive for many large-scale MOMIP problems 11, meta-heuristics and evolutionary algorithms offer a practical alternative. These are stochastic optimization techniques used to find optimal or near-optimal solutions for conflicting objectives.1 They are particularly suitable for complex, large-scale problems and can generate a set of well-distributed solutions in a single run, often capable of handling uncertainty.1

Examples of such algorithms include:

* **Evolutionary Algorithms (EAs) and Genetic Algorithms (GAs):** These biologically inspired processes are widely used in MOO.1  
* **NSGA-II (Non-dominated Sorting Genetic Algorithm II):** Known for its computational efficiency in searching for near-optimal solutions and robust capability in managing uncertainty.22  
* **MOEA/D (Multi-Objective Evolutionary Algorithm based on Decomposition):** Another well-known algorithm, particularly for many-objective problems.34  
* **Particle Swarm Optimization (PSO) and Ant Colony Optimization (ACO):** These are other biologically inspired meta-heuristics applied to multi-objective problems.17

While these methods are effective for finding good approximations, a limitation is that they do not guarantee global optimality.1 Furthermore, they may struggle with "many-objective" problems, where the increased number of objectives can compromise the selection pressure of dominance-based approaches.10

## **4\. Applications of Multi-Objective MIP**

Multi-Objective Mixed Integer Programming (MOMIP) provides a powerful and versatile framework for decision-making in real-world scenarios characterized by limited resources, complex rules, and the need for discrete choices. Its ability to model and solve problems with conflicting objectives and integer variables enables the systematic evaluation of trade-offs and the identification of optimal, explainable solutions.3 MOMIP finds extensive application across various sectors, transforming complexity into clarity and ensuring that decisions lead to the best possible outcomes under real-world constraints.3

### **4.1. Supply Chain Management and Logistics**

In supply chain management (SCM) and logistics, MOMIP is instrumental in optimizing complex networks where multiple, often conflicting, objectives must be balanced.

* **Examples:** Applications include optimizing distribution networks, minimizing total distribution costs across various transportation modes (trucks, trains, ships), managing inventory levels, selecting optimal suppliers, and designing overall supply chain network configurations.17 Specific discrete decisions involve deciding  
  *where* to locate warehouses (binary choice), *which* suppliers to utilize (binary), or the *number* of items to produce or transport.3 For instance, MOMIP can be used to optimize the distribution network system of a flexible global packaging company, considering transportation modes (trucks, trains, and ships) to minimize total distribution costs while ensuring timely delivery of demands.18 It can also be applied to multi-period lot-sizing problems involving multiple products and multiple suppliers, with objectives including cost, quality, and service level.37  
* **Objectives:** Common objectives in SCM MOMIP models include minimizing total cost (e.g., production, transportation, inventory), reducing delivery time, mitigating risks, and maximizing efficiency, reliability, or customer service levels.17 For instance, a multi-objective mixed-integer non-linear model might be developed for multi-period lot-sizing problems, considering cost, quality, and service level.37

### **4.2. Healthcare Resource Allocation**

MOMIP plays a crucial role in optimizing the allocation of scarce resources within healthcare systems, addressing complex challenges that involve both cost and quality of care.

* **Examples:** Applications include optimizing medical resource allocation in hospital emergency departments (EDs) to address overcrowding, personnel shift scheduling for nurses and doctors, and strategic hospital management decisions.14 Key discrete decisions involve determining the  
  *number* of doctors, nurses, lab technicians, or other medical equipment to allocate.14 For example, a mixed-integer linear programming problem can be used to optimally schedule homogeneous personnel's shifts in hospitals, taking into account days off and the number of staff required per shift to comply with labor laws and minimize staff payroll costs.14  
* **Objectives:** Typical objectives in healthcare MOMIP models are minimizing average patient length of stay, reducing medical resource waste and costs, maximizing resource utilization rates, and balancing patient satisfaction.14

### **4.3. Energy Systems Optimization**

MOMIP is extensively applied in energy systems engineering to optimize complex processes and infrastructure, balancing economic, environmental, and operational objectives.

* **Examples:** This includes optimizing the integration of complex industrial systems (considering materials and energy flows), unit commitment and economic dispatch in power grids, transmission expansion planning, energy storage optimization (e.g., battery sizing and operation), microgrid design and operation, and scheduling in additive manufacturing (3D printing) facilities.20 These applications involve discrete decisions such as the binary commitment status of generation units (on/off), the integer number of new transmission lines to be built, or the selection of specific generation and storage assets within a microgrid design.20  
* **Objectives:** Common objectives include minimizing total generation cost, maximizing profit from energy sales, minimizing investment cost in infrastructure, maximizing the value of energy storage, minimizing makespan (completion time), and reducing energy consumption.20 For instance, a multi-objective MILP model can schedule additive manufacturing machines to minimize makespan and energy consumption, demonstrating potential energy savings with minimal impact on completion times.44

## **5\. Post-Optimality Analysis and Decision Support**

Beyond finding optimal solutions, the utility of Multi-Objective Mixed Integer Programming (MOMIP) extends into post-optimality analysis, providing critical tools for decision-makers to understand the implications of the derived trade-offs and the robustness of the solutions.

### **5.1. Interpreting Trade-offs and Pareto Front Analysis**

The Pareto front is an exceptionally powerful visual aid for analyzing the compromises inherent in multi-objective optimization.7 Unlike single-objective optimization, which yields a unique optimum, MOO problems typically result in a Pareto front that represents a continuum of best-fit solutions.8 This collection of non-dominated solutions allows decision-makers to understand the intricate relationships between conflicting objectives, where improving any one objective inevitably compromises at least one other.8

Decision-makers can examine the Pareto front to determine the specific blend of trade-offs that best suits their operational constraints and organizational objectives.8 This involves understanding precisely how much of one objective must be sacrificed to improve another by a certain quantity.1 The Pareto front empowers them to select from a diverse set of optimal compromises that reflect context-specific priorities.8

However, visualizing Pareto fronts becomes increasingly challenging when the number of objectives exceeds two or three, as the Pareto front points become multidimensional.46 This necessitates advanced visualization techniques to help decision-makers comprehend the high-dimensional search space and the interactions between objectives and constraints.33 Tools that can map these spaces into reduced dimensions or provide interactive exploration capabilities are crucial for effective decision-making in many-objective scenarios.33

### **5.2. Sensitivity Analysis in MOMIP**

Sensitivity analysis in MOMIP determines how an optimal solution is affected by changes in parameter values, particularly the coefficients of the objective function.48 For Mixed-Integer Linear Programming (MILP), sensitivity analysis is considerably more computationally demanding than for continuous Linear Programming (LP), often requiring re-optimization rather than simple post-optimal information.48

A multi-objective approach to sensitivity analysis has emerged as a robust method. This approach demonstrates that the sensitivity regions (the range of parameter values for which the current solution remains optimal) can be determined by solving a multi-objective MILP.48 This involves finding the extreme non-dominated points adjacent to the optimal solution of the original single-objective MILP.48 This method is particularly versatile as its applicability is independent of the specific solution method used for multi-objective programming, implying that its computational performance will improve as multi-objective solvers become more efficient.48 For variations in a single objective function coefficient, it suffices to determine the two extreme non-dominated points adjacent to the optimal solution of a bi-objective MILP to obtain the sensitivity region.49 This capability is crucial for understanding the robustness of an optimal decision and for exploring alternative solutions under varying conditions.

## **6\. Conclusions**

Mixed Integer Planning (MIP) stands as a cornerstone in mathematical optimization, uniquely capable of modeling problems that integrate continuous, discrete, and binary decision variables. This inherent flexibility allows for a highly realistic representation of complex real-world systems, ensuring that derived solutions are not only mathematically optimal but also practically feasible and explainable. The explicit encoding of objectives, constraints, and decisions within MIP models contributes to their transparency, a vital attribute for trust and accountability in high-stakes decision environments.

When MIP is extended to Multi-Objective Optimization (MOO), forming Multi-Objective Mixed Integer Programming (MOMIP), the complexity escalates significantly. MOMIP problems are characterized by multiple, often conflicting, objectives and a non-convex feasible region due to the discrete nature of some variables. This non-convexity poses a considerable computational burden, making the identification of the entire Pareto front—the set of optimal trade-off solutions—a challenging task, especially for large-scale or "many-objective" problems. The phenomenon of "relaxed dominance" in many-objective scenarios underscores the need for sophisticated algorithmic adaptations to maintain effective solution search.

To address these challenges, various methodologies are employed. Scalarization techniques, such as the Weighted Sum Method, Epsilon-Constraint Method, and Goal Programming, transform the multi-objective problem into a series of single-objective problems amenable to standard MIP solvers. While the Weighted Sum Method offers simplicity, its limitation in capturing non-convex Pareto fronts is a significant concern for MOMIP. The Epsilon-Constraint Method, conversely, provides a more systematic approach to exploring the entire Pareto front, including non-convex regions, by converting objectives into constraints and parametrically varying their bounds. Goal Programming offers a flexible framework for prioritizing objectives by minimizing deviations from target values.

Beyond scalarization, specialized algorithms like Multi-Objective Branch-and-Bound (MOBB) are developed to directly tackle MOMIP's complexities. These algorithms feature enhancements such as objective branching, advanced probing, and sophisticated node selection rules to navigate the discrete, non-convex solution space more efficiently. For problems where exact solutions are computationally prohibitive, meta-heuristics and evolutionary algorithms provide valuable approximations, offering a practical means to generate a diverse set of near-optimal solutions.

The practical utility of MOMIP is evident across diverse fields. In **supply chain management**, it optimizes complex logistics networks by balancing costs, delivery times, and risks. In **healthcare**, it addresses critical resource allocation challenges, such as minimizing patient wait times while optimizing staff schedules and controlling costs. In **energy systems**, MOMIP facilitates the design and operation of efficient systems by considering economic, environmental, and operational objectives simultaneously.

Ultimately, MOMIP serves as an indispensable framework for strategic decision-making in complex, real-world systems. It moves beyond finding a singular "optimal" point to illuminating a spectrum of optimal compromises, empowering decision-makers to make informed choices that align with their nuanced preferences and organizational priorities. The ongoing research into more efficient algorithms, robust approximation techniques, and advanced post-optimality analysis methods continues to expand the applicability and impact of MOMIP in addressing the most challenging multi-objective problems with discrete components.

#### **引用的著作**

1. Elite Multi-Criteria Decision Making—Pareto Front Optimization in Multi-Objective Optimization \- MDPI, 檢索日期：8月 11, 2025， [https://www.mdpi.com/1999-4893/17/5/206](https://www.mdpi.com/1999-4893/17/5/206)  
2. Optimization problems and objectives | Combinatorial Optimization Class Notes \- Fiveable, 檢索日期：8月 11, 2025， [https://library.fiveable.me/combinatorial-optimization/unit-1/optimization-problems-objectives/study-guide/Oii7tgZQvbYbUlCV](https://library.fiveable.me/combinatorial-optimization/unit-1/optimization-problems-objectives/study-guide/Oii7tgZQvbYbUlCV)  
3. What is Mixed Integer Programming (MIP)? | NVIDIA Glossary, 檢索日期：8月 11, 2025， [https://www.nvidia.com/en-us/glossary/mixed-integer-programming/](https://www.nvidia.com/en-us/glossary/mixed-integer-programming/)  
4. Mixed-Integer Programming (MIP) – A Primer on the Basics \- Gurobi Optimization, 檢索日期：8月 11, 2025， [https://www.gurobi.com/resources/mixed-integer-programming-mip-a-primer-on-the-basics/](https://www.gurobi.com/resources/mixed-integer-programming-mip-a-primer-on-the-basics/)  
5. Discrete Optimization with Decision Diagrams \- andrew.cmu.ed, 檢索日期：8月 11, 2025， [https://www.andrew.cmu.edu/user/vanhoeve/papers/discrete\_opt\_with\_DDs.pdf](https://www.andrew.cmu.edu/user/vanhoeve/papers/discrete_opt_with_DDs.pdf)  
6. Towards Foundation Models for Mixed Integer Linear Programming \- OpenReview, 檢索日期：8月 11, 2025， [https://openreview.net/forum?id=6yENDA7J4G](https://openreview.net/forum?id=6yENDA7J4G)  
7. Multi-objective optimization \- Wikipedia, 檢索日期：8月 11, 2025， [https://en.wikipedia.org/wiki/Multi-objective\_optimization](https://en.wikipedia.org/wiki/Multi-objective_optimization)  
8. Mastering Trade-Offs: Balancing Competing Objectives in Multi-Objective Optimization \- nAG, 檢索日期：8月 11, 2025， [https://nag.com/insights/balancing-competing-objectives-in-multi-objective-optimization/](https://nag.com/insights/balancing-competing-objectives-in-multi-objective-optimization/)  
9. Adaptive weighted-sum method for bi-objective optimization: Pareto ..., 檢索日期：8月 11, 2025， [http://strategic.mit.edu/docs/2\_6a\_SMO\_AWS\_biobjective.pdf](http://strategic.mit.edu/docs/2_6a_SMO_AWS_biobjective.pdf)  
10. Multi-and many-objective optimization: present and future in de novo drug design \- Frontiers, 檢索日期：8月 11, 2025， [https://www.frontiersin.org/journals/chemistry/articles/10.3389/fchem.2023.1288626/full](https://www.frontiersin.org/journals/chemistry/articles/10.3389/fchem.2023.1288626/full)  
11. Multiobjective Integer and Mixed-Integer Linear Programming ..., 檢索日期：8月 11, 2025， [https://www.researchgate.net/publication/300077339\_Multiobjective\_Integer\_and\_Mixed-Integer\_Linear\_Programming](https://www.researchgate.net/publication/300077339_Multiobjective_Integer_and_Mixed-Integer_Linear_Programming)  
12. A literature review of multi-objective programming, 檢索日期：8月 11, 2025， [https://vrs.amsi.org.au/wp-content/uploads/sites/6/2014/09/CORRECTED-YAP\_Research-Paper-Final.pdf](https://vrs.amsi.org.au/wp-content/uploads/sites/6/2014/09/CORRECTED-YAP_Research-Paper-Final.pdf)  
13. Integer and Combinatorial Optimization \- P.C. Rossin College of Engineering & Applied Science \- Lehigh University, 檢索日期：8月 11, 2025， [https://engineering.lehigh.edu/sites/engineering.lehigh.edu/files/\_DEPARTMENTS/ise/pdf/tech-papers/12/12T\_020.pdf](https://engineering.lehigh.edu/sites/engineering.lehigh.edu/files/_DEPARTMENTS/ise/pdf/tech-papers/12/12T_020.pdf)  
14. (PDF) Mixed integer linear programming problem for personnel multi-day shift scheduling: A case study in an Iran hospital \- ResearchGate, 檢索日期：8月 11, 2025， [https://www.researchgate.net/publication/353597861\_Mixed\_integer\_linear\_programming\_problem\_for\_personnel\_multi-day\_shift\_scheduling\_A\_case\_study\_in\_an\_Iran\_hospital](https://www.researchgate.net/publication/353597861_Mixed_integer_linear_programming_problem_for_personnel_multi-day_shift_scheduling_A_case_study_in_an_Iran_hospital)  
15. Epsilon Constraint Method: A Detailed Guide \- Number Analytics, 檢索日期：8月 11, 2025， [https://www.numberanalytics.com/blog/detailed-guide-epsilon-constraint-method](https://www.numberanalytics.com/blog/detailed-guide-epsilon-constraint-method)  
16. Epsilon-Constraint Method in Practice \- Number Analytics, 檢索日期：8月 11, 2025， [https://www.numberanalytics.com/blog/epsilon-constraint-method-applications](https://www.numberanalytics.com/blog/epsilon-constraint-method-applications)  
17. (PDF) A Multi-Objective Optimization for Supply Chain Management ..., 檢索日期：8月 11, 2025， [https://www.researchgate.net/publication/363278484\_A\_Multi-Objective\_Optimization\_for\_Supply\_Chain\_Management\_using\_Artificial\_Intelligence\_AI](https://www.researchgate.net/publication/363278484_A_Multi-Objective_Optimization_for_Supply_Chain_Management_using_Artificial_Intelligence_AI)  
18. A Mixed-Integer Programming Model for Optimizing the Distribution Network of a Packaging Company \- DergiPark, 檢索日期：8月 11, 2025， [https://dergipark.org.tr/tr/download/article-file/4471637](https://dergipark.org.tr/tr/download/article-file/4471637)  
19. Parallel Multi-Objective Branch and Bound \- cs.wisc.edu, 檢索日期：8月 11, 2025， [https://pages.cs.wisc.edu/\~wzh/dtu\_thesis.pdf](https://pages.cs.wisc.edu/~wzh/dtu_thesis.pdf)  
20. Optimizing Energy Systems with MILP \- Number Analytics, 檢索日期：8月 11, 2025， [https://www.numberanalytics.com/blog/ultimate-guide-to-milp-in-energy-systems-engineering](https://www.numberanalytics.com/blog/ultimate-guide-to-milp-in-energy-systems-engineering)  
21. Full article: A review of multi-objective optimization: Methods and its ..., 檢索日期：8月 11, 2025， [https://www.tandfonline.com/doi/full/10.1080/23311916.2018.1502242](https://www.tandfonline.com/doi/full/10.1080/23311916.2018.1502242)  
22. A Survey on Modeling and Optimizing Multi-Objective Systems \- ResearchGate, 檢索日期：8月 11, 2025， [https://www.researchgate.net/publication/316655694\_A\_Survey\_on\_Modeling\_and\_Optimizing\_Multi-Objective\_Systems](https://www.researchgate.net/publication/316655694_A_Survey_on_Modeling_and_Optimizing_Multi-Objective_Systems)  
23. A Review on Multi-Objective Mixed-Integer Non-Linear Optimization Programming Methods, 檢索日期：8月 11, 2025， [https://www.mdpi.com/2673-4117/5/3/104](https://www.mdpi.com/2673-4117/5/3/104)  
24. Goal Programming: Strengths and Weaknesses | PDF | Analysis ..., 檢索日期：8月 11, 2025， [https://www.scribd.com/document/188876388/Goal-Programming](https://www.scribd.com/document/188876388/Goal-Programming)  
25. Goal Programming for Multi-Objective Optimization \- Number Analytics, 檢索日期：8月 11, 2025， [https://www.numberanalytics.com/blog/goal-programming-multi-objective-optimization](https://www.numberanalytics.com/blog/goal-programming-multi-objective-optimization)  
26. Normal-Boundary Intersection: A New Method for Generating the ..., 檢索日期：8月 11, 2025， [https://repository.rice.edu/bitstream/1911/101880/1/TR96-19.pdf](https://repository.rice.edu/bitstream/1911/101880/1/TR96-19.pdf)  
27. (PDF) On the Normal Boundary Intersection Method for Generation ..., 檢索日期：8月 11, 2025， [https://www.researchgate.net/publication/220857976\_On\_the\_Normal\_Boundary\_Intersection\_Method\_for\_Generation\_of\_Efficient\_Front](https://www.researchgate.net/publication/220857976_On_the_Normal_Boundary_Intersection_Method_for_Generation_of_Efficient_Front)  
28. The normalized normal constraint method for generating the Pareto ..., 檢索日期：8月 11, 2025， [https://www.researchgate.net/publication/226918823\_The\_normalized\_normal\_constraint\_method\_for\_generating\_the\_Pareto\_frontier](https://www.researchgate.net/publication/226918823_The_normalized_normal_constraint_method_for_generating_the_Pareto_frontier)  
29. Full article: An extension of the directed search domain algorithm to ..., 檢索日期：8月 11, 2025， [https://www.tandfonline.com/doi/full/10.1080/0305215X.2016.1248960](https://www.tandfonline.com/doi/full/10.1080/0305215X.2016.1248960)  
30. What exact methods are available to solve multi objective optimization problems to find the true Preto front? | ResearchGate, 檢索日期：8月 11, 2025， [https://www.researchgate.net/post/What\_exact\_methods\_are\_available\_to\_solve\_multi\_objective\_optimization\_problems\_to\_find\_the\_true\_Preto\_front](https://www.researchgate.net/post/What_exact_methods_are_available_to_solve_multi_objective_optimization_problems_to_find_the_true_Preto_front)  
31. Enhancing Branch-and-Bound for Multiobjective 0-1 Programming ..., 檢索日期：8月 11, 2025， [https://www.researchgate.net/publication/373880331\_Enhancing\_Branch-and-Bound\_for\_Multiobjective\_0-1\_Programming](https://www.researchgate.net/publication/373880331_Enhancing_Branch-and-Bound_for_Multiobjective_0-1_Programming)  
32. Exact algorithms for multiobjective linear optimization problems with integer variables: A state of the art survey | Request PDF \- ResearchGate, 檢索日期：8月 11, 2025， [https://www.researchgate.net/publication/359162422\_Exact\_algorithms\_for\_multiobjective\_linear\_optimization\_problems\_with\_integer\_variables\_A\_state\_of\_the\_art\_survey](https://www.researchgate.net/publication/359162422_Exact_algorithms_for_multiobjective_linear_optimization_problems_with_integer_variables_A_state_of_the_art_survey)  
33. Visualization in multiobjective optimization | Request PDF \- ResearchGate, 檢索日期：8月 11, 2025， [https://www.researchgate.net/publication/343901841\_Visualization\_in\_multiobjective\_optimization](https://www.researchgate.net/publication/343901841_Visualization_in_multiobjective_optimization)  
34. pymoo: Multi-objective Optimization in Python, 檢索日期：8月 11, 2025， [https://pymoo.org/](https://pymoo.org/)  
35. Multi-objective simulation optimization for medical capacity ..., 檢索日期：8月 11, 2025， [https://www.researchgate.net/publication/272893198\_Multi-objective\_simulation\_optimization\_for\_medical\_capacity\_allocation\_in\_emergency\_department](https://www.researchgate.net/publication/272893198_Multi-objective_simulation_optimization_for_medical_capacity_allocation_in_emergency_department)  
36. Multi-Objective Energy Optimization with Load and Distributed Energy Source Scheduling in the Smart Power Grid \- MDPI, 檢索日期：8月 11, 2025， [https://www.mdpi.com/2071-1050/15/13/9970](https://www.mdpi.com/2071-1050/15/13/9970)  
37. Multi-objective optimization for supply chain management problem: A literature review \- Growing Science, 檢索日期：8月 11, 2025， [https://www.growingscience.com/dsl/Vol5/dsl\_2015\_45.pdf](https://www.growingscience.com/dsl/Vol5/dsl_2015_45.pdf)  
38. Optimizing Supply Chain Inventory: A Mixed Integer Linear Programming Approach \- MDPI, 檢索日期：8月 11, 2025， [https://www.mdpi.com/2079-8954/13/1/33](https://www.mdpi.com/2079-8954/13/1/33)  
39. What is Mixed Integer Programming (MIP)? | NVIDIA Glossary, 檢索日期：8月 11, 2025， [https://www.nvidia.com/en-in/glossary/mixed-integer-programming/](https://www.nvidia.com/en-in/glossary/mixed-integer-programming/)  
40. A Mixed-Integer Linear Programming Formulation for Optimizing Multi-Scale Material and Energy Integration \- Frontiers, 檢索日期：8月 11, 2025， [https://www.frontiersin.org/journals/energy-research/articles/10.3389/fenrg.2020.00049/full](https://www.frontiersin.org/journals/energy-research/articles/10.3389/fenrg.2020.00049/full)  
41. Multiobjective Optimization of Mixed-Integer Linear Programming Problems: A Multiparametric Optimization Approach \- PMC \- National Institutes of Health (NIH) |, 檢索日期：8月 11, 2025， [https://pmc.ncbi.nlm.nih.gov/articles/PMC8248908/](https://pmc.ncbi.nlm.nih.gov/articles/PMC8248908/)  
42. Energy System Optimization Models \- Emergent Mind, 檢索日期：8月 11, 2025， [https://www.emergentmind.com/topics/energy-system-optimization-models](https://www.emergentmind.com/topics/energy-system-optimization-models)  
43. Energy Efficiency through MILP Optimization \- Number Analytics, 檢索日期：8月 11, 2025， [https://www.numberanalytics.com/blog/energy-efficiency-through-milp-optimization](https://www.numberanalytics.com/blog/energy-efficiency-through-milp-optimization)  
44. Multi-Objective MILP Models for Optimizing Makespan and Energy Consumption in Additive Manufacturing Systems \- MDPI, 檢索日期：8月 11, 2025， [https://www.mdpi.com/2673-4591/97/1/28](https://www.mdpi.com/2673-4591/97/1/28)  
45. Trade-off analysis approach for interactive nonlinear multiobjective optimization \- DiVA portal, 檢索日期：8月 11, 2025， [http://www.diva-portal.org/smash/get/diva2:482939/FULLTEXT01.pdf](http://www.diva-portal.org/smash/get/diva2:482939/FULLTEXT01.pdf)  
46. Visualization of Pareto Front Points when Solving Multi-objective Optimization Problems \- SciSpace, 檢索日期：8月 11, 2025， [https://scispace.com/pdf/visualization-of-pareto-front-points-when-solving-multi-2ftfzcaf7p.pdf](https://scispace.com/pdf/visualization-of-pareto-front-points-when-solving-multi-2ftfzcaf7p.pdf)  
47. Visualization-aided Multi-Criteria Decision-Making using Interpretable Self-Organizing Maps, 檢索日期：8月 11, 2025， [https://www.egr.msu.edu/\~kdeb/papers/c2023011.pdf](https://www.egr.msu.edu/~kdeb/papers/c2023011.pdf)  
48. MILP sensitivity analysis for the objective function coefficients \- Lars Relund Nielsen, 檢索日期：8月 11, 2025， [https://www.research.relund.dk/publications/pdf/andersen23.pdf](https://www.research.relund.dk/publications/pdf/andersen23.pdf)  
49. MILP Sensitivity Analysis for the Objective Function Coefficients \- Bohrium, 檢索日期：8月 11, 2025， [https://www.bohrium.com/paper-details/milp-sensitivity-analysis-for-the-objective-function-coefficients/864973578863378533-61189](https://www.bohrium.com/paper-details/milp-sensitivity-analysis-for-the-objective-function-coefficients/864973578863378533-61189)