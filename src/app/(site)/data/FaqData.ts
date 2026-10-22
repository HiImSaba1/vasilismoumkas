import { publicCopy } from "@/app/(site)/data/ApprovedPublicCopy";

export const faqData = [
  {
    question: "Tell Me About Your Plans",
    answer: "Share your wedding date, location and the celebration you are planning. We can arrange a conversation to discuss your priorities and the photography coverage that suits your day.",
    date: "Step 01",
  },
  {
    question: "Booking Procedure & Securing Your Date",
    answer: "You’ll receive a personalised proposal outlining your photography coverage. Your date is secured once the agreement is signed and the deposit is paid.",
    date: "Step 02",
  },
  {
    question: "Planning Your Photography",
    answer: "We’ll discuss the people, moments and portraits that matter to you, along with your locations and the light throughout the day. Any additional sessions or events are confirmed in your proposal.",
    date: "Step 03",
  },
  {
    question: "Planning Your Wedding Timeline",
    answer: "Planning your wedding timeline begins 60 days before your wedding, with the final details confirmed together with you. For bookings made closer to the date, we’ll agree on the planning schedule together.",
    date: "Step 04",
  },
  {
    question: "Your Wedding Day",
    answer: "I document your wedding as it unfolds, giving you space to enjoy the people around you. During couple and family portraits, I offer gentle direction to help you feel comfortable and keep the experience relaxed." + " " + publicCopy.safety,
    date: "Step 05",
  },
  {
    question: "Preview Gallery",
    answer: publicCopy.preview,
    date: "Step 06",
  },
  {
    question: "Final Gallery Delivery & Prints",
    answer: `${publicCopy.delivery} ${publicCopy.prints}`,
    date: "Step 07",
  },
  {
    question: "Wedding Albums",
    answer: "A wedding album brings your photographs together in a story you can hold and revisit. Ask me about the available album options for your wedding collection.",
    date: "Step 08",
  },
];
