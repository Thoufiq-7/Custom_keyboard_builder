import json
import os

base = os.path.dirname(os.path.abspath(__file__))
categories = {
    "keyboards": {"file": "keyboards.json", "folder": "keyboards"},
    "switches": {"file": "switches.json", "folder": "switches"},
    "keycaps": {"file": "keycaps.json", "folder": "keycaps"},
    "accessories": {"file": "accessories.json", "folder": "accessories"},
}

for key, info in categories.items():
    path = os.path.join(base, info["file"])
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    trimmed = data[:10]
    for p in trimmed:
        pid = p["id"]
        p["image"] = "/src/assets/" + info["folder"] + "/" + pid + ".jpg"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(trimmed, f, indent=2, ensure_ascii=False)
    print(f'{info["file"]}: trimmed to {len(trimmed)} items')

print("Done!")
