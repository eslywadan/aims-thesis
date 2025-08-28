package cp_scheduling;

import java.io.PrintWriter;
import java.io.File;
import java.io.PrintStream;
import java.util.ArrayList;
import java.util.List;

import com.google.ortools.sat.CpModel;
import com.google.ortools.sat.CpSolver;
import com.google.ortools.sat.CpSolverStatus;
import com.google.ortools.sat.IntVar;
import com.google.ortools.sat.IntervalVar;

import cp_scheduling.SchedJobShop.DataReader;
import cp_scheduling.SchedJobShop.IntervalVarList;
import ilog.concert.IloException;
import ilog.concert.IloIntExpr;
import ilog.concert.IloIntervalVar;

public class SchedJobShopORTools {

	static {
		System.loadLibrary("jniortools");
	}

	public static void scheduleFromDirectory(int dataset_id, String foldername, int timeout,int n_workers) throws Exception {
		scheduleFromDirectory(dataset_id,foldername, timeout, n_workers, false);
	}
	
	public static void scheduleFromDirectory(int dataset_id, String foldername, int timeout,int n_workers,boolean justInstantiation) throws Exception {
		
		String outFile = "ORT_Adv_"+INFO.dataset_folder[dataset_id].substring(15, 20)+"_" + foldername + "_"+timeout+"_"+n_workers+"_v777810.csv";
		String inFile = INFO.dataset_folder[dataset_id]+ foldername + "/";
		
		if (justInstantiation) {
			System.out.println("Using Adv ORTools Solver to JUST INSTANTIATE:\ninput= " + inFile + "\noutput= " + outFile
					+ "\ntimeout= " + timeout);
			outFile = outFile.substring(0,outFile.length()-4)+"_inst.csv";
		}
		else {
			System.out.println("++Using Advanced ORTools Solver to solve:\ninput= " + inFile + "\noutput= " + outFile
					+ "\ntimeout= " + timeout);
		// Save original out stream.
	    PrintStream originalOut = System.out;

        // Create a new file output stream.
        
        PrintStream fileOut = new PrintStream(Main.RESULTS_PATH + outFile.substring(0,outFile.length()-3)+"txt");

        // Redirect standard out to file.
        System.setOut(fileOut);
		}
		
		
		PrintWriter writer = new PrintWriter(Main.RESULTS_PATH + outFile, "UTF-8");
		File[] files = new File(inFile).listFiles();
		// If this pathname does not denote a directory, then listFiles() returns null.
		int i = 0;
		for (File file : files)
			if (file.isFile()){
				i++;
				System.out.println("Solving instance"+file.getName()+" "+i+"/"+files.length);
				writer.println(scheduleFromFile(dataset_id, inFile, file.getName(), timeout,justInstantiation,n_workers));
			}
		// writer.println(filename+";"+solver.objectiveValue()+";"+solver.wallTime()+";"+optimal);
		writer.close();
	}

