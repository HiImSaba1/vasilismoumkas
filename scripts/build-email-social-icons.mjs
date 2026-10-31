// Small, local vector glyphs rasterized to PNG for email-client compatibility.
import sharp from "sharp";
import {resolve} from "node:path";
const icons={
  instagram:'<rect x="14" y="14" width="36" height="36" rx="11" fill="none" stroke="#D9CEC3" stroke-width="4"/><circle cx="32" cy="32" r="9" fill="none" stroke="#D9CEC3" stroke-width="4"/><circle cx="43" cy="21" r="2.5" fill="#D9CEC3"/>',
  pinterest:'<circle cx="32" cy="32" r="22" fill="none" stroke="#D9CEC3" stroke-width="3"/><path d="M25 50 32 24m-4 15c17 8 23-19 9-21-10-2-18 7-13 17" fill="none" stroke="#D9CEC3" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
};
for(const[name,paths]of Object.entries(icons)){
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">${paths}</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(resolve('public/vm_img/Offer',`email-social-${name}.png`));
}
console.log("Created Instagram and Pinterest PNG glyphs for the editorial email footer.");
