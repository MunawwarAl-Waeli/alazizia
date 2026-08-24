/**
 * بطاقة خدمة
 *
 * الهدف:
 * إبراز الخدمة بسرعة دون إغراق البطاقة بالتفاصيل.
 */

import { ArrowUpLeft } from "lucide-react";
import { Link } from "wouter";
import { getServiceImage, type Service } from "@/data/services";

type ServiceCardProps = {
  service: Service;
  index?: number;
};

export default function ServiceCard({ service, index = 0 }: ServiceCardProps) {

  return (
    <Link
      href={`/services/${service.slug}`}
      className="service-card group"
      aria-label={`مشاهدة خدمة ${service.title}`}
    >
      {/* =====================================================
          Image
      ====================================================== */}
      <div className="service-card__image-wrap">
        <img
          src={getServiceImage(service)}
          alt={service.title}
          // في حال لم تكن الصورة موجودة، نعرض صورة افتراضية
          onError={e => {
            e.currentTarget.src = "/media/default-image.webp";
          }}
          className="service-card__image"
          width={500}
          height={500}
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
        />
      </div>

      {/* =====================================================
          Body
      ====================================================== */}
      <div className="service-card__body">
        {/* Meta */}
        <div className="service-card__meta">
          <p className="service-card__category">{service.category}</p>

          <span className="service-card__serial" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {/* Content */}
        <div className="service-card__content">
          <div className="service-card__text">
            <h3>{`تركيب ${service.title}`}</h3>
          </div>

          <span className="service-card__arrow" aria-hidden="true">
            <ArrowUpLeft size={19} strokeWidth={1.8} />
          </span>
        </div>
      </div>
    </Link>
  );
}
