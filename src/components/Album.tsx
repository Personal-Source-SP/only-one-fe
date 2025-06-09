"use client";

import { ITEMS_PER_PAGE_DEFAULT } from "@/constants";
import { useAlbumContext } from "@/contexts/AlbumContext";
import { Empty, Pagination } from "antd";
import { FC, useState } from "react";
import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import FolderTags from "./FolderTag";
// import FolderItem from "@/components/core-mac-os/folder/folderItem";

const AlbumComponent: FC = () => {
  const {
    folders,
    itemsPerPage,
    selectedFolder,
    slideShowDelay,
    sortedPhotos,
    currentPage,
    handleDeleteFolder,
    handlePageChange,
    handleSelectFolder,
  } = useAlbumContext();

  const [index, setIndex] = useState(-1);

  const indexOfLastPhoto = !itemsPerPage
    ? sortedPhotos.length
    : currentPage * itemsPerPage;
  const indexOfFirstPhoto = !itemsPerPage ? 0 : indexOfLastPhoto - itemsPerPage;
  const currentPhotos = sortedPhotos.slice(indexOfFirstPhoto, indexOfLastPhoto);

  return (
    <section className="p-4">
      {/* <FolderItem name="Album ảnh" /> */}

      <FolderTags
        folders={folders}
        selectedFolder={selectedFolder}
        onSelectFolder={handleSelectFolder}
        onDeleteFolder={handleDeleteFolder}
      />

      {currentPhotos.length > 0 ? (
        <>
          <RowsPhotoAlbum
            targetRowHeight={200}
            photos={currentPhotos}
            onClick={({ index }) => setIndex(indexOfFirstPhoto + index)}
          />

          <div className="mt-4 flex justify-center">
            <Pagination
              current={currentPage}
              showSizeChanger={false}
              total={sortedPhotos.length}
              onChange={handlePageChange}
              pageSize={ITEMS_PER_PAGE_DEFAULT}
            />
          </div>
        </>
      ) : (
        <Empty description="Không tìm thấy ảnh" />
      )}

      <Lightbox
        index={index}
        open={index >= 0}
        slides={sortedPhotos}
        close={() => setIndex(-1)}
        plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
        slideshow={{
          delay: slideShowDelay,
        }}
      />
    </section>
  );
};

export default AlbumComponent;
