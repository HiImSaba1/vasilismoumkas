export function removeGreekTonos(value:string){
  return value.normalize("NFD").replace(/[\u0301\u0342]/g,"").normalize("NFC");
}
