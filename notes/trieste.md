# Trieste

- Known from the paper 2202.12848v1.pdf [A Robust Multi-Objective Bayesian Optimization
Framework Considering Input Uncertainty](./2202.12848v1.pdf)

- The above has used the package to do experiment


## Getting started (copy from https://github.com/secondmind-labs/trieste Reame)
Here's a quick overview of the main components of a Bayesian optimization loop. For more details, see our Documentation where we have multiple Tutorials covering both the basic functionalities of the toolbox, as well as more advanced usage.

Let's set up a synthetic black-box objective function we wish to minimize, for example, a popular Branin optimization function, and generate some initial data

```python
from trieste.objectives import Branin, mk_observer

observer = mk_observer(Branin.objective)

initial_query_points = Branin.search_space.sample(5)
initial_data = observer(initial_query_points)
```

First step is to create a probabilistic model of the objective function, for example a Gaussian Process model

```python
from trieste.models.gpflow import build_gpr, GaussianProcessRegression

gpflow_model = build_gpr(initial_data, Branin.search_space)
model = GaussianProcessRegression(gpflow_model)
Next ingredient is to choose an acquisition rule and acquisition function

from trieste.acquisition import EfficientGlobalOptimization, ExpectedImprovement

acquisition_rule = EfficientGlobalOptimization(ExpectedImprovement())
```

Finally, we optimize the acquisition function using our model for a number of steps and we check the obtained minimum

```python
from trieste.bayesian_optimizer import BayesianOptimizer

bo = BayesianOptimizer(observer, Branin.search_space)
num_steps = 15
result = bo.optimize(num_steps, initial_data, model)
query_point, observation, arg_min_idx = result.try_get_optimal_point()
```

