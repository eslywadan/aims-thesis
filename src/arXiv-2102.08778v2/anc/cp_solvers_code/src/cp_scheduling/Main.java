
package cp_scheduling;

import java.io.IOException;
import java.io.PrintStream;
import ilog.cp.IloCP;

public class Main {

	public static final String RESULTS_PATH = "./results/";
	public static final String DATA_PATH = "./data/jobshop/";
	
	public static void main(String args[]) throws Exception{
		//SchedJobShop.launcher(args);
		/*
		SchedJobShopORTools.scheduleFromDirectory("1");
		SchedJobShopORTools.scheduleFromDirectory("2");
		SchedJobShopORTools.scheduleFromDirectory("3");
		
		ORToolsNaive.scheduleFromDirectory(args[0],true);
		ORToolsNaive.scheduleFromDirectory(args[0],false);
		*/
		

		System.out.println("java library path= "+System.getProperty("java.library.path"));
		
		boolean large = true;
		
		int timeout = 1200;
		double factor = 1.15;
		int startlimit = 100;
		int n_workers = -1;
		String folder="";
		int dataset=-1;
		//argument parsing
		switch (args.length) {
		
		case 5:
			dataset = Integer.parseInt(args[1]);
			folder = args[2];
			timeout = Integer.parseInt(args[3]);
			n_workers = Integer.parseInt(args[4]);
			System.out.println("Solver with "+n_workers+" workers launching on dataset "+INFO.dataset_folder[dataset]+", folder "+folder+ " with default timeout of "+timeout+" seconds,startfail of "+startlimit +" and factor of"+factor);
			
			break;
		default:
			System.out.print("Arguments Error, the number of arguts is wrong. Usage:\n"
					+ "First argument (mandatory):\n"
					+ "\t0 - ORTools Advanced encoding\n"
					+ "\t1 - CPOptimizer Advanced encoding\n"
					+ "\t2 - ORTools Naive encoding\n"
					+ "\t3 - CPOptimizer Naive encoding\n"
					+ "Second argument (Mandatory): dataset id (0=taillard, 1=optimum, 2=small)\n"
					+ "Third argument (Mandatory): Input folder name \n"
					+ "Forth argument (Mandatory): Timeout of the solver, default 1200 seconds\n"
					+ "Fifth argument (Mandatory): n of workers (threads) available to the solver");
			System.exit(0);
		}
		int arg = Integer.parseInt(args[0]);
		

		
		switch (arg) {
			case 0:
				SchedJobShopORTools.scheduleFromDirectory(dataset,folder, timeout,n_workers);
				break;
			case 1:
				SchedJobShop.scheduleFromDirectory(dataset,folder, timeout,n_workers);
				break;
			case 2:
				ORToolsNaive.scheduleFromDirectory(folder, large, timeout);
				break;
			case 3:
				NaiveJobShop.scheduleFromDirectory(folder, large, timeout);
				break;
			case 4:
				SemiNaive.scheduleFromDirectory(folder, large, timeout);
				break;
			case 7:
				SchedJobShop.scheduleFromDirectory(dataset,folder,timeout,n_workers,startlimit,factor);
				break;
			case 8:
				ORToolsSemiNaive.scheduleFromDirectory(folder, large, timeout);
				break;
			case 9:
				ORToolsNaive.scheduleFromDirectory(folder, large, timeout,true);
				break;
			case 10:
				ORToolsSemiNaive.scheduleFromDirectory(folder, large, timeout,true);
				break;
			case 11:
				SchedJobShopORTools.scheduleFromDirectory(dataset,folder, timeout,n_workers, true);
				break;
			/*case 12:
				SchedORToolsCPOld.scheduleFromDirectory(folder, large, timeout);
				break;*/
				
	}
}
}
