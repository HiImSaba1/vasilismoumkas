import LegalContent from "../privacy-policy/LegalContent";

export default function CookiesPage() {
  const cookieSections = [
    {
      heading: "What are cookies?",
      content: "Cookies are small text files containing a string of characters that can be placed on your computer or mobile device that uniquely identifies your browser or device. We may use technologies like cookies, pixels and local storage to deliver, secure, and understand products, services, and ads."
    },
    {
      heading: "What are cookies used for?",
      content: "Cookies and other technologies allow a site or services to know if your computer or device has visited it before. They help us understand how the site is being used, help you navigate between pages efficiently, remember your preferences, and generally improve your experience. They also help ensure that the marketing you see online is more relevant to you."
    },
    {
      heading: "Why does Vasilis Moumkas Photography use cookies?",
      content: "We use these technologies to show you relevant content, improve your experience, and help protect Vasilis Moumkas Photography and our users. This includes essential cookies for secure areas (like client galleries), performance cookies (Google Analytics) to see which galleries are most popular, and functional cookies to remember choices like your language or region."
    },
    {
      heading: "How long will cookies stay on my device?",
      content: "The length of time depends on whether it is a 'persistent' or 'session' cookie. Session cookies stay until you stop browsing, while persistent cookies stay until they expire or are deleted."
    },
    {
      heading: "First and third party cookies",
      content: "First-party cookies belong to Vasilis Moumkas Photography. Third-party cookies are placed by other parties through our Service, such as analytics providers or business partners to help measure the effectiveness of our artistic showcase."
    },
    {
      heading: "How to control cookies",
      content: "You can modify your cookie settings within your browser's 'Help', 'Tools' or 'Edit' facility. Please note that disabling cookies may prevent you from accessing certain parts of our Service, such as private client galleries."
    }
  ];

return <LegalContent title={<>Cookies <br/> Policy</>} sections={cookieSections} />;}