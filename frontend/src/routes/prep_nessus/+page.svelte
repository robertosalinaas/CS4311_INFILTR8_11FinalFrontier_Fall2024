<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Navbar from '$lib/navbar.svelte';
  import { settings } from '$lib/stores/settings';

  export let isOpen = true;

  // Theme-specific classes
  $: themeClasses = {
      container: $settings.theme === 'light' 
          ? 'bg-gray-100' 
          : $settings.theme === 'dark' 
              ? 'bg-gray-800' 
              : 'bg-yellow-50',
      card: $settings.theme === 'light'
          ? 'bg-white'
          : $settings.theme === 'dark'
              ? 'bg-gray-900'
              : 'bg-yellow-100',
      text: $settings.theme === 'light'
          ? 'text-gray-800'
          : $settings.theme === 'dark'
              ? 'text-gray-100'
              : 'text-gray-900',
      subtext: $settings.theme === 'light'
          ? 'text-gray-600'
          : $settings.theme === 'dark'
              ? 'text-gray-400'
              : 'text-gray-700',
      border: $settings.theme === 'light'
          ? 'border-gray-200'
          : $settings.theme === 'dark'
              ? 'border-gray-700'
              : 'border-yellow-200'
  };

  // State management
  let projects: Array<{ id: string; name: string }> = [];
  let selectedProject = '';
  let nessusFile: File | null = null;
  let isProcessing = false;
  let processingCompleted = false;
  let loadingProgress = 0;
  let errorMessage = '';
  let csvFiles: string[] = [];

  // Check authentication and fetch projects
  onMount(async () => {
      const sessionId = localStorage.getItem('sessionId');
      
      if (!sessionId) {
          goto('/user_login');
          return;
      }

      try {
          const authResponse = await fetch('http://localhost:3000/api/auth/status', {
              headers: {
                  'Authorization': sessionId
              }
          });
          
          if (!authResponse.ok) {
              localStorage.removeItem('sessionId');
              goto('/user_login');
              return;
          }

          // Fetch projects
          const projectsResponse = await fetch('http://localhost:3000/api/projects', {
              headers: {
                  'Authorization': sessionId
              }
          });

          if (projectsResponse.ok) {
              const projectsData = await projectsResponse.json();
              projects = projectsData;
          }

      } catch (error) {
          console.error('Error:', error);
          localStorage.removeItem('sessionId');
          goto('/user_login');
      }
  });

  function handleFileUpload(event: Event) {
      const fileInput = event.target as HTMLInputElement;
      if (fileInput.files && fileInput.files[0]) {
          const file = fileInput.files[0];
          if (file.name.endsWith('.nessus')) {
              nessusFile = file;
              errorMessage = '';
          } else {
              errorMessage = 'Please upload a valid .nessus file';
              nessusFile = null;
              fileInput.value = '';
          }
      }
  }

  async function processFile() {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
        goto('/user_login');
        return;
    }

    if (!selectedProject || !nessusFile) {
        errorMessage = 'Please select a project and file';
        return;
    }

    isProcessing = true;
    processingCompleted = false;
    loadingProgress = 0;
    errorMessage = '';
    csvFiles = [];

    try {
        const formData = new FormData();
        formData.append('file', nessusFile as File);
        formData.append('projectId', selectedProject); // Changed from projectName to projectId
        
        const response = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            headers: {
                'Authorization': sessionId
            },
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            csvFiles = result.csvFiles;
            
            // Simulate progress while processing
            const updateProgress = () => {
                return new Promise(resolve => {
                    let progress = 0;
                    const interval = setInterval(() => {
                        progress += 1;
                        loadingProgress = progress;
                        if (progress >= 100) {
                            clearInterval(interval);
                            resolve(true);
                        }
                    }, 50);
                });
            };

            await updateProgress();
            processingCompleted = true;
        } else {
            const error = await response.json();
            errorMessage = error.message || 'Failed to process file';
        }
    } catch (error) {
        console.error('Error processing file:', error);
        errorMessage = 'An error occurred while processing the file';
    } finally {
        isProcessing = false;
    }
}

