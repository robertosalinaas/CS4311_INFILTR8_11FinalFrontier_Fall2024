<script lang="ts">
    import { slide } from 'svelte/transition';
    import { settings } from "$lib/stores/settings";
    import { themeClasses } from "$lib/utils/themeClasses";
    import { createEventDispatcher } from 'svelte';
    import { handleDeleteProject } from '$lib/utils/handleDeleteProject';
    
    const dispatch = createEventDispatcher();

    export let projects: Array<{
      id: string;
      name: string;
      nessusFileName: string | null;
      nessusFilePath: string | null;
      createdAt: string;
      scopeIPs: Array<{ id: string; value: string }>;
      offLimitIPs: Array<{ id: string; value: string }>;
      allowedExploits: string[];
    }>;

    export let isLoading: boolean;
    let error: string | null = null;

    $: isDarkMode = $settings.theme === "dark";
  
    function formatDate(dateString: string): string {
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).format(date);
      } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
      }
    }
  
    let selectedProjectId: string | null = null;
  
    function toggleProjectDetails(projectId: string) {
      selectedProjectId = selectedProjectId === projectId ? null : projectId;
    }

    async function handleDownloadNessus(projectId: string) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            error = "No active session found";
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/download-nessus/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to download file');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `nessus-${projectId}.nessus`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (e) {
            console.error('Download error:', e);
            error = e instanceof Error ? e.message : "Failed to download file";
        }
    }

    async function handleDelete(projectId: string) {
        if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await handleDeleteProject(projectId);
            
            if (response.error) {
                error = response.error;
            } else {
                projects = projects.filter(p => p.id !== projectId);
                dispatch('refresh');
                dispatch('storageUpdate');
            }
        } catch (e) {
            error = e instanceof Error ? e.message : "Failed to delete project";
        }
    }
</script>

{#if isLoading}
    <div class="flex justify-center items-center p-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 {isDarkMode ? 'border-gray-400' : 'border-blue-500'}"></div>
    </div>
{:else if error}
    <div class="rounded-lg shadow-lg p-8 text-center {$themeClasses.card}">
        <div class="flex justify-center mb-4">
            <svg class="w-16 h-16 {isDarkMode ? 'text-red-400' : 'text-red-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <h3 class="text-xl font-medium {$themeClasses.text} mb-2">Error Loading Projects</h3>
        <p class="{$themeClasses.textSecondary}">{error}</p>
        <button
            class="mt-4 px-4 py-2 rounded-full transition-colors
                {isDarkMode 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}"
            on:click={() => dispatch('refresh')}
        >
            Retry
        </button>
    </div>
{:else if projects.length === 0}
    <div class="rounded-lg shadow-lg p-8 text-center {$themeClasses.card}">
        <div class="flex justify-center mb-4">
            <svg class="w-16 h-16 {$themeClasses.textSecondary}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            </svg>
        </div>
        <h3 class="text-xl font-medium {$themeClasses.text} mb-2">No Projects Found</h3>
        <p class="{$themeClasses.textSecondary}">You haven't created any projects yet.</p>
    </div>
{:else}
    <div class="space-y-4">
        {#each projects as project (project.id)}
            <div class="rounded-lg shadow-lg overflow-hidden {$themeClasses.card}">
                <!-- Project Header -->
                <div class="p-4 flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="flex-shrink-0">
                            <svg 
                                class="w-8 h-8 {$themeClasses.textSecondary}" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    stroke-linecap="round" 
                                    stroke-linejoin="round" 
                                    stroke-width="2" 
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-lg font-medium {$themeClasses.text}">{project.name}</h3>
                            <p class="{$themeClasses.textSecondary} text-sm">Created {formatDate(project.createdAt)}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        {#if project.nessusFileName}
                            <button
                                class="px-3 py-1 text-sm rounded-full border transition-colors
                                    {isDarkMode 
                                        ? 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700' 
                                        : 'bg-white text-green-800 border-gray-200 hover:bg-gray-50'}"
                                on:click={() => handleDownloadNessus(project.id)}
                            >
                                Download Nessus
                            </button>
                        {/if}
                        <button
                            class="px-3 py-1 text-sm rounded-full border transition-colors
                                {isDarkMode 
                                    ? 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700' 
                                    : 'bg-white text-blue-800 border-gray-200 hover:bg-gray-50'}"
                            on:click={() => toggleProjectDetails(project.id)}
                        >
                            {selectedProjectId === project.id ? 'Hide Details' : 'Show Details'}
                        </button>
                        <button
                            class="px-3 py-1 text-sm rounded-full border transition-colors
                                {isDarkMode 
                                    ? 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700' 
                                    : 'bg-white text-red-800 border-gray-200 hover:bg-gray-50'}"
                            on:click={() => handleDelete(project.id)}
                        >
                            Delete
                        </button>
                    </div>
                </div>

                <!-- Expanded Project Details -->
                {#if selectedProjectId === project.id}
                    <div class="border-t {isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-6" transition:slide>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Scope IPs -->
                            <div class="space-y-2">
                                <h4 class="text-sm font-medium {$themeClasses.text}">Scope IPs</h4>
                                <div class="text-sm {$themeClasses.textSecondary}">
                                    {project.scopeIPs.length} IPs configured
                                </div>
                                <div class="flex flex-wrap gap-2">
                                    {#each project.scopeIPs as ip}
                                        <span class="px-2 py-1 text-xs rounded-full border
                                            {isDarkMode 
                                                ? 'bg-gray-800 text-gray-200 border-gray-700' 
                                                : 'bg-white text-gray-800 border-gray-200'}">
                                            {ip.value}
                                        </span>
                                    {/each}
                                </div>
                            </div>

                            <!-- Off-Limit IPs -->
                            <div class="space-y-2">
                                <h4 class="text-sm font-medium {$themeClasses.text}">Off-Limit IPs</h4>
                                <div class="text-sm {$themeClasses.textSecondary}">
                                    {project.offLimitIPs.length} IPs configured
                                </div>
                                <div class="flex flex-wrap gap-2">
                                    {#each project.offLimitIPs as ip}
                                        <span class="px-2 py-1 text-xs rounded-full border
                                            {isDarkMode 
                                                ? 'bg-gray-800 text-gray-200 border-gray-700' 
                                                : 'bg-white text-gray-800 border-gray-200'}">
                                            {ip.value}
                                        </span>
                                    {/each}
                                </div>
                            </div>

                            <!-- Allowed Exploits -->
                            <div class="space-y-2 md:col-span-2">
                                <h4 class="text-sm font-medium {$themeClasses.text}">Allowed Archetypes</h4>
                                <div class="text-sm {$themeClasses.textSecondary}">
                                    {project.allowedExploits.length} Archetypes configured
                                </div>
                                <div class="flex flex-wrap gap-2">
                                    {#each project.allowedExploits as exploit}
                                        <span class="px-2 py-1 text-xs rounded-full border
                                            {isDarkMode 
                                                ? 'bg-gray-800 text-gray-200 border-gray-700' 
                                                : 'bg-white text-gray-800 border-gray-200'}">
                                            {exploit}
                                        </span>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
        {/each}
    </div>
{/if}