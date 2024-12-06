<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { settings } from "$lib/stores/settings";
    import { handleFetchProjects } from '$lib/utils/handleFetchProjects';
    import { onMount } from 'svelte';
    import ProcessButtonLoadingBar from './ProcessButtonLoadingBar.svelte';
    import { handleStartAnalysis } from '$lib/utils/handleStartAnalysis';
    import AnalysisResults from './AnalysisResults.svelte';

    export let isLoading = false;
    let analysisResults: any = null;
    const dispatch = createEventDispatcher();
    let processButton: ProcessButtonLoadingBar;

    let projects: Array<{
        id: string;
        name: string;
        scopeIPs: Array<{ id: string; value: string }>;
        offLimitIPs: Array<{ id: string; value: string }>;
        allowedExploits: string[];
        createdAt: string;
    }> = [];
    let error: string | null = null;
    let selectedProjectId: string | null = null;

    $: isDarkMode = $settings.theme === "dark";

    async function loadProjects() {
        isLoading = true;
        error = null;
        
        try {
            const response = await handleFetchProjects();
            
            if (response.error) {
                error = response.error;
                projects = [];
            } else {
                projects = response.projects || [];
            }
        } catch (e) {
            error = e instanceof Error ? e.message : "Failed to load projects";
            projects = [];
        } finally {
            isLoading = false;
        }
    }

    function handleProjectSelect(event: Event) {
        const select = event.target as HTMLSelectElement;
        const projectId = select.value;
        
        // Always reset first
        if (processButton) {
            processButton.resetLoading();
        }
        
        if (projectId) {
            const selectedProject = projects.find(p => p.id === projectId);
            if (selectedProject) {
                selectedProjectId = projectId;
                dispatch('projectSelect', selectedProject);
            }
        } else {
            selectedProjectId = null;
            dispatch('projectSelect', null);
        }
    }

    // Add this function to handle the analysis
    async function handleAnalysis() {
        if (!selectedProjectId) {
            throw new Error('No project selected');
        }

        const result = await handleStartAnalysis(selectedProjectId);
        
        if (result.error) {
            throw new Error(result.error);
        }

        // Store the analysis results
        analysisResults = result.results;

        dispatch('analysisComplete', {
            success: true,
            message: result.successMessage,
            results: result.results
        });

        return result;
    }

    onMount(() => {
        loadProjects();
    });
</script>

<div class="rounded-lg shadow-lg overflow-hidden {isDarkMode ? 'bg-gray-800' : 'bg-white'}">
    <div class="p-6">
        <div class="space-y-4">
            <div>
                <label 
                    for="project-select" 
                    class="block text-sm font-medium {isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2"
                >
                    Select Project
                </label>
                
                {#if isLoading}
                    <div class="animate-pulse flex space-x-4">
                        <div class="h-12 {isDarkMode ? 'bg-gray-700' : 'bg-slate-700'} rounded-lg w-full"></div>
                    </div>
                {:else if error}
                    <div class="rounded-lg {isDarkMode ? 'bg-gray-700' : 'bg-red-50'} p-4">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <svg 
                                    class="h-5 w-5 {isDarkMode ? 'text-gray-400' : 'text-red-400'}" 
                                    viewBox="0 0 20 20" 
                                    fill="currentColor"
                                >
                                    <path 
                                        fill-rule="evenodd" 
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                                        clip-rule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div class="ml-3">
                                <h3 class="text-sm font-medium {isDarkMode ? 'text-gray-200' : 'text-red-800'}">
                                    Error loading projects
                                </h3>
                                <div class="mt-2 text-sm {isDarkMode ? 'text-gray-400' : 'text-red-700'}">
                                    <p>{error}</p>
                                </div>
                                <div class="mt-4">
                                    <button
                                        type="button"
                                        class="rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200
                                            {isDarkMode 
                                                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                                                : 'bg-red-50 text-red-800 hover:bg-red-100'} 
                                            focus:outline-none focus:ring-2 
                                            {isDarkMode ? 'focus:ring-gray-500' : 'focus:ring-red-600'} 
                                            focus:ring-offset-2"
                                        on:click={loadProjects}
                                    >
                                        Try again
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                {:else if projects.length === 0}
                    <div class="rounded-lg {isDarkMode ? 'bg-gray-700' : 'bg-yellow-50'} p-4">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <svg 
                                    class="h-5 w-5 {isDarkMode ? 'text-gray-400' : 'text-yellow-400'}" 
                                    viewBox="0 0 20 20" 
                                    fill="currentColor"
                                >
                                    <path 
                                        fill-rule="evenodd" 
                                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                                        clip-rule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div class="ml-3">
                                <h3 class="text-sm font-medium {isDarkMode ? 'text-gray-200' : 'text-yellow-800'}">
                                    No projects available
                                </h3>
                                <div class="mt-2 text-sm {isDarkMode ? 'text-gray-400' : 'text-yellow-700'}">
                                    <p>Create a project first to start the analysis.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                {:else}
                    <div class="relative">
                        <select
                            id="project-select"
                            class="appearance-none block w-full px-4 py-3 rounded-lg border text-base
                                transition-colors duration-200 ease-in-out cursor-pointer
                                {isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 focus:border-gray-500 focus:ring-1 focus:ring-gray-500' 
                                    : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}"
                            on:change={handleProjectSelect}
                        >
                            <option value="" class={isDarkMode ? 'bg-gray-700' : 'bg-white'}>
                                Choose a project...
                            </option>
                            {#each projects as project}
                                <option 
                                    value={project.id}
                                    selected={selectedProjectId === project.id}
                                    class={isDarkMode ? 'bg-gray-700' : 'bg-white'}
                                >
                                    {project.name} • {project.scopeIPs.length} IPs • {project.allowedExploits.length} Archetypes
                                </option>
                            {/each}
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 
                            {isDarkMode ? 'text-gray-400' : 'text-gray-500'}">
                            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                            </svg>
                        </div>
                    </div>
                {/if}
            </div>

            {#if selectedProjectId}
                <div class="mt-4 p-4 rounded-lg border 
                    {isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600' 
                        : 'bg-gray-50 border-gray-200'}">
                    <div class="text-sm {isDarkMode ? 'text-gray-300' : 'text-gray-600'} flex items-center space-x-2">
                        <svg class="h-5 w-5 {isDarkMode ? 'text-gray-400' : 'text-gray-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Selected project will be used for analysis</span>
                    </div>
                </div>
            {/if}

            <ProcessButtonLoadingBar 
                bind:this={processButton}
                onClick={handleAnalysis}
                disabled={selectedProjectId === null}  
                on:analysisComplete
            />
            {#if analysisResults}
                <AnalysisResults results={analysisResults} />
            {/if}
        </div>
    </div>
</div>