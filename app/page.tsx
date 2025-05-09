import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="">
     <h2>Hello from  Home!!!</h2>
     <Link href="/login" className="text-blue-600 ">Login</Link>
     <br/>
     

     <Link href="/register" className="text-blue-600 ">Register</Link>

    </div>
  );
}
