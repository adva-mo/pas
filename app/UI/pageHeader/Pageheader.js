import Link from "next/link";

function PageHeader({ title }) {
  return (
    <nav className="bg-zinc-900">
      <div className="flex items-center justify-between max-w-screen-sm gap-4 px-3 py-4 mx-auto font-sans text-xl text-white select-none bg-zinc-900 max-w-screen-smflex">
        <span className="px-1 pb-1 font-bold leading-none tracking-tighter rounded-sm shadow shadow-indigo-400/70 border-zinc-500 text-zinc-400">
          פ א ס
        </span>
        <h1 className="pt-2 text-2xl font-semibold tracking-wide text-indigo-100 translate-x-1">
          {title}
        </h1>
        <Link
          href="/"
          className="h-full transition duration-200 ease-in-out hover:font-bold hover:scale-110 hover:text-indigo-200"
        >
          חזור{"  "}
          <span className="font-thin text-indigo-300 transition duration-150 ease-in-out pe-1">
            &gt;&gt;
          </span>
        </Link>
      </div>
    </nav>
  );
}
export default PageHeader;
