<script lang="ts">
    import Navbar from "$lib/components/navbar/Navbar.svelte";
    import CreateProjectCard from "$lib/components/dashboard_create_project/CreateProjectCard.svelte";
    import PageHeader from '$lib/components/common/PageHeader.svelte';
    import AuthGuard from '$lib/components/common/AuthGuard.svelte';
    import SuccessMessage from '$lib/components/common/SuccessMessage.svelte';
    import ErrorMessage from '$lib/components/common/ErrorMessage.svelte';
    import { settings } from "$lib/stores/settings";
    import { themeClasses } from "$lib/utils/themeClasses";
    import { handleCreateProject } from '$lib/utils/handleCreateProject';
    import { onMount } from 'svelte';
  
    interface ProjectForm {
        name: string;
        nessusFileName: string | null;
        nessusFilePath: string | null;
        nessusFile: File | null;
        scopeIPs: Array<{ id: string; value: string }>;
        offLimitIPs: Array<{ id: string; value: string }>;
        allowedExploits: Array<{ id: string; value: string }>;
    }
  
    let isLoading = false;
    let successMessage = "";
    let errorMessage = "";
    let username = "";
    let createProjectForm: ProjectForm = {
        name: "",
        nessusFileName: null,
        nessusFilePath: null,
        nessusFile: null,
        scopeIPs: [],
        offLimitIPs: [],
        allowedExploits: []
    };
  
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
  
    onMount(() => {
      fetchUser();
    });
  
    async function onCreateProject(event: Event) {
        event.preventDefault();
        isLoading = true;
        successMessage = "";
        errorMessage = "";
  
        try {
            const response = await handleCreateProject(event, createProjectForm);
            
            if (response.error) {
                errorMessage = response.error;
                return;
            }
  
            if (response.project) {
                // Reset form after successful creation
                createProjectForm = {
                    name: "",
                    nessusFileName: null,
                    nessusFilePath: null,
                    nessusFile: null,
                    scopeIPs: [],
                    offLimitIPs: [],
                    allowedExploits: []
                };
  
                successMessage = response.successMessage || `Project "${response.project.name}" has been created successfully.`;
            }
        } catch (error) {
            console.error('Error creating project:', error);
            errorMessage = "An unexpected error occurred. Please try again.";
        } finally {
            isLoading = false;
        }
    }
  
    // navbar
    export let isOpen = true;
  
    // Apply text size to document root when it changes
    $: if (typeof window !== "undefined") {
        document.documentElement.style.fontSize = `${$settings.textSize}px`;
    }
</script>

<Navbar bind:isOpen />

<AuthGuard>
  <div class="p-6 {isOpen ? 'main-expanded': 'main-collapsed'} min-h-screen transition-all duration-500 ease-in-out {$themeClasses.container}">
      <div class="max-w-4xl mx-auto">
          <PageHeader 
            title={username ? `${username}'s Projects` : 'Projects'} 
            subtitle="Create a new project" 
            centered={true} 
          />
          
          {#if successMessage}
              <SuccessMessage message={successMessage} />
          {/if}
          
          {#if errorMessage}
              <ErrorMessage message={errorMessage} />
          {/if}

          <CreateProjectCard
              {isLoading}
              bind:createProjectForm
              onSubmit={onCreateProject}
          />
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