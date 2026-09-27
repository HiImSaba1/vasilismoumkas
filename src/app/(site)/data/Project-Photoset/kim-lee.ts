import { Photo } from "../ProjectsData";

const folderPath = "/vm_img/Projects/Kim_Lee/";
const baseName = "vasilis_moumkas_kim_lee_";
const coupleAlt = "Kim & Lee wedding by Vasilis Moumkas";

const order = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
];

export const kimLeePhotos: Photo[] = order.map((num) => {
  const isHorizontal = [1, 4, 9, 13, 19].includes(num);

  return {
    src: `${folderPath}${baseName}${num}.webp`,
    alt: `${coupleAlt} - Image ${num}`,
    width: isHorizontal ? 1200 : 800,
    height: isHorizontal ? 1000 : 1200,
  };
});
