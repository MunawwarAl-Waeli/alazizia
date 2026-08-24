/**
 * مصدر الخدمات وإدارتها: ربط تلقائي وديناميكي للصور بناءً على مسارات المجلدات.
 */

import servicePayload from "../../../static-assets/services-data_71caf2b0.json";

export type Service = {
  id: string;
  slug: string;
  title: string;
  category: string;
  seoTitle: string;
  seoDescription: string;
  description: string;
  image: string;
  featured: boolean;
  priority?: number;
  uses: string[];
  materials: string[];
  keywords?: string[];
  searchTerms?: string[];
  galleryImages: string[]; // إضافة هذا الحقل
};

const SERVICE_ITEMS: Service[] = (
  Array.isArray(servicePayload) ? servicePayload : servicePayload.services
) as Service[];

const NORMALIZED_SERVICES = SERVICE_ITEMS.map(item => ({
  ...item,
  image: getServiceImage(item),
}));

export function getInitialServices(): Service[] {
  return NORMALIZED_SERVICES;
}

// -----------------------------------------------------
// 1. توليد المسارات الديناميكية للصور (Dynamic Image Resolution)
// -----------------------------------------------------

/**
 * جلب صورة الغلاف الرئيسية للخدمة اعتماداً على الـ slug
 * المسار المتوقع: /media/services/[slug]/cover.webp
 */
export function getServiceImage(serviceOrSlug: Service): string {
  return serviceOrSlug.image;
}

/**
 * جلب معرض الصور الخاص بالخدمة ديناميكياً
 * المسار المتوقع: /media/services/[slug]/1.webp, 2.webp, 3.webp...
 */
/**
 * جلب معرض الصور بناءً على الأسماء المعرفة في بيانات الخدمة
 */
/**
 * جلب معرض الصور بناءً على المسارات الكاملة المعرفة في بيانات الخدمة
 */
export function getServiceGallery(service: Service) {
  if (!service.galleryImages || service.galleryImages.length === 0) {
    return [];
  }

  return service.galleryImages.map(imagePath => {
    // استخراج اسم الملف الأخير فقط
    const fileName = imagePath.split("/").pop() || "";

    // تنظيف اسم الملف لاستخدامه كعنوان نصي (Title/Alt) بالعربي
    const cleanTitle = fileName
      .replace(/-/g, " ")
      .replace(/\.(webp|jpg|png)$/, "");

    // ترميز المسار بالكامل للتأكد من قراءة الحروف العربية بشكل صحيح
    // encodeURI يحافظ على علامات / والـ : بينما يرمز الحروف العربية والمسافات
    const safeSrc = encodeURI(imagePath);

    return {
      src: safeSrc,
      title: cleanTitle || service.title,
      category: service.category,
    };
  });
}

export function getCategory(service: Service) {
  return service.category;
}

// -----------------------------------------------------
// 2. أصول الهوية البصرية والمستلزمات العشواءية (Brand Assets)
// -----------------------------------------------------

export const brandAssets = {
  logo: "/media/company-logo_596a3868.png",
  architecture: "/media/jeddah-shades-architectural-reference_e7af56f7-1600.webp",
  architectureSrcSet:
    "/media/jeddah-shades-architectural-reference_e7af56f7-1024.webp 1024w, /media/jeddah-shades-architectural-reference_e7af56f7-1600.webp 1600w",
  ctaCanopy:
    "/media/services/tensile-structure-umbrellas/tensile-structure-umbrellas-2.webp",
  materials: "/media/services/fabric-screens/fabric-screens-1.webp",
};

// -----------------------------------------------------
// 3. النظرة العامة والنصوص الترويجية (Dynamic Overviews)
// -----------------------------------------------------

export function getServiceOverview(service: Service): string {
  const title = service.title;
  const slug = service.slug;

  if (
    slug.includes("pergola") ||
    title.includes("برجولات") ||
    title.includes("جلسات")
  ) {
    return `تنفذ شركة العزيزية ${title} للمنازل والحدائق والمساحات الخارجية في جدة، مع الاهتمام بتوزيع الظل وشكل الهيكل وطريقة الاستخدام. نساعدك على اختيار التصميم والخامة المناسبة للموقع للحصول على مساحة عملية ومريحة ومتناسقة مع المبنى.`;
  }

  if (slug.includes("screen") || title.includes("سواتر")) {
    return `توفر شركة العزيزية ${title} في جدة حلولًا عملية للخصوصية وتنظيم المساحات الخارجية. يتم تحديد نوع الساتر وارتفاعه وطريقة تثبيته وفق طبيعة الموقع واتجاهات الرؤية ومتطلبات الاستخدام، مع تنفيذ مرتب ومتين.`;
  }

  if (
    slug.includes("panel") ||
    slug.includes("lexan") ||
    title.includes("تغطية") ||
    title.includes("ساندوتش")
  ) {
    return `تنفذ شركة العزيزية ${title} في جدة لتغطية الأسقف والمساحات الخارجية وحمايتها من العوامل الجوية. نراعي طبيعة المكان ونقاط التثبيت والتصريف والعزل للوصول إلى تغطية عملية ومناسبة للاستخدام.`;
  }

  if (slug.includes("maintenance") || title.includes("صيانة")) {
    return `تقدم شركة العزيزية خدمة ${title} في جدة للمظلات والهياكل الخارجية، وتشمل فحص حالة الهيكل والتغطية ونقاط التثبيت ومعالجة المشكلات التي تؤثر في المتانة أو الاستخدام.`;
  }

  return `تقدم شركة العزيزية ${title} في جدة للمنازل والفلل ومواقف السيارات والحدائق والمنشآت. نحدد نوع المظلة والتصميم والخامة وفق مساحة الموقع ودرجة التعرض للشمس وطبيعة الاستخدام للحصول على حل عملي ومناسب.`;
}

export function getServiceContactCopy(service: Service): string {
  return `هل تبحث عن ${service.title} بتصميم مناسب لمساحتك؟ أرسل صورة للموقع وأبعاده التقريبية عبر واتساب، أو اتصل بنا مباشرة لنرتب الخطوة التالية بوضوح.`;
}

// -----------------------------------------------------
// 4. تحميل قائمة الخدمات وتحقين أبعاد الصور تلقائياً
// -----------------------------------------------------

let serviceCache: Promise<Service[]> | undefined;

export function loadServices(): Promise<Service[]> {
  if (!serviceCache) {
    serviceCache = Promise.resolve(getInitialServices());
  }

  return serviceCache;
}
