from fpdf import FPDF
import pandas as pd
import textwrap
import os


script_dir = os.path.dirname(os.path.abspath(__file__))
# Path to the Process_5 directory where CSVs are stored
csv_dir = os.path.join(script_dir, 'Process_5')

class PDF(FPDF):
    def header(self):
        """Add a consistent header for all pages."""
        self.set_font("Arial", "B", 12)
        self.cell(0, 10, "CSV Data Report", 0, 1, "C")
        self.ln(5)

    def chapter_title(self, title):
        """Add a title for each section."""
        self.set_font("Arial", "B", 14)
        self.cell(0, 10, title, 0, 1, "L")
        self.ln(5)

    def render_table(self, dataframe, title):
        """
        Render a DataFrame as a table in the PDF.
        If the table is too wide, split it into smaller chunks.
        """
        max_columns_per_page = 6  # Number of columns to fit on one page
        col_width = 40  # Adjust column width
        row_height = 7  # Row height for table

        self.add_page()
        self.chapter_title(title)

        # Split the dataframe if it has too many columns
        column_groups = [
            dataframe.columns[i : i + max_columns_per_page]
            for i in range(0, len(dataframe.columns), max_columns_per_page)
        ]

        for group_index, columns in enumerate(column_groups):
            if group_index > 0:
                self.add_page()

            # Print column headers
            for col in columns:
                self.cell(col_width, row_height, col, border=1, align="C")
            self.ln(row_height)

            # Print data rows
            for _, row in dataframe[columns].iterrows():
                for col in columns:
                    cell_value = str(row[col]) if not pd.isnull(row[col]) else ""
                    wrapped_text = textwrap.fill(cell_value, width=15)
                    self.cell(col_width, row_height, wrapped_text, border=1, align="L")
                self.ln(row_height)

            self.ln(5)  # Add space before the next group of columns


# File paths
files = {
    "Ranked Entry Points": os.path.join(csv_dir, "ranked_entry_points.csv"),
    "Port 0 Entries": os.path.join(csv_dir, "port_0_entries.csv"),
    "Entrypoint Most Info": os.path.join(csv_dir, "entrypoint_most_info.csv"),
    "Data with Exploits": os.path.join(csv_dir, "data_with_exploits.csv")
}


# Create a PDF instance
pdf = PDF()
pdf.set_auto_page_break(auto=True, margin=15)

# Add a title page
pdf.add_page()
pdf.set_font("Arial", "B", 16)
pdf.cell(0, 10, "Comprehensive CSV Report", 0, 1, "C")
pdf.ln(10)
pdf.set_font("Arial", size=12)
pdf.multi_cell(0, 10, "This report contains the contents of the provided CSV files. "
                      "Tables")

# Process each CSV file
for title, file_path in files.items():
    try:
        if os.path.exists(file_path):
            df = pd.read_csv(file_path)
            pdf.render_table(df, title)
        else:
            pdf.add_page()
            pdf.chapter_title(f"{title} (File Not Found)")
            pdf.multi_cell(0, 10, f"The file {os.path.basename(file_path)} was not found in the Process_5 directory.")
    except Exception as e:
        pdf.add_page()
        pdf.chapter_title(f"{title} (Error)")
        pdf.multi_cell(0, 10, f"Failed to process this file: {str(e)}")

# Save the PDF in the same directory as the script
output_path = os.path.join(script_dir, "Human_Readable_CSV_Report.pdf")
pdf.output(output_path)

print(f"PDF Report Generated: {output_path}")