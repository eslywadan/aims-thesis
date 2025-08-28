package cp_scheduling;

public class Test {
	
	static {
	    System.loadLibrary("jniconstraintsolver");
	    System.out.println("ok");
	}
	
	public static void main(String[] args) {
		String p=System.getProperty("java.library.path");
		System.out.println(p);
		
	}
}
