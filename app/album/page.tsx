import dynamic from "next/dynamic";

const AlbumComponent = dynamic(() => import("@/components/Album"), {
  ssr: false,
});

export default function AlbumPage() {
  return <AlbumComponent />;
}
