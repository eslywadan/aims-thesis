package cp_scheduling;

//---------------------------------------------------------------*- Java -*-
//File: ./examples/src/java/SchedJobShop.java
//--------------------------------------------------------------------------
//Licensed Materials - Property of IBM
//
//5724-Y48 5724-Y49 5724-Y54 5724-Y55 5725-A06 5725-A29
//Copyright IBM Corporation 1990, 2017. All Rights Reserved.
//
//Note to U.S. Government Users Restricted Rights:
//Use, duplication or disclosure restricted by GSA ADP Schedule
//Contract with IBM Corp.
//--------------------------------------------------------------------------

/* ------------------------------------------------------------

Problem Description
-------------------

In the classical Job-Shop Scheduling problem a finite set of jobs is
processed on a finite set of machines. Each job is characterized by a
fixed order of operations, each of which is to be processed on a
specific machine for a specified duration.  Each machine can process
at most one operation at a time and once an operation initiates
processing on a given machine it must complete processing
uninterrupted.  The objective of the problem is to find a schedule
that minimizes the makespan of the schedule.

------------------------------------------------------------ */

import ilog.concert.*;
import ilog.cp.*;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class SemiNaive {

	static class DataReader {

		private StreamTokenizer st;

		public DataReader(String filename) throws IOException {
			FileInputStream fstream = new FileInputStream(filename);
			Reader r = new BufferedReader(new InputStreamReader(fstream));
			st = new StreamTokenizer(r);
		}

		public int next() throws IOException {
			st.nextToken();
			return (int) st.nval;
		}
	}

	static class IntervalVarList extends ArrayList<IloIntervalVar> {
		public IloIntervalVar[] toArray() {
			return (IloIntervalVar[]) this.toArray(new IloIntervalVar[this.size()]);
		}
	}

	static IloIntExpr[] arrayFromList(List<IloIntExpr> list) {
		return (IloIntExpr[]) list.toArray(new IloIntExpr[list.size()]);
	}

	public static void scheduleFromDirectory(String foldername, boolean large, int timeout) throws Exception {
		String outFile = "CPO_SemiNaive_small_" + foldername +"_branch.csv";
		String inFile = Main.DATA_PATH + foldername + "/";
		if (large) {
			outFile = "CPO_SemiNaive_large_" + foldername + "_branch.csv";
			inFile = Main.DATA_PATH.substring(0, Main.DATA_PATH.length() - 1) + "_large/" + foldername + "/";
		}
		System.out.println("Using SemiNaive CPOptimizer Solver to solve:\ninput= " + inFile + "\noutput= " + outFile
				+ "\ntimeout= " + timeout);
		
		// Save original out stream.
	    PrintStream originalOut = System.out;

        // Create a new file output stream.
        
        PrintStream fileOut = new PrintStream(Main.RESULTS_PATH + outFile.substring(0,outFile.length()-3)+"txt");

        // Redirect standard out to file.
        System.setOut(fileOut);
		
		
		PrintWriter writer = new PrintWriter(Main.RESULTS_PATH + outFile, "UTF-8");
		File[] files = new File(inFile).listFiles();
		// If this pathname does not denote a directory, then listFiles() returns null.
		int i = 0;
		for (File file : files)
			if (file.isFile()) {
				i++;
				System.out.println("Solving instance" + file.getName() + " " + i + "/" + files.length);
				writer.println(scheduleFromFile(inFile, file.getName(), timeout));
			}
		// writer.println(filename+";"+solver.objectiveValue()+";"+solver.wallTime()+";"+optimal);
		writer.close();
	}

	public static String scheduleFromFile(String folder, String filename, int timeout) throws Exception {

		// String filename = "../../../examples/data/jobshop_default.data";
		// String filename = "./data/jobshop/jobshop_swv01.data";
		int nbJobs, nbMachines;

		IloCP cp = new IloCP();
		DataReader data = new DataReader(folder + filename);
		try {
			nbJobs = data.next();
			nbMachines = data.next();
			List<IloIntExpr> ends = new ArrayList<>();
			IntervalVarList[] machines = new IntervalVarList[nbMachines];
			for (int j = 0; j < nbMachines; j++)
				machines[j] = new IntervalVarList();

			for (int i = 0; i < nbJobs; i++) {
				IloIntervalVar prec = cp.intervalVar();
				for (int j = 0; j < nbMachines; j++) {
					int m, d;
					m = data.next();
					d = data.next();
					IloIntervalVar ti = cp.intervalVar(d);
					machines[m].add(ti);
					if (j > 0) {
						// cp.add(cp.endBeforeStart(prec, ti));
						cp.add(cp.le(cp.sum(cp.constant(ti.getSizeMin()), cp.endOf(prec)), cp.endOf(ti)));
					}
					prec = ti;
				}
				ends.add(cp.endOf(prec));
			}

			/*
			 * for (int j = 0; j < nbMachines; j++)
			 * cp.add(cp.noOverlap(machines[j].toArray()));
			 */

			for (int m = 0; m < nbMachines; m++) {
				for (int x = 0; x < nbJobs - 1; x++) {
					for (int y = x + 1; y < nbJobs; y++) {
						// System.out.println(machines[m].get(y).getSizeMax()+"
						// "+machines[m].get(y).getSizeMin());
						cp.add(cp.or(
								cp.le(cp.sum(cp.constant(machines[m].get(y).getSizeMin()),
										cp.endOf(machines[m].get(x))), cp.endOf(machines[m].get(y))),
								cp.le(cp.sum(cp.constant(machines[m].get(x).getSizeMin()),
										cp.endOf(machines[m].get(y))), cp.endOf(machines[m].get(x)))));
					}
				}
			}

			cp.setParameter(IloCP.IntParam.Workers, 1);
			cp.setParameter(IloCP.DoubleParam.TimeLimit, timeout);
			cp.setParameter(IloCP.IntParam.LogVerbosity, IloCP.ParameterValues.Terse);
	        cp.setParameter(IloCP.DoubleParam.RelativeOptimalityTolerance, 0);
	        
			IloObjective objective = cp.minimize(cp.max(arrayFromList(ends)));
			cp.add(objective);

			 if (cp.solve()) {
	             System.out.println(filename+";"+cp.getObjValue()+";"+cp.getInfo(IloCP.DoubleInfo.TotalTime)+";"+cp.getObjBound()+";"+cp.getInfo(IloCP.IntInfo.NumberOfBranches));
	             return(filename+";"+cp.getObjValue()+";"+cp.getInfo(IloCP.DoubleInfo.TotalTime)+";"+cp.getObjBound()+";"+cp.getInfo(IloCP.IntInfo.NumberOfBranches));
	         } else {
	             System.out.println("No solution found.");
	             return(filename+";NoSolution;"+cp.getInfo(IloCP.DoubleInfo.TotalTime)+";"+cp.getInfo(IloCP.IntInfo.NumberOfBranches));
	         }
		} catch (IloException e) {
			System.err.println("Error: " + e);
			return filename + ";Error;" + e;

		}
	}
}
