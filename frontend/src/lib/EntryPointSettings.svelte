<script>
  let entryPoints = [
    { name: 'Weak Passwords', selected: false },
    { name: 'Default Credentials', selected: false },
    { name: 'Open Ports', selected: false }
  ];

  function saveSettings() {
    const selectedEntryPoints = entryPoints
      .filter(entry => entry.selected)
      .map(entry => entry.name);

    localStorage.setItem('selectedEntryPoints', JSON.stringify(selectedEntryPoints));
    console.log('Selected Entry Points:', selectedEntryPoints);
  }
</script>

<main>
  <h1>Select Entry Points</h1>
  <form on:submit|preventDefault={saveSettings}>
    {#each entryPoints as entry}
      <label>
        <input type="checkbox" bind:checked={entry.selected} />
        {entry.name}
      </label>
      <br />
    {/each}
    <button type="submit">Save Settings</button>
  </form>
</main>
