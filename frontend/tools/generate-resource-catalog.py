from __future__ import annotations

import hashlib
import json
import re
from datetime import datetime
from pathlib import Path

import pypdfium2 as pdfium
from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = PROJECT_ROOT.parent
CONFIG_FILE = PROJECT_ROOT / "resource-paths.json"
GALLERY_DATA_FILE = PROJECT_ROOT / "tools" / "generated" / "papers.data.js"
GALLERY_CACHE_DIR = PROJECT_ROOT / "assets" / "images" / "pdf-gallery-cache"


def resolve_resource_root(config: dict) -> Path:
    configured = config.get("localContentRoot")
    if configured:
        root = (REPO_ROOT / configured).resolve()
        if root.exists():
            return root
    local_root = REPO_ROOT / "local-resources" / "MCA_new"
    if local_root.exists():
        return local_root
    return PROJECT_ROOT / config["contentRoot"]


def web_path(path: Path) -> str:
    resolved = path.resolve()
    local_root = (REPO_ROOT / "local-resources").resolve()
    if resolved.is_relative_to(local_root):
        return "/local-resources/" + resolved.relative_to(local_root).as_posix()
    return "../" + resolved.relative_to(PROJECT_ROOT).as_posix()


def natural_key(value: str) -> list[object]:
    return [
        int(part) if part.isdigit() else part.lower()
        for part in re.split(r"(\d+)", value)
    ]


def display_name(folder_name: str) -> str:
    return folder_name.replace("_", "-").upper()


def is_hindi_pdf(path: Path) -> bool:
    return path.stem.lower().endswith("-hi")


def hindi_name_for(path: Path) -> str:
    return f"{path.stem}-hi{path.suffix}"


def english_name_for(path: Path) -> str:
    return f"{path.stem[:-3]}{path.suffix}" if is_hindi_pdf(path) else path.name


def preview_name(path: Path) -> str:
    readable = re.sub(r"[^a-z0-9]+", "-", path.stem.lower()).strip("-")[:55]
    source = path.resolve().relative_to(REPO_ROOT).as_posix()
    digest = hashlib.sha1(source.encode("utf-8")).hexdigest()[:8]
    return f"{readable}-{digest}.webp"


def short_month(value: str) -> str:
    return "Dec" if value.lower().startswith("dec") else "June"


def exam_session(filename: str) -> str:
    match = re.search(r"\b(June|December|Dec)\s+(\d{4})\b", filename, re.IGNORECASE)
    if match:
        return f"{match.group(2)} {short_month(match.group(1))}"
    match = re.search(r"\b(\d{4})\s+(June|December|Dec)\b", filename, re.IGNORECASE)
    if match:
        return f"{match.group(1)} {short_month(match.group(2))}"
    set_match = re.search(r"\bSet[-\s]*(\d+)\b", filename, re.IGNORECASE)
    return f"Set {set_match.group(1)}" if set_match else "Question Paper"


def session_sort_value(filename: str) -> int:
    match = re.search(r"\b(June|December|Dec)\s+(\d{4})\b", filename, re.IGNORECASE)
    if match:
        month = 12 if match.group(1).lower() in {"december", "dec"} else 6
        return int(match.group(2)) * 100 + month
    match = re.search(r"\b(\d{4})\s+(June|December|Dec)\b", filename, re.IGNORECASE)
    if match:
        month = 12 if match.group(2).lower() in {"december", "dec"} else 6
        return int(match.group(1)) * 100 + month
    set_match = re.search(r"\bSet[-\s]*(\d+)\b", filename, re.IGNORECASE)
    return int(set_match.group(1)) if set_match else 0


def display_title(filename: str) -> str:
    title = Path(filename).stem
    title = re.sub(r"-hi$", "", title, flags=re.IGNORECASE)
    title = re.sub(r"\bquestion\s+paper\b", "", title, flags=re.IGNORECASE)
    return re.sub(r"\s+", " ", title).strip(" -")


def render_preview(pdf_path: Path, preview_path: Path) -> int:
    pdf = pdfium.PdfDocument(str(pdf_path))
    page_count = len(pdf)
    if page_count and (
        not preview_path.exists()
        or preview_path.stat().st_mtime < pdf_path.stat().st_mtime
    ):
        page = pdf[0]
        image = page.render(scale=1.45).to_pil()
        image.thumbnail((900, 1200), Image.Resampling.LANCZOS)
        image.save(preview_path, "WEBP", quality=82, method=6)
        page.close()
    pdf.close()
    return page_count


def pdf_entry(path: Path) -> dict[str, str]:
    return {"title": path.stem, "path": web_path(path)}


def grouped_study_material(study_dir: Path) -> list[dict]:
    if not study_dir.exists():
        return []
    groups: dict[str, list[dict[str, str]]] = {}
    for pdf in sorted(study_dir.rglob("*.pdf"), key=lambda item: natural_key(str(item))):
        relative_parent = pdf.parent.relative_to(study_dir)
        title = "Study Material" if str(relative_parent) == "." else relative_parent.as_posix()
        groups.setdefault(title, []).append(pdf_entry(pdf))
    return [{"title": title, "files": files} for title, files in groups.items()]


