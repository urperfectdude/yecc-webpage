#!/usr/bin/env python3
"""Reads the course landing pages on www.yourerpcoach.com and writes src/data/courses.json, which the course pages
are built from. Course artwork and instructor photos are saved to src/assets/courses.

The old site is a JavaScript app, so each page is rendered in headless Chrome first. Rendered pages are kept in
tools/.cache; delete that folder to pull fresh content. Run from anywhere: python3 tools/fetch_courses.py
"""

from html import unescape
from pathlib import Path
from urllib.parse import quote, unquote
import ast
import json
import re
import subprocess

HERE = Path(__file__).resolve().parent
SRC = HERE.parent / "src"
CACHE = HERE / ".cache"
IMAGES = SRC / "assets" / "courses"
ORIGIN = "https://www.yourerpcoach.com"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
PATHS = [
    "erp-business-processes-overview-175/supplier-master-data-management-996",
    "basics-of-erp-2024-24/what-is-erp--165",
    "oracle-cloud-p2p-fast-track-course-13/introduction-to-oracle-erp-cloud-or-oracle-fusion-apps-video-11",
    "oracle-cloud-expense-27/01_introduction-to-oracle-cloud-expenses-176",
    "oracle-cloud-scm-process-course-21/00_course-introduction-video-118",
    "oracle-cloud-erp-basics-and-general-accounting-2025-26-86/introduction-to-oracle-erp-cloud-or-oracle-fusion-apps-video-11",
    "oracle-cloud-erp-accounts-payable-2025-26-87/01_ap-module-overview-and-manual-invoice-part-1-video-46",
    "oracle-cloud-erp-cash-management-2025-26-88/01_cash-management-overview-and-bank-statement-creation-video-73",
    "oracle-cloud-erp-accounts-receivable-2025-26-89/01_receivables-transactions-customer-invoices-video-80",
    "oracle-cloud-erp-fixed-assets-2025-26-90/01_key-fa-setups-asset-flexfields-video-100",
]
LESSON_META = re.compile(r"^(\d+:\d+|(Video|Test|Assignment) \|.*)$")


def rendered(path):
    f = CACHE / (path.split("/")[0] + ".html")
    if not f.is_file():
        CACHE.mkdir(parents=True, exist_ok=True)
        out = subprocess.run(
            [CHROME, "--headless=new", "--disable-gpu", "--virtual-time-budget=25000", "--dump-dom", f"{ORIGIN}/courselanding/{path}"],
            capture_output=True, text=True, timeout=180,
        ).stdout
        f.write_text(out, encoding="utf-8")
    return f.read_text(encoding="utf-8", errors="ignore")


def lines(page):
    """Visible text, one element per line. Headings start with '#', images are '[IMG url]', links '[A url]'."""
    b = page[page.find("<body"):]
    b = re.sub(r"<(script|style|svg|noscript)\b.*?</\1>", "", b, flags=re.S)
    b = re.sub(r'<img[^>]*src="([^"]*)"[^>]*>', r"\n[IMG \1]\n", b)
    b = re.sub(r"<(h[1-6])[^>]*>", "\n#", b)
    b = re.sub(r'<a[^>]*href="([^"]*)"[^>]*>', r"\n[A \1] ", b)
    b = re.sub(r"</(p|div|li|h[1-6]|section|a|span|td|tr|button|label)>", "\n", b)
    b = unescape(re.sub(r"<[^>]+>", "", b)).replace("—", ", ")
    return [l.strip() for l in b.split("\n") if l.strip()]


def image(url):
    """Download once into assets/courses and return the local filename."""
    name = re.sub(r"[^A-Za-z0-9.]+", "-", unquote(url).rsplit("/", 1)[1]).lower()
    target = IMAGES / name
    if not target.is_file():
        IMAGES.mkdir(parents=True, exist_ok=True)
        # curl, not urllib: the image CDN answers Python's client with 403.
        subprocess.run(["curl", "-sSfkL", "-o", str(target), quote(unquote(url), safe=":/")], check=True, timeout=120)
    return name


