import pandas as pd
import sys
import json
from io import StringIO

def merge_csvs_to_excel(csv_data, output_file):
    try:
        dfs = {}
        chunk_size = 10000  # Adjust based on your needs
        
        for sheet_name, csv_content in csv_data.items():
            # Read CSV in chunks
            chunks = []
            for chunk in pd.read_csv(StringIO(csv_content), chunksize=chunk_size):
                chunks.append(chunk)
            dfs[sheet_name] = pd.concat(chunks, ignore_index=True)

        # Write to Excel without the options parameter
        with pd.ExcelWriter(output_file, engine='xlsxwriter') as writer:
            for sheet_name, df in dfs.items():
                # Convert sheet name to a valid Excel sheet name
                valid_sheet_name = sheet_name[:31].replace('/', '_').replace('\\', '_')
                df.to_excel(writer, sheet_name=valid_sheet_name, index=False)
        
        return True
    except Exception as e:
        print(f"Error creating Excel file: {str(e)}", file=sys.stderr)
        return False

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python merge_csv.py <csv_data_json> <output_file>")
        sys.exit(1)
    
    try:
        csv_data_str = sys.argv[1]
        output_file = sys.argv[2]
        
        # Parse the JSON data
        csv_data = json.loads(csv_data_str)
        
        # Map the CSV data keys to sheet names
        sheet_mapping = {
            'data_with_exploits': 'Data With Exploits',
            'entrypoint_most_info': 'Entrypoint Most Info',
            'port_0_entries': 'Port 0 Entries',
            'ranked_entry_points': 'Ranked Entry Points'
        }
        
        # Rename the keys to proper sheet names
        formatted_csv_data = {
            sheet_mapping[key]: value 
            for key, value in csv_data.items() 
            if key in sheet_mapping
        }
        
        success = merge_csvs_to_excel(formatted_csv_data, output_file)
        sys.exit(0 if success else 1)
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {str(e)}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {str(e)}", file=sys.stderr)
        sys.exit(1)