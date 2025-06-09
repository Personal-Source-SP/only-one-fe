import dynamic from "next/dynamic";

const LoginComponent = dynamic(() => import("@/pages/login"), {
  ssr: false,
});

export default function LoginPage() {
  return <LoginComponent />;
}
