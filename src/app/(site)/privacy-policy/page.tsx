import LegalContent from "./LegalContent";

export default function PrivacyPage() {
  const privacySections = [
    {
      heading: "Who we are",
      content: "Our website address is: https://vasilismoumkas.com. Vasilis Moumkas Photography is based in Thessaloniki, Greece (Melinas Merkouri 25, 54655) and provides luxury wedding and destination photography services across Greece, Italy, France, and Europe."
    },
    {
      heading: "Data Collection",
      content: "We collect personal information such as names, email addresses, and event details (location, date, guest count) through our contact forms. This data is used exclusively for communication, contract preparation, and the fulfillment of photography services."
    },
    {
      heading: "Image Usage & Copyright",
      content: "All photographs captured by Vasilis Moumkas are protected by copyright law. We respect your privacy; images are only published on this portfolio, social media, or editorial submissions with the explicit consent of the clients, ensuring an authentic legacy that transcends the moment."
    },
    {
      heading: "Cookies & Analytics",
      content: "This website uses essential cookies for functionality and analytical cookies (Google Analytics) to help us understand how visitors interact with our portfolio. If you leave a comment or use our contact form, metadata may be retained to improve our service response."
    },
    {
      heading: "How long we retain your data",
      content: "Contact form submissions and event details are retained as long as necessary to provide our services and meet legal or administrative requirements. Client gallery data is typically stored for the duration specified in your individual service contract."
    },
    {
      heading: "Your rights over your data",
      content: "You can request to receive an exported file of the personal data we hold about you or request that we erase any personal data. This does not include data we are obliged to keep for administrative, legal, or security purposes."
    },
    {
      heading: "Contact Information",
      content: "For any privacy-related inquiries, you can reach Vasilis Moumkas at vasilis.moumkas@gmail.com, by phone at +30 6972218775, or at our studio in Thessaloniki, Greece."
    }
  ];

  return <LegalContent title={<>Privacy <br/> Policy</>} sections={privacySections} />;
}