import { Photo } from "../ProjectsData";

const folderPath = "/vm_img/Projects/Daria_Keyhan/";
const baseName = "vasilis_moumkas_daria_keyhan_";
const coupleAlt = "Daria & Keyhan wedding by Vasilis Moumkas";

const order = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 
  11, 12, 13, 14
];

export const dariaKeyhanPhotos: Photo[] = order.map((num) => {
  const isHorizontal = [5].includes(num); 

  return {
    src: `${folderPath}${baseName}${num}.webp`,
    alt: `${coupleAlt} - Image ${num}`,
    width: isHorizontal ? 1200 : 800,
    height: isHorizontal ? 1000 : 1200,
  };
});