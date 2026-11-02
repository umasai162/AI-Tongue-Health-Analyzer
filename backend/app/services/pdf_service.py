import os
from pathlib import Path
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

from app.config import settings

class PDFReportService:
    """
    Professional PDF Health Report Generation Service.
    Compiles analysis results, multi-task predictions, explainable AI heatmaps,
    and structured LLM health insights into an educational PDF document.
    """

    @classmethod
    def generate_report_pdf(
        cls,
        analysis_id: int,
        user_name: str,
        user_email: str,
        created_at_str: str,
        image_paths: Dict[str, str],
        predictions: List[Dict[str, Any]],
        report_data: Dict[str, Any],
        output_filename: str
    ) -> str:
        """
        Build and write a PDF health analysis report to disk.
        """
        output_path = Path(settings.REPORTS_DIR) / output_filename
        doc = SimpleDocTemplate(
            str(output_path),
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Custom palette styles
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#0f172a"),
            alignment=1  # Center
        )
        subtitle_style = ParagraphStyle(
            "DocSubTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#0284c7"),
            alignment=1
        )
        section_style = ParagraphStyle(
            "SectionHeader",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=16,
            textColor=colors.HexColor("#0f172a"),
            spaceBefore=10,
            spaceAfter=4
        )
        body_style = ParagraphStyle(
            "BodyDark",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#334155")
        )
        bullet_style = ParagraphStyle(
            "BulletText",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor("#334155"),
            leftIndent=12,
            spaceAfter=2
        )
        disclaimer_style = ParagraphStyle(
            "Disclaimer",
            parent=styles["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=7.5,
            leading=10,
            textColor=colors.HexColor("#b91c1c")
        )

        story = []

        # 1. Header Banner
        story.append(Paragraph("AI TONGUE HEALTH ANALYZER", title_style))
        story.append(Paragraph("CLINICAL COMPUTER VISION & EDUCATIONAL INSIGHT REPORT", subtitle_style))
        story.append(Spacer(1, 8))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284c7"), spaceAfter=10))

        # 2. Meta Information Bar
        meta_data = [
            [
                Paragraph(f"<b>Patient / User:</b> {user_name}", body_style),
                Paragraph(f"<b>Analysis ID:</b> #{analysis_id}", body_style)
            ],
            [
                Paragraph(f"<b>Email:</b> {user_email}", body_style),
                Paragraph(f"<b>Date:</b> {created_at_str}", body_style)
            ]
        ]
        meta_table = Table(meta_data, colWidths=[270, 270])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 10))

        # 3. Visualizations Gallery (2x2 Grid of images)
        story.append(Paragraph("Visual Analysis & Explainable AI (XAI)", section_style))
        img_cells = []
        for label, img_key in [
            ("Original Image", "original"),
            ("CLAHE Preprocessed", "processed"),
            ("U-Net Mask", "mask"),
            ("Grad-CAM XAI Heatmap", "gradcam")
        ]:
            img_p = image_paths.get(img_key)
            if img_p and os.path.exists(img_p):
                try:
                    img_flowable = RLImage(img_p, width=1.8*inch, height=1.35*inch)
                    cell = [img_flowable, Paragraph(f"<b>{label}</b>", subtitle_style)]
                except Exception:
                    cell = [Paragraph(f"{label} [Preview]", body_style)]
            else:
                cell = [Paragraph(f"{label} (N/A)", body_style)]
            img_cells.append(cell)

        if len(img_cells) >= 4:
            gallery_data = [
                [img_cells[0], img_cells[1]],
                [img_cells[2], img_cells[3]]
            ]
            gallery_table = Table(gallery_data, colWidths=[270, 270])
            gallery_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('PADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(gallery_table)
        story.append(Spacer(1, 10))

        # 4. Multi-Task Quantitative Predictions Table
        story.append(Paragraph("Computer Vision Observations & Confidence", section_style))
        table_rows = [["Tongue Characteristic", "Observed Feature", "Confidence", "Clinical Notes"]]
        for p in predictions:
            conf_str = f"{int(p.get('confidence', 0) * 100)}%"
            table_rows.append([
                Paragraph(f"<b>{p.get('feature_name', '')}</b>", body_style),
                Paragraph(str(p.get("predicted_label", "")), body_style),
                Paragraph(conf_str, body_style),
                Paragraph(str(p.get("details", "")), body_style)
            ])
        pred_table = Table(table_rows, colWidths=[120, 110, 60, 250])
        pred_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0284c7")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ('PADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(pred_table)
        story.append(Spacer(1, 10))

        # 5. Educational Insights & Next Steps
        story.append(Paragraph("AI Educational Synthesis & Guidance", section_style))
        story.append(Paragraph(f"<b>Summary:</b> {report_data.get('summary', '')}", body_style))
        story.append(Spacer(1, 6))

        story.append(Paragraph("<b>Recommended Next Steps & Oral Hygiene:</b>", body_style))
        for step in report_data.get("recommended_next_steps", []):
            story.append(Paragraph(f"• {step}", bullet_style))
        story.append(Spacer(1, 6))

        story.append(Paragraph("<b>When to Consult a Licensed Professional:</b>", body_style))
        for item in report_data.get("when_to_consult_doctor", []):
            story.append(Paragraph(f"• {item}", bullet_style))
        story.append(Spacer(1, 6))

        story.append(Paragraph("<b>Evidence Citations:</b>", body_style))
        for cite in report_data.get("evidence_references", []):
            story.append(Paragraph(f"• {cite}", bullet_style))
        story.append(Spacer(1, 8))

        # 6. Medical Disclaimer Box
        disclaimer_text = report_data.get("medical_disclaimer", "")
        disclaimer_table = Table([[Paragraph(disclaimer_text, disclaimer_style)]], colWidths=[540])
        disclaimer_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#fef2f2")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#f87171")),
            ('PADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(disclaimer_table)

        doc.build(story)
        return str(output_path)

pdf_service = PDFReportService()
