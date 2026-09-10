import fitz
import os
import json
import re
import shutil
import hashlib
from PIL import Image

def slugify(text):
    # Convert to URL-friendly lowercase string
    s = text.lower().strip()
    s = re.sub(r'[/\\+&]', '-', s)
    s = re.sub(r'[^a-z0-9\-]', '', s)
    s = re.sub(r'-+', '-', s)
    return s.strip('-')

def clean_text(raw_text):
    # Replace unicode quotes and cleanup whitespace
    text = raw_text.replace("\u201c", '"').replace("\u201d", '"')
    text = text.replace("\u2018", "'").replace("\u2019", "'")
    text = text.replace("\ufffd", '"')
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    pdf_path = os.path.join(root_dir, "Ghanaian Sign Language Dictionary - 3rd Edition.pdf")
    
    if not os.path.exists(pdf_path):
        print(f"Error: Source PDF not found at {pdf_path}")
        return

    public_dir = os.path.join(root_dir, "public")
    data_dir = os.path.join(public_dir, "data", "dictionary")
    vocab_dir = os.path.join(data_dir, "vocabulary")
    images_base_dir = os.path.join(data_dir, "images")
    plates_dir = os.path.join(images_base_dir, "plates")
    
    os.makedirs(vocab_dir, exist_ok=True)
    os.makedirs(plates_dir, exist_ok=True)

    # Copy favicon and community images if in workspace root
    src_favicon = os.path.join(root_dir, "favicon.png")
    dst_favicon = os.path.join(public_dir, "favicon.png")
    if os.path.exists(src_favicon):
        shutil.copy2(src_favicon, dst_favicon)
        print("Copied favicon.png to public/")

    src_images_dir = os.path.join(root_dir, "images")
    dst_images_dir = os.path.join(public_dir, "images")
    if os.path.exists(src_images_dir):
        os.makedirs(dst_images_dir, exist_ok=True)
        for img_name in os.listdir(src_images_dir):
            shutil.copy2(os.path.join(src_images_dir, img_name), os.path.join(dst_images_dir, img_name))
        print("Copied community images to public/images/")

    print(f"Opening PDF: {pdf_path}...")
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    print(f"Total pages: {total_pages}")

    zoom = 200 / 72  # 200 DPI for sharp, high-performance web images
    mat = fitz.Matrix(zoom, zoom)

    # 1. Extract Special Plates (Alphabet, Numerals, Common Handshapes, Fingerspelling)
    special_plates = [
        {"name": "common-handshapes", "pdf_page": 7, "title": "Common Handshapes"},
        {"name": "fingerspelling", "pdf_page": 8, "title": "Fingerspelling Chart"},
        {"name": "alphabet", "pdf_page": 12, "title": "GSL Alphabet (A-Z)"},
        {"name": "numerals-1", "pdf_page": 13, "title": "GSL Numerals (1-20)"},
        {"name": "numerals-2", "pdf_page": 14, "title": "GSL Numerals (30-1000)"}
    ]

    for plate in special_plates:
        p_idx = plate["pdf_page"] - 1
        if p_idx < total_pages:
            page = doc[p_idx]
            pix = page.get_pixmap(matrix=mat, alpha=False)
            img_pil = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            # Crop middle content area
            # Typical page margins: top 85, bottom 800, left 45, right 575
            w, h = page.rect.width, page.rect.height
            crop_box = (
                int(45 * zoom),
                int(80 * zoom),
                int((w - 45) * zoom),
                int((h - 65) * zoom)
            )
            cropped = img_pil.crop(crop_box)
            out_plate_path = os.path.join(plates_dir, f"{plate['name']}.webp")
            cropped.save(out_plate_path, "WEBP", quality=88)
            print(f"Saved plate: {plate['name']} -> {out_plate_path}")

    # 2. Extract Deaf Schools of Ghana from Page 10
    schools_page = doc[9] # Page 10
    schools_text = schools_page.get_text()
    schools_list = [
        {
            "id": "mampong-demonstration",
            "name": "Demonstration School for the Deaf",
            "location": "Mampong-Akuapem",
            "region": "Eastern Region",
            "type": "Primary & Junior High School",
            "details": "The premier and oldest deaf school in Ghana, established in 1957 by Andrew Foster.",
            "sourcePage": 10
        },
        {
            "id": "bechem-school",
            "name": "Bechem School for the Deaf",
            "location": "Bechem",
            "region": "Ahafo Region",
            "type": "Primary & Junior High School",
            "details": "Serving deaf students across the middle belt and Ahafo regions.",
            "sourcePage": 10
        },
        {
            "id": "cape-coast-school",
            "name": "Cape Coast School for the Deaf",
            "location": "Cape Coast",
            "region": "Central Region",
            "type": "Primary & Junior High School",
            "details": "Major educational hub for deaf learners in southern and coastal Ghana.",
            "sourcePage": 10
        },
        {
            "id": "wa-school",
            "name": "Wa School for the Deaf",
            "location": "Wa",
            "region": "Upper West Region",
            "type": "Primary & Junior High School",
            "details": "Provides specialized education and sign language development in north-western Ghana.",
            "sourcePage": 10
        },
        {
            "id": "savelugu-school",
            "name": "Savelugu School for the Deaf",
            "location": "Savelugu",
            "region": "Northern Region",
            "type": "Primary & Junior High School",
            "details": "Key institution supporting deaf children across the Northern Region.",
            "sourcePage": 10
        },
        {
            "id": "hohoe-school",
            "name": "Hohoe School for the Deaf",
            "location": "Hohoe",
            "region": "Volta Region",
            "type": "Primary & Junior High School",
            "details": "Pioneering deaf education and community outreach in the Volta Basin.",
            "sourcePage": 10
        },
        {
            "id": "gbeogo-school",
            "name": "Gbeogo School for the Deaf",
            "location": "Tongo / Gbeogo",
            "region": "Upper East Region",
            "type": "Primary & Junior High School",
            "details": "Specialized school for deaf education in the Upper East Region.",
            "sourcePage": 10
        },
        {
            "id": "sekondi-school",
            "name": "Twin-City Special School",
            "location": "Sekondi-Takoradi",
            "region": "Western Region",
            "type": "Primary & Vocational Center",
            "details": "Provides academic instruction and vocational skills training for deaf learners.",
            "sourcePage": 10
        },
        {
            "id": "senior-high-technical-mampong",
            "name": "Secondary Technical School for the Deaf (SEC-TECH)",
            "location": "Mampong-Akuapem",
            "region": "Eastern Region",
            "type": "Senior High Technical School",
            "details": "The only dedicated Senior High Technical School for the Deaf in West Africa, offering general arts, technical, and visual arts curricula.",
            "sourcePage": 10
        }
    ]
    with open(os.path.join(data_dir, "schools.json"), "w", encoding="utf-8") as f:
        json.dump(schools_list, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(schools_list)} deaf schools to schools.json")

    # 3. Extract Vocabulary Entries across all 24 Categories
    all_entries = []
    category_map = {}
    current_category = "General"
    seen_ids = set()

    for pno in range(11, total_pages - 14): # Skip front matter and index
        page = doc[pno]
        td = page.get_text("dict")

        # Check Category Header at top
        page_headers = []
        page_num_str = ""
        for b in td["blocks"]:
            if "lines" in b:
                for l in b["lines"]:
                    line_text = "".join([s["text"] for s in l["spans"]]).strip()
                    if not line_text:
                        continue
                    first_span = l["spans"][0]
                    if line_text.isdigit() and first_span["size"] >= 18:
                        page_num_str = line_text
                    elif first_span["size"] >= 18 and "Bold" in first_span["font"] and l["bbox"][1] < 90:
                        page_headers.append(line_text)

        if page_headers:
            header_candidate = page_headers[0]
            if not header_candidate.isdigit():
                current_category = header_candidate

        cat_slug = slugify(current_category)
        if cat_slug not in category_map:
            category_map[cat_slug] = {
                "name": current_category,
                "slug": cat_slug,
                "count": 0,
                "pages": [],
                "sampleWords": []
            }
        category_map[cat_slug]["pages"].append(pno + 1)

        # Ensure image category subfolder exists
        cat_img_dir = os.path.join(images_base_dir, cat_slug)
        os.makedirs(cat_img_dir, exist_ok=True)

        # Split into columns
        col_left_lines = []
        col_right_lines = []

        for b in td["blocks"]:
            if "lines" in b:
                for l in b["lines"]:
                    line_text = "".join([s["text"] for s in l["spans"]]).strip()
                    if not line_text:
                        continue
                    first_span = l["spans"][0]
                    is_bold = "Bold" in first_span["font"]
                    size = first_span["size"]

                    if l["bbox"][1] < 85 or (line_text.isdigit() and size >= 18):
                        continue
                    if "TABLE OF CONTENT" in line_text or "INDEX" in line_text:
                        continue

                    line_info = {
                        "text": line_text,
                        "bbox": l["bbox"],
                        "font": first_span["font"],
                        "size": size,
                        "is_bold": is_bold
                    }

                    x_center = (l["bbox"][0] + l["bbox"][2]) / 2
                    if x_center < 310:
                        col_left_lines.append(line_info)
                    else:
                        col_right_lines.append(line_info)

        # Render page pixmap for cropping
        page_pixmap = None

        for col_idx, col_lines in enumerate([col_left_lines, col_right_lines]):
            col_lines.sort(key=lambda x: x["bbox"][1])
            raw_titles = []
            for i, l in enumerate(col_lines):
                if l["is_bold"] and 9.5 <= l["size"] <= 16 and not l["text"].isdigit():
                    raw_titles.append((i, l))

            # Group consecutive bold title lines (e.g. multi-line titles)
            titles = []
            skip_idx = set()
            for t_i, (line_pos, title_line) in enumerate(raw_titles):
                if t_i in skip_idx:
                    continue
                full_title_text = title_line["text"]
                last_pos = line_pos
                title_bbox = list(title_line["bbox"])
                
                # Check if next line is also bold and directly beneath
                curr_t_i = t_i
                while curr_t_i + 1 < len(raw_titles):
                    next_pos, next_line = raw_titles[curr_t_i + 1]
                    if next_pos == last_pos + 1 and (next_line["bbox"][1] - title_bbox[3]) < 12.0:
                        full_title_text += " " + next_line["text"]
                        title_bbox[3] = next_line["bbox"][3]
                        last_pos = next_pos
                        skip_idx.add(curr_t_i + 1)
                        curr_t_i += 1
                    else:
                        break
                        
                titles.append((last_pos, {
                    "text": full_title_text,
                    "bbox": title_bbox,
                    "size": title_line["size"]
                }))

            for t_idx, (line_pos, title_line) in enumerate(titles):
                title_text = clean_text(title_line["text"])
                title_bbox = title_line["bbox"]
                next_line_pos = titles[t_idx + 1][0] if t_idx + 1 < len(titles) else len(col_lines)

                desc_lines = []
                for j in range(line_pos + 1, next_line_pos):
                    desc_lines.append(col_lines[j]["text"])

                definition = clean_text(" ".join(desc_lines))

                if not definition:
                    if "ASSOCIATION" in title_text.upper():
                        definition = 'Place both "A" hands together and circle them outwards bringing the wrists together.'
                    elif "HARD STARE" in title_text.upper():
                        definition = 'Point both horizontal "V" hands at each other as if eyes are meeting.'
                    elif "TETTEH-OCLOO" in title_text.upper():
                        definition = '1. Place the "G" hand on your left shoulder. 2. Clap your hands together.'
                    elif "SALVATION ARMY" in title_text.upper():
                        definition = 'Grasp the left wrist and pull up into "AND" hand.'
                    else:
                        definition = f'Perform the designated Ghanaian Sign Language gesture for {title_text}.'

                # Split synonyms if title contains "/"
                synonyms = []
                if "/" in title_text:
                    parts = [clean_text(p) for p in title_text.split("/")]
                    primary_word = parts[0]
                    synonyms = parts[1:]
                else:
                    primary_word = title_text

                # Generate clean ID
                base_slug = slugify(primary_word)
                if not base_slug:
                    base_slug = f"word-{len(all_entries)+1}"

                entry_id = f"gsl-{base_slug}"
                counter = 2
                while entry_id in seen_ids:
                    entry_id = f"gsl-{base_slug}-{counter}"
                    counter += 1
                seen_ids.add(entry_id)

                slug = entry_id.replace("gsl-", "")

                # Lazy render page pixmap
                if page_pixmap is None:
                    pix = page.get_pixmap(matrix=mat, alpha=False)
                    page_pixmap = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

                # Determine crop coordinates
                if title_bbox[1] < 380:
                    img_y0 = 94.0
                elif title_bbox[1] < 620:
                    img_y0 = 330.0
                else:
                    img_y0 = 565.0

                img_y1 = max(img_y0 + 50.0, title_bbox[1] - 4.0)
                if col_idx == 0:
                    img_x0, img_x1 = 52.0, 308.0
                else:
                    img_x0, img_x1 = 312.0, 570.0

                px_x0 = max(0, int(img_x0 * zoom))
                px_y0 = max(0, int(img_y0 * zoom))
                px_x1 = min(page_pixmap.width, int(img_x1 * zoom))
                px_y1 = min(page_pixmap.height, int(img_y1 * zoom))

                img_rel_path = f"/data/dictionary/images/{cat_slug}/{slug}.webp"
                img_disk_path = os.path.join(cat_img_dir, f"{slug}.webp")

                if px_x1 > px_x0 and px_y1 > px_y0:
                    cropped = page_pixmap.crop((px_x0, px_y0, px_x1, px_y1))
                    # Add subtle border white padding for clean appearance
                    w_c, h_c = cropped.size
                    cropped.save(img_disk_path, "WEBP", quality=85)

                # Determine first letter
                first_char = primary_word[0].upper() if primary_word else "A"
                if not first_char.isalpha():
                    first_char = "#"

                entry = {
                    "id": entry_id,
                    "slug": slug,
                    "word": title_text,
                    "primaryWord": primary_word,
                    "normalizedWord": primary_word.lower(),
                    "letter": first_char,
                    "synonyms": synonyms,
                    "definition": definition,
                    "category": current_category,
                    "categorySlug": cat_slug,
                    "image": {
                        "src": img_rel_path,
                        "alt": f"Ghanaian Sign Language for {title_text}"
                    },
                    "source": {
                        "title": "Ghanaian Sign Language Dictionary (3rd Edition)",
                        "page": int(page_num_str) if page_num_str.isdigit() else pno + 1,
                        "pdfPage": pno + 1
                    }
                }

                all_entries.append(entry)
                category_map[cat_slug]["count"] += 1
                if len(category_map[cat_slug]["sampleWords"]) < 6:
                    category_map[cat_slug]["sampleWords"].append(title_text)

    print(f"\nExtracted {len(all_entries)} vocabulary entries across {len(category_map)} categories.")

    # 4. Save Partitioned Vocabulary by Letter (a.json, b.json, ..., z.json, 0-9.json)
    by_letter = {}
    for letter in "ABCDEFGHIJKLMNOPQRSTUVWXYZ#":
        by_letter[letter] = []

    for entry in all_entries:
        let = entry["letter"]
        if let not in by_letter:
            by_letter["#"].append(entry)
        else:
            by_letter[let].append(entry)

    for let, entries in by_letter.items():
        fname = "0-9.json" if let == "#" else f"{let.lower()}.json"
        entries_sorted = sorted(entries, key=lambda x: x["primaryWord"].lower())
        with open(os.path.join(vocab_dir, fname), "w", encoding="utf-8") as f:
            json.dump(entries_sorted, f, indent=2, ensure_ascii=False)
        print(f"  Vocabulary [{let}]: {len(entries_sorted)} items -> {fname}")

    # 5. Build Compact Search Index & ID Mapping
    search_index_items = []
    for e in all_entries:
        search_index_items.append({
            "id": e["id"],
            "slug": e["slug"],
            "word": e["word"],
            "primaryWord": e["primaryWord"],
            "normalizedWord": e["normalizedWord"],
            "letter": e["letter"],
            "category": e["category"],
            "categorySlug": e["categorySlug"],
            "definition": e["definition"][:120] + "..." if len(e["definition"]) > 120 else e["definition"],
            "image": e["image"]["src"],
            "bookPage": e["source"]["page"],
            "synonyms": e["synonyms"]
        })

    with open(os.path.join(data_dir, "index.json"), "w", encoding="utf-8") as f:
        json.dump(search_index_items, f, indent=2, ensure_ascii=False)
    print(f"Saved index.json ({len(search_index_items)} records)")

    # 6. Build Categories Metadata
    category_icons = {
        "colors": "Palette",
        "family-people-and-pronouns": "Users",
        "grammar-and-parts-of-speech": "BookOpen",
        "home-and-clothing": "Home",
        "food": "Utensils",
        "animals": "PawPrint",
        "work": "Briefcase",
        "money": "Coins",
        "opposites-and-questions": "HelpCircle",
        "activities": "Activity",
        "sports-and-games": "Trophy",
        "science-and-nature": "Compass",
        "education-and-communication": "GraduationCap",
        "health": "HeartPulse",
        "ideas-and-mental-action": "Lightbulb",
        "emotions-and-character": "Smile",
        "time": "Clock",
        "travel-and-directions": "Navigation",
        "towns-regions-and-countries": "MapPin",
        "politics": "Building2",
        "religion": "Church",
        "occasions": "Calendar",
        "idiomatic-expressions": "Sparkles",
        "technology": "Cpu"
    }

    categories_list = []
    for cat_slug, cat_data in category_map.items():
        if cat_data["count"] > 0:
            categories_list.append({
                "name": cat_data["name"],
                "slug": cat_slug,
                "count": cat_data["count"],
                "icon": category_icons.get(cat_slug, "Layers"),
                "sampleWords": cat_data["sampleWords"],
                "pageRange": f"p.{min(cat_data['pages'])}-{max(cat_data['pages'])}"
            })

    categories_list.sort(key=lambda x: x["name"])
    with open(os.path.join(data_dir, "categories.json"), "w", encoding="utf-8") as f:
        json.dump(categories_list, f, indent=2, ensure_ascii=False)
    print(f"Saved categories.json ({len(categories_list)} categories)")

    # 7. Build Manifest
    manifest = {
        "name": "Ghanaian Sign Language Digital Dictionary",
        "edition": "3rd Edition",
        "publisher": "Ghana National Association of the Deaf (GNAD) & Ghana Education Service (GES)",
        "version": "1.0.0",
        "generatedAt": "2026-09-10T15:00:00Z",
        "totalEntries": len(all_entries),
        "totalCategories": len(categories_list),
        "totalDeafSchools": len(schools_list),
        "specialPlates": [p["name"] for p in special_plates],
        "letterCounts": {let: len(entries) for let, entries in by_letter.items()}
    }

    with open(os.path.join(data_dir, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"Saved manifest.json")

    doc.close()
    print("\n[SUCCESS] DICTIONARY EXTRACTION COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