def catalog_tags():
    """Audience, functional area, product and pricing tags from the old site's course API, keyed by course path."""
    f = CACHE / "getCourses.json"
    if not f.is_file():
        CACHE.mkdir(parents=True, exist_ok=True)
        # The API answers only requests that carry the site's Origin header.
        subprocess.run(["curl", "-sSf", "-o", str(f), "-H", f"Origin: {ORIGIN}", "https://api.yourerpcoach.com/courses/getCourses"], check=True, timeout=60)
    read = lambda v: ast.literal_eval(v) if isinstance(v, str) else (v or [])
    return {
        c["Url"].split("/")[0]: {"audience": read(c["IntendentAudience"]), "areas": read(c["FunctionalArea"]), "product": read(c["Product"]), "pricing": read(c["Pricing"])}
        for c in json.loads(f.read_text(encoding="utf-8"))["data"]
    }


def money(text):
    return "₹{:,}".format(int(float(text.replace("₹", "").replace(",", ""))))


def between(L, start, end):
    return L[L.index(start) + 1:L.index(end)]


def parse(path):
    L = lines(rendered(path))
    i = next(k for k, l in enumerate(L) if l.startswith("#"))
    c = {"slug": re.sub(r"-\d+$", "", path.split("/")[0]), "url": f"{ORIGIN}/courselanding/{path}", "title": L[i][1:], "description": L[i + 1]}
    head = L[i + 2:L.index("#This Course Includes")]
    for l in head:
        key, _, val = l.partition(": ")
        if key == "Instructor":
            # The old page repeats the company name; keep each part once.
            c["instructor"] = ", ".join(dict.fromkeys(p.strip() for p in val.split(",")))
        elif key == "Course Content":
            c["content"] = re.sub(r"\s*-\s*", " · ", val)
        elif key == "Total Duration":
            c["duration"] = val
        elif key == "Mode of Delivery":
            c["mode"] = val
        elif l.startswith("[IMG "):
            c["thumbnail"] = image(l[5:-1])
    prices = [l for l in head if re.match(r"^₹?[\d,]+(\.\d+)?$", l)]
    c["price"] = money(prices[0])
    c["original"] = money(prices[1]) if len(prices) > 1 else ""
    c["off"] = next((l.replace("%off", "% off") for l in head if l.endswith("%off")), "")
    c["includes"] = between(L, "#This Course Includes", "#This Course is Ideal for")
    c["ideal"] = between(L, "#This Course is Ideal for", "#Course Content")

    end = next(k for k, l in enumerate(L) if "logo_foot" in l)
    why = L.index("#Why YECC Courses are Different?") if "#Why YECC Courses are Different?" in L else end
    prof = L.index("#Instructor Profile") if "#Instructor Profile" in L else why
    c["modules"] = []
    for l in L[L.index("#Course Content") + 1:prof]:
        if l.startswith("[IMG "):
            c["modules"].append({"rows": []})
        else:
            c["modules"][-1]["rows"].append(l)
    for m in c["modules"]:
        rows = m.pop("rows")
        m["name"], m["total"], m["count"] = rows[0], rows[1], re.sub(r"\s*-\s*", " · ", rows[2])
        m["lessons"] = []
        for title, meta in zip(rows[3::2], rows[4::2]):
            assert LESSON_META.match(meta), (path, title, meta)
            kind = meta.split(" |")[0].lower() if "|" in meta else "video"
            preview = title.endswith(" Preview")
            m["lessons"].append({
                "title": title[:-8] if preview else title, "kind": kind, "preview": preview,
                "meta": meta.split("| ", 1)[1].replace(" | ", " · ") if "|" in meta else meta,
            })

    bio = []
    for l in L[prof + 1:why]:
        if l.startswith("[IMG "):
            c["photo"] = image(l[5:-1])
        elif l.startswith("[A "):
            c["linkedin"] = l[3:l.index("]")]
        elif bio and bio[-1].count("(") > bio[-1].count(")"):
            bio[-1] += " " + l  # a bullet the old page breaks across two lines
        else:
            bio.append(l)
    c["bio"] = bio
    c["why"] = L[why + 1:end]
    return c


if __name__ == "__main__":
    tags = catalog_tags()
    courses = [{**parse(p), **tags[p.split("/")[0]]} for p in PATHS]
    (SRC / "data" / "courses.json").write_text(json.dumps(courses, ensure_ascii=False, indent=1), encoding="utf-8")
    for c in courses:
        print(c["slug"], c["price"], c["original"], c["off"], len(c["modules"]), "modules", sum(len(m["lessons"]) for m in c["modules"]), "items")
