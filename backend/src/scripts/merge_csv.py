import pandas as pd
import sys
import json
from io import StringIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import inch

def create_pdf_report(file_paths, output_file):
    try:
        # Process CSV files into DataFrames
        dfs = {}
        sheet_mapping = {
            'data_with_exploits': 'Data With Exploits',
            'entrypoint_most_info': 'Entrypoint Most Info',
            'port_0_entries': 'Port 0 Entries',
            'ranked_entry_points': 'Ranked Entry Points'
        }
        
        for key, sheet_name in sheet_mapping.items():
            if key in file_paths:
                df = pd.read_csv(file_paths[key])
                if not df.empty:
                    dfs[sheet_name] = df

        # Initialize PDF document
        doc = SimpleDocTemplate(
            output_file,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        styles = getSampleStyleSheet()
        elements = []

        # Title
        elements.append(Paragraph("Network Analysis Report", styles['Title']))
        elements.append(Spacer(1, 0.5 * inch))

        # Generate Table of Contents
        elements.append(Paragraph("Table of Contents", styles['Heading1']))
        elements.append(Spacer(1, 0.2 * inch))

        for idx, sheet_name in enumerate(dfs.keys()):
            elements.append(Paragraph(
                f"{idx + 1}. {sheet_name}",
                styles['Normal']
            ))
            elements.append(Spacer(1, 0.1 * inch))

        elements.append(PageBreak())

        # Add each sheet's content
        for sheet_name, df in dfs.items():
            elements.append(Paragraph(
                f"Sheet: {sheet_name}",
                styles['Heading2']
            ))
            elements.append(Spacer(1, 0.2 * inch))

            # Process rows in chunks for better readability
            rows_per_page = 10
            row_chunks = [df.iloc[i:i + rows_per_page] for i in range(0, len(df), rows_per_page)]
            
            for chunk in row_chunks:
                # Create table from chunk
                data = [[Paragraph(str(col), styles['Normal']) for col in df.columns]]
                for _, row in chunk.iterrows():
                    data.append([Paragraph(str(val), styles['Normal']) for val in row])

                table = Table(data, repeatRows=1)
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                    ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
                    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 1), (-1, -1), 8),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ]))
                elements.append(table)
                elements.append(Spacer(1, 0.2 * inch))
                elements.append(PageBreak())

        # Build the PDF
        doc.build(elements)
        return True
    except Exception as e:
        print(f"Error creating PDF file: {str(e)}", file=sys.stderr)
        return False

def main():
    try:
        if len(sys.argv) != 3:
            print("Usage: python merge_csv.py <file_paths_json> <output_file>")
            sys.exit(1)
        
        # Parse the JSON data
        file_paths = json.loads(sys.argv[1])
        output_file = sys.argv[2]
        
        success = create_pdf_report(file_paths, output_file)
        sys.exit(0 if success else 1)
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {str(e)}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()