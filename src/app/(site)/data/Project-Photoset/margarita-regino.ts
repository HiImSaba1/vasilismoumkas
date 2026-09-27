import { Photo } from "../ProjectsData";

const folderPath = "/vm_img/Projects/Margarita_Regino/";
const baseName = "vasilis_moumkas_margarita_regino_";
const coupleAlt = "Margarita & Regino wedding by Vasilis Moumkas";

const order = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27,
];

export const margaritaReginoPhotos: Photo[] = order.map((num) => {
  const isHorizontal = [1, 13].includes(num);

  return {
    src: `${folderPath}${baseName}${num}.webp`,
    alt: `${coupleAlt} - Image ${num}`,
    width: isHorizontal ? 1200 : 800,
    height: isHorizontal ? 1000 : 1200,
  };
});