async function downloadCSV(filename: string) {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
        goto('/user_login');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/download/${filename}`, {
            headers: {
                'Authorization': sessionId
            }
        });

        if (!response.ok) {
            throw new Error('Failed to download file');
        }

        // Create a blob from the response and trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error downloading file:', error);
        errorMessage = 'Failed to download file';
    }
}
</script>

<Navbar bind:isOpen />

<div class="p-6 {isOpen ? 'main-expanded' : 'main-collapsed'} flex items-center justify-center min-h-screen transition-all duration-500 ease-in-out {themeClasses.container}">
    <div class="max-w-xl w-full p-10 rounded-2xl shadow-lg {themeClasses.card}">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-4xl font-bold {themeClasses.text}">Process Data</h1>
        </div>
        
        <!-- Project Selection -->
        <div class="mb-6">
            <label for="project-select" class="block font-semibold mb-2 {themeClasses.text}">Select Project</label>
            <select 
                id="project-select"
                bind:value={selectedProject} 
                class="w-full p-4 border rounded-lg focus:ring transition-all duration-300 ease-in-out {themeClasses.card} {themeClasses.text} {themeClasses.border}"
            >
                <option value="">Choose a project</option>
                {#each projects as project}
                    <option value={project.id}>{project.name}</option>
                {/each}
            </select>
            <p class="mt-2 {themeClasses.subtext}">
                Need to create a new project? Visit the <a href="/project_manager" class="text-blue-500 hover:underline">Project Manager</a>
            </p>
        </div>
        
        <!-- File Upload -->
        <div class="mb-6">
            <label for="nessus-file" class="block font-semibold mb-2 {themeClasses.text}">Upload .nessus File</label>
            <input 
                id="nessus-file"
                type="file" 
                accept=".nessus" 
                on:change={handleFileUpload} 
                class="w-full p-4 rounded-lg focus:ring transition-all duration-300 ease-in-out {themeClasses.card} {themeClasses.text} {themeClasses.border}"
            />
            {#if errorMessage}
                <p class="mt-2 text-red-500 text-sm">{errorMessage}</p>
            {/if}
        </div>
        
        <!-- Process Button -->
        <button 
            on:click={processFile} 
            disabled={!selectedProject || !nessusFile || isProcessing} 
            class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-all duration-300 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isProcessing ? 'Processing...' : 'Process File'}
        </button>
        
        <!-- Loading Bar -->
        {#if isProcessing}
            <div class="mt-6">
                <div class="relative pt-1">
                    <div class="flex mb-2 items-center justify-between">
                        <div>
                            <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full {themeClasses.text}">
                                Processing
                            </span>
                        </div>
                        <div class="text-right">
                            <span class="text-xs font-semibold inline-block {themeClasses.text}">
                                {loadingProgress}%
                            </span>
                        </div>
                    </div>
                    <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                        <div
                            style="width: {loadingProgress}%"
                            class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300 ease-in-out"
                        >
                        </div>
                    </div>
                </div>
            </div>
        {/if}
        
        <!-- Completion Message -->
          {#if processingCompleted}
          <div class="mt-6">
              <p class="text-center text-green-600 font-semibold text-lg mb-4">
                  Processing completed successfully!
              </p>
              
              {#if csvFiles.length > 0}
                  <div class="space-y-2">
                      <p class="font-medium {themeClasses.text}">Generated CSV Files:</p>
                      {#each csvFiles as csvFile}
                          <button
                              on:click={() => downloadCSV(csvFile)}
                              class="w-full p-2 text-left rounded-lg border {themeClasses.border} hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors flex items-center justify-between"
                          >
                              <span class="{themeClasses.text}">{csvFile}</span>
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                              </svg>
                          </button>
                      {/each}
                  </div>
              {/if}
              
              <div class="mt-4 text-center">
                  <a 
                      href="/reports" 
                      class="inline-block text-blue-500 hover:underline"
                  >
                      Continue to Reports
                  </a>
              </div>
          </div>
      {/if}
    </div>
</div>

<style>
    :global(.main-expanded) {
        margin-left: 250px;
    }

    :global(.main-collapsed) {
        margin-left: 0;
    }

    @media (max-width: 768px) {
        :global(.main-expanded) {
            margin-left: 0;
        }
    }
</style>