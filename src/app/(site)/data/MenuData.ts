// /src/app/data/MenuData.ts

export interface NavItem {
  title: string;
  href: string;
  image: string;
  imageIndex: number;
}

export interface FooterLink {
  text: string;
  href: string;
  isExternal?: boolean;
}

export interface FooterColumn {
  type: string;
  title: string;
  links: FooterLink[];
  linkClass: string;
}

export const navItems: NavItem[] = [
  {
    title: "Home",
    href: "/",
    image: "/vm_img/FullScreenMenu/vasilis_moumkas_fullscreen_menu_img_2.webp",
    imageIndex: 2,
  },
  {
    title: "About",
    href: "/about",
    image: "/vm_img/FullScreenMenu/vasilis_moumkas_fullscreen_menu_img_3.webp",
    imageIndex: 3,
  },
  {
    title: "Education",
    href: "/education",
    image: "/vm_img/Projects/Eirini_Fotis/vasilis_moumkas_eirini_fotis_7.webp", 
    imageIndex: 4,
  },
  {
    title: "Portfolio",
    href: "/portfolio",
    image: "/vm_img/FullScreenMenu/vasilis_moumkas_fullscreen_menu_img_4.webp",
    imageIndex: 5,
  },
  {
    title: "Services",
    href: "/services",
    image: "/vm_img/FullScreenMenu/vasilis_moumkas_fullscreen_menu_img_5.webp",
    imageIndex: 6,
  },
  {
    title: "Contact",
    href: "/contact",
    image: "/vm_img/FullScreenMenu/vasilis_moumkas_fullscreen_menu_img_1.webp",
    imageIndex: 7,
  },
];

export const socialItems = [
  {
    title: "Instagram",
    href: "https://www.instagram.com/vasilismoumkas_weddings/",
    isExternal: true,
  },
  {
    title: "Facebook",
    href: "https://www.facebook.com/VasilisMoumkasPhotography",
    isExternal: true,
  },
  {
    title: "Pinterest",
    href: "https://gr.pinterest.com/vasilismoumkas/",
    isExternal: true,
  },
];

export const footerLinksData: FooterColumn[] = [
  {
    type: "Address",
    title: "Address",
    links: [
      {
        text: "Google Maps",
        href: "https://maps.app.goo.gl/TtCHaW5abmw4VFDC8",
        isExternal: true,
      },
    ],
    linkClass: "inline-block",
  },
  {
    type: "Contact",
    title: "Contact",
    links: [
      { text: "6972218775", href: "tel:6972218775" },
      {
        text: "vasilis.moumkas@gmail.com",
        href: "mailto:vasilis.moumkas@gmail.com",
      },
      {
        text: "WhatsApp Message",
        href: "https://wa.me/306972218775?text=Hello%20Vasilis...",
        isExternal: true,
      },
    ],
    linkClass: "block",
  },
  {
    type: "Socials",
    title: "Socials",
    links: socialItems.map((s) => ({
      text: s.title,
      href: s.href,
      isExternal: true,
    })),
    linkClass: "block",
  },
];