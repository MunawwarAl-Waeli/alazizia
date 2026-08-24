/** ظلّ معماري هادئ: خريطة HTML ديناميكية تعرض كل الخدمات الرسمية لتدعيم التنقل والروابط الداخلية. */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { PageHero } from "@/components/SiteShell";
import { brandAssets, loadServices, type Service } from "@/data/services";
import { usePageMeta } from "@/lib/seo";

export default function SiteMapPage() {
  const [services, setServices] = useState<Service[]>([]); usePageMeta("خريطة الموقع", "روابط منظمة لجميع أقسام موقع شركة العزيزية للمظلات والسواتر والخدمات المتاحة.", "/sitemap");
  useEffect(() => { loadServices().then(setServices).catch(() => setServices([])); }, []);
  return <><PageHero eyebrow="دليل التنقل" title="خريطة الموقع" description="روابط واضحة للصفحات الرئيسية وكامل كتالوج الخدمات." image={brandAssets.architecture} /><section className="section section--mist"><div className="container sitemap-grid"><section><p className="eyebrow">الصفحات الرئيسية</p><h2>استكشف الموقع</h2>{[["الرئيسية", "/"], ["الخدمات", "/services"], ["المعرض", "/gallery"], ["عن الشركة", "/about"]].map(([name, href]) => <Link key={href} href={href}>{name}</Link>)}</section><section><p className="eyebrow">الخدمات</p><h2>كل الخدمات</h2>{services.length ? services.map((service) => <Link key={service.slug} href={`/services/${service.slug}`}>{service.title}</Link>) : <span>جارٍ تجهيز الروابط…</span>}</section></div></section></>;
}
