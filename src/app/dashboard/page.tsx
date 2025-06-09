import dynamic from "next/dynamic";

const DashboardComponent = dynamic(() => import("@/pages/dashboard"), {
  ssr: false,
});

export default function DashboardPage() {
  return <DashboardComponent />;
}
