<script lang="ts">
    import Navbar from "$lib/components/navbar/Navbar.svelte";
    import PageHeader from '$lib/components/common/PageHeader.svelte';
    import AuthGuard from '$lib/components/common/AuthGuard.svelte';
    import { settings } from "$lib/stores/settings";
    import { themeClasses } from "$lib/utils/themeClasses";
    import { onMount } from 'svelte';

    let isOpen = true;
    let username = "";
    
    const githubUrl = "https://github.com/robertosalinaas/CS4311_INFILTR8_11FinalFrontier_Fall2024";

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

    function openGithub() {
        window.open(githubUrl, '_blank');
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
                title="Support & Resources" 
                subtitle="Learn how to use INFILTR8 and access documentation" 
                centered={true} 
            />

            <div class="mt-8 space-y-8">
                <!-- Video Tutorial Section -->
                <div class="rounded-lg overflow-hidden shadow-lg {$themeClasses.card}">
                    <h2 class="text-xl font-semibold p-4 border-b {$themeClasses.borderColor} {$themeClasses.text}">
                        Video Tutorial
                    </h2>
                    <div class="aspect-w-16 aspect-h-9">
                        <video 
                            class="w-full"
                            controls
                            preload="metadata"
                        >
                            <source src="/tutorial.mp4" type="video/mp4">
                            <track 
                                kind="captions"
                                label="English"
                                srclang="en"
                                default
                            >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>

                <!-- GitHub Repository Section -->
                <div class="rounded-lg overflow-hidden shadow-lg p-6 {$themeClasses.card}">
                    <h2 class="text-xl font-semibold mb-4 {$themeClasses.text}">
                        Source Code & Documentation
                    </h2>
                    <p class="mb-4 {$themeClasses.textSecondary}">
                        Access our GitHub repository for detailed documentation, source code, and contribution guidelines.
                    </p>
                    <button
                        on:click={openGithub}
                        class="flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors duration-200
                            {$settings.theme === 'dark'
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white'}"
                    >
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
                        </svg>
                        <span>View on GitHub</span>
                    </button>
                </div>
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

    /* Required for aspect ratio container */
    .aspect-w-16 {
        position: relative;
        padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
    }

    .aspect-w-16 > * {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
</style>