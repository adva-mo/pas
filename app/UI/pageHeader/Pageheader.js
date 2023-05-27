import Link from "next/link";

function PageHeader({ title }) {
  return (
    <div className="bg-sky-400 w-full h-20 flex justify-end items-center gap-4">
      <h4>{title}</h4>
      <Link href="/">חזור</Link>
    </div>
  );
}
export default PageHeader;
