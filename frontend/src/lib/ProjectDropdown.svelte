<script lang="ts">
  let projects = ["Project 1", "Project 2", "Project 3"];
  let selectedProject = "Project 1";
</script>

<div class="dropdown">
  <select bind:value={selectedProject}>
    {#each projects as project}
      <option value={project}>{project}</option>
    {/each}
  </select>
</div>

<style>
  .dropdown select {
    padding: 10px;
    border-radius: 5px;
    width: 100%;
    margin-bottom: 20px;
    background-color: #34495e; 
    color: white;
    border: none;
    transition: background-color 0.3s ease;
  }

  .dropdown select:hover {
    background-color: #1abc9c; 
  }
</style>
