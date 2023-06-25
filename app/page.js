import Image from "next/image";
import Link from "next/link";
import logo from "../public/pas-logo.png";

const username = "יותם";

export default function Home() {
  return (
    <main
      className="flex flex-col items-center max-w-screen-sm min-h-screen py-6 mx-auto font-sans text-xl"
      dir="ltr"
    >
      <Image
        src={logo}
        height={56}
        alt="Pas logo"
        priority={true}
        placeholder={"blur"}
      />
      <h1 className="py-6 text-4xl font-bold text-center border-b w-80 border-slate-300 ">
        שלום, <span className="tracking-wide text-indigo-700 ">{username}</span>
      </h1>

      <div className="py-6 space-y-3 ">
        <Link
          className="block w-64 px-6 py-4 overflow-hidden text-center duration-200 ease-out bg-white rounded-md shadow hover:shadow-md hover:scale-105"
          href={"/newattendance"}
        >
          הוסף נוכחות
        </Link>
        <Link
          className="block w-64 px-6 py-4 overflow-hidden text-center duration-200 ease-out bg-white rounded-md shadow hover:shadow-md hover:scale-105"
          href={"/newproject"}
        >
          פתח פרוייקט
        </Link>
        <Link
          className="block w-64 px-6 py-4 overflow-hidden text-center duration-200 ease-out bg-white rounded-md shadow hover:shadow-md hover:scale-105"
          href={"/newclient"}
        >
          הוסף לקוח
        </Link>{" "}
        <Link
          className="block w-64 px-6 py-4 overflow-hidden text-center duration-200 ease-out bg-white rounded-md shadow hover:shadow-md hover:scale-105"
          href={"/newuser"}
        >
          הוסף עובד
        </Link>
        <Link
          className="block w-64 px-6 py-4 overflow-hidden text-center duration-200 ease-out bg-white rounded-md shadow hover:shadow-md hover:scale-105"
          href={"/reports"}
        >
          צפייה בדוחות
        </Link>
      </div>
    </main>
  );
}
