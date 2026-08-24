/** ظلّ معماري هادئ: معرض بصري ديناميكي يقرأ صور الخدمات مباشرة وبدون تعقيد. */
import { useEffect, useState, useMemo, useRef } from "react";
import { PageHero } from "@/components/SiteShell";
import {
  brandAssets,
  loadServices,
  getServiceGallery,
  type Service,
} from "@/data/services";
import { usePageMeta } from "@/lib/seo";
import altTextsData from "@/data/serviceAltTexts.json";

// عدد الصور التي سيتم عرضها في كل دفعة (مهم جداً لأداء الجوال)
const ITEMS_PER_PAGE = 30;

export default function Gallery() {
  const [category, setCategory] = useState("الكل");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // مرجع للتحكم في التمرير التلقائي لأعلى المعرض
  const galleryRef = useRef<HTMLDivElement>(null);

  usePageMeta(
    "معرض الأعمال",
    "مشاهد وصور من خدمات المظلات والسواتر والبرجولات والجلسات الخارجية والتغطيات.",
    "/gallery"
  );

  // تحميل قائمة الخدمات ديناميكياً عند فتح الصفحة
  useEffect(() => {
    loadServices()
      .then(data => setServices(data))
      .catch(error => console.error("خطأ في تحميل المعرض:", error))
      .finally(() => setLoading(false));
  }, []);

  // استخراج الأقسام تلقائياً وبشكل ديناميكي من الخدمات المحملة
  const categories = useMemo(() => {
    return [
      "الكل",
      ...Array.from(
        new Set(services.map(item => item.category).filter(Boolean))
      ),
    ];
  }, [services]);

  // إنتاج قائمة الصور لكل خدمات الموقع
  const allGalleryItems = useMemo(() => {
    return services.flatMap(service => {
      const serviceAlts = altTextsData[
        service.slug as keyof typeof altTextsData
      ] || [service.title];

      const rawItems = [
        {
          src: service.image,
          title: service.title,
          category: service.category,
        },
        ...getServiceGallery(service),
      ];

      return rawItems.map((item, idx) => ({
        ...item,
        alt: serviceAlts[idx % serviceAlts.length],
      }));
    });
  }, [services]);

  // فلترة الصور حسب القسم المختار
  const filteredItems = useMemo(() => {
    return allGalleryItems.filter(
      item => category === "الكل" || item.category === category
    );
  }, [allGalleryItems, category]);

  // الصور المعروضة فعلياً في الصفحة حالياً
  const visibleItems = filteredItems.slice(0, visibleCount);

  // دالة تغيير التصنيف مع التمرير الناعم للأعلى
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setVisibleCount(ITEMS_PER_PAGE); // إعادة تعيين عدد الصور

    // التمرير الناعم إلى بداية المعرض
    if (galleryRef.current) {
      const offset = 80; // مسافة تعويضية للهيدر العلوي، يمكنك تعديل الرقم إذا كان الهيدر يغطي على الأزرار
      const elementPosition = galleryRef.current.getBoundingClientRect().top;
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
        eyebrow="صور من الأعمال"
        title="المادة والظل في مشاهد حقيقية."
        description="استكشف صورًا مختارة من أعمال المظلات والسواتر والبرجولات والتغطيات الخارجية."
        image={brandAssets.architecture}
      />

      {/* تم ربط المرجع (ref) هنا */}
      <section className="section section--mist" ref={galleryRef}>
        <div className="container relative">
          {/* شريط التصنيفات اللاصق */}
          <div className="sticky-filters-wrapper">
            <div className="gallery-filters">
              {categories.map(item => (
                <button
                  key={item}
                  onClick={() => handleCategoryChange(item)}
                  className={`filter-btn ${item === category ? "is-active" : ""}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* عرض الصور */}
          {loading ? (
            <div className="loading-state">جاري تحميل المعرض...</div>
          ) : (
            <>
              <div className="gallery-grid">
                {visibleItems.map((item, index) => (
                  <figure
                    className={`gallery-item gallery-item--${(index % 5) + 1}`}
                    key={`${item.src}-${index}`}
                  >
                    <img
                      src={item.src.toString()}
                      alt={item.alt}
                      loading={index < 6 ? "eager" : "lazy"}
                      onError={e => {
                        const target = e.target as HTMLElement;
                        if (target.parentElement) {
                          target.parentElement.style.display = "none";
                        }
                      }}
                    />
                    <figcaption>
                      <span>{item.category}</span>
                      <strong>{item.alt}</strong>
                    </figcaption>
                  </figure>
                ))}
              </div>

              {/* زر عرض المزيد */}
              {visibleCount < filteredItems.length && (
                <div className="load-more-container">
                  <button
                    onClick={() =>
                      setVisibleCount(prev => prev + ITEMS_PER_PAGE)
                    }
                    className="load-more-btn"
                  >
                    عرض المزيد ({filteredItems.length - visibleCount})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
