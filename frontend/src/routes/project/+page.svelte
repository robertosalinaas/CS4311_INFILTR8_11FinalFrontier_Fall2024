<script lang="ts">
  import { goto } from '$app/navigation';

  export let isOpen = true;
  
  import Navbar from '$lib/navbar.svelte';
  import { dndzone } from 'svelte-dnd-action';
  import { flip } from 'svelte/animate';
  import { cubicOut } from 'svelte/easing';

  // Define types for IP and Exploit items
  type IPItem = { id: number; ip: string; checked: boolean };
  type ExploitItem = { id: number; name: string; checked: boolean };
  type ProjectFolder = { name: string; items: number; size: string };

  // Data for the current project and project folders to load
  let currentProject: ProjectFolder = { name: "Example", items: 109, size: "1.6 GB" };

  let loadProjects: ProjectFolder[] = [
    { name: "Project A", items: 49, size: "1.42 MB" },
    { name: "Project B", items: 286, size: "2.6 GB" },
    { name: "Project C", items: 52, size: "64 MB" },
  ];

  let ipList: IPItem[] = [
    { id: 1, ip: "192.168.2.8", checked: false },
    { id: 2, ip: "192.168.21.5", checked: false },
    { id: 3, ip: "192.198.8.43", checked: false },
    { id: 4, ip: "192.168.5.5", checked: false },
  ];

  let exploits: ExploitItem[] = [
    { id: 101, name: "SQL Injection", checked: false },
    { id: 102, name: "DDoS Attack", checked: false },
    { id: 103, name: "Default Credentials", checked: false },
    { id: 104, name: "Missing Encryption", checked: false },
    { id: 105, name: "Unauthenticated Port Bypass", checked: false },
    { id: 106, name: "Weak Passwords", checked: false },
  ];

  let ipIdCounter = ipList.length + 1;
  let exploitIdCounter = exploits.length + 1;
  let newIp = ''; 
  let newExploit = ''; 
  let addingIp = false;
  let addingExploit = false;

  function selectProject(index: number) {
    const selectedProject = loadProjects[index];
    loadProjects[index] = currentProject;
    currentProject = selectedProject;
  }

  function submitNewIp() {
    if (newIp.trim() !== '') {
      ipList = [...ipList, { id: ipIdCounter++, ip: newIp, checked: true }];
      newIp = '';        
      addingIp = false; 
    } else {
      alert('Please enter a valid IP address');
    }
  }

  function submitNewExploit() {
    if (newExploit.trim() !== '') {
      exploits = [...exploits, { id: exploitIdCounter++, name: newExploit, checked: false }];
      newExploit = ''; 
      addingExploit = false; 
    } else {
      alert('Please enter a valid exploit name');
    }
  }

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

  function deleteIpItem(index: number): void {
    ipList.splice(index, 1); 
    ipList = [...ipList]; 
  }

  function deleteExploitItem(index: number): void {
    exploits.splice(index, 1); 
    exploits = [...exploits];
  }

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
            <p class="text-left">{currentProject.name}</p>
            <span class="text-sm text-gray-500 dark:text-gray-400">{currentProject.items} items, {currentProject.size}</span>
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

      {#if addingIp}
        <div class="flex space-x-2 mb-4">
          <input
            type="text"
            bind:value={newIp}
            placeholder="Enter new IP address"
            class="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-48 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            on:keydown={(e) => e.key === 'Enter' && submitNewIp()}
          />
          <button on:click={submitNewIp} class="bg-teal-600 dark:bg-teal-500 text-white px-3 py-2 rounded-md hover:bg-teal-700 dark:hover:bg-teal-600">Add</button>
        </div>
      {/if}

      <ul use:dndzone={{ items: ipList, flipDurationMs: 300 }}
          on:consider={handleIpListReorder}
          on:finalize={handleIpListReorder}>
        {#each ipList as item, index(item.id)}
          <li class="flex justify-between items-center py-3 border-t border-hidden w-3/4 hover:bg-slate-300 dark:hover:bg-gray-700 rounded-lg px-3">
            <div class="flex items-center space-x-3">
              <input type="checkbox" bind:checked={item.checked} class="w-5 h-5">
              <span class="text-gray-900 dark:text-gray-100">{item.ip}</span>
            </div>
            <div class="flex space-x-2">
              <button on:click={() => moveUpInIpList(index)} class="text-gray-900 dark:text-gray-100 hover:text-gray-500 dark:hover:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                </svg>
              </button>
              <!-- Down and delete buttons follow similar dark mode style -->
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

      {#if addingExploit}
        <div class="flex space-x-2 mb-4">
          <input
            type="text"
            bind:value={newExploit}
            placeholder="Enter new exploit"
            class="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-48 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            on:keydown={(e) => e.key === 'Enter' && submitNewExploit()}
          />
          <button on:click={submitNewExploit} class="bg-teal-600 dark:bg-teal-500 text-white px-3 py-2 rounded-md hover:bg-teal-700 dark:hover:bg-teal-600">Add</button>
        </div>
      {/if}

      <ul use:dndzone={{ items: exploits, flipDurationMs: 300 }}
          on:consider={handleExploitsReorder}
          on:finalize={handleExploitsReorder}>
        {#each exploits as exploit, index(exploit.id)}
          <li class="flex justify-between items-center py-3 border-t border-hidden w-3/4 hover:bg-slate-300 dark:hover:bg-gray-700 rounded-lg px-3">
            <div class="flex items-center space-x-3">
              <input type="checkbox" bind:checked={exploit.checked} class="w-5 h-5">
              <span class="text-gray-900 dark:text-gray-100">{exploit.name}</span>
            </div>
            <div class="flex space-x-2">
              <!-- Control buttons for moving up, down, delete -->
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
      {#each loadProjects as folder, index}
      <button 
        class="flex gap-10 justify-between items-center p-2 mt-4 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-3xl hover:bg-slate-300 dark:hover:bg-gray-700 shadow-lg max-w-[311px]" 
        on:click={() => selectProject(index)}
      >
        <div class="flex items-center space-x-3">
          <img loading="lazy" src={folderIconSrc} alt="" class="object-contain shrink-0 self-stretch my-auto aspect-[0.92] w-[49px]" />
          <div>
            <p class="text-left text-gray-900 dark:text-gray-100">{folder.name}</p>
            <span class="text-sm text-gray-500 dark:text-gray-400">{folder.items} items | {folder.size}</span>
          </div>
        </div>
        <img loading="lazy" src={arrorIconSrc} alt="" class="object-contain shrink-0 self-stretch my-auto w-6 aspect-square" />
      </button>
      {/each}
    </ul>
  </aside>
</main>
