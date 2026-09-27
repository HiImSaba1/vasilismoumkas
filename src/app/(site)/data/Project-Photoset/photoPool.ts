import * as anastasiaRodrigo from "./anastasia-rodrigo";
import * as amaditaVasilis from "./amadita-vasilis";
import * as anastasiaThanos from "./anastasia-thanos";
import * as claireThanos from "./claire-thanos";
import * as dariaKeyhan from "./daria-keyhan";
import * as eiriniFotis from "./eirini-fotis";
import * as evaGiannis from "./eva-giannis";
import * as evanRevan from "./evan-revan";
import * as katerinaStefanos from "./katerina-stefanos";
import * as kimLee from "./kim-lee";
import * as kymaraPantelis from "./kymara-pantelis";
import * as lauraAlex from "./laura-alex";
import * as lousileKonstantinos from "./lousile_konstantinos";
import * as olgaAlex from "./olga-alex";
import * as margaritaRegino from "./margarita-regino";
import * as nikolinaGeorge from "./nikolina-george";

const allPhotosets = [
  ...anastasiaRodrigo.anastasiaRodrigoPhotos,
  ...amaditaVasilis.amaditaVasilisPhotos,
  ...anastasiaThanos.anastasiaThanosPhotos,
  ...claireThanos.claireThanosPhotos,
  ...dariaKeyhan.dariaKeyhanPhotos,
  ...eiriniFotis.eiriniFotisPhotos,
  ...evaGiannis.evaGiannisPhotos,
  ...evanRevan.evanRevanPhotos,
  ...katerinaStefanos.katerinaStefanosPhotos,
  ...kimLee.kimLeePhotos,
  ...kymaraPantelis.kymaraPantelisPhotos,
  ...lauraAlex.lauraAlexPhotos,
  ...lousileKonstantinos.lousileKonstantinosPhotos,
  ...olgaAlex.olgaAlexPhotos,
  ...margaritaRegino.margaritaReginoPhotos,
  ...nikolinaGeorge.nikolinaGeorgePhotos,
];

export const GLOBAL_PHOTO_POOL: string[] = allPhotosets.map((p) => p.src);

export const PORTRAIT_PHOTO_POOL: string[] = allPhotosets
  .filter((p) => {
    const isPortrait = p.height > p.width * 1.2;
    return isPortrait;
  })
  .map((p) => p.src);

  export const HORIZONTAL_PHOTO_POOL: string[] = allPhotosets
  .filter((p) => {
    const isHorizontal = p.height < p.width;
    return isHorizontal;
  })
  .map((p) => p.src);