	public static String scheduleFromFile(int dataset_id, String folder, String filename, int timeout,boolean justInstantiation,int n_workers) throws Exception {
		long startTime = System.currentTimeMillis();
		CpModel model = new CpModel();
		CpSolver solver = new CpSolver();
		// Three weeks.
		int horizon = 0;
		if (filename == null)
			filename = Main.DATA_PATH + "jobshop_abz7.data";

		int nJobs, nMachines;
		int boundary;
		System.out.println("Solving instance: " + filename);

		DataReader data = new DataReader(folder + filename);

		// calculating horizon
		nJobs = data.next();
		nMachines = data.next();

		for (int i = 0; i < nJobs; i++) {
			int m, d;
			for (int j = 0; j < nMachines; j++) {
				m = data.next();
				d = data.next();
				horizon += d;
			}
		}
		System.out.println("Calculated horizon is " + horizon);

		data = new DataReader(folder + filename);
		nJobs = data.next();
		nMachines = data.next();
		IntVar[] lastOpsEnds = new IntVar[nJobs];
		ArrayList<IntervalVar>[] machines = (ArrayList<IntervalVar>[]) new ArrayList[nMachines];
//initialization of machines array list
		for (int j = 0; j < nMachines; j++)
            machines[j] = new ArrayList<IntervalVar>();
		
		for (int i = 0; i < nJobs; i++) {
			IntVar endPrec = null;
			int m, d;
			IntVar start, end;
			IntervalVar op;
			boundary = nMachines;
            if (dataset_id == 1)
                boundary = nMachines*nJobs;
			for (int j = 0; j < boundary; j++) {//this condition is  nMachines*nJobs just for the bench instances. normally should be  nMachines
				m = data.next();
				d = data.next();
				if (m == -1)
					break;
				start = model.newIntVar(0, horizon, "start" + (i * nJobs + j));

				end = model.newIntVar(0, horizon, "end" + (i * nJobs + j));
				op = model.newIntervalVar(start, d, end, "op" + (i * nJobs + j));
				
				machines[m].add(op);
				if (j > 0) {
					model.addLessOrEqual(endPrec, start);
				}
				endPrec = end;
			}
			lastOpsEnds[i] = endPrec;
		}
		
		for (int j = 0; j < nMachines; j++) {
			IntervalVar[] machine = new IntervalVar[machines[j].size()];
			machines[j].toArray(machine);
			model.addNoOverlap(machine);
			
		}

		// Makespan objective.
		IntVar obj = model.newIntVar(0, horizon, "makespan");
		model.addMaxEquality(obj, lastOpsEnds);
		model.minimize(obj);
		System.out.println("Instantiation finished, starting solving...");
		// Creates a solver and solves the model.
		
		solver.getParameters().setMaxTimeInSeconds(timeout);
		solver.getParameters().setNumSearchWorkers(n_workers);
		MySolutionCallback mSC = new MySolutionCallback();
		long stopTime = System.currentTimeMillis();
        double instantiation_time = (double)(stopTime - startTime)/1000;
        if (justInstantiation)
        	return (filename + ";" +instantiation_time);
		CpSolverStatus status = solver.solveWithSolutionCallback(model, mSC);
		String optimal = "No";
		if (status == CpSolverStatus.OPTIMAL) {
			System.out.println("Optimal Schedule Length: " + solver.objectiveValue());
			optimal = "Yes";
		} else
			System.out.println("Non Optimal Schedule Length: " + solver.objectiveValue());
		System.out.println("Solver Walltime: " + solver.wallTime());

		return (filename + ";" + solver.objectiveValue() + ";" + solver.wallTime() + ";" + optimal+";"+solver.numBranches()+";"+solver.numConflicts());
	}



public static String scheduleFromeEdbFile(String folder, String filename, int timeout,boolean justInstantiation) throws Exception {
		long startTime = System.currentTimeMillis();
		CpModel model = new CpModel();
		CpSolver solver = new CpSolver();
		// Three weeks.
		int horizon = 0;
		if (filename == null)
			filename = Main.DATA_PATH + "jobshop_abz7.data";

		int nJobs, nMachines;
		System.out.println("Solving instance: " + filename);

		DataReader data = new DataReader(folder + filename);

		// calculating horizon
		nJobs = data.next();
		nMachines = data.next();

		for (int i = 0; i < nJobs; i++) {
			int m, d;
			for (int j = 0; j < nMachines; j++) {
				m = data.next();
				d = data.next();
				horizon += d;
			}
		}
		System.out.println("Calculated horizon is " + horizon);

		data = new DataReader(folder + filename);
		nJobs = data.next();
		nMachines = data.next();
		IntVar[] lastOpsEnds = new IntVar[nJobs];
		ArrayList<IntervalVar>[] machines = (ArrayList<IntervalVar>[]) new ArrayList[nMachines];

		for (int i = 0; i < nJobs; i++) {
			IntVar endPrec = null;
			int m, d;
			IntVar start, end;
			IntervalVar op;
			for (int j = 0; j < nMachines; j++) {
				m = data.next();
				d = data.next();
				if (m == -1)
					break;
				start = model.newIntVar(0, horizon, "start" + (i * nJobs + j));

				end = model.newIntVar(0, horizon, "end" + (i * nJobs + j));
				op = model.newIntervalVar(start, d, end, "op" + (i * nJobs + j));
				if (machines[m] == null)
					machines[m] = new ArrayList<IntervalVar>();
				machines[m].add(op);
				if (j > 0) {
					model.addLessOrEqual(endPrec, start);
				}
				endPrec = end;
			}
			lastOpsEnds[i] = endPrec;
		}

		for (int j = 0; j < nMachines; j++) {
			IntervalVar[] machine = new IntervalVar[machines[j].size()];
			machines[j].toArray(machine);
			model.addNoOverlap(machine);
			
		}

		// Makespan objective.
		IntVar obj = model.newIntVar(0, horizon, "makespan");
		model.addMaxEquality(obj, lastOpsEnds);
		model.minimize(obj);
		System.out.println("Instantiation finished, starting solving...");
		// Creates a solver and solves the model.
		
		solver.getParameters().setMaxTimeInSeconds(timeout);
		MySolutionCallback mSC = new MySolutionCallback();
		long stopTime = System.currentTimeMillis();
        double instantiation_time = (double)(stopTime - startTime)/1000;
        if (justInstantiation)
        	return (filename + ";" +instantiation_time);
		CpSolverStatus status = solver.solveWithSolutionCallback(model, mSC);
		String optimal = "No";
		if (status == CpSolverStatus.OPTIMAL) {
			System.out.println("Optimal Schedule Length: " + solver.objectiveValue());
			optimal = "Yes";
		} else
			System.out.println("Non Optimal Schedule Length: " + solver.objectiveValue());
		System.out.println("Solver Walltime: " + solver.wallTime());

		return (filename + ";" + solver.objectiveValue() + ";" + solver.wallTime() + ";" + optimal+";"+solver.numBranches()+";"+solver.numConflicts());
	}
}

