import dynamic from "next/dynamic";

const DriveComponent = dynamic(() => import("@/pages/drive"), {
  ssr: false,
});

export default function DrivePage() {
  return <DriveComponent />;
}
