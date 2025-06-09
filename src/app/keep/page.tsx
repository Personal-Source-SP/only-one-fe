import dynamic from "next/dynamic";

const KeepComponent = dynamic(() => import("@/pages/keep"), {
  ssr: false,
});

export default function KeepPage() {
  return <KeepComponent />;
}
