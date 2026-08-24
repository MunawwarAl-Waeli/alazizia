/** ظلّ معماري هادئ: الصفحة الرئيسية مركزة على الخدمات والأعمال وقناة تواصل مباشرة بلا نماذج وسيطة. */
import { useState } from "react";
import { ArrowDownLeft, ArrowUpLeft } from "lucide-react";
import { Link } from "wouter";
import ServiceCard from "@/components/ServiceCard";
import { ButtonLink, SectionIntro } from "@/components/SiteShell";
import { brandAssets, getInitialServices, type Service } from "@/data/services";
import { DirectContactActions } from "@/lib/contact";
import { useJsonLd, usePageMeta } from "@/lib/seo";
import "@/pages/service-cards.css";
function useServices() {
  const [services] = useState<Service[]>(getInitialServices);
  return { services, error: false };
}

export default function Home() {
  const { services, error } = useServices();
  usePageMeta(
    "مظلات وسواتر وبرجولات في جدة",
    "شركة العزيزية للمظلات والسواتر: حلول خارجية للمنازل والمنشآت تشمل المظلات والسواتر والبرجولات والجلسات والتغطيات.",
    "/"
  );
  useJsonLd({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "شركة العزيزية للمظلات والسواتر",
    description: "حلول مظلات وسواتر وبرجولات للمساحات الخارجية في السعودية",
    areaServed: "Saudi Arabia",
  });
  const featured = services.slice(0, 12);
  const workItems = featured.slice(0, 6);

  return (
    <>
      <section className="home-hero">
        <img
          src={brandAssets.architecture}
          srcSet={brandAssets.architectureSrcSet}
          sizes="100vw"
          alt=""
          className="home-hero__brand-image"
          width={1600}
          height={900}
          loading="eager"
          fetchPriority="low"
          decoding="async"
        />
        <div className="home-hero__glow" />
        <div className="container home-hero__layout">
          <div className="home-hero__copy">
            <p className="eyebrow eyebrow--copper">
              شركة العزيزية للمظلات والسواتر في جدة
            </p>
            <h1 className="home-hero__headline">
              تركيب مظلات وسواتر
              <br />
              <em>وبرجولات في جدة</em>
            </h1>
            <p>
              ننفذ مظلات سيارات، سواتر خصوصية، برجولات حدائق وتغطيات خارجية
              للمنازل والفلل والمواقف والمنشآت في جدة.
            </p>
            <div className="home-hero__actions">
              <DirectContactActions compact />
            </div>
            <div className="home-hero__note">
              <span>01</span>
              <p>
                حلول تركيب مظلات وسواتر للمنازل والحدائق والمواقف، تبدأ من
                معاينة الموقع وطبيعة الاستخدام.
              </p>
            </div>
          </div>
          <div className="home-hero__project">
            <img
              src="/media/services/garden-umbrellas/garden-umbrellas-32.webp"
              alt="برجولة وجلسة خارجية من أعمال الشركة"
              width={500}
              height={500}
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
            <div className="home-hero__project-label">
              <span>مساحات خارجية</span>
              <ArrowDownLeft size={22} />
            </div>
          </div>
        </div>
      </section>
      <section className="intro-strip">
        <div className="container intro-strip__layout">
          <p>
            نركب المظلات والسواتر والبرجولات للمنازل والفلل والمواقف والحدائق
            والمنشآت في جدة
          </p>
          <div>
            <span>مظلات</span>
            <span>سواتر</span>
            <span>برجولات</span>
            <span>تغطيات</span>
          </div>
        </div>
      </section>
      <section id="services" className="section section--mist">
        <div className="container">
          <SectionIntro
            eyebrow=" خدمات المظلات والسواتر"
            title="تركيب مظلات وسواتر وبرجولات حسب احتياجك."
            copy="استكشف خدمات تركيب المظلات والسواتر والبرجولات والتغطيات للمنازل والحدائق والمواقف والمنشآت، مع صفحة تفصيلية وصورة مستقلة لكل خدمة."
          />
          {error ? (
            <div className="inline-notice">
              تعذر تحميل قائمة الخدمات في هذه اللحظة، يرجى المحاولة مجددًا.
            </div>
          ) : featured.length ? (
            <>
              <div className="services-grid home-services-grid">
                {featured.map((service, index) => (
                  <ServiceCard
                    key={service.slug}
                    service={service}
                    index={index}
                  />
                ))}
              </div>
              <div className="home-services__action">
                <ButtonLink href="/services" tone="dark">
                  مشاهدة كل خدمات المظلات والسواتر
                </ButtonLink>
              </div>
            </>
          ) : (
            <div className="loading-grid">
              {Array.from({ length: 12 }).map((_, index) => (
                <span key={index} />
              ))}
            </div>
          )}
        </div>
      </section>
      <div className="service-cards">
        <div className="service-cards__grid">
          {workItems.map(service => (
            <article className="service-card" key={service.slug}>
              <div className="service-card__image">
                  <img
                    src={service.image}
                    alt={`${service.title} من أعمال شركة العزيزية`}
                    width={500}
                    height={500}
                    loading="lazy"
                    decoding="async"
                  />

                <Link
                  href={`/services/${service.slug}`}
                  className="service-card__link"
                  aria-label={`عرض خدمة ${service.title}`}
                >
                  <span className="service-card__icon">
                    <ArrowUpLeft size={20} strokeWidth={2} aria-hidden="true" />
                  </span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
      <section className="cta-band">
        <img
          src={brandAssets.ctaCanopy}
          alt=""
          width={500}
          height={500}
          loading="lazy"
          decoding="async"
        />
        <div className="cta-band__veil" />
        <div className="container cta-band__inner">
          <p className="eyebrow eyebrow--copper">ابدأ من موقعك</p>
          <h2>
            لديك مساحة؟
            <br />
            نتحدث عنها الآن.
          </h2>
          <p>
            أرسل صورة للموقع أو اتصل بنا مباشرة. نساعدك في تحديد الخدمة الأقرب
            وطريقة البداية المناسبة لمساحتك.
          </p>
          <DirectContactActions className="cta-band__actions" />
          <div className="cta-band__contact-note">
            <span>واتساب أو اتصال مباشر</span>
            <strong>+966 5309 89 975</strong>
          </div>
        </div>
      </section>
    </>
  );
}
