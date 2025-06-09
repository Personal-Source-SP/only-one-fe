import dynamic from "next/dynamic";

const HomeClient = dynamic(() => import("@/components/Home"), { ssr: false });

export default function Home() {
  return <HomeClient />;
}