/*
 * DataReader data = new DataReader(filename); try { nbJobs = data.next();
 * nbMachines = data.next(); List<IloIntExpr> ends = new
 * ArrayList<IloIntExpr>(); IntervalVarList[] machines = new
 * IntervalVarList[nbMachines]; for (int j = 0; j < nbMachines; j++) machines[j]
 * = new IntervalVarList();
 * 
 * for (int i = 0; i < nbJobs; i++) { IloIntervalVar prec = cp.intervalVar();
 * for (int j = 0; j < nbMachines; j++) { int m, d; m = data.next(); d =
 * data.next(); IloIntervalVar ti = cp.intervalVar(d); machines[m].add(ti); if
 * (j > 0) { cp.add(cp.endBeforeStart(prec, ti)); } prec = ti; }
 * ends.add(cp.endOf(prec)); }
 * 
 * for (int j = 0; j < nbMachines; j++)
 * cp.add(cp.noOverlap(machines[j].toArray()));
 * 
 */
/*
 * // Task 0, duration 2. IntVar start0 = model.newIntVar(0, horizon, "start0");
 * int duration0 = 2; IntVar end0 = model.newIntVar(0, horizon, "end0");
 * IntervalVar task0 = model.newIntervalVar(start0, duration0, end0, "task0");
 * 
 * // Task 1, duration 4. IntVar start1 = model.newIntVar(0, horizon, "start1");
 * int duration1 = 4; IntVar end1 = model.newIntVar(0, horizon, "end1");
 * IntervalVar task1 = model.newIntervalVar(start1, duration1, end1, "task1");
 * 
 * // Task 2, duration 3. IntVar start2 = model.newIntVar(0, horizon, "start2");
 * int duration2 = 3; IntVar end2 = model.newIntVar(0, horizon, "end2");
 * IntervalVar task2 = model.newIntervalVar(start2, duration2, end2, "task2");
 * 
 * model.addLessOrEqual(end2, start1); model.addLessOrEqual(end1, start0); //
 * Weekends. IntervalVar weekend0 = model.newFixedInterval(5, 2, "weekend0");
 * IntervalVar weekend1 = model.newFixedInterval(12, 2, "weekend1"); IntervalVar
 * weekend2 = model.newFixedInterval(19, 2, "weekend2");
 * 
 * // No Overlap constraint. This constraint enforces that no two intervals can
 * overlap. // In this example, as we use 3 fixed intervals that span over
 * weekends, this constraint makes // sure that all tasks are executed on
 * weekdays. model.addNoOverlap(new IntervalVar[] {task0, task1, task2,
 * weekend0, weekend1, weekend2});
 * 
 * // Makespan objective. IntVar obj = model.newIntVar(0, horizon, "makespan");
 * model.addMaxEquality(obj, new IntVar[] {end0, end1, end2});
 * model.minimize(obj);
 * 
 * // Creates a solver and solves the model. CpSolver solver = new CpSolver();
 * CpSolverStatus status = solver.solve(model);
 * 
 * if (status == CpSolverStatus.OPTIMAL) {
 * System.out.println("Optimal Schedule Length: " + solver.objectiveValue());
 * System.out.println("Task 0 starts at " + solver.value(start0));
 * System.out.println("Task 1 starts at " + solver.value(start1));
 * System.out.println("Task 2 starts at " + solver.value(start2)); } } }
 */