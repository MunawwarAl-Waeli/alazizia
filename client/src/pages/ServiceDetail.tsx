import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Link, useRoute } from "wouter";
import { ButtonLink, PageHero, SectionIntro } from "@/components/SiteShell";
import ServiceCard from "@/components/ServiceCard";
import {
  getCategory,
  getServiceContactCopy,
  getServiceGallery,
      getInitialServices,
    type Service,

} from "@/data/services";
import { DirectContactActions } from "@/lib/contact";
import { useJsonLd, usePageMeta } from "@/lib/seo";

export default function ServiceDetail() {
  const [, params] = useRoute("/services/:slug");

  const [services] = useState<Service[]>(getInitialServices);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // حالة جديدة للتحكم في السحب عبر شاشات اللمس (Swipe) في الجوال
  const [touchStart, setTouchStart] = useState<number | null>(null);

  /*
   * الخدمة الحالية
   */
  const service = useMemo(
    () => services.find(item => item.slug === params?.slug),
    [services, params?.slug]
  );

  /*
   * الخدمات المرتبطة (نعتمد على التصنيف)
   */
  const related = useMemo(
    () =>
      service
        ? services
            .filter(
              item =>
                item.slug !== service.slug &&
                getCategory(item) === getCategory(service)
            )
            .slice(0, 3) // عرض 3 خدمات مرتبطة كحد أقصى ليتناسب مع الشبكة
        : [],
    [service, services]
  );

  /*
   * معرض الصور المرتبط بالخدمة
   */
  const serviceGallery = useMemo(
    () => (service ? getServiceGallery(service) : []),
    [service, services]
  );

  /*
   * نص التواصل
   */
  const contactCopy = service ? getServiceContactCopy(service) : "";

  /*
   * SEO
   */
  usePageMeta(
    service?.seoTitle ??
      (service
        ? `${service.title} في جدة | شركة العزيزية للمظلات والسواتر`
        : "خدمات المظلات والسواتر والبرجولات في جدة"),
    service?.seoDescription ??
      (service
        ? `${service.title} في جدة من شركة العزيزية للمظلات والسواتر. تعرف على تفاصيل الخدمة والصور والخيارات المتاحة وتواصل معنا مباشرة.`
        : "خدمات المظلات والسواتر والبرجولات والتغطيات في جدة من شركة العزيزية للمظلات والسواتر."),
    `/services/${params?.slug ?? ""}`
  );

  /*
   * Structured Data
   */
  useJsonLd(
    service
      ? {
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.title,
          description: service.seoDescription || service.description,
          serviceType: service.title,
          areaServed: {
            "@type": "City",
            name: "جدة",
            containedInPlace: {
              "@type": "Country",
              name: "Saudi Arabia",
            },
          },
          provider: {
            "@type": "LocalBusiness",
            name: "شركة العزيزية للمظلات والسواتر",
            address: {
              "@type": "PostalAddress",
              addressLocality: "جدة",
              addressCountry: "SA",
            },
          },
          image: service.image,
          url:
            typeof window !== "undefined"
              ? `${window.location.origin}/services/${service.slug}`
              : `/services/${service.slug}`,
        }
      : {}
  );

  /*
   * إغلاق معرض الصور
   */
  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  /*
   * الصورة التالية
   */
  const nextImage = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    if (!serviceGallery.length) return;
    setLightboxIndex(current =>
      current === null || current >= serviceGallery.length - 1 ? 0 : current + 1
    );
  };

  /*
   * الصورة السابقة
   */
  const prevImage = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    if (!serviceGallery.length) return;
    setLightboxIndex(current =>
      current === null || current <= 0 ? serviceGallery.length - 1 : current - 1
    );
  };

  /*
   * دوال السحب باللمس (Swipe) للجوال
   */
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff > 50) nextImage(); // سحب لليسار = الصورة التالية
    if (diff < -50) prevImage(); // سحب لليمين = الصورة السابقة
    setTouchStart(null);
  };

  /*
   * التنقل بالكيبورد داخل معرض الصور
   */
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") nextImage();
      if (event.key === "ArrowRight") prevImage();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex, serviceGallery.length]);

  /*
   * حالة التحميل
   */
  if (!services.length) {
    return (
      <section className="detail-loading">
        <span>جارٍ تحميل الخدمة...</span>
      </section>
    );
  }

  /*
   * الخدمة غير موجودة
   */
  if (!service) {
    return (
      <section className="not-found">
        <p className="eyebrow">404</p>
        <h1>هذه الخدمة غير موجودة</h1>
        <p>ربما تغير رابط الخدمة أو لم تعد الخدمة متاحة حاليًا.</p>
        <ButtonLink href="/services" tone="dark">
          مشاهدة جميع الخدمات
        </ButtonLink>
      </section>
    );
  }

  return (
    <>
      {/* =====================================================
          Hero
      ====================================================== */}
      <PageHero
        className="page-hero--service"
        eyebrow={`${getCategory(service)} · جدة`}
        title={service.title}
        description={service.description}
        image={service.image}
      >
        {/* إضافة مسار الصفحات (Breadcrumbs) لـ UX و SEO أفضل */}
        <div className="breadcrumbs" style={{ marginBottom: "1.5rem" }}>
          <Link href="/">الرئيسية</Link>{" "}
          <span style={{ margin: "0 0.5rem" }}>/</span>
          <Link href="/services">الخدمات</Link>{" "}
          <span style={{ margin: "0 0.5rem" }}>/</span>
          <span style={{ color: "#fff", opacity: 0.8 }}>{service.title}</span>
        </div>

        <DirectContactActions compact className="page-hero__direct" />
      </PageHero>

      {/* =====================================================
          Gallery
      ====================================================== */}
      <section className="section section--mist service-showcase">
        <div className="container">
          <SectionIntro
            eyebrow="صور وأعمال مشابهة"
            title={`نماذج من أعمال ${service.title}`}
            copy={`صور وأعمال مرتبطة بخدمة ${service.title} تساعدك على تصور الشكل والخامات وطريقة التنفيذ قبل التواصل معنا.`}
          />

          {serviceGallery.length > 0 ? (
            <div
              className="service-project-gallery"
              aria-label={`صور ${service.title}`}
            >
              {serviceGallery.map((item, index) => (
                <figure
                  className={`service-project-gallery__item service-project-gallery__item--${
                    (index % 6) + 1
                  }`}
                  key={`${service.slug}-${item!.src}-${index}`}
                  onClick={() => setLightboxIndex(index)}
                  role="button"
                  tabIndex={0}
                  aria-label={`فتح صورة ${service.title}`}
                  onKeyDown={event => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setLightboxIndex(index);
                    }
                  }}
                >
                  <img
                    src={item!.src.toString()}
                    alt={`${service.title} في جدة - نموذج من الأعمال`}
                    width={500}
                    height={500}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    onError={e => {
                      const target = e.target as HTMLElement;
                      if (target.parentElement) {
                        target.parentElement.style.display = "none";
                      }
                    }}
                  />
                </figure>
              ))}
            </div>
          ) : (
            <div className="inline-notice">
              لا توجد صور إضافية متاحة لهذه الخدمة حاليًا.
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          الخدمات المرتبطة (Related Services) - تمت إضافتها
      ====================================================== */}
      {related.length > 0 && (
        <section className="section" style={{ background: "var(--paper)" }}>
          <div className="container">
            <SectionIntro
              eyebrow="مزيد من الخيارات"
              title="خدمات ذات صلة"
              copy="استكشف المزيد من الخدمات والحلول المشابهة التي قد تناسب احتياجات موقعك."
            />
            <div className="services-grid services-grid--catalog">
              {related.map((relatedService, index) => (
                <ServiceCard
                  key={relatedService.slug}
                  service={relatedService}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          CTA & Support Banner (صورة كخلفية مدمجة بالثيم)
      ====================================================== */}
      <section className="service-cta-banner">
        {/* الصورة كخلفية مع تأثير الدمج الاحترافي */}
        <div className="service-cta-banner__bg">
          <img
            src="/media/flat-illustration-customer-support-1.png.webp"
            alt="خدمة العملاء والدعم"
            width={2000}
            height={2000}
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="container service-cta-banner__inner">
          <div className="service-cta-banner__content">
            <p className="eyebrow eyebrow--copper">نحن هنا لخدمتك</p>

            <h2>دعنا نساعدك على تحقيق إنجاز أكثر من رائع</h2>

            <p>
              يسعدنا أن نكون في خدمتكم وحسن ظنكم، ووضع اللمسات لصالح نموذج العمل
              المخصص لكم.
            </p>

            <DirectContactActions className="service-cta-banner__actions" />
          </div>
        </div>
      </section>

      {/* =====================================================
          Lightbox (مع دعم السحب باللمس)
      ====================================================== */}
      {lightboxIndex !== null && serviceGallery[lightboxIndex] && (
        <div
          className="lightbox-overlay"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`عرض صور ${service.title}`}
        >
          <button
            type="button"
            className="lightbox-btn lightbox-close"
            onClick={closeLightbox}
            aria-label="إغلاق الصورة"
          >
            <X size={26} />
          </button>

          <div
            className="lightbox-content"
            onClick={event => event.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <button
              type="button"
              className="lightbox-btn lightbox-prev"
              onClick={prevImage}
              aria-label="الصورة السابقة"
            >
              <ChevronRight size={32} />
            </button>

            <img
              src={serviceGallery[lightboxIndex].src.toString()}
              alt={`${service.title} في جدة - صورة تنفيذ`}
              className="lightbox-img"
            />

            <button
              type="button"
              className="lightbox-btn lightbox-next"
              onClick={nextImage}
              aria-label="الصورة التالية"
            >
              <ChevronLeft size={32} />
            </button>
          </div>

          <div
            className="lightbox-counter"
            style={{
              position: "absolute",
              bottom: "2rem",
              color: "white",
              fontFamily: "var(--font-display)",
              letterSpacing: "2px",
            }}
          >
            {lightboxIndex + 1} / {serviceGallery.length}
          </div>
        </div>
      )}
    </>
  );
}
