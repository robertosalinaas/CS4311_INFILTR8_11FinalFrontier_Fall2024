<script lang="ts">
    import { onMount } from 'svelte';
    import { settings } from "$lib/stores/settings";
    import { themeClasses } from "$lib/utils/themeClasses";
    import Navbar from "$lib/components/navbar/Navbar.svelte";
    import AuthGuard from '$lib/components/common/AuthGuard.svelte';
    import AnalysisResults from "$lib/components/analysis/AnalysisResults.svelte";
    import ErrorMessage from '$lib/components/common/ErrorMessage.svelte';
    import SuccessMessage from '$lib/components/common/SuccessMessage.svelte';
    import PageHeader from "$lib/components/common/PageHeader.svelte";
    import ProjectSummary from "$lib/components/reports/ProjectSummary.svelte";
    import { handleFetchAnalyzedProjects } from '$lib/utils/handleFetchAnalyzedProjects';
    
    interface AnalyzedProject {
        projectId: string;
        name: string;
        createdAt: string;
        analysisCompletedAt?: string;
        data_with_exploits?: string;
        ranked_entry_points?: string;
        entrypoint_most_info?: string;
        port_0_entries?: string;
        error?: string;
        scopeIPs?: Array<{ id: string; value: string }>;
        offLimitIPs?: Array<{ id: string; value: string }>;
        allowedExploits?: string[];
    }

    let projects: AnalyzedProject[] = [];
    let isLoading = false;
    let error = "";
    let successMessage = "";
    let selectedProject: AnalyzedProject | null = null;
    let isOpen = true;

    // Apply text size to document root when it changes
    $: if (typeof window !== "undefined") {
        document.documentElement.style.fontSize = `${$settings.textSize}px`;
    }

    onMount(async () => {
        await fetchAnalyzedProjects();
    });

    async function fetchAnalyzedProjects() {
        isLoading = true;
        error = "";
        successMessage = "";

        const result = await handleFetchAnalyzedProjects();
        
        if (result.error) {
            error = result.error;
        } else if (result.projects) {
            projects = result.projects.sort((a: AnalyzedProject, b: AnalyzedProject) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            successMessage = result.successMessage ?? "";
        }
        
        isLoading = false;
    }

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
</script>

<Navbar bind:isOpen />

<AuthGuard>
    <div class="p-6 {isOpen ? 'main-expanded': 'main-collapsed'} min-h-screen transition-all duration-500 ease-in-out {$themeClasses.container}">
        <div class="max-w-7xl mx-auto">
            <PageHeader 
                title="Analysis Reports" 
                subtitle="View and download analysis results" 
                centered={true} 
            />

            {#if error}
                <ErrorMessage message={error} />
            {/if}

            {#if successMessage}
                <SuccessMessage message={successMessage} />
            {/if}

            {#if isLoading}
                <div class="text-center py-12">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            {:else if projects.length === 0}
                <div class="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200 {$themeClasses.card}">
                    No analyzed projects found.
                </div>
            {:else}
                <div class="space-y-6">
                    {#each projects as project (project.projectId)}
                        <div class="border rounded-lg shadow-sm {$themeClasses.card}">
                            <div class="p-4 border-b {$themeClasses.borderColor}">
                                <div class="flex justify-between items-center">
                                    <div>
                                        <h2 class="text-lg font-semibold {$themeClasses.text}">
                                            {project.name}
                                        </h2>
                                        <p class="text-sm {$themeClasses.textSecondary}">
                                            Analyzed on {formatDate(project.analysisCompletedAt || project.createdAt)}
                                        </p>
                                    </div>
                                    <button
                                        disabled={isLoading}
                                        on:click={() => selectedProject = selectedProject?.projectId === project.projectId ? null : project}
                                        class="px-4 py-2 text-sm rounded-md transition-colors duration-200
                                            {$themeClasses.button}
                                            {isLoading ? 'opacity-50 cursor-not-allowed' : ''}"
                                    >
                                        {selectedProject?.projectId === project.projectId ? 'Hide Results' : 'View Results'}
                                    </button>
                                </div>
                            </div>
                            
                            {#if selectedProject?.projectId === project.projectId}
                                <div class="p-4 space-y-6">
                                    <ProjectSummary project={project} />
                                    
                                    {#if project.error}
                                        <ErrorMessage message={project.error} />
                                    {:else}
                                        <AnalysisResults results={project} />
                                    {/if}
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</AuthGuard>

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