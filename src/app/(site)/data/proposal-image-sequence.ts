export type ProposalImage={src:string;alt:string};

const base="/vm_img/Offer";
const baptismBase="/vm_img/baptism-crm-final-images-200kb";

export const weddingProposalMainImages:ProposalImage[]=[
  {src:`${base}/01-main-vertical-images/01-santorini-wedding-couple-sunset-vasilis-moumkas.webp`,alt:"Wedding couple embracing at sunset in Santorini, photographed by Vasilis Moumkas"},
  {src:`${base}/01-main-vertical-images/02-bridal-portrait-wedding-photographer-greece-vasilis-moumkas.webp`,alt:"Fine-art bridal portrait by wedding photographer Vasilis Moumkas in Greece"},
  {src:`${base}/01-main-vertical-images/03-fine-art-wedding-table-details-vasilis-moumkas.webp`,alt:"Fine-art wedding table details photographed by Vasilis Moumkas"},
  {src:`${base}/01-main-vertical-images/04-santorini-editorial-bride-vasilis-moumkas.webp`,alt:"Editorial bride portrait in Santorini photographed by Vasilis Moumkas"},
];

export const weddingProposalSmallImages:ProposalImage[]=[
  {src:`${base}/02-small-alternating-images/01-joyful-wedding-couple-thessaloniki-vasilis-moumkas.webp`,alt:"Joyful wedding couple in Thessaloniki photographed by Vasilis Moumkas"},
  {src:`${base}/02-small-alternating-images/02-eva-george-wedding-architecture-greece-vasilis-moumkas.webp`,alt:"Eva and George framed by wedding architecture in Greece, photographed by Vasilis Moumkas"},
  {src:`${base}/02-small-alternating-images/03-black-white-bride-portrait-halkidiki-vasilis-moumkas.webp`,alt:"Black-and-white bride portrait in Halkidiki by Vasilis Moumkas"},
  {src:`${base}/02-small-alternating-images/04-wedding-ceremony-kiss-greece-vasilis-moumkas.webp`,alt:"Wedding ceremony kiss in Greece photographed by Vasilis Moumkas"},
  {src:`${base}/02-small-alternating-images/05-bride-bridesmaids-halkidiki-wedding-vasilis-moumkas.webp`,alt:"Bride with bridesmaids at a Halkidiki wedding photographed by Vasilis Moumkas"},
  {src:`${base}/02-small-alternating-images/06-editorial-bride-veil-black-white-vasilis-moumkas.webp`,alt:"Black-and-white editorial bride and veil portrait by Vasilis Moumkas"},
];

export const weddingProposalImageSequence=[...weddingProposalMainImages,...weddingProposalSmallImages];

export const baptismProposalMainImages:ProposalImage[]=[
  {src:`${baptismBase}/baptism-family-joy-hero-vasilis-moumkas.jpg`,alt:"Joyful family portrait during a baptism celebration photographed by Vasilis Moumkas"},
  {src:`${baptismBase}/baptism-family-moment-vasilis-moumkas.jpg`,alt:"Tender family moment on a baptism day photographed by Vasilis Moumkas"},
  {src:`${baptismBase}/baptism-girl-portrait-vasilis-moumkas.jpg`,alt:"Editorial portrait of a girl during a baptism celebration photographed by Vasilis Moumkas"},
];

export const baptismProposalSmallImages:ProposalImage[]=[
  {src:`${baptismBase}/baptism-decoration-details-vasilis-moumkas.jpg`,alt:"Elegant baptism decoration details photographed by Vasilis Moumkas"},
  {src:`${baptismBase}/baptism-child-editorial-portrait-vasilis-moumkas.jpg`,alt:"Editorial child portrait during a baptism celebration photographed by Vasilis Moumkas"},
  {src:`${baptismBase}/baptism-ceremony-moment-vasilis-moumkas.jpg`,alt:"Authentic moment from a baptism ceremony photographed by Vasilis Moumkas"},
  {src:`${baptismBase}/baptism-emotional-moment-vasilis-moumkas.jpg`,alt:"Emotional family moment during a baptism photographed by Vasilis Moumkas"},
];

export const baptismProposalImageSequence=[...baptismProposalMainImages,...baptismProposalSmallImages];
