<script lang="ts">
  import Navbar from "$lib/components/navbar/Navbar.svelte";
  import ProjectDetails from "$lib/components/dashboard_see_project/ProjectDetails.svelte";
  import PageHeader from '$lib/components/common/PageHeader.svelte';
  import AuthGuard from '$lib/components/common/AuthGuard.svelte';
  import SuccessMessage from '$lib/components/common/SuccessMessage.svelte';
  import ErrorMessage from '$lib/components/common/ErrorMessage.svelte';
  import MemoryBar from '$lib/components/dashboard_see_project/MemoryBar.svelte';
  import { settings } from "$lib/stores/settings";
  import { themeClasses } from "$lib/utils/themeClasses";
  import { handleFetchProjects } from '$lib/utils/handleFetchProjects';
  import { onMount } from 'svelte';

  let isOpen = true;
  let successMessage = "";
  let errorMessage = "";
  let username = "";
  let isLoading = true;
  let projects: any[] = [];
  let memoryBarComponent: any; // Reference to MemoryBar component

  async function loadProjects() {
    isLoading = true; // Show loading state while fetching
    try {
      const response = await handleFetchProjects();
      if (response.error) {
        errorMessage = response.error;
        projects = [];
      } else {
        errorMessage = ""; // Clear any previous errors
        projects = response.projects || [];
        successMessage = "Projects updated successfully"; // Optional: show success message
        // Clear success message after 3 seconds
        setTimeout(() => {
          successMessage = "";
        }, 3000);
      }
    } catch (error) {
      errorMessage = "Failed to load projects";
      projects = [];
    } finally {
      isLoading = false;
    }
  }

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

  onMount(async () => {
    fetchUser();
    await loadProjects();
  });

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
        subtitle="View all projects" 
        centered={true} 
      />
      
      <MemoryBar bind:this={memoryBarComponent} />
      
      {#if successMessage}
        <SuccessMessage message={successMessage} />
      {/if}
      
      {#if errorMessage}
        <ErrorMessage message={errorMessage} />
      {/if}

      <ProjectDetails 
        {projects} 
        {isLoading}
        on:refresh={loadProjects}
        on:storageUpdate={() => memoryBarComponent?.refresh()}
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