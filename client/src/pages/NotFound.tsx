/** ظلّ معماري هادئ: خطأ 404 بسيط مع مخرج واضح إلى الخدمات والصفحة الرئيسية. */
import { ButtonLink } from "@/components/SiteShell";
import { usePageMeta } from "@/lib/seo";
export default function NotFound() { usePageMeta("الصفحة غير موجودة", "لم يتم العثور على الصفحة المطلوبة.", "/404"); return <section className="not-found"><p className="eyebrow">404</p><h1>هذه الصفحة خارج مخطط الموقع.</h1><p>ربما تغير الرابط أو لم تعد الصفحة متاحة. يمكنك العودة إلى الخدمات أو الصفحة الرئيسية.</p><div><ButtonLink href="/" tone="dark">العودة للرئيسية</ButtonLink><ButtonLink href="/services" tone="copper">مشاهدة الخدمات</ButtonLink></div></section>; }
