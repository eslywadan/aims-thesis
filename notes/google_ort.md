# Google's OR-Tools

 Google's OR-Tools and its solvers
***

### CP-SAT

**CP-SAT** is the recommended solver for **discrete optimization problems**. It's a hybrid solver that combines techniques from constraint programming, satisfiability (SAT) solving, and linear programming. It is specifically designed to work with integer variables.

***

### MPSolver and SCIP

The wrapper for **SCIP**. OR-Tools uses a wrapper called **MPSolver** that provides a unified interface to various third-party linear programming (LP) and mixed-integer programming (MIP) solvers, including **SCIP**. Therefore, SCIP isn't a native OR-Tools solver but one that can be used through the MPSolver interface.

MPSolver is used for problems with both **continuous** and **integer variables** (Mixed-Integer Programming or MIP), as well as pure continuous problems (Linear Programming or LP). SCIP itself is a powerful solver for MIP and mixed-integer nonlinear programming (MINLP), which makes it suitable for problems with continuous numbers.