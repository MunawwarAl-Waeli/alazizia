/** ظلّ معماري هادئ: قناة التواصل الوحيدة هي واتساب أو الاتصال المباشر، بلا نموذج وسيط. */
import { MessageCircle, PhoneCall } from "lucide-react";

export const contactDetails = {
  phoneDisplay: "+966 5309 89 975",
  phoneHref: "tel:+966530989975",
  email: "info@al-azizia.com",
  whatsappHref: "https://wa.me/966530989975?text=%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2%D9%8A%D8%A9%20%D9%84%D9%84%D9%85%D8%B8%D9%84%D8%A7%D8%AA%20%D9%88%D8%A7%D9%84%D8%B3%D9%88%D8%A7%D8%AA%D8%B1",
};

export function DirectContactActions({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return <div className={`direct-contact-actions ${compact ? "direct-contact-actions--compact" : ""} ${className}`}>
    <a href={contactDetails.whatsappHref} target="_blank" rel="noreferrer"><MessageCircle size={compact ? 16 : 19} />واتساب مباشر</a>
    <a href={contactDetails.phoneHref}><PhoneCall size={compact ? 16 : 19} />اتصل الآن</a>
  </div>;
}
