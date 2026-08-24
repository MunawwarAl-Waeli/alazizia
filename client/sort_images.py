import os
import json
from pathlib import Path
import re
BASE_DIR = Path(__file__).resolve().parent.parent
# مسار مجلد الخدمات الرئيسي (تأكد أنه يطابق مكان مجلدات الصور لديك)
SERVICES_DIR = BASE_DIR / "static-assets" / "services"
OUTPUT_JSON_FILE = "generated_galleries.json"

def is_arabic(text):
    """التحقق مما إذا كان النص يحتوي على حروف عربية"""
    return bool(re.search(r'[\u0600-\u06FF]', text))

def generate_galleries():
    if not os.path.exists(SERVICES_DIR):
        print(f"❌ مجلد الخدمات غير موجود: {SERVICES_DIR}")
        print("تأكد من تشغيل السكربت في مجلد المشروع الصحيح أو ضبط المسار.")
        return

    galleries_data = []
    total_renamed = 0
    total_images = 0

    # قراءة كل المجلدات الفرعية داخل مجلد services
    subfolders = sorted(os.listdir(SERVICES_DIR))

    for slug in subfolders:
        service_folder = os.path.join(SERVICES_DIR, slug)
        
        # نتأكد أنه مجلد فعلي وليس ملفاً عادياً
        if not os.path.isdir(service_folder):
            continue

        gallery_images = []
        files = sorted(os.listdir(service_folder))
        img_counter = 1

        for filename in files:
            # التحقق من صيغ الصور فقط
            if not filename.lower().endswith(('.webp', '.jpg', '.jpeg', '.png')):
                continue

            total_images += 1
            old_path = os.path.join(service_folder, filename)
            
            # إذا كان اسم الملف يحتوي على حروف عربية، نقوم بإعادة تسميته إلى الإنجليزية
            if is_arabic(filename):
                ext = os.path.splitext(filename)[1].lower()
                new_filename = f"{slug}-{img_counter}{ext}"
                img_counter += 1
            else:
                # إذا كان إنجليزياً أصلاً، نتركه كما هو
                new_filename = filename

            new_path = os.path.join(service_folder, new_filename)

            # تغيير اسم الملف في المجلد فعلياً إذا اختلف الاسم
            if old_path != new_path:
                # معالجة تفادي تكرار الأسماء
                if os.path.exists(new_path):
                    new_filename = f"{slug}-{img_counter}-alt{ext}"
                    new_path = os.path.join(service_folder, new_filename)
                    img_counter += 1
                
                os.rename(old_path, new_path)
                print(f"🔄 [{slug}] تم تغيير: '{filename}' ⬅️ '{new_filename}'")
                total_renamed += 1

            # بناء مسار الويب النهائي للصورة
            web_path = f"/media/services/{slug}/{new_filename}"
            gallery_images.append(web_path)

        # إضافة بيانات هذا المجلد إلى القائمة
        galleries_data.append({
            "slug": slug,
            "galleryImages": gallery_images
        })

    # حفظ النتيجة في ملف JSON جديد منفصل
    output_data = {
        "galleries": galleries_data
    }

    with open(OUTPUT_JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    print(f"\n✨ تمت العملية بنجاح!")
    print(f"📁 تم فحص {total_images} صورة إجمالاً.")
    print(f"🔄 تم إعادة تسمية {total_renamed} صورة عربية إلى الإنجليزية لتجنب أخطاء المتصفح.")
    print(f"📄 تم إنشاء الملف الجديد بنجاح باسم: '{OUTPUT_JSON_FILE}'")

if __name__ == "__main__":
    generate_galleries()
# # -*- coding: utf-8 -*-

# """
# فرز صور خدمات شركة العزيزية
# --------------------------------

# الوظيفة:
# 1. قراءة الخدمات من services-data*.json
# 2. قراءة الصور من static-assets
# 3. تحليل اسم كل صورة باستخدام كلمات مفتاحية
# 4. ربط الصورة بأفضل خدمة من الخدمات الموجودة في JSON
# 5. تجميع الصور داخل مجلدات الخدمات
# 6. اكتشاف الصور المصغرة وعدم اعتبارها صوراً مستقلة
# 7. عدم حذف أي صورة من المصدر
# 8. إنشاء تقرير CSV
# 9. إنشاء تقرير JSON
# 10. إنشاء مجلد UNSORTED للصور التي لم يتم التعرف عليها
# 11. إنشاء ملف للمراجعة اليدوية
# """

# from pathlib import Path
# import json
# import csv
# import re
# import shutil
# from collections import defaultdict


# # ============================================================
# # الإعدادات
# # ============================================================

# BASE_DIR = Path(__file__).resolve().parent.parent

# SOURCE_DIR = BASE_DIR / "static-assets"
# OUTPUT_DIR = BASE_DIR / "sorted-services"

# # ابحث تلقائياً عن ملف الخدمات
# JSON_FILES = list(SOURCE_DIR.glob("services-data*.json"))

# IMAGE_EXTENSIONS = {
#     ".jpg",
#     ".jpeg",
#     ".png",
#     ".webp",
#     ".gif",
#     ".avif",
# }

# # الملفات التي لا نريد اعتبارها صور خدمات
# IGNORE_FILES = {
#     ".gitkeep",
# }

# # ============================================================
# # الكلمات المفتاحية
# # ============================================================

# KEYWORDS = {

#     # --------------------------------------------------------
#     # مظلات سيارات
#     # --------------------------------------------------------
#     "car-umbrellas": [
#         "car",
#         "cars",
#         "سيارات",
#         "سيارة",
#         "مواقف",
#         "parking",
#         "carshade",
#         "car-shade",
#     ],

#     # --------------------------------------------------------
#     # مظلات حدائق
#     # --------------------------------------------------------
#     "garden-umbrellas": [
#         "garden",
#         "gardens",
#         "حدائق",
#         "حديقة",
#         "garden-shade",
#     ],

#     # --------------------------------------------------------
#     # مظلات منازل
#     # --------------------------------------------------------
#     "home-umbrellas": [
#         "home",
#         "homes",
#         "house",
#         "houses",
#         "منزل",
#         "منازل",
#         "فيلا",
#         "فلل",
#         "villa",
#         "villas",
#     ],

#     # --------------------------------------------------------
#     # مظلات جلسات
#     # --------------------------------------------------------
#     "outdoor-seating-umbrellas": [
#         "seating",
#         "جلسات",
#         "جلسة",
#         "outdoor-seating",
#         "outdoor-seating-umbrellas",
#     ],

#     # --------------------------------------------------------
#     # مظلات مسابح
#     # --------------------------------------------------------
#     "pool-umbrellas": [
#         "pool",
#         "pools",
#         "swimming",
#         "مسبح",
#         "مسابح",
#         "pool-shade",
#     ],

#     # --------------------------------------------------------
#     # مظلات مدارس
#     # --------------------------------------------------------
#     "school-umbrellas": [
#         "school",
#         "schools",
#         "مدرسة",
#         "مدارس",
#         "school-shade",
#     ],

#     # --------------------------------------------------------
#     # مظلات محلات
#     # --------------------------------------------------------
#     "shop-umbrellas": [
#         "shop",
#         "shops",
#         "store",
#         "stores",
#         "محل",
#         "محلات",
#         "متجر",
#         "متاجر",
#     ],

#     # --------------------------------------------------------
#     # مظلات متحركة
#     # --------------------------------------------------------
#     "movable-umbrellas": [
#         "movable",
#         "moveable",
#         "متحركة",
#         "متحرك",
#         "mobile",
#     ],

#     # --------------------------------------------------------
#     # شد إنشائي
#     # --------------------------------------------------------
#     "tensile-structure-umbrellas": [
#         "tensile",
#         "tensile-structure",
#         "شد-إنشائي",
#         "شد",
#         "إنشائي",
#     ],

#     # --------------------------------------------------------
#     # مظلات حديد
#     # --------------------------------------------------------
#     "iron-umbrellas": [
#         "iron",
#         "حديد",
#         "metal",
#         "steel",
#     ],

#     # --------------------------------------------------------
#     # مظلات خشبية
#     # --------------------------------------------------------
#     "wooden-umbrellas": [
#         "wooden",
#         "wood",
#         "خشب",
#         "خشبية",
#     ],

#     # --------------------------------------------------------
#     # مظلات قماش
#     # --------------------------------------------------------
#     "fabric-umbrellas": [
#         "fabric",
#         "fabric-shades",
#         "قماش",
#         "قماشية",
#         "cloth",
#         "textile",
#     ],

#     # --------------------------------------------------------
#     # مظلات لكسان
#     # --------------------------------------------------------
#     "lexan-umbrellas": [
#         "lexan",
#         "لكسان",
#         "polycarbonate",
#     ],

#     # --------------------------------------------------------
#     # مظلات PVC
#     # --------------------------------------------------------
#     "pvc-umbrellas": [
#         "pvc",
#     ],

#     # --------------------------------------------------------
#     # مظلات قرميد
#     # --------------------------------------------------------
#     "brick-umbrellas": [
#         "brick",
#         "bricks",
#         "قرميد",
#         "قرميدية",
#         "tile",
#         "tiles",
#     ],

#     # --------------------------------------------------------
#     # سواتر حديد
#     # --------------------------------------------------------
#     "iron-screens": [
#         "iron-screens",
#         "screens-iron",
#         "iron-screen",
#         "سواتر-حديد",
#     ],

#     # --------------------------------------------------------
#     # سواتر خشبية
#     # --------------------------------------------------------
#     "wooden-screens": [
#         "wooden-screens",
#         "screens-wood",
#         "wooden-screen",
#         "سواتر-خشبية",
#     ],

#     # --------------------------------------------------------
#     # سواتر شرائح حديد
#     # --------------------------------------------------------
#     "slatted-iron-screens": [
#         "slatted",
#         "slats",
#         "iron-slotted",
#         "شرائح",
#         "شرائح-حديد",
#         "slotted",
#     ],

#     # --------------------------------------------------------
#     # سواتر قماش
#     # --------------------------------------------------------
#     "fabric-screens": [
#         "fabric-screens",
#         "fabric-screen",
#         "سواتر-قماش",
#     ],

#     # --------------------------------------------------------
#     # سواتر لكسان
#     # --------------------------------------------------------
#     "lexan-screens": [
#         "lexan-screens",
#         "lexan-screen",
#         "سواتر-لكسان",
#     ],

#     # --------------------------------------------------------
#     # سواتر أبواب ومداخل
#     # --------------------------------------------------------
#     "door-screens": [
#         "door",
#         "doors",
#         "doors-screens",
#         "door-screens",
#         "doors-screens-installation",
#         "مداخل",
#         "مدخل",
#         "أبواب",
#         "باب",
#     ],

#     # --------------------------------------------------------
#     # تركيب برجولات
#     # --------------------------------------------------------
#     "pergolas-installation": [
#         "pergolas-installation",
#         "pergola-installation",
#         "تركيب-برجولات",
#         "تركيب",
#     ],

#     # --------------------------------------------------------
#     # برجولات حدائق
#     # --------------------------------------------------------
#     "garden-pergolas": [
#         "garden-pergolas",
#         "garden-pergola",
#         "برجولات-حدائق",
#     ],

#     # --------------------------------------------------------
#     # برجولات حديد
#     # --------------------------------------------------------
#     "iron-pergolas": [
#         "iron-pergolas",
#         "iron-pergola",
#         "برجولات-حديد",
#     ],

#     # --------------------------------------------------------
#     # جلسات خارجية
#     # --------------------------------------------------------
#     "outdoor-seating": [
#         "outdoor-seating",
#         "seating-outdoor",
#         "جلسات-خارجية",
#         "جلسات",
#     ],

#     # --------------------------------------------------------
#     # ساندوتش بانل
#     # --------------------------------------------------------
#     "sandwich-panel-installation": [
#         "sandwich-panel-installation",
#         "sandwich-panel",
#         "sandwich",
#         "ساندوتش",
#         "ساندوتش-بانل",
#     ],

#     # --------------------------------------------------------
#     # تركيب لكسان
#     # --------------------------------------------------------
#     "lexan-installation": [
#         "lexan-installation",
#         "تركيب-ألواح-لكسان",
#         "تركيب-لكسان",
#     ],

#     # --------------------------------------------------------
#     # الصيانة
#     # --------------------------------------------------------
#     "umbrella-and-screen-maintenance": [
#         "maintenance",
#         "repair",
#         "صيانة",
#         "إصلاح",
#     ],

#     # --------------------------------------------------------
#     # تفصيل حسب الطلب
#     # --------------------------------------------------------
#     "custom-umbrellas-and-screens": [
#         "custom",
#         "custom-car",
#         "حسب-الطلب",
#         "تفصيل",
#         "مخصص",
#     ],
# }


# # ============================================================
# # كلمات تستبعد بعض المطابقات
# # ============================================================

# EXCLUDE_WORDS = {
#     "logo": True,
#     "company-logo": True,
#     "architecture": True,
#     "architectural": True,
#     "hero": True,
# }


# # ============================================================
# # الخدمات التي نريد إنشاء مجلداتها
# # ============================================================

# def load_services():

#     if not JSON_FILES:
#         raise FileNotFoundError(
#             f"لم يتم العثور على ملف services-data*.json داخل:\n{SOURCE_DIR}"
#         )

#     json_file = JSON_FILES[0]

#     print(f"JSON   : {json_file}")

#     with open(json_file, "r", encoding="utf-8") as f:
#         data = json.load(f)

#     if isinstance(data, list):
#         services = data

#     elif isinstance(data, dict) and isinstance(data.get("services"), list):
#         services = data["services"]

#     else:
#         raise ValueError(
#             "صيغة JSON غير صحيحة: لم يتم العثور على services"
#         )

#     return services


# # ============================================================
# # تطبيع اسم الملف
# # ============================================================

# def normalize(text):

#     text = text.lower()

#     replacements = {
#         "–": "-",
#         "—": "-",
#         "_": "-",
#         " ": "-",
#     }

#     for old, new in replacements.items():
#         text = text.replace(old, new)

#     # إزالة الأحجام مثل:
#     # 150x150
#     # 300x300
#     # 768x768
#     # 1024x768
#     text = re.sub(
#         r"-?\d{2,5}x\d{2,5}",
#         "",
#         text
#     )

#     # إزالة hash مثل:
#     # _3973cb7c
#     text = re.sub(
#         r"-?[a-f0-9]{7,}$",
#         "",
#         text
#     )

#     text = re.sub(
#         r"-+",
#         "-",
#         text
#     )

#     return text.strip("-")


# # ============================================================
# # معرفة هل الصورة Thumbnail
# # ============================================================

# def is_thumbnail(filename):

#     name = filename.lower()

#     patterns = [
#         r"-150x150",
#         r"-300x300",
#         r"-300x225",
#         r"-300x195",
#         r"-300x293",
#         r"-243x300",
#         r"-232x300",
#         r"-768x768",
#         r"-768x576",
#         r"-768x500",
#         r"-768x993",
#         r"-792x1024",
#         r"-1024x768",
#         r"-1024x667",
#     ]

#     return any(
#         re.search(pattern, name)
#         for pattern in patterns
#     )


# # ============================================================
# # استخراج الـ hash
# # ============================================================

# def remove_hash(name):

#     return re.sub(
#         r"[-_]?[a-f0-9]{7,}$",
#         "",
#         name,
#         flags=re.IGNORECASE
#     )


# # ============================================================
# # حساب نتيجة المطابقة
# # ============================================================

# def calculate_score(filename, service):

#     original = filename.lower()

#     normalized = normalize(
#         Path(filename).stem
#     )

#     normalized = remove_hash(normalized)

#     slug = str(
#         service.get("slug", "")
#     ).lower()

#     title = str(
#         service.get("title", "")
#     ).lower()

#     score = 0

#     matched_keywords = []

#     # --------------------------------------------------------
#     # تطابق slug الخدمة
#     # --------------------------------------------------------

#     if slug and slug in normalized:
#         score += 100
#         matched_keywords.append(f"SLUG:{slug}")

#     # --------------------------------------------------------
#     # الكلمات المخصصة للخدمة
#     # --------------------------------------------------------

#     keywords = KEYWORDS.get(slug, [])

#     for keyword in keywords:

#         keyword_norm = normalize(keyword)

#         if not keyword_norm:
#             continue

#         if keyword_norm in normalized:

#             # الكلمات الطويلة أقوى
#             score += 20 + min(len(keyword_norm), 20)

#             matched_keywords.append(keyword)

#     # --------------------------------------------------------
#     # title
#     # --------------------------------------------------------

#     title_words = [
#         normalize(word)
#         for word in re.split(r"\s+", title)
#         if len(word) >= 3
#     ]

#     for word in title_words:

#         if word and word in normalized:

#             score += 8

#             matched_keywords.append(
#                 f"title:{word}"
#             )

#     # --------------------------------------------------------
#     # قواعد إضافية
#     # --------------------------------------------------------

#     # car أقوى من umbrella
#     if "car" in normalized and slug == "car-umbrellas":
#         score += 50

#     # garden
#     if "garden" in normalized and slug == "garden-umbrellas":
#         score += 40

#     # pool
#     if "pool" in normalized and slug == "pool-umbrellas":
#         score += 40

#     # school
#     if "school" in normalized and slug == "school-umbrellas":
#         score += 40

#     # shop
#     if "shop" in normalized and slug == "shop-umbrellas":
#         score += 40

#     # pergola
#     if "pergola" in normalized:

#         if slug in {
#             "pergolas-installation",
#             "garden-pergolas",
#             "iron-pergolas",
#         }:
#             score += 35

#     # screens
#     if "screens" in normalized:

#         if slug in {
#             "iron-screens",
#             "wooden-screens",
#             "slatted-iron-screens",
#             "fabric-screens",
#             "lexan-screens",
#             "door-screens",
#         }:
#             score += 30

#     return score, matched_keywords


# # ============================================================
# # أفضل خدمة للصورة
# # ============================================================

# def find_best_service(filename, services):

#     results = []

#     for service in services:

#         score, matches = calculate_score(
#             filename,
#             service
#         )

#         if score > 0:

#             results.append({
#                 "service": service,
#                 "score": score,
#                 "matches": matches,
#             })

#     if not results:
#         return None, 0, []

#     results.sort(
#         key=lambda x: x["score"],
#         reverse=True
#     )

#     best = results[0]

#     return (
#         best["service"],
#         best["score"],
#         best["matches"],
#     )


# # ============================================================
# # اسم مجلد آمن
# # ============================================================

# def safe_service_directory(service):

#     service_id = str(
#         service.get("id", "")
#     ).strip()

#     slug = str(
#         service.get("slug", "unknown")
#     ).strip()

#     title = str(
#         service.get("title", "")
#     ).strip()

#     if service_id:
#         try:
#             prefix = str(
#                 int(service_id)
#             ).zfill(2)

#         except ValueError:
#             prefix = service_id

#     else:
#         prefix = "00"

#     # نستخدم slug كاسم أساسي للمجلد
#     return f"{prefix}-{slug}"


# # ============================================================
# # نسخ الصورة بدون الكتابة فوق ملف موجود
# # ============================================================

# def copy_unique(source, destination):

#     destination.parent.mkdir(
#         parents=True,
#         exist_ok=True
#     )

#     if not destination.exists():

#         shutil.copy2(
#             source,
#             destination
#         )

#         return destination

#     stem = destination.stem
#     suffix = destination.suffix

#     counter = 2

#     while True:

#         new_destination = destination.parent / (
#             f"{stem}-{counter}{suffix}"
#         )

#         if not new_destination.exists():

#             shutil.copy2(
#                 source,
#                 new_destination
#             )

#             return new_destination

#         counter += 1


# # ============================================================
# # تقرير CSV
# # ============================================================

# def write_csv_report(rows):

#     report = OUTPUT_DIR / "sorting-report.csv"

#     with open(
#         report,
#         "w",
#         newline="",
#         encoding="utf-8-sig"
#     ) as f:

#         writer = csv.DictWriter(
#             f,
#             fieldnames=[
#                 "filename",
#                 "type",
#                 "service_id",
#                 "service_slug",
#                 "service_title",
#                 "score",
#                 "matched_keywords",
#                 "destination",
#             ]
#         )

#         writer.writeheader()

#         writer.writerows(rows)

#     return report


# # ============================================================
# # تقرير JSON
# # ============================================================

# def write_json_report(rows):

#     report = OUTPUT_DIR / "sorting-report.json"

#     with open(
#         report,
#         "w",
#         encoding="utf-8"
#     ) as f:

#         json.dump(
#             rows,
#             f,
#             ensure_ascii=False,
#             indent=2
#         )

#     return report


# # ============================================================
# # ملخص
# # ============================================================

# def print_summary(
#     services,
#     sorted_count,
#     unsorted_count,
#     thumbnails_count,
#     ignored_count,
#     service_counts
# ):

#     print()
#     print("=" * 70)
#     print("ملخص الفرز")
#     print("=" * 70)

#     print(
#         f"إجمالي الخدمات        : {len(services)}"
#     )

#     print(
#         f"الصور المصنفة         : {sorted_count}"
#     )

#     print(
#         f"الصور غير المصنفة     : {unsorted_count}"
#     )

#     print(
#         f"الصور المصغرة         : {thumbnails_count}"
#     )

#     print(
#         f"الملفات المتجاهلة     : {ignored_count}"
#     )

#     print()
#     print("-" * 70)
#     print("عدد الصور لكل خدمة")
#     print("-" * 70)

#     for service in services:

#         slug = str(
#             service.get("slug", "")
#         )

#         title = str(
#             service.get("title", "")
#         )

#         count = service_counts.get(
#             slug,
#             0
#         )

#         print(
#             f"{title:<35} {count:>4}"
#         )


# # ============================================================
# # main
# # ============================================================

# def main():

#     print("=" * 70)
#     print("فرز صور الخدمات - النسخة المحسنة")
#     print("=" * 70)

#     print(
#         f"المصدر : {SOURCE_DIR}"
#     )

#     print(
#         f"النتيجة: {OUTPUT_DIR}"
#     )

#     print()

#     # --------------------------------------------------------
#     # تحقق من المصدر
#     # --------------------------------------------------------

#     if not SOURCE_DIR.exists():

#         raise FileNotFoundError(
#             f"مجلد الصور غير موجود:\n{SOURCE_DIR}"
#         )

#     # --------------------------------------------------------
#     # تحميل الخدمات
#     # --------------------------------------------------------

#     services = load_services()

#     # --------------------------------------------------------
#     # الصور
#     # --------------------------------------------------------

#     images = [
#         p
#         for p in SOURCE_DIR.iterdir()
#         if p.is_file()
#         and p.suffix.lower() in IMAGE_EXTENSIONS
#         and p.name not in IGNORE_FILES
#     ]

#     images.sort(
#         key=lambda p: p.name.lower()
#     )

#     print(
#         f"عدد الخدمات في JSON: {len(services)}"
#     )

#     print(
#         f"عدد الصور: {len(images)}"
#     )

#     print("=" * 70)

#     # --------------------------------------------------------
#     # إنشاء مجلد النتيجة
#     # --------------------------------------------------------

#     OUTPUT_DIR.mkdir(
#         parents=True,
#         exist_ok=True
#     )

#     UNSORTED_DIR = OUTPUT_DIR / "UNSORTED"

#     THUMBNAILS_DIR = OUTPUT_DIR / "_THUMBNAILS"

#     UNSORTED_DIR.mkdir(
#         exist_ok=True
#     )

#     THUMBNAILS_DIR.mkdir(
#         exist_ok=True
#     )

#     # --------------------------------------------------------
#     # النتائج
#     # --------------------------------------------------------

#     rows = []

#     service_counts = defaultdict(int)

#     sorted_count = 0
#     unsorted_count = 0
#     thumbnails_count = 0
#     ignored_count = 0

#     # --------------------------------------------------------
#     # معالجة الصور
#     # --------------------------------------------------------

#     for index, image in enumerate(images, 1):

#         print(
#             f"[{index}/{len(images)}] {image.name}"
#         )

#         # ----------------------------------------------------
#         # Thumbnail
#         # ----------------------------------------------------

#         if is_thumbnail(image.name):

#             destination = THUMBNAILS_DIR / image.name

#             copied = copy_unique(
#                 image,
#                 destination
#             )

#             thumbnails_count += 1

#             rows.append({
#                 "filename": image.name,
#                 "type": "thumbnail",
#                 "service_id": "",
#                 "service_slug": "",
#                 "service_title": "",
#                 "score": 0,
#                 "matched_keywords": "",
#                 "destination": str(copied),
#             })

#             continue

#         # ----------------------------------------------------
#         # تجاهل الشعار وبعض الصور العامة
#         # ----------------------------------------------------

#         normalized_name = normalize(
#             image.stem
#         )

#         if (
#             "logo" in normalized_name
#             or "company-logo" in normalized_name
#         ):

#             destination = OUTPUT_DIR / "_GENERAL"

#             copied = copy_unique(
#                 image,
#                 destination / image.name
#             )

#             ignored_count += 1

#             rows.append({
#                 "filename": image.name,
#                 "type": "general",
#                 "service_id": "",
#                 "service_slug": "",
#                 "service_title": "",
#                 "score": 0,
#                 "matched_keywords": "logo",
#                 "destination": str(copied),
#             })

#             continue

#         # ----------------------------------------------------
#         # العثور على أفضل خدمة
#         # ----------------------------------------------------

#         best, score, matches = find_best_service(
#             image.name,
#             services
#         )

#         # ----------------------------------------------------
#         # لم نجد خدمة
#         # ----------------------------------------------------

#         if best is None or score < 15:

#             destination = copy_unique(
#                 image,
#                 UNSORTED_DIR / image.name
#             )

#             unsorted_count += 1

#             rows.append({
#                 "filename": image.name,
#                 "type": "unsorted",
#                 "service_id": "",
#                 "service_slug": "",
#                 "service_title": "",
#                 "score": score,
#                 "matched_keywords": ", ".join(matches),
#                 "destination": str(destination),
#             })

#             continue

#         # ----------------------------------------------------
#         # الخدمة
#         # ----------------------------------------------------

#         service_id = str(
#             best.get("id", "")
#         )

#         service_slug = str(
#             best.get("slug", "")
#         )

#         service_title = str(
#             best.get("title", "")
#         )

#         folder_name = safe_service_directory(
#             best
#         )

#         service_dir = OUTPUT_DIR / folder_name

#         service_dir.mkdir(
#             parents=True,
#             exist_ok=True
#         )

#         destination = copy_unique(
#             image,
#             service_dir / image.name
#         )

#         sorted_count += 1

#         service_counts[
#             service_slug
#         ] += 1

#         rows.append({
#             "filename": image.name,
#             "type": "service",
#             "service_id": service_id,
#             "service_slug": service_slug,
#             "service_title": service_title,
#             "score": score,
#             "matched_keywords": ", ".join(matches),
#             "destination": str(destination),
#         })

#     # ========================================================
#     # الملفات التي تم إنشاؤها
#     # ========================================================

#     csv_report = write_csv_report(
#         rows
#     )

#     json_report = write_json_report(
#         rows
#     )

#     # ========================================================
#     # تقرير الصور غير المصنفة
#     # ========================================================

#     unsorted_report = OUTPUT_DIR / "UNSORTED-review.txt"

#     with open(
#         unsorted_report,
#         "w",
#         encoding="utf-8"
#     ) as f:

#         f.write(
#             "الصور التي تحتاج مراجعة يدوية\n"
#         )

#         f.write(
#             "=" * 60
#             + "\n\n"
#         )

#         for row in rows:

#             if row["type"] == "unsorted":

#                 f.write(
#                     f"{row['filename']}\n"
#                 )

#                 f.write(
#                     f"score: {row['score']}\n"
#                 )

#                 f.write(
#                     f"matches: {row['matched_keywords']}\n\n"
#                 )

#     # ========================================================
#     # ملخص
#     # ========================================================

#     print_summary(
#         services=services,
#         sorted_count=sorted_count,
#         unsorted_count=unsorted_count,
#         thumbnails_count=thumbnails_count,
#         ignored_count=ignored_count,
#         service_counts=service_counts,
#     )

#     print()
#     print("=" * 70)
#     print("اكتمل الفرز")
#     print("=" * 70)

#     print(
#         f"CSV التقرير       : {csv_report}"
#     )

#     print(
#         f"JSON التقرير      : {json_report}"
#     )

#     print(
#         f"مراجعة UNSORTED   : {unsorted_report}"
#     )

#     print()
#     print(
#         "ملاحظة: الصور الأصلية لم يتم حذفها أو تعديلها."
#     )

#     print(
#         "الصور المصغرة تم فصلها في مجلد _THUMBNAILS."
#     )

#     print(
#         "الصور غير المعروفة تم وضعها في UNSORTED."
#     )


# # ============================================================
# # التشغيل
# # ============================================================

# if __name__ == "__main__":
#     main()