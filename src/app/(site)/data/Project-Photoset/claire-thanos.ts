import { Photo } from "../ProjectsData";

const folderPath = "/vm_img/Projects/Claire_Thanos/";
const baseName = "vasilis_moumkas_claire_thanos_";
const coupleAlt = "Claire & Thanos wedding by Vasilis Moumkas";

const order = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34
];

export const claireThanosPhotos: Photo[] = order.map((num) => {
  const isHorizontal = [1, 8, 11, 20].includes(num);

  return {
    src: `${folderPath}${baseName}${num}.webp`,
    alt: `${coupleAlt} - Image ${num}`,
    width: isHorizontal ? 1200 : 800,
    height: isHorizontal ? 1000 : 1200,
  };
});
