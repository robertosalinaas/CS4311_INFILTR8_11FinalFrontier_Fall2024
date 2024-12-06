<script lang="ts">
    import Navbar from "$lib/components/navbar/Navbar.svelte";
    import SelectProject from "$lib/components/analysis/SelectProject.svelte";
    import PageHeader from '$lib/components/common/PageHeader.svelte';
    import AuthGuard from '$lib/components/common/AuthGuard.svelte';
    import SuccessMessage from '$lib/components/common/SuccessMessage.svelte';
    import ErrorMessage from '$lib/components/common/ErrorMessage.svelte';
    import { settings } from "$lib/stores/settings";
    import { themeClasses } from "$lib/utils/themeClasses";
    import { onMount } from 'svelte';
    import ProjectDetails from '$lib/components/analysis/ProjectView.svelte';

    let isOpen = true;
    let successMessage = "";
    let errorMessage = "";
    let username = "";
    let isLoading = false;
    let selectedProject: any = null;
  
    function fetchUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                username = user.username;
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }
  
    function handleProjectSelect(event: CustomEvent) {
        selectedProject = event.detail;
        successMessage = selectedProject ? `Project "${selectedProject.name}" selected` : "";
        errorMessage = "";
    }

    function handleAnalysisComplete(event: CustomEvent) {
        if (event.detail.success) {
            successMessage = event.detail.message;
            errorMessage = "";
        } else {
            errorMessage = event.detail.message;
            successMessage = "";
        }
    }
  
    onMount(() => {
        fetchUser();
    });
  
    $: if (typeof window !== "undefined") {
        document.documentElement.style.fontSize = `${$settings.textSize}px`;
    }
</script>
  
<Navbar bind:isOpen />
  
<AuthGuard>
    <div class="p-6 {isOpen ? 'main-expanded': 'main-collapsed'} min-h-screen transition-all duration-500 ease-in-out {$themeClasses.container}">
        <div class="max-w-4xl mx-auto">
            <PageHeader 
                title="Analysis Dashboard" 
                subtitle="Select a project and start the analysis" 
                centered={true} 
            />
            
            {#if successMessage}
                <div class="mb-6">
                    <SuccessMessage message={successMessage} />
                </div>
            {/if}
            
            {#if errorMessage}
                <div class="mb-6">
                    <ErrorMessage message={errorMessage} />
                </div>
            {/if}
  
            <div class="space-y-6">
                <SelectProject 
                    {isLoading}
                    on:projectSelect={handleProjectSelect}
                    on:analysisComplete={handleAnalysisComplete}
                />
  
                {#if selectedProject}
                    <ProjectDetails project={selectedProject} />
                {/if}
            </div>
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