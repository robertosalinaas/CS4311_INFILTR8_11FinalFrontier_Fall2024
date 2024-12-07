import sys
import os
import xml.etree.ElementTree as ET
import pandas as pd
import json
import category_encoders as ce
from sklearn.preprocessing import MinMaxScaler
import argparse

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Analyze Nessus scan results')
    parser.add_argument('nessus_file', help='Path to the Nessus file')
    parser.add_argument('--output-dir', required=True, help='Directory for output files')
    parser.add_argument('--allowed-ips', required=True, help='Comma-separated list of allowed IP addresses')
    parser.add_argument('--allowed-exploits', required=True, help='Comma-separated list of allowed exploit archetypes')
    
    args = parser.parse_args()

    # Convert comma-separated strings to lists
    allowed_ips = [ip.strip() for ip in args.allowed_ips.split(',')]
    allowed_exploits = [exploit.strip() for exploit in args.allowed_exploits.split(',')]

    # Verify the Nessus file exists
    if not os.path.exists(args.nessus_file):
        print(f"Error: Nessus file not found at {args.nessus_file}")
        sys.exit(1)

    # Create output directory if it doesn't exist
    os.makedirs(args.output_dir, exist_ok=True)

    # Construct paths for output files
    data_with_exploits_path = os.path.join(args.output_dir, 'data_with_exploits.csv')
    ranked_entry_points_path = os.path.join(args.output_dir, 'ranked_entry_points.csv')
    entrypoint_most_info_path = os.path.join(args.output_dir, 'entrypoint_most_info.csv')
    port_0_entries_path = os.path.join(args.output_dir, 'port_0_entries.csv')
    exploits_output_path = os.path.join(args.output_dir, 'exploits.json')

    # Initialize an empty DataFrame
    df = pd.DataFrame(columns=[])
    column_names = ['file', 'name', 'ip', 'port', 'viable_exploit', 'archetype']
    have_names = False  # Flag to check if column names have been added

    # Parse XML file using ElementTree
    try:
        main_tree = ET.parse(args.nessus_file)
    except ET.ParseError as e:
        print(f"Error parsing Nessus file: {e}")
        sys.exit(1)

    def map_to_archetype(plugin_name, plugin_family):
        archetypes = {
            'Unauthenticated port bypass': ['Port Bypass', 'Network'],
            'Default credentials': ['Default Credentials', 'Authentication'],
            'Unpatched software exploits': ['Vulnerability', 'Exploitable'],
            'Missing encryption protocols': ['Encryption', 'SSL'],
            'Other': ['Other']
        }
        
        for archetype, keywords in archetypes.items():
            for keyword in keywords:
                if keyword.lower() in plugin_name.lower() or keyword.lower() in plugin_family.lower():
                    return archetype
        return 'Other'

    def filter_dataframe(df, allowed_ips, allowed_exploits):
        print(f"Debug - Filtering DataFrame")
        print(f"Allowed IPs: {allowed_ips}")
        print(f"Allowed Exploits: {allowed_exploits}")
        print(f"DataFrame columns: {df.columns}")
        if 'archetype' in df.columns:
            print(f"Unique archetypes in DataFrame: {df['archetype'].unique()}")
            print("Archetype value counts:")
            print(df['archetype'].value_counts())
        
        filtered_df = df.copy()
        
        if 'ip' in df.columns:
            filtered_df = filtered_df[filtered_df['ip'].isin(allowed_ips)]
            print(f"After IP filter: {len(filtered_df)} rows")
        
        if 'archetype' in df.columns:
            # Convert allowed_exploits to match the exact case of the constants
            allowed_exploits_exact = [
                'Unauthenticated port bypass' if e.lower() == 'unauthenticated port bypass'
                else 'Default credentials' if e.lower() == 'default credentials'
                else 'Missing encryption protocols' if e.lower() == 'missing encryption protocols'
                else 'Unpatched software exploits' if e.lower() == 'unpatched software exploits'
                else 'Other' if e.lower() == 'other'
                else e
                for e in allowed_exploits
            ]
            filtered_df = filtered_df[filtered_df['archetype'].isin(allowed_exploits_exact)]
            print(f"After exploit filter: {len(filtered_df)} rows")
        
        return filtered_df

    exploits = []

    # Iterate through each ReportHost element in the XML
    for host in main_tree.findall('.//ReportHost'):
        host_name = host.get('name')  # Extract host name
        host_ip_tag = host.find('.//HostProperties/tag[@name="host-ip"]')
        if host_ip_tag is None:
            continue
        host_ip = host_ip_tag.text  # Extract host IP
        # Iterate through each child element of ReportHost
        for child in host:
            if not child.tag == 'ReportItem':
                continue
            if not have_names:
                have_names = True
                # Add all attributes of the ReportItem to column_names if not already present
                for key in child.attrib:
                    if key not in column_names:
                        column_names.append(key)
                # Initialize DataFrame with updated column names
                df = pd.DataFrame(columns=column_names)
            
            # Add a new row to DataFrame for each ReportItem
            ind = len(df.index)
            df.loc[ind] = ''
            df.at[ind, 'name'] = host_name
            df.at[ind, 'file'] = os.path.basename(args.nessus_file)
            df.at[ind, 'ip'] = host_ip
            df.at[ind, 'port'] = child.attrib.get('port')

            # Check for viable exploit indicators
            severity = int(child.attrib.get('severity', '0'))
            exploit_available = child.find('.//exploit_available')
            if exploit_available is not None:
                for exploit in exploit_available:
                    exploit_info = {
                        'name': exploit.attrib.get('exploit_name', 'Unknown'),
                        'type': 'HAS_AVAILABLE_EXPLOIT',
                        'ip': host_ip,
                        'port': child.attrib.get('port'),
                        'severity': severity
                    }
                    exploits.append(exploit_info)

            exploitability_ease = child.find('.//exploitability_ease')
            cvss_base_score = float(child.attrib.get('cvss_base_score', '0.0'))
            viable_exploit = (exploit_available is not None) or (exploitability_ease is not None and exploitability_ease.text in ['Exploitable', 'Easy'])

            df.at[ind, 'viable_exploit'] = viable_exploit

            # Add attributes of ReportItem to respective columns in DataFrame
            for key in child.attrib:
                df.at[ind, key] = child.attrib.get(key)

            # Map pluginName and pluginFamily to archetypes
            plugin_name = child.attrib.get('pluginName', '')
            plugin_family = child.attrib.get('pluginFamily', '')
            archetype = map_to_archetype(plugin_name, plugin_family)
            df.at[ind, 'archetype'] = archetype

    # Filter the main DataFrame
    df = filter_dataframe(df, allowed_ips, allowed_exploits)

    # Save exploits to JSON (filter exploits list by IP only)
    filtered_exploits = [
        exploit for exploit in exploits 
        if exploit['ip'] in allowed_ips
    ]
    with open(exploits_output_path, 'w') as f:
        json.dump(filtered_exploits, f)
    print(f"Filtered exploit data saved to {exploits_output_path}")

    # Export filtered DataFrame to CSV file
    df.to_csv(data_with_exploits_path, index=False)

    # Debugging: Print DataFrame shape and head to verify final output
    print(f"DataFrame shape after filtering: {df.shape}")
    print(df.head())

    try:
        # Encode categorical variables
        plugin_family = pd.get_dummies(df['pluginFamily'])
        protocol = pd.get_dummies(df['protocol'])
        svc = pd.get_dummies(df['svc_name'])
        port = pd.get_dummies(df['port'])

        # Apply binary encoding to 'pluginID' column using category_encoders
        encoder = ce.BinaryEncoder(cols=['pluginID'])
        encoded_data = encoder.fit_transform(df)

        # Encode 'archetype' column
        archetype_encoded = pd.get_dummies(df['archetype'])

        # Drop unnecessary columns and concatenate encoded categorical variables
        encoded_data = encoded_data.drop(['pluginFamily', 'file', 'name', 'ip', 'port', 'svc_name', 'pluginName', 'protocol'], axis=1)
        encoded_data = pd.concat([encoded_data, protocol, svc, port, plugin_family, archetype_encoded], axis=1)

        # Include 'viable_exploit' in the dataset
        viable_exploit = df['viable_exploit'].astype(int)
        encoded_data = pd.concat([encoded_data, viable_exploit], axis=1)

        # Analyze entry points
        filtered_df = df[df['port'] != '0']
        filtered_df['severity'] = pd.to_numeric(filtered_df['severity'], errors='coerce')

        entry_point_info = filtered_df.groupby(['ip', 'port']).agg({
            'severity': 'mean',
            'viable_exploit': 'sum',
            'pluginID': 'nunique'
        }).reset_index()

        entry_point_info.columns = ['ip', 'port', 'severity_score', 'exploit_score', 'distinct_vulnerabilities']

        # Normalize the scores
        scaler = MinMaxScaler()
        if len(entry_point_info) > 1:  # Only normalize if we have more than one entry
            entry_point_info[['severity_score', 'exploit_score', 'distinct_vulnerabilities']] = scaler.fit_transform(
                entry_point_info[['severity_score', 'exploit_score', 'distinct_vulnerabilities']]
            )

        # Calculate the combined score
        entry_point_info['combined_score'] = (
            0.5 * entry_point_info['severity_score'] +
            0.3 * entry_point_info['exploit_score'] +
            0.2 * entry_point_info['distinct_vulnerabilities']
        )

        # Sort and save results
        ranked_entry_points = entry_point_info.sort_values(by='combined_score', ascending=False)
        ranked_entry_points = filter_dataframe(ranked_entry_points, allowed_ips, allowed_exploits)
        ranked_entry_points.to_csv(ranked_entry_points_path, index=False)
        print(f"\nFiltered ranked entry points saved to {ranked_entry_points_path}")

        # Save entry points with most information
        entry_point_info_sorted = filtered_df.groupby(['ip', 'port']).size().reset_index(name='vulnerability_count')
        entry_point_info_sorted = entry_point_info_sorted.sort_values(by='vulnerability_count', ascending=False)
        entry_point_info_sorted = filter_dataframe(entry_point_info_sorted, allowed_ips, allowed_exploits)
        entry_point_info_sorted.to_csv(entrypoint_most_info_path, index=False)
        print(f"\nFiltered top entry points saved to {entrypoint_most_info_path}")

        # Handle Port 0 entries
        port_0_entries = df[df['port'] == '0']
        port_0_entries = filter_dataframe(port_0_entries, allowed_ips, allowed_exploits)
        port_0_entries.to_csv(port_0_entries_path, index=False)
        print(f"\nFiltered Port 0 entries saved to {port_0_entries_path}")

        print("\nAnalysis completed successfully")
        return 0

    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
