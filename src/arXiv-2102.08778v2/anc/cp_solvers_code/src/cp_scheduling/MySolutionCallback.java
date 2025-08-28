package cp_scheduling;

import com.google.ortools.sat.CpSolverSolutionCallback;

class MySolutionCallback extends CpSolverSolutionCallback {
    public MySolutionCallback() {
      
    }

    @Override
    public void onSolutionCallback() {
      System.out.println("* " +objectiveValue() +" "+ wallTime()+" "+numConflicts());
      
    }

  }