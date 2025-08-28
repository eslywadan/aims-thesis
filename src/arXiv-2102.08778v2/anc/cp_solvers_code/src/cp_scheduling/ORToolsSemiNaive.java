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
import com.google.ortools.sat.Literal;
import com.google.ortools.sat.IntervalVar;

import cp_scheduling.SchedJobShop.DataReader;
import cp_scheduling.SchedJobShop.IntervalVarList;
import ilog.concert.IloException;
import ilog.concert.IloIntExpr;
import ilog.concert.IloIntervalVar;

public class ORToolsSemiNaive {

	static {
		System.loadLibrary("jniortools");
	}

	public static void scheduleFromDirectory(String foldername, boolean large, int timeout) throws Exception {
		scheduleFromDirectory(foldername, large, timeout, false);
	}
	
	public static void scheduleFromDirectory(String foldername, boolean large, int timeout,boolean justInstantiation) throws Exception {
		String outFile = "ORT_SemiNaive_small_" + foldername + "_"+timeout+"_conf.csv";
		String inFile = Main.DATA_PATH + foldername + "/";
		if (large) {
			outFile = "ORT_SemiNaive_large_" + foldername + "_"+timeout+"_conf.csv";
			inFile = Main.DATA_PATH.substring(0, Main.DATA_PATH.length() - 1) + "_large/" + foldername + "/";
		}
		
		if (justInstantiation) {
			System.out.println("Using SemiNaive ORTools Solver to JUST INSTANTIATE:\ninput= " + inFile + "\noutput= " + outFile
					+ "\ntimeout= " + timeout);
			outFile = outFile.substring(0,outFile.length()-4)+"_inst.csv";
		}
		else {
			System.out.println("Using SemiNaive ORTools Solver to solve:\ninput= " + inFile + "\noutput= " + outFile
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
			if (file.isFile()) {
				i++;
				System.out.println("Solving instance" + file.getName() + " " + i + "/" + files.length);
				writer.println(scheduleFromFile(inFile, file.getName(), timeout,justInstantiation));
			}
		// writer.println(filename+";"+solver.objectiveValue()+";"+solver.wallTime()+";"+optimal);
		writer.close();
	}

	public static String scheduleFromFile(String folder, String filename, int timeout,boolean justInstantiation) throws Exception {

		long startTime = System.currentTimeMillis();
		CpModel model = new CpModel();
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
		data = new DataReader(folder + filename);
		nJobs = data.next();
		nMachines = data.next();
		IntVar[] lastOpsEnds = new IntVar[nJobs];
		ArrayList<IntVar>[] machineStarts = (ArrayList<IntVar>[]) new ArrayList[nMachines];
		ArrayList<IntVar>[] machineEnds = (ArrayList<IntVar>[]) new ArrayList[nMachines];

		for (int i = 0; i < nJobs; i++) {
			IntVar endPrec = null;
			int m, d;
			IntVar start, end;
			for (int j = 0; j < nMachines; j++) {
				m = data.next();
				d = data.next();
				start = model.newIntVar(0, horizon, "start" + (i * nJobs + j));

				end = model.newIntVar(0, horizon, "end" + (i * nJobs + j));

				model.newIntervalVar(start, d, end, "op" + (i * nJobs + j));
				
				if (machineStarts[m] == null)
					machineStarts[m] = new ArrayList<IntVar>();
				if (machineEnds[m] == null)
					machineEnds[m] = new ArrayList<IntVar>();
				machineStarts[m].add(start);
				machineEnds[m].add(end);

				if (j > 0) {
					model.addLessOrEqual(endPrec, start);
				}
				endPrec = end;
			}
			lastOpsEnds[i] = endPrec;
		}
		IntVar dummy;
		int dummy_i = 0;
		for (int m = 0; m < nMachines; m++)
			for (int i = 0; i < machineStarts[m].size() - 1; i++)
				for (int j = i + 1; j < machineStarts[m].size(); j++) {
					dummy = model.newBoolVar("dummy" + dummy_i);

					dummy_i++;
					model.addLessOrEqual(machineEnds[m].get(i), machineStarts[m].get(j)).onlyEnforceIf(dummy);
					model.addLessOrEqual(machineEnds[m].get(j), machineStarts[m].get(i)).onlyEnforceIf(dummy.not());
				}

		// Makespan objective.
		IntVar obj = model.newIntVar(0, horizon, "makespan");
		model.addMaxEquality(obj, lastOpsEnds);
		model.minimize(obj);

		System.out.println("Instantiation finished, starting solving...");
		// Creates a solver and solves the model.
		CpSolver solver = new CpSolver();
		solver.getParameters().setMaxTimeInSeconds(timeout);
		MySolutionCallback mSC = new MySolutionCallback();
		long stopTime = System.currentTimeMillis();
        double instantiation_time = (stopTime - startTime)/1000;
        if (justInstantiation)
        	return (filename + ";" +instantiation_time);
		CpSolverStatus status = solver.solveWithSolutionCallback(model, mSC);
		
		String optimal = "No";

		if (status == CpSolverStatus.OPTIMAL) {
			System.out.println("Optimal Schedule Length: " + solver.objectiveValue());
			optimal = "Yes";
		} else
			System.out.println("Non Optimal Schedule Length: " + solver.objectiveValue());
		System.out.println(filename + ";" + solver.objectiveValue() + ";" + solver.wallTime() + ";" + optimal+";"+solver.numBranches()+";"+solver.numConflicts());

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