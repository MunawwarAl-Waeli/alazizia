import { useEffect, useMemo, useState, useRef } from "react";
import { Search } from "lucide-react";
import { PageHero, SectionIntro } from "@/components/SiteShell";
import ServiceCard from "@/components/ServiceCard";
import { brandAssets, loadServices, type Service } from "@/data/services";
import { DirectContactActions } from "@/lib/contact";
import { usePageMeta } from "@/lib/seo";

/**
 * صفحة جميع الخدمات
 */
export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("الكل");

  // مرجع للتحكم في التمرير التلقائي لأعلى قسم الخدمات
  const servicesSectionRef = useRef<HTMLElement>(null);

  /**
   * SEO - (تم الحفاظ عليها كما طلبت)
   */
  usePageMeta(
    "مظلات وسواتر وبرجولات جدة | شركة العزيزية",
    "تركيب وتصميم مظلات وسواتر وبرجولات في جدة للمنازل والفلل ومواقف السيارات والحدائق والمسابح والمنشآت. تعرف على خدمات شركة العزيزية واختر الحل المناسب لموقعك.",
    "/services"
  );

  /**
   * تحميل الخدمات
   */
  useEffect(() => {
    loadServices()
      .then(setServices)
      .catch(() => setServices([]));
  }, []);

  /**
   * التصنيفات
   */
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(services.map(service => service.category).filter(Boolean))
    );
    return ["الكل", ...uniqueCategories];
  }, [services]);

  /**
   * البحث والتصفية والترتيب
   */
  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = services.filter(service => {
      const matchesFilter = filter === "الكل" || service.category === filter;

      if (!matchesFilter) return false;
      if (!normalizedQuery) return true;

      const searchableContent = [
        service.title,
        service.description,
        service.category,
        ...((
          service as Service & { keywords?: string[]; searchTerms?: string[] }
        ).keywords ?? []),
        ...((
          service as Service & { keywords?: string[]; searchTerms?: string[] }
        ).searchTerms ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableContent.includes(normalizedQuery);
    });

    // ترتيب النتائج
    return filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (a.priority ?? 99) - (b.priority ?? 99);
    });
  }, [filter, query, services]);

  /**
   * الخدمات المميزة
   */
  const featured = useMemo(() => {
    return visible.filter(service => service.featured).slice(0, 4);
  }, [visible]);

  /**
   * بقية الخدمات
   */
  const remainder = useMemo(() => {
    const featuredSlugs = new Set(featured.map(service => service.slug));
    return visible.filter(service => !featuredSlugs.has(service.slug));
  }, [featured, visible]);

  /**
   * عدد الخدمات
   */
  const getServiceCountLabel = (count: number) => {
    if (count === 0) return "لا توجد خدمات";
    if (count === 1) return "خدمة واحدة";
    if (count === 2) return "خدمتان";
    if (count >= 3 && count <= 10) return `${count} خدمات`;
    return `${count} خدمة`;
  };

  const isLoading = services.length === 0;

  // دالة تغيير التصنيف مع التمرير الناعم
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);

    // التمرير الناعم لأعلى الخدمات لمنع قفز الصفحة للأسفل
    if (servicesSectionRef.current) {
      const offset = 90; // مسافة الهيدر العلوي
      const elementPosition =
        servicesSectionRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <PageHero
        eyebrow="خدمات المظلات والسواتر والبرجولات في جدة"
        title="حلول متخصصة للمساحات الخارجية في جدة"
        description="نقدم تصميم وتفصيل وتركيب المظلات والسواتر والبرجولات وحلول التغطية للمنازل والفلل ومواقف السيارات والحدائق والمسابح والمنشآت، مع اختيار الحل المناسب لطبيعة كل موقع."
        image={brandAssets.architecture}
      />

      {/* تم ربط الـ ref هنا */}
      <section className="section section--mist" ref={servicesSectionRef}>
        <div className="container relative">
          <SectionIntro
            eyebrow={`${services.length || 0} خدمة متخصصة`}
            title="اختر الحل المناسب لمساحتك"
            copy="استعرض خدماتنا في جدة، واستخدم البحث أو التصنيفات للوصول إلى الخدمة المناسبة."
          />

          {/* الغلاف اللاصق لشريط البحث والتصنيفات */}
          <div className="sticky-toolbar-wrapper">
            <div className="catalog-toolbar">
              <div className="catalog-search">
                <Search size={18} />
                <input
                  type="search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="ابحث عن مظلات، سواتر، برجولات..."
                  aria-label="البحث عن خدمة"
                />
              </div>

              <div className="catalog-filters scrollable-filters">
                {categories.map(category => (
                  <button
                    type="button"
                    className={filter === category ? "is-active" : ""}
                    onClick={() => handleFilterChange(category)}
                    key={category}
                    aria-pressed={filter === category}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!isLoading && (
            <p className="catalog-count" aria-live="polite">
              {query.trim() || filter !== "الكل"
                ? `${getServiceCountLabel(visible.length)} متاحة`
                : `${getServiceCountLabel(services.length)} متاحة`}
            </p>
          )}

          {services.length ? (
            <>
              {featured.length > 0 && (
                <aside
                  className="services-project-index"
                  aria-label="الخدمات المميزة"
                >
                  <div className="services-project-index__statement">
                    <span>{String(featured.length).padStart(2, "0")}</span>
                    <div>
                      <p>
                        خدمات مختارة من أعمالنا في جدة، نبدأ من{" "}
                        <strong>احتياج الموقع</strong> ثم نحدد الحل الأنسب من
                        حيث الاستخدام والخامة وطريقة التنفيذ.
                      </p>
                    </div>
                  </div>

                  {featured[0] && (
                    <ServiceCard service={featured[0]} index={0} />
                  )}

                  {featured.length > 1 && (
                    <div className="services-project-index__side">
                      {featured.slice(1).map((service, index) => (
                        <ServiceCard
                          key={service.slug}
                          service={service}
                          index={index + 1}
                        />
                      ))}
                    </div>
                  )}
                </aside>
              )}

              {remainder.length > 0 && (
                <>
                  <div className="catalog-all-services-heading">
                    <p className="eyebrow">جميع الخدمات</p>
                    <h2>حلول مصممة حسب طبيعة الاستخدام</h2>
                  </div>

                  <div
                    className="services-grid services-grid--catalog"
                    aria-label="قائمة الخدمات"
                  >
                    {remainder.map((service, index) => (
                      <ServiceCard
                        key={service.slug}
                        service={service}
                        index={index + featured.length}
                      />
                    ))}
                  </div>
                </>
              )}

              {visible.length === 0 && (
                <div className="inline-notice">
                  لا توجد خدمة مطابقة لبحثك.
                  <br />
                  جرّب كلمة أخرى مثل:
                  <strong> سيارات، حدائق، سواتر، برجولات، قماش، لكسان </strong>
                  أو اختر تصنيفًا مختلفًا.
                </div>
              )}
            </>
          ) : (
            <div className="inline-notice">جارٍ تجهيز الخدمات...</div>
          )}

          <aside className="catalog-direct-contact">
            <div>
              <p className="eyebrow">
                خدمات المظلات والسواتر والبرجولات في جدة
              </p>
              <h2>لا تعرف أي خدمة تناسب موقعك؟</h2>
              <p>
                أرسل صورة للمكان والمقاسات التقريبية إن توفرت، وسنساعدك في تحديد
                الحل المناسب حسب الاستخدام والمساحة المطلوبة.
              </p>
            </div>

            <DirectContactActions className="catalog-direct-contact__actions" />
          </aside>
        </div>
      </section>
    </>
  );
}
