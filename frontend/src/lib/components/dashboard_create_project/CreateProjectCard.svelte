<script lang="ts">
    import ListItem from '$lib/components/dashboard_create_project/ListItem.svelte';
    import NessusFileUpload from '$lib/components/dashboard_create_project/NessusFileUpload.svelte';
    import { settings } from "$lib/stores/settings";
    import { onMount } from 'svelte';
    import { EXPLOITS } from "$lib/stores/constants";
    import ArchetypeToggles from '$lib/components/dashboard_create_project/ArchetypeToggles.svelte';

    export let isLoading: boolean;
    export let createProjectForm: {
        name: string;
        nessusFileName: string | null;
        nessusFilePath: string | null;
        nessusFile: File | null;
        scopeIPs: Array<{ id: string; value: string }>;
        offLimitIPs: Array<{ id: string; value: string }>;
        allowedExploits: Array<{ id: string; value: string }>;
    };
    export let onSubmit: (event: Event) => void;

    let fileProcessing = false;
    let initialized = false;
    let formErrors: string[] = [];
    
    // Add these computed properties
    $: scopeIPsList = createProjectForm.scopeIPs;
    $: offLimitIPsList = createProjectForm.offLimitIPs;
    $: selectedArchetypesList = createProjectForm.allowedExploits.map(e => e.value);
    
    $: isDarkMode = $settings.theme === "dark";
    $: isNessusFileUploaded = createProjectForm.nessusFileName !== null && createProjectForm.nessusFile !== null;

    $: {
        formErrors = [];
        if (!createProjectForm.name?.trim()) {
            formErrors.push("Project name is required");
        }
        if (!isNessusFileUploaded) {
            formErrors.push("Nessus file is required");
        }
        if (isNessusFileUploaded && !createProjectForm.scopeIPs?.length) {
            formErrors.push("At least one scope IP is required");
        }
        // Add validation for Allowed Archetypes
        if (isNessusFileUploaded && !createProjectForm.allowedExploits?.length) {
            formErrors.push("At least one archetype must be selected");
        }
    }

    $: isFormValid = formErrors.length === 0;

    onMount(() => {
        createProjectForm = {
            ...createProjectForm,
            scopeIPs: createProjectForm.scopeIPs || [],
            offLimitIPs: createProjectForm.offLimitIPs || [],
            allowedExploits: createProjectForm.allowedExploits || []
        };
        initialized = true;
    });

    function handleSubmit(event: Event) {
        event.preventDefault();
        if (!isFormValid) {
            return;
        }
        onSubmit(event);
    }

    function handleScopeIPsChange(event: CustomEvent<Array<{ id: string; value: string }>>) {
        if (!initialized) return;
        const newScopeIPs = [...event.detail];
        const currentOffLimitIPs = [...(createProjectForm.offLimitIPs || [])];
        
        const filteredOffLimitIPs = currentOffLimitIPs.filter(
            offLimitIP => !newScopeIPs.some(scopeIP => scopeIP.value === offLimitIP.value)
        );

        createProjectForm = {
            ...createProjectForm,
            scopeIPs: newScopeIPs,
            offLimitIPs: filteredOffLimitIPs
        };
    }

    function handleOffLimitIPsChange(event: CustomEvent<Array<{ id: string; value: string }>>) {
        if (!initialized) return;
        const newOffLimitIPs = [...event.detail];
        const currentScopeIPs = [...(createProjectForm.scopeIPs || [])];
        
        const filteredScopeIPs = currentScopeIPs.filter(
            scopeIP => !newOffLimitIPs.some(offLimitIP => offLimitIP.value === scopeIP.value)
        );

        createProjectForm = {
            ...createProjectForm,
            scopeIPs: filteredScopeIPs,
            offLimitIPs: newOffLimitIPs
        };
    }

    function handleIPsFound(event: CustomEvent<string[]>) {
        if (!initialized) return;

        console.log('IPs found:', event.detail);
        const ips = event.detail;
        const currentOffLimitIPs = [...(createProjectForm.offLimitIPs || [])];
        const currentScopeIPs = [...(createProjectForm.scopeIPs || [])];
        
        const newScopeIPs = ips
            .filter(ip => !currentOffLimitIPs.some(offLimitIP => offLimitIP.value === ip))
            .filter(ip => !currentScopeIPs.some(scopeIP => scopeIP.value === ip))
            .map(ip => ({
                id: crypto.randomUUID(),
                value: ip
            }));

        if (newScopeIPs.length > 0) {
            createProjectForm = {
                ...createProjectForm,
                scopeIPs: [...currentScopeIPs, ...newScopeIPs]
            };
        }
    }
