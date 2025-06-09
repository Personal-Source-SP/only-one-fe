import dynamic from "next/dynamic";

const PhotosComponent = dynamic(() => import("@/pages/photos"), {
  ssr: false,
});

export default function PhotosPage() {
  return <PhotosComponent />;
}
