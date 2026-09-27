import { Photo } from "../ProjectsData";

const folderPath = "/vm_img/Projects/Kymara_Pantelis/";
const baseName = "vasilis_moumkas_kymara_pantelis_";
const coupleAlt = "Kymara & Pantelis wedding by Vasilis Moumkas";

const order = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
];

export const kymaraPantelisPhotos: Photo[] = order.map((num) => {
  // If MOST are portraits, define the exceptions (the horizontals)
  const isHorizontal = [1, 2, 3, 4, 6, 9, 10, 11, 12, 15, 16, 17, 18, 19, 20, 21].includes(num); 

  return {
    src: `${folderPath}${baseName}${num}.webp`,
    alt: `${coupleAlt} - Image ${num}`,
    // Set dimensions so the component can "read" them
    width: isHorizontal ? 1200 : 800,
    height: isHorizontal ? 1000 : 1200,
  };
});