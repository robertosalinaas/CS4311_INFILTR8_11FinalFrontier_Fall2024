<script>
  import { onMount } from 'svelte';
  import Navbar from '$lib/navbar.svelte';

  let isOpen = true;
  let projects = [];
  let selectedProject = '';
  let newProjectName = '';
  let allowedIP = '';
  let offLimitIP = '';
  let allowedIPs = [];
  let offLimitIPs = [];

  async function loadProjects() {
    try {
      const response = await fetch('http://localhost:3000/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      projects = await response.json();
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }

  async function loadProjectIPs() {
    if (selectedProject) {
        try {
            const response = await fetch(`http://localhost:3000/projects/${selectedProject}/ips`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const ips = await response.json();
            allowedIPs = ips.filter(ip => ip.type === 'HAS_ALLOWED_IP').map(ip => ip.address);
            offLimitIPs = ips.filter(ip => ip.type === 'HAS_OFF_LIMIT_IP').map(ip => ip.address);
        } catch (error) {
            console.error('Error loading project IPs:', error);
        }
    }
  }

  onMount(() => {
    loadProjects();
  });

  $: if (selectedProject) {
    loadProjectIPs();
  }

  async function createProject() {
    if (newProjectName && !projects.includes(newProjectName)) {
      try {
        const response = await fetch('http://localhost:3000/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: newProjectName })
        });
        if (!response.ok) {
          throw new Error('Failed to create project');
        }
        await loadProjects();
        selectedProject = newProjectName;
        newProjectName = '';
        alert('Project created successfully!');
      } catch (error) {
        console.error('Error creating project:', error);
        alert('Error creating project: ' + error.message);
      }
    }
  }

  async function addAllowedIP() {
    if (allowedIP && selectedProject) {
      try {
        const response = await fetch(`http://localhost:3000/projects/${selectedProject}/allowed-ip`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ip: allowedIP })
        });
        if (!response.ok) {
          throw new Error('Failed to add allowed IP');
        }
        allowedIPs = [...allowedIPs, allowedIP];
        allowedIP = '';
        alert('Allowed IP added successfully!');
      } catch (error) {
        console.error('Error adding allowed IP:', error);
        alert('Error adding allowed IP: ' + error.message);
      }
    }
  }

  async function addOffLimitIP() {
    if (offLimitIP && selectedProject) {
      try {
        const response = await fetch(`http://localhost:3000/projects/${selectedProject}/off-limit-ip`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ip: offLimitIP })
        });
        if (!response.ok) {
          throw new Error('Failed to add off-limit IP');
        }
        offLimitIPs = [...offLimitIPs, offLimitIP];
        offLimitIP = '';
        alert('Off-limit IP added successfully!');
      } catch (error) {
        console.error('Error adding off-limit IP:', error);
        alert('Error adding off-limit IP: ' + error.message);
      }
    }
  }
</script>

<Navbar bind:isOpen />

<main class="{isOpen ? 'main-expanded' : 'main-collapsed'} bg-gray-100 dark:bg-gray-900 min-h-screen transition-all duration-300">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 p-4 lg:p-8">
    <!-- Left section -->
    <div>
      <h1 class="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Allowed & Off-limits IP List</h1>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-md shadow-md mb-8">
        <h2 class="text-xl font-bold mb-4 text-gray-700 dark:text-gray-100">Select or Create Project</h2>
        <div class="flex flex-col md:flex-row gap-4">
          <select 
            bind:value={selectedProject} 
            class="p-2 border rounded-md flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
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
              class="p-2 border rounded-md flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
            <button 
              on:click={createProject} 
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Right section -->
    <div class="mt-6 lg:mt-0">
      {#if selectedProject}
        <div class="bg-white dark:bg-gray-800 p-6 rounded-md shadow-md mb-8">
          <h2 class="text-xl font-bold mb-4 text-gray-700 dark:text-gray-100">Manage IPs for {selectedProject}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Allowed IPs -->
            <div>
              <h3 class="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-100">Allowed IPs</h3>
              <div class="flex gap-2 mb-4">
                <input 
                  type="text" 
                  bind:value={allowedIP} 
                  placeholder="Enter allowed IP" 
                  class="p-2 border rounded-md flex-grow focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
                <button 
                  on:click={addAllowedIP} 
                  class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors dark:bg-red-600 dark:hover:bg-red-700"
                >
                  Add
                </button>
              </div>
              <ul class="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                {#each allowedIPs as ip}
                  <li>{ip}</li>
                {/each}
              </ul>
              {#if allowedIPs.length === 0}
                <p class="text-sm text-gray-500 dark:text-gray-400">No allowed IPs added yet.</p>
              {/if}
            </div>

            <!-- Off-limit IPs -->
            <div>
              <h3 class="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-100">Off-limit IPs</h3>
              <div class="flex gap-2 mb-4">
                <input 
                  type="text" 
                  bind:value={offLimitIP} 
                  placeholder="Enter off-limit IP" 
                  class="p-2 border rounded-md flex-grow focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
                <button 
                  on:click={addOffLimitIP} 
                  class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors dark:bg-red-600 dark:hover:bg-red-700"
                >
                  Add
                </button>
              </div>
              <ul class="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                {#each offLimitIPs as ip}
                  <li>{ip}</li>
                {/each}
              </ul>
              {#if offLimitIPs.length === 0}
                <p class="text-sm text-gray-500 dark:text-gray-400">No off-limit IPs added yet.</p>
              {/if}
            </div>
          </div>
        </div>
      {:else}
        <p class="text-lg text-gray-600 dark:text-gray-400">Please select or create a project to manage IPs.</p>
      {/if}
    </div>
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
