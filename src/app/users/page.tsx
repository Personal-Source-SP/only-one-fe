import dynamic from "next/dynamic";

const UsersComponent = dynamic(() => import("@/pages/users"), {
  ssr: false,
});

export default function UsersPage() {
  return <UsersComponent />;
}
