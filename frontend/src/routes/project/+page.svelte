<script lang="ts">
  import { goto } from '$app/navigation';

  export let isOpen = true;
  
  import Navbar from '$lib/navbar.svelte';
  import { onMount } from 'svelte';
  import { dndzone } from 'svelte-dnd-action';
  import { flip } from 'svelte/animate';
  import { cubicOut } from 'svelte/easing';

  // Define types for IP and Exploit items
  type IPItem = { id: number; ip: string; checked: boolean; type: 'allowed' | 'off-limit' };
  type ExploitItem = { id: number; name: string; checked: boolean; type: 'allowed' | 'unallowed' };

  let selectedProject = '';
  let projects = [];
  let ipList: IPItem[] = [];
  let exploits: ExploitItem[] = [];
  let isIpAllowed = true;
  let allowedExploits: ExploitItem[] = [];
  let unallowedExploits: ExploitItem[] = [];
  let newIp = ''
  let newExploit = '';
  let isExploitAllowed = true; // Checkbox state for allowed or unallowed exploit


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

  // Function to load IPs for the selected project
  async function loadProjectIPs() {
    if (selectedProject) {
      try {
        const response = await fetch(`http://localhost:3000/projects/${selectedProject}/ips`);
        if (!response.ok) {
          throw new Error('Failed to fetch IPs');
        }
        const ips = await response.json();
        ipList = ips.map((ip: any) => ({
          id: ip.id,
          ip: ip.address,
          checked: false,
          type: ip.type === 'HAS_ALLOWED_IP' ? 'allowed' : 'off-limit',
        }));

      } catch (error) {
        console.error('Error loading project IPs:', error);
      }
    }
  }

  // Function to add a new IP to the selected project
  async function addIP() {
    if (newIp && selectedProject) {
      try {
        const type = isIpAllowed ? 'HAS_ALLOWED_IP' : 'HAS_OFF_LIMIT_IP';
        const response = await fetch(`http://localhost:3000/projects/${selectedProject}/${isIpAllowed ? 'allowed-ip' : 'off-limit-ip'}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip: newIp, type })
        });
        if (!response.ok) throw new Error('Failed to add IP');
        ipList = [...ipList, { id: Date.now(), ip: newIp, checked: false, type: isIpAllowed ? 'allowed' : 'off-limit' }];
        newIp = '';
      } catch (error) {
        console.error('Error adding IP:', error);
      }
    }
  }
  

   // Load exploits (allowed and unallowed)
   async function loadExploits() {
    try {
      const response = await fetch(`http://localhost:3000/projects/${selectedProject}/exploits`);
      if (!response.ok) throw new Error('Failed to fetch exploits');
      const data = await response.json();
      exploits = data.map((exploit: any) => ({
        id: exploit.id,
        name: exploit.name,
        checked: false,
        type: exploit.type === 'HAS_ALLOWED_EXPLOIT' ? 'allowed' : 'unallowed'
      }));

    } catch (error) {
      console.error('Error loading exploits:', error);
    }
  }

  async function addExploit() {
    if (newExploit && selectedProject) {
      try {
        const type = isExploitAllowed ? 'HAS_ALLOWED_EXPLOIT' : 'HAS_OFF_LIMIT_EXPLOIT';
        const response = await fetch(`http://localhost:3000/projects/${selectedProject}/${isExploitAllowed ? 'allowed-exploit' : 'off-limit-exploit'}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newExploit, type })
        });
        if (!response.ok) throw new Error('Failed to add exploit');
        exploits = [...exploits, { id: Date.now(), name: newExploit, checked: false, type: isExploitAllowed ? 'allowed' : 'unallowed' }];
        newExploit = '';
      } catch (error) {
        console.error('Error adding exploit:', error);
      }
    }
  }

    // Select a project and load its IPs and exploits
  function selectProject(project: string) {
    console.log(projects)
    selectedProject = project;
    console.log(selectedProject)
    loadProjectIPs();
    loadExploits();
  }

  // Function to delete an IP from ipList
async function deleteIpItem(ipId: number, index: number) {
  try {
    const response = await fetch(`http://localhost:3000/projects/${selectedProject}/ips/${ipId}`, {
      method: 'DELETE',
    });
    console.log(response)
    if (!response.ok) throw new Error('Failed to delete IP');

    ipList.splice(index, 1); // Remove the item from the list in UI
    ipList = [...ipList]; // Trigger reactivity
  } catch (error) {
    console.error('Error deleting IP:', error);
  }
}

// Function to delete an exploit from exploits
async function deleteExploitItem(exploitId, index) {
  console.log(exploitId)
  try {
    const response = await fetch(`http://localhost:3000/projects/${selectedProject}/exploits/${exploitId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete exploit');

    // Remove the exploit from exploits on success
    exploits.splice(index, 1); 
    exploits = [...exploits]; // Trigger reactivity
  } catch (error) {
    console.error('Error deleting exploit:', error);
  }
}



  // Initialize data on mount
  onMount(() => {
    loadProjects();
    loadExploits();
  });
 
  console.log(projects)
  let addingIp = false;
  let addingExploit = false;


  function startAddingIp() {
    addingIp = true;
  }

  function startAddingExploit() {
    addingExploit = true;
  }

  function handleIpListReorder(event: CustomEvent<{ items: IPItem[] }>): void {
    const { items } = event.detail;
    ipList = items;
  }

  function handleExploitsReorder(event: CustomEvent<{ items: ExploitItem[] }>): void {
    const { items } = event.detail;
    exploits = items;
  }

  function moveUpInIpList(index: number): void {
    if (index === 0) return;
    [ipList[index], ipList[index - 1]] = [ipList[index - 1], ipList[index]]; 
    ipList = [...ipList]; 
  }

  function moveDownInIpList(index: number): void {
    if (index === ipList.length - 1) return; 
    [ipList[index], ipList[index + 1]] = [ipList[index + 1], ipList[index]];
    ipList = [...ipList]; 
  }

  function moveUpInExploits(index: number): void {
    if (index === 0) return; 
    [exploits[index], exploits[index - 1]] = [exploits[index - 1], exploits[index]];
    exploits = [...exploits]; 
  }

  function moveDownInExploits(index: number): void {
    if (index === exploits.length - 1) return;
    [exploits[index], exploits[index + 1]] = [exploits[index + 1], exploits[index]];
    exploits = [...exploits]; 
  }

  onMount(() => {
    loadProjects();  // Fetch projects when the component mounts
  });

  $: if (selectedProject) loadProjectIPs();

  let folderIconSrc = "https://cdn.builder.io/api/v1/image/assets/TEMP/bd5f3ae2fb45d029aa12a06c1bac426e682908ad489f1f444bcb1ee1a84a5cf3?placeholderIfAbsent=true&apiKey=2e556ccd119247e0ab85e312accfd79c";
  let arrorIconSrc = "https://cdn.builder.io/api/v1/image/assets/TEMP/44108f81ceaa218666ee8493a94a51cb92183cc4e709837f56b6b45348e16b4b?placeholderIfAbsent=true&apiKey=2e556ccd119247e0ab85e312accfd79c";
</script>

<style>
  main {
    transition: margin-left 0.3s ease;
  }

  .main-collapsed {
    margin-left: 0;
  }

  .main-expanded {
    margin-left: 250px; 
  }
</style>

<Navbar bind:isOpen />

<main class="{isOpen ? 'main-expanded' : 'main-collapsed'} flex flex-col md:flex-row p-6 bg-slate-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
  <!-- Left Section (Project Folders and Exploits) -->
  <div class="flex flex-col w-full md:w-3/4 p-4 space-y-8">
    
    <!-- Current Project Folder -->
    <section>
      <h2 class="text-3xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Current Project Folder</h2>
      <button class="flex gap-10 justify-between items-center p-2 mt-4 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-3xl shadow-lg max-w-[311px]">
        <div class="flex items-center space-x-4">
          <img loading="lazy" src={folderIconSrc} alt="" class="object-contain shrink-0 self-stretch my-auto aspect-[0.92] w-[49px]" />
          <div>
            <p class="text-left">{selectedProject}</p>
          </div>
        </div>
      </button>
    </section>
  
    <!-- Scope IP List -->
    <section>
      <div class="flex justify-between items-center w-3/4">
        <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Scope IP List</h2>
        <button on:click={startAddingIp} class="text-black dark:text-white px-3 py-1 rounded-md hover:bg-teal-700 dark:hover:bg-teal-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg> 
        </button>
      </div>
      <!-- Add new IP address input field -->
      {#if addingIp}
        <div class="flex space-x-2 mb-4">
          <input
            type="text"
            bind:value={newIp}
            placeholder="Enter new IP address"
            class="border rounded px-2 py-1 w-48 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            on:keydown={(e) => e.key === 'Enter' && addIP()}
          />
          <label class="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
            <input type="checkbox" bind:checked={isIpAllowed} class="form-checkbox h-5 w-5" />
            <span>Allowed</span>
          </label>
          <button on:click={addIP} class="bg-teal-600 text-white px-3 py-2 rounded-md hover:bg-teal-700">Add</button>
        </div>
      {/if}

      <ul use:dndzone={{ items: ipList, flipDurationMs: 300 }}
          on:consider={handleIpListReorder}
          on:finalize={handleIpListReorder}>
        {#each ipList as item, index(item.id)}
          <li animate:flip={{ duration: 400, easing: cubicOut }} class="flex justify-between items-center py-3 border-t border-hidden w-3/4 hover:bg-slate-300 dark:hover:bg-gray-700 rounded-lg px-3">
            <div class="flex items-center space-x-3">
              <!-- Indicator styled based on 'allowed' or 'off-limit' type -->
              <div class="w-5 h-5 rounded-full {item.type === 'allowed' ? 'bg-green-500' : 'bg-red-500'}"></div>
              <span class="text-gray-900 dark:text-gray-100">{item.ip}</span>
            </div>
            <div class="flex space-x-2">
              <!-- Icons and Controls -->
              <!-- Up arrow -->
              <button on:click={() => moveUpInIpList(index)} class="text-gray-900 dark:text-gray-100 hover:text-gray-500 dark:hover:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                </svg>
              </button>
              <!-- Down arrow -->
              <button on:click={() => moveDownInIpList(index)} class="text-gray-900 dark:text-gray-100 hover:text-gray-500 dark:hover:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <!-- Delete button -->
              <button on:click={() => deleteIpItem(item.id, index)} class="text-gray-900 dark:text-gray-100 hover:text-gray-500 dark:hover:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

            </div>
          </li>
        {/each}
      </ul>

    </section>
    
    <!-- Exploits Allowed -->
    <section>
      <div class="flex justify-between items-center w-3/4">
        <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Exploits Allowed</h2>
        <button on:click={startAddingExploit} class="text-black dark:text-white px-3 py-1 rounded-md hover:bg-teal-700 dark:hover:bg-teal-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>
      <!-- Add new exploit input field -->
      {#if addingExploit}
      <div class="flex space-x-2 mb-4">
        <input
          type="text"
          bind:value={newExploit}
          placeholder="Enter new exploit"
          class="border rounded px-2 py-1 w-48 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          on:keydown={(e) => e.key === 'Enter' && addExploit()}
        />
        <label class="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
          <input type="checkbox" bind:checked={isExploitAllowed} class="form-checkbox h-5 w-5" />
          <span>Allowed</span>
        </label>
        <button on:click={addExploit} class="bg-teal-600 text-white px-3 py-2 rounded-md hover:bg-teal-700">Add</button>
      </div>
    {/if}


    <ul use:dndzone={{ items: exploits, flipDurationMs: 300 }}
        on:consider={handleExploitsReorder}
        on:finalize={handleExploitsReorder}>
      {#each exploits as exploit, index(exploit.id)}
        <li animate:flip={{ duration: 400, easing: cubicOut }} class="flex justify-between items-center py-3 border-t border-hidden w-3/4 hover:bg-slate-300 dark:hover:bg-gray-700 rounded-lg px-3">
          <div class="flex items-center space-x-3">
            <!-- Indicator styled based on 'allowed' or 'unallowed' type -->
            <div class="w-5 h-5 rounded-full {exploit.type === 'allowed' ? 'bg-green-500' : 'bg-red-500'}"></div>
            <span class="text-gray-900 dark:text-gray-100">{exploit.name}</span>
          </div>
          <div class="flex space-x-2">
            <!-- Icons and Controls -->
            <!-- Up arrow -->
            <button on:click={() => moveUpInExploits(index)} class="text-gray-900 dark:text-gray-100 hover:text-gray-500 dark:hover:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
              </svg>
            </button>
            <!-- Down arrow -->
            <button on:click={() => moveDownInExploits(index)} class="text-gray-900 dark:text-gray-100 hover:text-gray-500 dark:hover:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            <!-- Delete button -->
            <button on:click={() => deleteExploitItem(exploit.id, index)} class="text-gray-900 dark:text-gray-100 hover:text-gray-500 dark:hover:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
          </div>
        </li>
      {/each}
    </ul>

    </section>

    <!-- Start Testing Button -->
    <div class="bottom-0 inset-x-0 flex justify-center mt-10 p-6 w-full">
      <button on:click={() => goto('./Testing')} class="bg-teal-600 dark:bg-teal-500 text-white px-6 py-3 rounded-md hover:bg-teal-700 dark:hover:bg-teal-600">Start Testing</button>
    </div>
  </div>

  <!-- Right Sidebar (Load Project) -->
  <aside class="w-full md:w-1/4 p-4 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
    <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Load Project</h2>
    <ul>
      {#each projects as project}
      <button 
        class="flex gap-10 justify-between items-center p-2 mt-4 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-3xl hover:bg-slate-300 dark:hover:bg-gray-700 shadow-lg max-w-[311px]" 
        on:click={() => selectProject(project)}
      >
        <div class="flex items-center space-x-3">
          <img loading="lazy" src={folderIconSrc} alt="" class="object-contain shrink-0 self-stretch my-auto aspect-[0.92] w-[49px]" />
          <div>
            <p class="text-left text-gray-900 dark:text-gray-100">{project}</p>
           <!-- <span class="text-sm text-gray-500 dark:text-gray-400">{folder.items} items | {folder.size}</span> -->
          </div>
        </div>
        <img loading="lazy" src={arrorIconSrc} alt="" class="object-contain shrink-0 self-stretch my-auto w-6 aspect-square" />
      </button>
      {/each}
    </ul>
  </aside>
</main>