def find_html_viewer(exam_dir: Path) -> str:
    if not exam_dir.exists():
        return ""
    candidates = [
        path for path in exam_dir.glob("*.html")
        if path.name.lower() != "index.html"
    ]
    return (
        web_path(sorted(candidates, key=lambda item: natural_key(item.name))[0])
        if candidates
        else ""
    )


def gallery_cards(exam_dir: Path, subject_code: str) -> list[dict]:
    GALLERY_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    pdf_files = sorted(exam_dir.glob("*.pdf"), key=lambda item: natural_key(item.name))
    by_name = {path.name.lower(): path for path in pdf_files}
    cards = []
    used: set[str] = set()

    for path in pdf_files:
        if path.name.lower() in used:
            continue
        if is_hindi_pdf(path):
            english = by_name.get(english_name_for(path).lower())
            hindi = path
        else:
            english = path
            hindi = by_name.get(hindi_name_for(path).lower())
        primary = english or hindi
        if primary is None:
            continue
        if english:
            used.add(english.name.lower())
        if hindi:
            used.add(hindi.name.lower())

        preview = GALLERY_CACHE_DIR / preview_name(primary)
        page_count = render_preview(primary, preview)
        stat = primary.stat()
        cards.append({
            "title": display_title(primary.name),
            "subject": subject_code,
            "session": exam_session(primary.name),
            "english": web_path(english) if english else "",
            "hindi": web_path(hindi) if hindi else "",
            "preview": web_path(preview),
            "fileName": primary.name,
            "pages": page_count,
            "size": stat.st_size,
            "updated": datetime.fromtimestamp(stat.st_mtime).strftime("%d %b %Y"),
            "_sort": session_sort_value(primary.name),
        })

    cards.sort(key=lambda card: card["_sort"], reverse=True)
    for card in cards:
        card.pop("_sort")
    return cards


def build_catalog(config: dict) -> tuple[dict, list[dict]]:
    content_root = resolve_resource_root(config)
    semester_prefix = config.get("semesterPrefix", "Semester_")
    exam_folder = config.get("examFolder", "exam_papers")
    study_folder = config.get("studyFolder", "study_material")
    subject_names = {
        key.upper(): value
        for key, value in config.get("subjectNames", {}).items()
    }
    question_banks = {
        key.upper(): value
        for key, value in config.get("questionBanks", {}).items()
    }
    semesters = []
    all_gallery_cards: list[dict] = []

    semester_dirs = sorted(
        (
            path for path in content_root.iterdir()
            if path.is_dir() and path.name.startswith(semester_prefix)
        ),
        key=lambda item: natural_key(item.name),
    )

    for semester_dir in semester_dirs:
        subjects = []
        for subject_dir in sorted(
            (path for path in semester_dir.iterdir() if path.is_dir()),
            key=lambda item: natural_key(item.name),
        ):
            code = display_name(subject_dir.name)
            exam_dir = subject_dir / exam_folder
            exam_files = (
                sorted(exam_dir.glob("*.pdf"), key=lambda item: natural_key(item.name))
                if exam_dir.exists()
                else []
            )
            study_groups = grouped_study_material(subject_dir / study_folder)
            if not exam_files and not study_groups:
                continue

            gallery_page = ""
            if exam_files:
                all_gallery_cards.extend(gallery_cards(exam_dir, code))
                gallery_page = f"/paper-gallery?subject={code}"

            question_bank = subject_dir / "question-bank.html"
            question_bank_url = question_banks.get(code, "")
            if not question_bank_url and question_bank.exists():
                question_bank_url = web_path(question_bank)

            subjects.append({
                "code": code,
                "name": subject_names.get(code, code),
                "type": "practical" if code.startswith("MCSL") else "theory",
                "questionPaperCount": len(
                    [path for path in exam_files if not is_hindi_pdf(path)]
                ),
                "galleryPage": gallery_page,
                "htmlViewer": find_html_viewer(exam_dir),
                "questionBank": question_bank_url,
                "studyGroups": study_groups,
            })

        semesters.append({
            "number": semester_dir.name.removeprefix(semester_prefix).replace("_", " "),
            "folder": semester_dir.name,
            "subjects": subjects,
        })

    return {"contentRoot": config["contentRoot"], "semesters": semesters}, all_gallery_cards


def main() -> None:
    config = json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
    catalog, gallery_data = build_catalog(config)
    output = PROJECT_ROOT / "tools" / "generated" / "subjects.data.js"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        "window.MCA_RESOURCE_CATALOG = "
        + json.dumps(catalog, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    GALLERY_DATA_FILE.write_text(
        "window.PDF_GALLERY_DATA = "
        + json.dumps(gallery_data, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )

    subject_count = sum(len(semester["subjects"]) for semester in catalog["semesters"])
    print(f"Catalog updated: {len(catalog['semesters'])} semester(s)")
    print(f"Subjects: {subject_count}")
    print(f"Question-paper gallery cards: {len(gallery_data)}")
    print(f"Catalog data: {output}")
    print(f"Gallery data: {GALLERY_DATA_FILE}")
    print(f"Gallery previews: {GALLERY_CACHE_DIR}")


if __name__ == "__main__":
    main()

