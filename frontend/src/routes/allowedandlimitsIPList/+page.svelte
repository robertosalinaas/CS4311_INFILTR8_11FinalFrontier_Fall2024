<script>
  import { onMount } from 'svelte';
  import Navbar from '$lib/navbar.svelte';

  let isOpen = true; // For controlling the Navbar state
  let projects = [];
  let selectedProject = '';
  let newProjectName = '';
  let allowedIP = '';
  let offLimitIP = '';

  // eevDummy function to simulate loading projects from a database
  function loadProjects() {
    return ['Project A', 'Project B', 'Project C'];
  }

  onMount(() => {
    projects = loadProjects();
  });

  function createProject() {
    if (newProjectName && !projects.includes(newProjectName)) {
      projects = [...projects, newProjectName];
      selectedProject = newProjectName;
      newProjectName = '';
    }
  }

  function addAllowedIP() {
    if (allowedIP && selectedProject) {
      // Here you would typically update this in your database
      console.log(`Added ${allowedIP} to allowed IPs for ${selectedProject}`);
      allowedIP = '';
    }
  }

  function addOffLimitIP() {
    if (offLimitIP && selectedProject) {
      // Here you would typically update this in your database
      console.log(`Added ${offLimitIP} to off-limit IPs for ${selectedProject}`);
      offLimitIP = '';
    }
  }
</script>

<Navbar bind:isOpen />

<main class="{isOpen ? 'main-expanded' : 'main-collapsed'}">
  <div class="p-4 lg:p-8">
    <h1 class="text-3xl font-bold mb-6">Allowed & Off-limits IP List</h1>

    <div class="bg-white p-6 rounded-md shadow-md mb-8">
      <h2 class="text-xl font-bold mb-4">Select or Create Project</h2>
      <div class="flex flex-col md:flex-row gap-4">
        <select 
          bind:value={selectedProject} 
          class="p-2 border rounded-md flex-grow"
        >
          <option value="">Select a project</option>
          {#each projects as project}
            <option value={project}>{project}</option>
          {/each}
        </select>
        <div class="flex gap-2">
          <input 
            type="text" 
            bind:value={newProjectName} 
            placeholder="New project name" 
            class="p-2 border rounded-md flex-grow"
          />
          <button 
            on:click={createProject} 
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>

    {#if selectedProject}
      <div class="bg-white p-6 rounded-md shadow-md mb-8">
        <h2 class="text-xl font-bold mb-4">Manage IPs for {selectedProject}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Allowed IPs -->
          <div>
            <h3 class="text-lg font-semibold mb-2">Allowed IPs</h3>
            <div class="flex gap-2 mb-4">
              <input 
                type="text" 
                bind:value={allowedIP} 
                placeholder="Enter allowed IP" 
                class="p-2 border rounded-md flex-grow"
              />
              <button 
                on:click={addAllowedIP} 
                class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Add
              </button>
            </div>
            <!-- Here you would typically display a list of allowed IPs -->
            <p class="text-sm text-gray-500">Allowed IPs will be displayed here</p>
          </div>

          <!-- Off-limit IPs -->
          <div>
            <h3 class="text-lg font-semibold mb-2">Off-limit IPs</h3>
            <div class="flex gap-2 mb-4">
              <input 
                type="text" 
                bind:value={offLimitIP} 
                placeholder="Enter off-limit IP" 
                class="p-2 border rounded-md flex-grow"
              />
              <button 
                on:click={addOffLimitIP} 
                class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Add
              </button>
            </div>
            <!-- Here you would typically display a list of off-limit IPs -->
            <p class="text-sm text-gray-500">Off-limit IPs will be displayed here</p>
          </div>
        </div>
      </div>
    {:else}
      <p class="text-lg text-gray-600">Please select or create a project to manage IPs.</p>
    {/if}
  </div>
</main>

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

  @media (max-width: 1024px) {
    .main-expanded {
      margin-left: 0;
    }
  }
</style>