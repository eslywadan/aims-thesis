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
import ilog.cp.IloCP.ParameterValues;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class SchedJobShop {

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

 public static void scheduleFromDirectory(int dataset_id,String foldername, int timeout,int n_workers)throws Exception {
	 scheduleFromDirectory(dataset_id, foldername, timeout, n_workers, 100, 1.15);
 }

public static void scheduleFromDirectory(int dataset_id,String foldername, int timeout,int n_workers,int startlimit,double factor) throws Exception {
		ParameterValues searchStrategy = IloCP.ParameterValues.Restart;
		String outFile = "CPO_Adv_"+INFO.dataset_folder[dataset_id].substring(15, 20)+"_" + foldername + "_"+timeout+ "_"+startlimit+ "_"+factor+"_"+n_workers+"_v1210.csv";
		String inFile = INFO.dataset_folder[dataset_id]+ foldername + "/";
		IloCP cp = new IloCP();
		System.out.println("++Using Advanced CPOptimizer Solver "+cp.getVersion()+" to solve:\ninput= " + inFile + "\noutput= " + outFile
				+ "\ntimeout= " + timeout + "\nworkers= " + n_workers);
		
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
				System.out.println("Solving instance"+file.getName()+" "+i+"/"+files.length);
				writer.println(scheduleFromFile(dataset_id,inFile, file.getName(), timeout,searchStrategy, startlimit, factor,n_workers));
			}
		// writer.println(filename+";"+solver.objectiveValue()+";"+solver.wallTime()+";"+optimal);
		writer.close();
	}

 
 
public static String scheduleFromFile(int dataset_id,String folder, String filename, int timeout,ParameterValues searchStrategy,int startlimit,double factor,int n_workers) throws Exception {
	
     //String filename = "../../../examples/data/jobshop_default.data";
     int nbJobs, nbMachines;
     int boundary;
    

     IloCP cp = new IloCP();
     DataReader data = new DataReader(folder +filename);
     try {
         nbJobs = data.next();
         nbMachines = data.next();
         List<IloIntExpr> ends = new ArrayList<IloIntExpr>();
         IntervalVarList[] machines = new IntervalVarList[nbMachines];
         
         for (int j = 0; j < nbMachines; j++)
             machines[j] = new IntervalVarList();

         for (int i = 0; i < nbJobs; i++) {
             IloIntervalVar prec = cp.intervalVar();
             boundary = nbMachines;
             if (dataset_id == 1)
                 boundary = nbMachines*nbJobs;
            		 
             for (int j = 0; j < boundary; j++) {//this boundary is  nMachines*nJobs just for the bench instances. normally should be  nMachines
                 int m, d;
                 m = data.next();
                 d = data.next();
                 if (m == -1)
 					break;
                 IloIntervalVar ti = cp.intervalVar(d);
                 machines[m].add(ti);
                 if (j > 0) {
                     cp.add(cp.endBeforeStart(prec, ti));
                 }
                 prec = ti;
             }
             ends.add(cp.endOf(prec));
         }

         for (int j = 0; j < nbMachines; j++)
             cp.add(cp.noOverlap(machines[j].toArray()));
         	
       
         cp.setParameter(IloCP.IntParam.Workers, n_workers);
         cp.setParameter(IloCP.DoubleParam.TimeLimit, (double)timeout);
         cp.setParameter(IloCP.IntParam.LogVerbosity, IloCP.ParameterValues.Terse);
         cp.setParameter(IloCP.DoubleParam.RelativeOptimalityTolerance, 0);
         //cp.setParameter(IloCP.DoubleParam.RestartGrowthFactor, factor);
         //cp.setParameter(IloCP.IntParam.SearchType, searchStrategy);
         //cp.setParameter(IloCP.IntParam.RestartFailLimit, startlimit);
         //cp.setParameter(IloCP.IntParam.FailureDirectedSearch, IloCP.ParameterValues.Off);
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
         return (filename+";ERROR;"+e);
     }
 }
}
