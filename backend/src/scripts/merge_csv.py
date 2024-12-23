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
        doc = SimpleDocTemplate(output_file, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []

        # Generate Table of Contents
        elements.append(Paragraph("Table of Contents", styles['Title']))
        toc_links = {}

        for idx, sheet_name in enumerate(dfs.keys()):
            link_text = f"{sheet_name}"
            toc_links[sheet_name] = f"link-{idx}"
            elements.append(Paragraph(
                f'<a href="#{toc_links[sheet_name]}" color="blue"><u>{link_text}</u></a>',
                styles['Normal']
            ))
            elements.append(Spacer(1, 0.2 * inch))

        elements.append(PageBreak())

        # Add each sheet's content
        for sheet_name, df in dfs.items():
            first_instance_link_added = False

            # Determine rows per page based on sheet name
            if sheet_name == "Ranked Entry Points":
                rows_per_page = 4
            elif sheet_name == "Entrypoint Most Info":
                rows_per_page = 6
            else:
                rows_per_page = 2

            # Process rows in chunks
            row_chunks = [df.iloc[i:i + rows_per_page] for i in range(0, len(df), rows_per_page)]
            
            for chunk in row_chunks:
                if not first_instance_link_added:
                    elements.append(Paragraph(
                        f'<a name="{toc_links[sheet_name]}"></a><b>Sheet: {sheet_name}</b>',
                        styles['Heading2']
                    ))
                    first_instance_link_added = True
                else:
                    elements.append(Paragraph(
                        f'<b>Sheet: {sheet_name}</b>',
                        styles['Heading2']
                    ))

                elements.append(Paragraph(
                    '<a href="#link-TOC" color="blue"><u>Return to TOC</u></a>',
                    styles['Normal']
                ))
                elements.append(Spacer(1, 0.2 * inch))

                # Add mini-tables for rows
                for _, row in chunk.iterrows():
                    row_data = [[Paragraph(f"<b>{col}</b>", styles['Normal']), str(val)] 
                               for col, val in zip(df.columns, row)]
                    table = Table(row_data, colWidths=[2.5 * inch, 4.5 * inch])
                    table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black),
                    ]))
                    elements.append(table)
                    elements.append(Spacer(1, 0.2 * inch))

                elements.append(PageBreak())

        # Add TOC link at the beginning
        toc_links['TOC'] = 'link-TOC'
        elements.insert(1, Paragraph('<a name="link-TOC"></a>', styles['Normal']))

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