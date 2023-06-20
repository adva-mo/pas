import Image from "next/image";
import Link from "next/link";
import logo from "../public/pas-logo.png";

const username = "יותם";

export default function Home() {
  return (
    <main className="flex flex-col items-center max-w-screen-sm min-h-screen py-6 mx-auto font-sans text-xl">
      <Image
        src={logo}
        height={56}
        alt="Pas logo"
        priority={true}
        placeholder={"blur"}
      />
      <h1 className="py-6 text-4xl font-bold border-b border-slate-200 min-w-[50vw] text-center ">
        שלום, <span className="tracking-wide text-indigo-700 ">{username}</span>
      </h1>

      <div className="py-6 space-y-3">
        <Link
          className=" block px-6 py-4 overflow-hidden bg-white rounded-md shadow min-w-[70vw] text-center hover:shadow-md hover:scale-105 ease-out duration-200"
          href={"/newattendance"}
        >
          הוסף נוכחות
        </Link>
        <Link
          className=" block px-6 py-4 overflow-hidden bg-white rounded-md shadow min-w-[70vw] text-center hover:shadow-md hover:scale-105 ease-out duration-200"
          href={"/newproject"}
        >
          פתח פרוייקט
        </Link>
        <Link
          className=" block px-6 py-4 overflow-hidden bg-white rounded-md shadow min-w-[70vw] text-center hover:shadow-md hover:scale-105 ease-out duration-200"
          href={"/newclient"}
        >
          הוסף לקוח
        </Link>{" "}
        <Link
          className=" block px-6 py-4 overflow-hidden bg-white rounded-md shadow min-w-[70vw] text-center hover:shadow-md hover:scale-105 ease-out duration-200"
          href={"/newuser"}
        >
          הוסף עובד
        </Link>
        <Link
          className=" block px-6 py-4 overflow-hidden bg-white rounded-md shadow min-w-[70vw] text-center hover:shadow-md hover:scale-105 ease-out duration-200"
          href={"/reports"}
        >
          צפייה בדוחות
        </Link>
      </div>
    </main>
  );
}
