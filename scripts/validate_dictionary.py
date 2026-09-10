import os
import json
import sys

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(root_dir, "public")
    data_dir = os.path.join(public_dir, "data", "dictionary")
    vocab_dir = os.path.join(data_dir, "vocabulary")
    
    print("=" * 60)
    print("      GHANAIAN SIGN LANGUAGE DICTIONARY VALIDATION")
    print("=" * 60)
    
    if not os.path.exists(data_dir):
        print("ERROR: Dictionary data directory does not exist! Run extract_dictionary.py first.")
        sys.exit(1)

    # 1. Validate manifest
    manifest_path = os.path.join(data_dir, "manifest.json")
    if not os.path.exists(manifest_path):
        print("ERROR: manifest.json is missing.")
        sys.exit(1)
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)
    print(f"Manifest Version: {manifest.get('version')} ({manifest.get('edition')})")
    print(f"Total Declared Entries: {manifest.get('totalEntries')}")

    # 2. Validate index.json
    index_path = os.path.join(data_dir, "index.json")
    with open(index_path, "r", encoding="utf-8") as f:
        index_items = json.load(f)
    print(f"Search Index Records: {len(index_items)}")

    # 3. Validate Categories
    cat_path = os.path.join(data_dir, "categories.json")
    with open(cat_path, "r", encoding="utf-8") as f:
        categories = json.load(f)
    print(f"Categories Count: {len(categories)}")

    # 4. Validate Schools
    schools_path = os.path.join(data_dir, "schools.json")
    with open(schools_path, "r", encoding="utf-8") as f:
        schools = json.load(f)
    print(f"Deaf Schools in Ghana: {len(schools)}")

    # 5. Validate Vocabulary Files & Image Assets
    seen_ids = set()
    total_vocab = 0
    missing_images = 0
    empty_definitions = 0
    valid_images = 0

    for fname in os.listdir(vocab_dir):
        if not fname.endswith(".json"):
            continue
        fpath = os.path.join(vocab_dir, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            items = json.load(f)
            
        for item in items:
            total_vocab += 1
            item_id = item.get("id")
            if not item_id or item_id in seen_ids:
                print(f"WARNING: Duplicate or missing ID: {item_id}")
            seen_ids.add(item_id)

            if not item.get("definition"):
                empty_definitions += 1

            img_rel = item.get("image", {}).get("src", "")
            if img_rel:
                # Resolve in public dir
                img_path = os.path.join(public_dir, img_rel.lstrip("/"))
                if os.path.exists(img_path) and os.path.getsize(img_path) > 0:
                    valid_images += 1
                else:
                    missing_images += 1
            else:
                missing_images += 1

    print("\n--- DETAILED AUDIT RESULTS ---")
    print(f"Vocabulary Entries Audited: {total_vocab}")
    print(f"Valid Sign Images:          {valid_images}")
    print(f"Missing/Broken Images:      {missing_images}")
    print(f"Empty Definitions:          {empty_definitions}")
    print(f"Duplicate IDs:              {total_vocab - len(seen_ids)}")
    
    # 6. Check Special Plates
    missing_plates = 0
    plates_dir = os.path.join(public_dir, "data", "dictionary", "images", "plates")
    for plate_name in manifest.get("specialPlates", []):
        plate_file = os.path.join(plates_dir, f"{plate_name}.webp")
        if not os.path.exists(plate_file) or os.path.getsize(plate_file) == 0:
            print(f"WARNING: Special plate missing: {plate_name}")
            missing_plates += 1

    print(f"Special Plates Validated:   {len(manifest.get('specialPlates', [])) - missing_plates}/{len(manifest.get('specialPlates', []))}")
    
    print("\n" + "=" * 60)
    if missing_images == 0 and empty_definitions == 0 and total_vocab > 1000:
        print("STATUS: PASSED - PRODUCTION READY DATASET")
    else:
        print("STATUS: COMPLETED WITH WARNINGS")
    print("=" * 60)

if __name__ == "__main__":
    main()
