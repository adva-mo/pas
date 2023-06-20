import Link from "next/link";

function PageHeader({ title }) {
  return (
    <nav className="bg-zinc-900">
      <div className="flex items-center justify-between max-w-screen-sm gap-4 px-3 py-4 mx-auto font-sans text-xl text-white bg-zinc-900 max-w-screen-smflex">
        <span className="px-1 pb-1 leading-none tracking-tight border-2 rounded-sm shadow-md shadow-indigo-400/75 border-zinc-50">
          פ א ס
        </span>
        <h1 className="text-3xl tracking-wide text-indigo-100">{title}</h1>
        <Link href="/" className="h-full pl-2">
          חזור <span className="font-thin text-indigo-300 pe-1 ">&gt;&gt;</span>
        </Link>
      </div>
    </nav>
  );
}
export default PageHeader;
