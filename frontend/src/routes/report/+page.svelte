<script>
  export let isOpen = true;
  import Navbar from '$lib/navbar.svelte';

  let exportFormats = ['PDF', 'CSV', 'Excel'];
  let selectedFormat = 'PDF';

  // Sample data for the summary table
  let summaryData = [
    { column1: 'Data 1', column2: 'Data 2', column3: 'Data 3' },
    { column1: 'Data 4', column2: 'Data 5', column3: 'Data 6' },
  ];

  function handleExport() {
    console.log(`Exporting data as ${selectedFormat}`);
    // Add logic for exporting data here
  }
</script>

<style>
  main {
    transition: margin-left 0.3s ease;
  }

  .main-collapsed {
    margin-left: 0;
  }

  .main-expanded {
    margin-left: 250px; /* Adjust this width based on your navbar width */
  }
  body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    background-color: #2c3e50; /* Match navbar background */
    color: white;
    height: 100vh;
  }

  .wrapper {
    display: flex;
    flex-direction: column; /* Stack items vertically */
    justify-content: center;
    align-items: center;
    height: 100vh; /* Ensure full height of the viewport */
  }

  h1 {
    font-size: 3rem;
    margin-bottom: 2rem;
    text-align: center;
  }

  .report-container {
    background: rgba(38, 92, 145, 0.8); /* Similar to navbar buttons */
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    width: 50%;
    max-width: 800px;
    text-align: center;
  }

  .report-container h2 {
    color: white;
    margin-bottom: 1.5rem;
    font-size: 2rem;
  }

  .summary-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1.5rem;
  }

  .summary-table th,
  .summary-table td {
    border: 1px solid #34495e; /* Match navbar button background */
    padding: 0.75rem;
    color: white;
    background: #34495e; /* Match navbar button background */
  }

  .export-controls {
    margin-bottom: 1.5rem;
  }

  .export-controls select {
    width: 100%;
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    background: #34495e; /* Match navbar button background */
    color: white;
  }

  .export-button {
    width: 100%;
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    background: #1abc9c; /* Match navbar button hover */
    color: white;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .export-button:hover {
    background: #16a085; /* Slightly darker for hover effect */
  }
</style>

<div class="{isOpen ? 'main-expanded' : 'main-collapsed'} wrapper">
  <h1>Reports</h1> <!-- Main title outside the report container -->
  
  <div class="report-container">
    <h2>Summary Table</h2>
    <table class="summary-table">
      <thead>
        <tr>
          <th>Column 1</th>
          <th>Column 2</th>
          <th>Column 3</th>
        </tr>
      </thead>
      <tbody>
        {#each summaryData as row}
          <tr>
            <td>{row.column1}</td>
            <td>{row.column2}</td>
            <td>{row.column3}</td>
          </tr>
        {/each}
      </tbody>
    </table>

    <div class="export-controls">
      <select bind:value={selectedFormat}>
        {#each exportFormats as format}
          <option value={format}>{format}</option>
        {/each}
      </select>
    </div>

    <button class="export-button" on:click={handleExport}>Export</button>
  </div>
</div>
