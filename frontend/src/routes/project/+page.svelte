<script lang="ts">
    export let isOpen = true;
    
    import Navbar from '$lib/navbar.svelte';
    import { dndzone } from 'svelte-dnd-action';
    import { flip } from 'svelte/animate';
    import { cubicOut } from 'svelte/easing';

  
    const flipDurationMS = 300;
  
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

     // Generate a new unique ID (simple incrementing integer)
    let ipIdCounter = ipList.length +1; // For IP list
    let exploitIdCounter = exploits.length + 1; // For Exploit list
    let newIp = ''; // Store new IP input
    let newExploit = ''; // Store new Exploit input
    let addingIp = false; // Control visibility of the IP input form
    let addingExploit = false; // Control visibility of the Exploit input form


    function selectProject(index: number) {
      // Save the currently selected project from the load project list
      const selectedProject = loadProjects[index];
      
      // Replace the selected project with the current project
      loadProjects[index] = currentProject;

      // Update the current project to the selected one
      currentProject = selectedProject;

      console.log("i am here")
    }
    // Function to add the new IP
    function submitNewIp() {
      if (newIp.trim() !== '') {
        ipList = [...ipList, { id: ipIdCounter++, ip: newIp, checked: true }];
        newIp = '';        // Reset input field
        addingIp = false;  // Hide input field
      } else {
        alert('Please enter a valid IP address');
      }
    }

    // Function to add the new Exploit
    function submitNewExploit() {
      if (newExploit.trim() !== '') {
        exploits = [...exploits, { id: exploitIdCounter++, name: newExploit, checked: false }];
        newExploit = ''; // Reset input field
        addingExploit = false; // Hide input field
      } else {
        alert('Please enter a valid exploit name');
      }
    }

    // Show input field for adding a new IP
    function startAddingIp() {
      addingIp = true;
    }

    // Show input field for adding a new Exploit
    function startAddingExploit() {
      addingExploit = true;
    }
  
    // Handle reorder for IP List
    function handleIpListReorder(event: CustomEvent<{ items: IPItem[] }>): void {
      const { items } = event.detail;
      ipList = items;
    }
  
    // Handle reorder for Exploits List
    function handleExploitsReorder(event: CustomEvent<{ items: ExploitItem[] }>): void {
      const { items } = event.detail;
      exploits = items;
    }
  
    // Function to move an item up in the IP list
    function moveUpInIpList(index: number): void {
      if (index === 0) return; // Can't move the first item up
      [ipList[index], ipList[index - 1]] = [ipList[index - 1], ipList[index]]; // Swap the item with the one above
      ipList = [...ipList]; // Trigger reactivity by reassigning the list
    }
  
    // Function to move an item down in the IP list
    function moveDownInIpList(index: number): void {
      if (index === ipList.length - 1) return; // Can't move the last item down
      [ipList[index], ipList[index + 1]] = [ipList[index + 1], ipList[index]]; // Swap the item with the one below
      ipList = [...ipList]; // Trigger reactivity by reassigning the list
    }
  
    // Function to move an item up in the Exploits list
    function moveUpInExploits(index: number): void {
      if (index === 0) return; // Can't move the first item up
      [exploits[index], exploits[index - 1]] = [exploits[index - 1], exploits[index]]; // Swap the item with the one above
      exploits = [...exploits]; // Trigger reactivity by reassigning the list
    }
  
    // Function to move an item down in the Exploits list
    function moveDownInExploits(index: number): void {
      if (index === exploits.length - 1) return; // Can't move the last item down
      [exploits[index], exploits[index + 1]] = [exploits[index + 1], exploits[index]]; // Swap the item with the one below
      exploits = [...exploits]; // Trigger reactivity by reassigning the list
    }

  // Function to delete an item from the IP list
  function deleteIpItem(index: number): void {
    ipList.splice(index, 1); // Remove the item at the given index
    ipList = [...ipList]; // Reassign the list to trigger reactivity
  }

  // Function to delete an item from the Exploits list
  function deleteExploitItem(index: number): void {
    exploits.splice(index, 1); // Remove the item at the given index
    exploits = [...exploits]; // Reassign the list to trigger reactivity
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
    margin-left: 250px; /* Adjust this width based on your navbar width */
  }
