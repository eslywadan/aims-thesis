package cp_scheduling;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StreamTokenizer;

import cp_scheduling.SchedJobShop.DataReader;
import ilog.concert.IloException;
import ilog.cp.IloCP;

public class InstanceConverter {

	private StreamTokenizer st;

	public InstanceConverter(String path) throws IOException {

		FileInputStream fstream = new FileInputStream(path);
		Reader r = new BufferedReader(new InputStreamReader(fstream));
		st = new StreamTokenizer(r);
	}

	public void loop() throws IOException {
		while(st.nextToken()!=StreamTokenizer.TT_EOF){
			System.out.println(st.sval);
			/*
			if(st.ttype==StreamTokenizer.TT_NUMBER){
				System.out.println(st.nval);
			}else if(st.ttype==StreamTokenizer.TT_WORD){
				System.out.println(st.sval);
		*/
				            }
	}


}
