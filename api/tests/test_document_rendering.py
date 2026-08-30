import fitz

from app.main import extract_available_text, render_document_pages
from app.settings import settings


def test_pdf_rendering_persists_a_page_image(tmp_path, monkeypatch):
    monkeypatch.setenv("DATA_DIR", str(tmp_path / "data"))
    settings.cache_clear()
    source = tmp_path / "source.pdf"
    document = fitz.open(); document.new_page().insert_text((72, 72), "Rent roll"); document.save(source)
    images = render_document_pages("test-file", source)
    assert len(images) == 1
    assert images[0].suffix == ".png" and images[0].is_file()
    settings.cache_clear()


def test_docx_and_csv_text_are_available_to_the_extractor(tmp_path):
    from docx import Document

    docx_path = tmp_path / "lease.docx"
    document = Document(); document.add_paragraph("Tenant: Northstar Foods"); document.save(docx_path)
    csv_path = tmp_path / "rent-roll.csv"; csv_path.write_text("tenant,monthly_rent\nNorthstar,12000\n")

    docx_text, docx_pages = extract_available_text(docx_path, docx_path.name)
    csv_text, csv_pages = extract_available_text(csv_path, csv_path.name)
    assert "Northstar Foods" in docx_text and docx_pages == 1
    assert "monthly_rent" in csv_text and csv_pages == 1
