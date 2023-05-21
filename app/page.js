import Image from "next/image";
import Link from "next/link";
import logo from "../public/pas-logo.png";

const username = "יותם";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center py-6">
      <Image
        src={logo}
        height={50}
        alt="Pas logo"
        priority={true}
        placeholder={"blur"}
      />
      <h2 className="mt-6"> שלום, {username}</h2>
      <div className="flex flex-col">
        <Link href={"/newattendance"}>הוסף נוכחות</Link>
        <Link href={"/newproject"}>פתח פרוייקט</Link>
        <Link href={"/newclient"}>הוסף לקוח</Link>
        <Link href={"/newuser"}>הוסף עובד</Link>
        <Link href={"/"}>צפייה בדוחות</Link>
      </div>
    </main>
  );
}
