import Image from "next/image";
import Link from "next/link";
import logo from "../public/pas-logo.png";

const username = "יותם";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center py-6">
      <Image src={logo} height={50} alt="Picture of the author" />
      <h2 className="mt-6"> שלום, {username}</h2>
      <div>
        <Link href={"/newattendance"}>הוסף נוכחות</Link>
      </div>
    </main>
  );
}