</style>
  
  <Navbar bind:isOpen />
  
  <main class="{isOpen ? 'main-expanded' : 'main-collapsed'} relative flex flex-col md:flex-row p-6 bg-slate-50 min-h-screen">
    <!-- Left Section (Project Folders and Exploits) -->
    <div class="flex flex-col w-full md:w-3/4 p-4 space-y-8">
      
      <!-- Current Project Folder -->
      <section>
        <h2 class="text-3xl font-semibold mb-4">Current Project Folder</h2>
        <button class="flex gap-10 justify-between items-center p-2 mt-4 w-full bg-white rounded-3xl shadow-lg max-w-[311px]">
          <div class="flex items-center space-x-4">
            <img loading="lazy" src={folderIconSrc} alt="" class="object-contain shrink-0 self-stretch my-auto aspect-[0.92] w-[49px]" />
            <div>
              <p class="text-left">{currentProject.name}</p>
              <span class="text-sm text-gray-500">{currentProject.items} items, {currentProject.size}</span>
            </div>
          </div>
        </button>
      </section>
  
      
      <!-- Scope IP List (First List) -->
        <section>
            <div class="flex justify-between items-center w-3/4">
                <h2 class="text-2xl font-semibold mb-4 border-b-4 w-5/6 pb-6">Scope IP List</h2>
                <button on:click={startAddingIp} class=" text-black px-3 py-1 rounded-md hover:bg-teal-700">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-10">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg> 
                </button>
            </div>

            <!-- Form to add IP-->
            {#if addingIp}
              <div class="flex space-x-2 mb-4">
                <input
                  type="text"
                  bind:value={newIp}
                  placeholder="Enter new IP address"
                  class="border border-gray-300 rounded px-2 py-1 w-48"
                  on:keydown={(e) => e.key === 'Enter' && submitNewIp()}
                />
                <button on:click={submitNewIp} class="bg-teal-600 text-white px-3 py-2 rounded-md hover:bg-teal-700">Add</button>
              </div>
            {/if}
            <ul use:dndzone={{ items: ipList, flipDurationMs: 300 }}
                on:consider={handleIpListReorder}
                on:finalize={handleIpListReorder}>
            {#each ipList as item, index(item.id)}
                <li animate:flip={{ duration: 400, easing: cubicOut }} class="flex justify-between items-center py-3 border-t border-hidden w-3/4 hover:bg-slate-300 rounded-lg px-3 animate:flip={{ duration: 400, easing: cubicOut }}">
                <div class="flex items-center space-x-3">
                    <!-- Bind the checkbox state to the item's 'checked' property -->
                    <input type="checkbox" bind:checked={item.checked} class="w-5 h-5">
                    <span>{item.ip}</span>
                </div>
                <div class="flex space-x-2">
                    <!-- Icons and controls -->
                    <!--up arrow-->
                    <button on:click={() => moveUpInIpList(index)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                        </svg>   
                    </button>
                    <!--down arrow-->
                    <button on:click={() => moveDownInIpList(index)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"> 
                            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /> 
                        </svg>
                    </button>
                    <button on:click={() => deleteIpItem(index)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>                     
                    </button>
                </div>
                </li>
            {/each}
            </ul>
        </section>
        
        <!-- Exploits Allowed (Second List) -->
        <section>
          <div class="flex justify-between items-center w-3/4">
            <h2 class="text-2xl font-semibold mb-4 border-b-4 w-5/6 pb-6">Exploits Allowed</h2>
            <button on:click={startAddingExploit} class=" text-black px-3 py-1 rounded-md hover:bg-teal-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-10">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg> 
            </button>
          </div>
          <!-- Form to add new Exploit -->
          {#if addingExploit}
            <div class="flex space-x-2 mb-4">
              <input
                type="text"
                bind:value={newExploit}
                placeholder="Enter new exploit"
                class="border border-gray-300 rounded px-2 py-1 w-48"
                on:keydown={(e) => e.key === 'Enter' && submitNewExploit()}
              />
              <button on:click={submitNewExploit} class="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">Add</button>
            </div>
          {/if}
          <ul use:dndzone={{ items: exploits, flipDurationMs: 300 }}
              on:consider={handleExploitsReorder}
              on:finalize={handleExploitsReorder}>
          {#each exploits as exploit, index(exploit.id)}
              <li animate:flip={{ duration: 400, easing: cubicOut }} class="flex justify-between items-center py-3 border-t border-hidden w-3/4 hover:bg-slate-300 rounded-lg px-3 ">
              <div class="flex items-center space-x-3">
                  <!-- Bind the checkbox state to the item's 'checked' property -->
                  <input type="checkbox" bind:checked={exploit.checked} class="w-5 h-5">
                  <span>{exploit.name}</span>
              </div>
              <div class="flex space-x-2">
                  <!-- Icons and controls -->
                  <!--up arrow-->
                  <button on:click={() => moveUpInExploits(index)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                      </svg>   
                  </button>
                  <!--down arrow-->
                  <button on:click={() => moveDownInExploits(index)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"> 
                          <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /> 
                      </svg>
                  </button>   
                  <button on:click={() => deleteExploitItem(index)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                                          
                  </button>
              </div>
              </li>
          {/each}
          </ul>
        </section>
  
      
  
      <!-- Start Testing Button -->
      
    </div>

    <div class="absolute bottom-0 inset-x-0 flex justify-center mt-10 p-6 w-full ">
      <button class="bg-teal-600 text-white px-6 py-3 rounded-md hover:bg-teal-700">Start Testing</button>
    </div>
  
    <!-- Right Sidebar (Load Project) -->
    <aside class="w-full md:w-1/4 p-4 bg-gray-50 overflow-y-auto">
      <h2 class="text-xl font-semibold mb-4">Load Project</h2>
      <ul>
        {#each loadProjects as folder, index}
        <button 
          class="flex gap-10 justify-between items-center p-2 mt-4 w-full bg-white rounded-3xl hover:bg-slate-300 shadow-lg max-w-[311px]" 
          on:click={() => selectProject(index)}
        >
          <div class="flex items-center space-x-3">
            <img loading="lazy" src={folderIconSrc} alt="" class="object-contain shrink-0 self-stretch my-auto aspect-[0.92] w-[49px]" />
            <div>
              <p class="text-left">{folder.name}</p>
              <span class="text-sm text-gray-500">{folder.items} items | {folder.size}</span>
            </div>
          </div>
          <img loading="lazy" src={arrorIconSrc} alt="" class="object-contain shrink-0 self-stretch my-auto w-6 aspect-square" />
        </button>
        {/each}
      </ul>
    </aside>
  </main>
  