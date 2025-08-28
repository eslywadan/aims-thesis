import time
import random
from ortools.linear_solver import pywraplp
from ortools.sat.python import cp_model
import numpy as np

class MultiCommodityFlowProblem:
    def __init__(self, num_nodes=20, num_edges=50, num_commodities=5, max_capacity=100):
        """Generate a random multi-commodity flow problem instance"""
        self.num_nodes = num_nodes
        self.num_commodities = num_commodities
        self.max_capacity = max_capacity
        
        # Generate random network structure
        random.seed(42)  # For reproducibility
        np.random.seed(42)
        
        self._generate_network()
        self._generate_commodities()
        self._validate_problem()
    
    def _generate_network(self):
        """Generate the network topology"""
        
        # Create edges (ensuring connectivity)
        self.edges = []
        self.edge_capacities = {}
        self.edge_costs = {}
        
        # First ensure connectivity with a spanning tree
        for i in range(1, self.num_nodes):
            parent = random.randint(0, i-1)
            # Add both directions for undirected graph
            edge1 = (parent, i)
            edge2 = (i, parent)
            self.edges.extend([edge1, edge2])
            capacity = random.randint(80, self.max_capacity)  # Higher capacity
            self.edge_capacities[edge1] = capacity
            self.edge_capacities[edge2] = capacity
            # Different costs for different commodities
            costs = [random.randint(1, 5) for _ in range(self.num_commodities)]
            self.edge_costs[edge1] = costs
            self.edge_costs[edge2] = costs
        
        # Add additional random edges (both directions)
        target_edges = min(50, self.num_nodes * (self.num_nodes - 1))  # Cap total edges
        additional_edges = target_edges - len(self.edges)
        added = 0
        attempts = 0
        while added < additional_edges and attempts < additional_edges * 3:
            u = random.randint(0, self.num_nodes-1)
            v = random.randint(0, self.num_nodes-1)
            if u != v and (u, v) not in self.edges:
                edge1 = (u, v)
                edge2 = (v, u)
                self.edges.extend([edge1, edge2])
                capacity = random.randint(60, self.max_capacity)
                self.edge_capacities[edge1] = capacity
                self.edge_capacities[edge2] = capacity
                costs = [random.randint(1, 5) for _ in range(self.num_commodities)]
                self.edge_costs[edge1] = costs
                self.edge_costs[edge2] = costs
                added += 2
            attempts += 1
    
    def _generate_commodities(self):
        """Generate supply/demand for each commodity ensuring feasibility"""
        
        # Generate supply/demand for each commodity
        self.supply_demand = {}
        for k in range(self.num_commodities):
            supply_demand_k = [0] * self.num_nodes
            
            # Create exactly balanced supply and demand
            # Choose source and sink nodes (ensure they're different)
            available_nodes = list(range(self.num_nodes))
            num_sources = min(2, self.num_nodes // 3)  # Fewer sources
            num_sinks = min(2, self.num_nodes // 3)    # Fewer sinks
            
            source_nodes = random.sample(available_nodes, num_sources)
            remaining_nodes = [n for n in available_nodes if n not in source_nodes]
            sink_nodes = random.sample(remaining_nodes, min(num_sinks, len(remaining_nodes)))
            
            # Generate smaller, more manageable supplies
            total_supply = 0
            supply_per_source = 40 // num_sources  # Distribute supply more evenly
            for node in source_nodes:
                supply = supply_per_source + random.randint(-5, 10)
                supply = max(10, supply)  # Minimum supply
                supply_demand_k[node] = supply
                total_supply += supply
            
            # Generate demands that exactly balance supply
            if len(sink_nodes) > 1:
                remaining_demand = total_supply
                for i, node in enumerate(sink_nodes[:-1]):
                    max_demand = min(remaining_demand - (len(sink_nodes) - i - 1) * 5, remaining_demand // 2)
                    demand = random.randint(5, max(5, max_demand))
                    supply_demand_k[node] = -demand
                    remaining_demand -= demand
                # Last sink gets remaining demand
                if remaining_demand > 0:
                    supply_demand_k[sink_nodes[-1]] = -remaining_demand
            else:
                supply_demand_k[sink_nodes[0]] = -total_supply
            
            # Verify balance
            balance = sum(supply_demand_k)
            if abs(balance) > 1e-6:
                print(f"Warning: Commodity {k} not balanced: {balance}")
                # Fix balance by adjusting the last sink
                if sink_nodes:
                    supply_demand_k[sink_nodes[-1]] -= balance
            
            self.supply_demand[k] = supply_demand_k
    
    def _validate_problem(self):
        """Validate that the problem is well-formed"""
        print(f"Problem validation:")
        print(f"  Nodes: {self.num_nodes}, Edges: {len(self.edges)}, Commodities: {self.num_commodities}")
        
        # Check flow balance for each commodity
        for k in range(self.num_commodities):
            balance = sum(self.supply_demand[k])
            total_supply = sum(max(0, x) for x in self.supply_demand[k])
            total_demand = sum(min(0, x) for x in self.supply_demand[k])
            print(f"  Commodity {k}: Supply={total_supply}, Demand={total_demand}, Balance={balance}")
            
        # Check if network has sufficient capacity
        total_capacity = sum(self.edge_capacities[edge] for edge in self.edges) // 2  # Divide by 2 for bidirectional
        total_flow_needed = sum(sum(max(0, x) for x in self.supply_demand[k]) for k in range(self.num_commodities))
        print(f"  Total edge capacity: {total_capacity}, Total flow needed: {total_flow_needed}")
        
        if total_capacity < total_flow_needed:
            print(f"  WARNING: Insufficient capacity! Ratio: {total_capacity/total_flow_needed:.2f}")
        else:
            print(f"  Capacity looks sufficient. Ratio: {total_capacity/total_flow_needed:.2f}")
    
    def solve_with_ip(self):
        """Solve using Integer Programming (Linear Solver)"""
        print("Solving with Integer Programming...")
        start_time = time.time()
        
        # Create solver
        solver = pywraplp.Solver.CreateSolver('SCIP')
        if not solver:
            print("SCIP solver unavailable")
            return None
        
        # Decision variables: flow[edge][commodity]
        flow_vars = {}
        for edge in self.edges:
            for k in range(self.num_commodities):
                var_name = f'flow_{edge[0]}_{edge[1]}_c{k}'
                flow_vars[(edge, k)] = solver.IntVar(0, self.edge_capacities[edge], var_name)
        
        # Capacity constraints
        for edge in self.edges:
            constraint = solver.Constraint(0, self.edge_capacities[edge])
            for k in range(self.num_commodities):
                constraint.SetCoefficient(flow_vars[(edge, k)], 1)
        
        # Flow conservation constraints
        for node in range(self.num_nodes):
            for k in range(self.num_commodities):
                constraint = solver.Constraint(
                    self.supply_demand[k][node], 
                    self.supply_demand[k][node]
                )
                
                # Outgoing flow (positive) - Incoming flow (negative)
                for edge in self.edges:
                    if edge[0] == node:  # Outgoing edge
                        constraint.SetCoefficient(flow_vars[(edge, k)], 1)
                    elif edge[1] == node:  # Incoming edge
                        constraint.SetCoefficient(flow_vars[(edge, k)], -1)
        
        # Objective: minimize total cost
        objective = solver.Objective()
        for edge in self.edges:
            for k in range(self.num_commodities):
                cost = self.edge_costs[edge][k]
                objective.SetCoefficient(flow_vars[(edge, k)], cost)
        objective.SetMinimization()
        
        # Solve
        solver.SetTimeLimit(60000)  # 60 seconds
        status = solver.Solve()
        
        solve_time = time.time() - start_time
        
        if status == pywraplp.Solver.OPTIMAL:
            print(f"IP Solution found in {solve_time:.3f} seconds")
            print(f"Optimal cost: {solver.Objective().Value()}")
            return {
                'status': 'OPTIMAL',
                'objective': solver.Objective().Value(),
                'time': solve_time,
                'solver_info': f"Nodes: {solver.nodes()}, Iterations: {solver.iterations()}"
            }
        elif status == pywraplp.Solver.FEASIBLE:
            print(f"IP found feasible solution in {solve_time:.3f} seconds")
            print(f"Best cost: {solver.Objective().Value()}")
            return {
                'status': 'FEASIBLE',
                'objective': solver.Objective().Value(),
                'time': solve_time,
                'solver_info': f"Nodes: {solver.nodes()}, Iterations: {solver.iterations()}"
            }
        else:
            print(f"IP failed: Status {status} in {solve_time:.3f} seconds")
            if status == pywraplp.Solver.INFEASIBLE:
                print("Problem is infeasible")
            elif status == pywraplp.Solver.UNBOUNDED:
                print("Problem is unbounded")
            return {
                'status': 'FAILED',
                'objective': None,
                'time': solve_time,
                'solver_info': f"Status: {status}"
            }
    
    def solve_with_cp(self):
        """Solve using Constraint Programming (CP-SAT)"""
        print("\nSolving with Constraint Programming...")
        start_time = time.time()
        
        model = cp_model.CpModel()
        
        # Decision variables
        flow_vars = {}
        for edge in self.edges:
            for k in range(self.num_commodities):
                var_name = f'flow_{edge[0]}_{edge[1]}_c{k}'
                flow_vars[(edge, k)] = model.NewIntVar(
                    0, self.edge_capacities[edge], var_name
                )
        
        # Capacity constraints
        for edge in self.edges:
            model.Add(
                sum(flow_vars[(edge, k)] for k in range(self.num_commodities)) 
                <= self.edge_capacities[edge]
            )
        
        # Flow conservation constraints
        for node in range(self.num_nodes):
            for k in range(self.num_commodities):
                outgoing_flow = []
                incoming_flow = []
                
                for edge in self.edges:
                    if edge[0] == node:  # Outgoing edge
                        outgoing_flow.append(flow_vars[(edge, k)])
                    elif edge[1] == node:  # Incoming edge
                        incoming_flow.append(flow_vars[(edge, k)])
                
                # Net flow = outgoing - incoming = supply/demand
                if outgoing_flow or incoming_flow:
                    outgoing_sum = sum(outgoing_flow) if outgoing_flow else 0
                    incoming_sum = sum(incoming_flow) if incoming_flow else 0
                    model.Add(outgoing_sum - incoming_sum == self.supply_demand[k][node])
        
        # Objective: minimize total cost
        cost_terms = []
        for edge in self.edges:
            for k in range(self.num_commodities):
                cost = self.edge_costs[edge][k]
                cost_terms.append(flow_vars[(edge, k)] * cost)
        
        model.Minimize(sum(cost_terms))
        
        # Solve
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 60  # 60 seconds
        solver.parameters.log_search_progress = False  # Reduce output
        
        status = solver.Solve(model)
        solve_time = time.time() - start_time
        
        if status == cp_model.OPTIMAL:
            print(f"CP Solution found in {solve_time:.3f} seconds")
            print(f"Optimal cost: {solver.ObjectiveValue()}")
            return {
                'status': 'OPTIMAL',
                'objective': solver.ObjectiveValue(),
                'time': solve_time,
                'solver_info': f"Branches: {solver.NumBranches()}, Conflicts: {solver.NumConflicts()}"
            }
        elif status == cp_model.FEASIBLE:
            print(f"CP found feasible solution in {solve_time:.3f} seconds")
            print(f"Best cost found: {solver.ObjectiveValue()}")
            return {
                'status': 'FEASIBLE',
                'objective': solver.ObjectiveValue(),
                'time': solve_time,
                'solver_info': f"Branches: {solver.NumBranches()}, Conflicts: {solver.NumConflicts()}"
            }
        else:
            print(f"CP failed: Status {status} in {solve_time:.3f} seconds")
            if status == cp_model.INFEASIBLE:
                print("Problem is infeasible")
            elif status == cp_model.MODEL_INVALID:
                print("Model is invalid")
            return {
                'status': 'FAILED',
                'objective': None,
                'time': solve_time,
                'solver_info': f"Status: {status}, Branches: {solver.NumBranches()}"
            }

def run_comparison():
    """Run comparison between IP and CP approaches"""
    print("=" * 60)
    print("MULTI-COMMODITY FLOW PROBLEM: IP vs CP COMPARISON")
    print("=" * 60)
    
    # Test different problem sizes
    test_cases = [
        {'nodes': 8, 'edges': 16, 'commodities': 2, 'name': 'Small'},
        {'nodes': 12, 'edges': 28, 'commodities': 3, 'name': 'Medium'},
        {'nodes': 15, 'edges': 40, 'commodities': 4, 'name': 'Large'},
    ]
    
    results = []
    
    for case in test_cases:
        print(f"\n{case['name']} Problem:")
        print(f"Nodes: {case['nodes']}, Edges: {case['edges']}, Commodities: {case['commodities']}")
        print("-" * 40)
        
        # Create problem instance
        problem = MultiCommodityFlowProblem(
            num_nodes=case['nodes'],
            num_edges=case['edges'], 
            num_commodities=case['commodities']
        )
        
        print("")  # Add space after validation output
        
        # Solve with both methods
        ip_result = problem.solve_with_ip()
        cp_result = problem.solve_with_cp()
        
        results.append({
            'case': case['name'],
            'ip': ip_result,
            'cp': cp_result
        })
        
        # Print comparison
        print(f"\nComparison for {case['name']} case:")
        if ip_result['status'] == 'OPTIMAL' and cp_result['status'] in ['OPTIMAL', 'FEASIBLE']:
            speedup = cp_result['time'] / ip_result['time'] if ip_result['time'] > 0 else float('inf')
            print(f"IP time: {ip_result['time']:.3f}s, CP time: {cp_result['time']:.3f}s")
            print(f"Speedup (CP/IP): {speedup:.2f}x {'(IP faster)' if speedup > 1 else '(CP faster)'}")
            
            if ip_result['objective'] and cp_result['objective']:
                quality = (cp_result['objective'] - ip_result['objective']) / ip_result['objective'] * 100
                print(f"Solution quality difference: {quality:.1f}%")
        elif ip_result['status'] == 'OPTIMAL':
            print(f"IP found optimal solution in {ip_result['time']:.3f}s, CP failed")
        elif cp_result['status'] in ['OPTIMAL', 'FEASIBLE']:
            print(f"CP found solution in {cp_result['time']:.3f}s, IP failed")
        else:
            print("Both solvers failed to find solutions")
        
        print(f"IP: {ip_result['solver_info']}")
        print(f"CP: {cp_result['solver_info']}")
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    ip_wins = sum(1 for r in results if r['ip']['status'] == 'OPTIMAL' and 
                  (r['cp']['status'] not in ['OPTIMAL', 'FEASIBLE'] or 
                   r['ip']['time'] < r['cp']['time']))
    
    ip_solves = sum(1 for r in results if r['ip']['status'] == 'OPTIMAL')
    cp_solves = sum(1 for r in results if r['cp']['status'] in ['OPTIMAL', 'FEASIBLE'])
    
    print(f"Integer Programming solved {ip_solves}/{len(results)} cases optimally")
    print(f"Constraint Programming solved {cp_solves}/{len(results)} cases")
    print(f"IP was faster in {ip_wins}/{len(results)} cases where both succeeded")
    print("\nKey observations:")
    print("- IP typically finds optimal solutions faster for network flow problems")
    print("- IP benefits from efficient network simplex algorithms and LP relaxations") 
    print("- CP struggles with large search spaces in flow variables")
    print("- CP may find good feasible solutions but takes longer to prove optimality")

if __name__ == "__main__":
    run_comparison()