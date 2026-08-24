/** ظلّ معماري هادئ: SEO ديناميكي لكل صفحة، بعناوين واضحة من مصدر الخدمات الرسمي. */
import { useEffect } from "react";

function setMeta(name: string, content: string, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    if (property) element.setAttribute("property", name);
    else element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
}

const SITE_ORIGIN = (import.meta.env.VITE_SITE_URL || "https://al-azizia.com").replace(/\/$/, "");

export function usePageMeta(title: string, description: string, path = "/") {
  useEffect(() => {
    const resolvedTitle = title.includes("العزيزية") ? title : `${title} | شركة العزيزية للمظلات والسواتر`;
    document.title = resolvedTitle;
    setMeta("description", description);
    setMeta("og:title", resolvedTitle, true);
    setMeta("og:description", description, true);
    setMeta("twitter:title", resolvedTitle);
    setMeta("twitter:description", description);
    setMeta("og:url", `${SITE_ORIGIN}${path}`, true);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${SITE_ORIGIN}${path}`;
  }, [description, path, title]);
}

export function useJsonLd(data: object) {
  useEffect(() => {
    const id = "jeddah-shades-json-ld";
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.text = JSON.stringify(data);
    return () => script?.remove();
  }, [data]);
}