</script>

<div class="rounded-lg shadow-lg overflow-hidden {isDarkMode ? 'bg-gray-900' : 'bg-white'}">
    <div class="{isDarkMode ? 'bg-gray-800' : 'bg-blue-600'} px-6 py-4">
        <h2 class="text-xl font-semibold text-white">Create Project</h2>
    </div>
    
    <div class="p-6">
        <form on:submit={handleSubmit} class="space-y-6">
            <!-- Project Name -->
            <div>
                <label 
                    for="project-name" 
                    class="block text-sm font-medium {isDarkMode ? 'text-gray-200' : 'text-gray-700'}"
                >
                    Project Name *
                </label>
                <input
                    id="project-name"
                    type="text"
                    bind:value={createProjectForm.name}
                    required
                    placeholder="Enter project name"
                    class="mt-1 block w-full px-3 py-2 rounded-md border transition-colors
                        {isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-gray-200 focus:outline-none focus:border-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}"
                />
            </div>

            <!-- Nessus File Upload -->
            <div class="space-y-2">
                <label 
                    for="nessus-upload"
                    class="block text-sm font-medium {isDarkMode ? 'text-gray-200' : 'text-gray-700'}"
                >
                    Import IPs from Nessus *
                </label>
                <NessusFileUpload 
                    id="nessus-upload"
                    bind:isProcessing={fileProcessing}
                    on:ipsFound={handleIPsFound}
                    on:fileSelected={(event) => {
                        createProjectForm = {
                            ...createProjectForm,
                            nessusFileName: event.detail.name,
                            nessusFile: event.detail.file,
                            nessusFilePath: null
                        };
                        console.log('File selected:', createProjectForm);
                    }}
                />
            </div>

            <!-- IP Configuration and Archetypes -->
            <div class="space-y-6">
                <ListItem
                    id="scope-ips"
                    title="Scope IPs *"
                    bind:items={scopeIPsList}
                    placeholder="Enter IP address"
                    type="ip"
                    on:change={handleScopeIPsChange}
                    disabled={!isNessusFileUploaded || fileProcessing}
                />

                <ListItem
                    id="off-limit-ips"
                    title="Off-limit IPs"
                    bind:items={offLimitIPsList}
                    placeholder="Enter IP address"
                    type="ip"
                    on:change={handleOffLimitIPsChange}
                    disabled={!isNessusFileUploaded || fileProcessing}
                />

                <ArchetypeToggles
                    bind:selectedArchetypes={selectedArchetypesList}
                    disabled={!isNessusFileUploaded || fileProcessing}
                    on:change={(event) => {
                        createProjectForm = {
                            ...createProjectForm,
                            allowedExploits: event.detail.map(value => ({
                                id: crypto.randomUUID(),
                                value
                            }))
                        };
                    }}
                />

                {#if !isNessusFileUploaded}
                    <p class="text-sm text-center {isDarkMode ? 'text-gray-400' : 'text-gray-500'}">
                        Please upload a Nessus file to enable IP and Archetype configuration
                    </p>
                {/if}
            </div>

            {#if formErrors.length > 0}
                <div class="rounded-md p-4 {isDarkMode ? 'bg-gray-800' : 'bg-red-50'}">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="{isDarkMode ? 'text-gray-400' : 'text-red-400'} h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium {isDarkMode ? 'text-gray-200' : 'text-red-800'}">
                                Please fix the following errors:
                            </h3>
                            <ul class="mt-2 text-sm {isDarkMode ? 'text-gray-400' : 'text-red-700'} list-disc list-inside">
                                {#each formErrors as error}
                                    <li>{error}</li>
                                {/each}
                            </ul>
                        </div>
                    </div>
                </div>
            {/if}

            <button
                type="submit"
                disabled={!isFormValid || isLoading || fileProcessing}
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium
                    {isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-gray-500'
                        : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'}
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors duration-200"
                aria-busy={isLoading || fileProcessing}
            >
                {#if isLoading || fileProcessing}
                    <svg
                        class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                        />
                        <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    {isLoading ? 'Creating Project...' : 'Processing File...'}
                {:else}
                    Create Project
                {/if}
            </button>
        </form>
    </div>
</div>