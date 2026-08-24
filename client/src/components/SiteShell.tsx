/** ظلّ معماري هادئ: هيكل RTL ثابت يحافظ على وضوح التنقل بين جميع الصفحات والخدمات. */
import { useEffect, useState, useRef, forwardRef, type ReactNode } from "react";
import {
  Menu,
  X,
  ArrowUpLeft,
  ChevronLeft,
  MessageCircle,
  Phone,
  MessageSquare,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { brandAssets } from "@/data/services";
import { contactDetails, DirectContactActions } from "@/lib/contact";

const links = [
  ["الرئيسية", "/"],
  ["الخدمات", "/services"],
  ["المعرض", "/gallery"],
  ["عن الشركة", "/about"],
] as const;

// 1. استخدام forwardRef لدعم تمرير المراجع بدون أخطاء تداخل الروابط
export const ButtonLink = forwardRef<
  HTMLAnchorElement,
  {
    href: string;
    children: ReactNode;
    tone?: "dark" | "copper" | "light";
    className?: string;
  }
>(({ href, children, tone = "dark", className = "" }, ref) => {
  return (
    <Link
      href={href}
      ref={ref} /* تمرير المرجع مباشرة لمكون Link */
      className={`button-link button-link--${tone} ${className}`}
    >
      {/* استخدمنا span بدلاً من a لمنع تداخل الروابط (Nesting Error) */}
      <span className="inline-flex items-center gap-2 w-full h-full">
        {children}
        <ArrowUpLeft size={18} strokeWidth={1.8} />
      </span>
    </Link>
  );
});
ButtonLink.displayName = "ButtonLink";

export function SectionIntro({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-intro">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <div className="section-intro__aside">
        {copy && <p>{copy}</p>}
        {action}
      </div>
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageSrcSet,
  children,
  className = "",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  image?: string;
  imageSrcSet?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`page-hero ${className}`}>
      {image && (
        <img
          src={image}
          srcSet={imageSrcSet}
          sizes="100vw"
          alt=""
          className="page-hero__image"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      )}
      <div className="page-hero__veil" />
      <div className="container page-hero__inner">
        <nav className="breadcrumbs" aria-label="مسار التنقل">
          <Link href="/">الرئيسية</Link>
          <ChevronLeft size={15} aria-hidden="true" />
          <span aria-current="page">{title}</span>
        </nav>
        <div className="page-hero__copy">
          <p className="eyebrow eyebrow--light">{eyebrow}</p>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}

// 2. المكون الاحترافي للزر العائم (Stitch-like Widget)
function FloatingContactWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // إغلاق الويدجت عند النقر خارجه
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        widgetRef.current &&
        !widgetRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="stitch-widget" ref={widgetRef}>
      <div className={`stitch-widget__menu ${isOpen ? "is-open" : ""}`}>
        <a
          href={contactDetails.phoneHref}
          className="stitch-widget__item stitch-widget__item--phone"
          aria-label="اتصل بنا"
          title="اتصل بنا"
        >
          <Phone size={20} />
        </a>
        <a
          href={contactDetails.whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="stitch-widget__item stitch-widget__item--whatsapp"
          aria-label="تواصل عبر واتساب"
          title="تواصل عبر واتساب"
        >
          <MessageCircle size={22} />
        </a>
      </div>
      <button
        className={`stitch-widget__toggle ${isOpen ? "is-active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="خيارات التواصل"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}

export default function SiteShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  // إدارة التمرير وإغلاق القائمة عند تغيير الصفحة
  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location]);

  // مراقبة التمرير للهيدر
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    onScroll(); // فحص أولي
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 3. منع تمرير الشاشة (Body Lock) عند فتح القائمة في الجوال (UX Expert Touch)
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none"; // لمنع السحب في سفاري
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [open]);

  return (
    <div className="site-shell">
      {/* رابط التخطي لمستخدمي لوحة المفاتيح (Accessibility) */}
      <a href="#main-content" className="skip-link">
        تخطي إلى المحتوى الرئيسي
      </a>

      <header className={`site-header ${scrolled ? "site-header--solid" : ""}`}>
        <div className="container site-header__inner">
          <Link
            href="/"
            className="brand"
            aria-label="شركة العزيزية - الصفحة الرئيسية"
          >
            <img src={brandAssets.logo} alt="" width={42} height={42} />
            <span>
              <strong>العزيزية</strong>
              <small>للمظلات والسواتر</small>
            </span>
          </Link>

          <nav className="site-nav" aria-label="التنقل الرئيسي">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className={location === href ? "is-active" : ""}
                aria-current={location === href ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="site-header__actions">
            <a
              className="header-direct-cta"
              href={contactDetails.whatsappHref}
              target="_blank"
              rel="noreferrer"
            >
              اطلب معاينة
            </a>
            <button
              className="menu-button"
              onClick={() => setOpen(!open)}
              aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={`mobile-menu ${open ? "mobile-menu--open" : ""}`}
        aria-hidden={!open}
      >
        <nav>
          {links.map(([label, href], index) => (
            <Link
              key={href}
              href={href}
              style={{ transitionDelay: `${index * 40}ms` }}
              aria-current={location === href ? "page" : undefined}
            >
              {label}
              <ArrowUpLeft size={19} aria-hidden="true" />
            </Link>
          ))}
          <a
            className="button-link button-link--copper"
            href={contactDetails.whatsappHref}
            target="_blank"
            rel="noreferrer"
            style={{ transitionDelay: `${links.length * 40}ms` }}
          >
            اطلب معاينة لمساحتك
            <ArrowUpLeft size={18} aria-hidden="true" />
          </a>
        </nav>
      </div>

      <main id="main-content" tabIndex={-1}>
        {children}
      </main>

      {/* الـ Footer لم يتم تغييره لأنه ممتاز، تم طيه هنا للاختصار لكن اتركه كما هو لديك */}
      <footer className="site-footer">
        <div className="container site-footer__top">
          <div className="site-footer__brand">
            <img src={brandAssets.logo} alt="" width={1220} height={536} />
            <div>
              <h2>
                حلول ظلّ مدروسة
                <br />
                للمساحات الخارجية.
              </h2>
              <p>
                شركة العزيزية متخصصة في تركيب مظلات جدة، مظلات السيارات،
                السواتر، البرجولات والتغطيات الخارجية للمنازل والفلل والحدائق
                والمواقف والمنشآت.
              </p>
            </div>
          </div>
          <div>
            <p className="footer-label">استكشف</p>
            <Link href="/">الرئيسية</Link>
            <Link href="/services">كل الخدمات</Link>
            <Link href="/gallery">معرض الأعمال</Link>
            <Link href="/about">عن الشركة</Link>
          </div>
          <div>
            <p className="footer-label">خدمات مطلوبة</p>
            <Link href="/services/jeddah-umbrellas">تركيب مظلات جدة</Link>
            <Link href="/services/car-umbrellas-installation">
              تركيب مظلات سيارات
            </Link>
            <Link href="/services/garden-pergolas">برجولات وحدائق</Link>
            <Link href="/services/screens-installation">تركيب سواتر</Link>
            <Link href="/services/lexan-installation">مظلات لكسان وتغطيات</Link>
            <Link href="/sitemap">خريطة كل الخدمات</Link>
          </div>
          <div className="site-footer__contact">
            <p className="footer-label">تواصل مباشر</p>
            <a href={contactDetails.phoneHref}>{contactDetails.phoneDisplay}</a>
            <a href={`mailto:${contactDetails.email}`}>
              {contactDetails.email}
            </a>
            <DirectContactActions compact />
          </div>
        </div>
        <div className="container site-footer__bottom">
          <span>
            © {new Date().getFullYear()} شركة العزيزية للمظلات والسواتر
          </span>
          <span>جدة · السعودية</span>
        </div>
      </footer>

      {/* 4. استدعاء الويدجت التفاعلي بدلاً من الزر الثابت */}
      <FloatingContactWidget />
    </div>
  );
}
