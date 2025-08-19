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

public class NaiveJobShop {
	
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

    static class IntVarList extends ArrayList<IloIntVar> {

        public IloIntVar[] toArray() {
            return (IloIntVar[]) this.toArray(new IloIntVar[this.size()]);
        }
    }

    static IloIntExpr[] arrayFromList(List<IloIntExpr> list) {
        return (IloIntExpr[]) list.toArray(new IloIntExpr[list.size()]);
    }

    
    


public static void scheduleFromDirectory(String foldername, boolean large, int timeout) throws Exception {
		String outFile = "CPO_Naive_small_" + foldername+"_branch.csv";
		String inFile = Main.DATA_PATH + foldername + "/";
		if (large) {
			outFile = "CPO_Naive_large_" + foldername + "_branch.csv";
			inFile = Main.DATA_PATH.substring(0, Main.DATA_PATH.length() - 1) + "_large/"+foldername+"/";
		}
		
		System.out.println("Using Naive CPOptimizer Solver to solve:\ninput= " + inFile + "\noutput= " + outFile
				+ "\ntimeout= " + timeout);
		// Save original out stream.
        PrintStream originalOut = System.out;

        // Create a new file output stream.
        
        PrintStream fileOut = new PrintStream(Main.RESULTS_PATH + outFile.substring(0,outFile.length()-3)+"txt");

        // Redirect standard out to file.
        System.setOut(fileOut);
		
		File[] files = new File(inFile).listFiles();
		// If this pathname does not denote a directory, then listFiles() returns null.
		int i = 0;
		for (File file : files)
			if (file.isFile()) {
				i++;
				System.out.println("Solving instance"+file.getName()+" "+i+"/"+files.length);
				BufferedWriter out = new BufferedWriter( 
		                   new FileWriter(Main.RESULTS_PATH + outFile, true)); 
		        out.write(scheduleFromFile(inFile, file.getName(), timeout)+"\n"); 
		        out.close(); 
			}
		// writer.println(filename+";"+solver.objectiveValue()+";"+solver.wallTime()+";"+optimal);
		
	}

 
 
public static String scheduleFromFile(String folder, String filename, int timeout) throws Exception {
	

        //String filename = "../../../examples/data/jobshop_default.data";
        //filename = "./data/jobshop/jobshop_swv01.data";
        int nbJobs, nbMachines;
        
        long startTime = System.currentTimeMillis();
        
        IloCP cp = new IloCP();
        DataReader data = new DataReader(folder +filename);
        try {
            nbJobs = data.next();
            nbMachines = data.next();

             int[][] machine = new int[nbJobs][nbMachines];
             int[][] duration = new int[nbJobs][nbMachines];
             
             IloIntVar[][] start = new IloIntVar[nbJobs][nbMachines];
             IloIntVar[][] finished = new IloIntVar[nbJobs][nbMachines];
             List<IloIntExpr> list = new ArrayList();
             ArrayList<Integer>[] jobs = new ArrayList[nbMachines];
             ArrayList<Integer>[] ops = new ArrayList[nbMachines];
             for(int i = 0; i < ops.length; i++){
                 ops[i] = new ArrayList();
                 jobs[i] = new ArrayList();
             }
             int sum = 0;
             
            for (int j = 0; j < nbJobs; j++) {
                for (int k = 0; k < nbMachines; k++) {
                    machine[j][k] = data.next();
                    jobs[machine[j][k]].add(j);
                    ops[machine[j][k]].add(k);
                    duration[j][k] = data.next();
                    sum += duration[j][k];
                }
            }
            
            for (int j = 0; j < nbJobs; j++) {
                for (int k = 0; k < nbMachines; k++) {
                    start[j][k] = cp.intVar(0, sum);
                    finished[j][k] = cp.intVar(0, sum);
                    list.add(finished[j][k]);
                    cp.add(cp.eq(cp.sum(cp.constant(duration[j][k]), start[j][k]), finished[j][k]));
                    if(k>0){
                        cp.add(cp.le(finished[j][k-1], start[j][k]));
                    }
                }
            }

            for(int m = 0; m < nbMachines; m++){
                for (int x = 0; x < nbJobs-1; x++) {
                    for(int y = x+1; y < nbJobs; y++){
                        cp.add(cp.or(cp.le(finished[jobs[m].get(x)][ops[m].get(x)], start[jobs[m].get(y)][ops[m].get(y)]), cp.le(finished[jobs[m].get(y)][ops[m].get(y)], start[jobs[m].get(x)][ops[m].get(x)])));
                    }
                }
            }

            cp.setParameter(IloCP.IntParam.Workers, 1);
            cp.setParameter(IloCP.DoubleParam.TimeLimit, (double)timeout);
            cp.setParameter(IloCP.IntParam.LogVerbosity, IloCP.ParameterValues.Terse);
            cp.setParameter(IloCP.DoubleParam.RelativeOptimalityTolerance, 0);
            
            IloObjective objective = cp.minimize(cp.max(list));
            cp.add(objective);
            
            long stopTime = System.currentTimeMillis();
            long instantiation_time = (stopTime - startTime)/1000;
            if (cp.solve()) {
                System.out.println(filename+";"+cp.getObjValue()+";"+cp.getInfo(IloCP.DoubleInfo.TotalTime)+";"+cp.getObjBound()+";"+cp.getInfo(IloCP.IntInfo.NumberOfBranches)+";"+instantiation_time);
                return(filename+";"+cp.getObjValue()+";"+cp.getInfo(IloCP.DoubleInfo.TotalTime)+";"+cp.getObjBound()+";"+cp.getInfo(IloCP.IntInfo.NumberOfBranches)+";"+instantiation_time);
            } else {
                System.out.println("No solution found.");
                return(filename+";NoSolution;"+cp.getInfo(IloCP.DoubleInfo.TotalTime)+";"+cp.getInfo(IloCP.IntInfo.NumberOfBranches)+";"+instantiation_time);
            }
         } catch (IloException e) {
            System.err.println("Error: " + e);
            return filename+";Error;"+e;
            
        }
        
    }
}
