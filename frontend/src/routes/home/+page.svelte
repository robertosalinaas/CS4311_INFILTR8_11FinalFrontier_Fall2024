<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import Navbar from '$lib/navbar.svelte';
    import { settings } from '$lib/stores/settings';
    
    let isOpen = true;
    let username = '';
    let timeOfDay = '';

    // Get time of day for greeting
    function getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        if (hour < 18) return 'afternoon';
        return 'evening';
    }

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
  
    let notifications = [
        { title: 'Notification error!', description: 'A target IP "10.0.0.2" was not found!', status: 'Unread', time: '4.4.2019; 13:44' },
        { title: 'Filed updated', description: 'cyber_Dependencies.pcap', status: 'Read', time: '4.4.2019; 13:44' },
        { title: 'Error message!', description: 'Target Files are missing!', status: 'Read', time: '4.4.2019; 13:44' },
    ];
  
    onMount(async () => {
        const sessionId = localStorage.getItem('sessionId');
        
        if (!sessionId) {
            goto('/user_login');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/status', {
                headers: {
                    'Authorization': sessionId
                }
            });
            
            if (!response.ok) {
                localStorage.removeItem('sessionId');
                goto('/user_login');
                return;
            }

            const data = await response.json();
            
            if (!data.isAuthenticated) {
                localStorage.removeItem('sessionId');
                goto('/user_login');
                return;
            }

            // Set username and time of day
            username = data.user.username;
            timeOfDay = getTimeOfDay();

        } catch (error) {
            console.error('Error checking authentication:', error);
            localStorage.removeItem('sessionId');
            goto('/user_login');
        }
    });
</script>

<Navbar bind:isOpen />

<main class="p-6 {isOpen ? 'main-expanded' : 'main-collapsed'} min-h-screen transition-all duration-500 ease-in-out {themeClasses.container}">
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Left section -->
        <div class="space-y-8 pl-4">
            <!-- Greeting -->
            <div class="mb-8 mt-4">
                <div class="flex flex-col items-start">
                    <h1 class="text-4xl lg:text-6xl font-bold {themeClasses.text}">
                        Good {timeOfDay},
                    </h1>
                    {#if username}
                        <span class="text-4xl lg:text-6xl font-bold mt-2 bg-gradient-to-r from-blue-600 to-green-600 text-transparent bg-clip-text">
                            {username}!
                        </span>
                    {/if}
                    <p class="{themeClasses.subtext} mt-4 text-xl">Welcome back to your dashboard</p>
                </div>
            </div>

            <!-- Notifications -->
            <div class="{themeClasses.card} rounded-xl shadow-lg p-8">
                <h2 class="text-2xl font-semibold mb-6 {themeClasses.text}">Notifications</h2>
                <div class="space-y-4">
                    {#each notifications as notification}
                        <div class="p-6 rounded-xl border-2 transition-all duration-300
                            {notification.status === 'Unread' 
                                ? 'border-blue-500 bg-blue-50/50' 
                                : themeClasses.border}">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h3 class="font-semibold {themeClasses.text}">{notification.title}</h3>
                                    <p class="text-sm {themeClasses.subtext} mt-1">{notification.description}</p>
                                </div>
                                <div class="text-right">
                                    <span class="inline-block px-2 py-1 rounded-full text-xs font-medium
                                        {notification.status === 'Unread' 
                                            ? 'bg-blue-100 text-blue-800' 
                                            : 'bg-gray-100 text-gray-800'}">
                                        {notification.status}
                                    </span>
                                    <p class="text-xs {themeClasses.subtext} mt-1">{notification.time}</p>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>

        <!-- Right section -->
        <div class="space-y-8">
            <!-- System Performance -->
            <div class="{themeClasses.card} rounded-xl shadow-lg p-8">
                <h2 class="text-2xl font-semibold mb-6 {themeClasses.text}">System Performance</h2>
                <div class="space-y-6">
                    {#each [
                        { label: 'CPU', value: '31%', color: 'bg-yellow-500', width: '31%' },
                        { label: 'GPU', value: '10%', color: 'bg-purple-500', width: '10%' },
                        { label: 'Memory', value: '1.2 Gb/4 Gb', color: 'bg-blue-500', width: '30%' },
                        { label: 'Network', value: '132,645 KB', color: 'bg-red-500', width: '50%' }
                    ] as metric}
                        <div>
                            <div class="flex justify-between mb-2">
                                <span class={themeClasses.text}>{metric.label}</span>
                                <span class={themeClasses.text}>{metric.value}</span>
                            </div>
                            <div class="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                                <div class="{metric.color} h-full rounded-full transition-all duration-300" 
                                     style="width: {metric.width}">
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Create New Project -->
            <div class="{themeClasses.card} rounded-xl shadow-lg p-8">
                <h2 class="text-2xl font-semibold mb-6 {themeClasses.text}">Create new project</h2>
                <div class="border-2 border-dashed {themeClasses.border} rounded-xl p-8 text-center">
                    <div class="w-16 h-16 mx-auto mb-4 {themeClasses.text}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <p class="{themeClasses.text} mb-2">Select a file or drag and drop here</p>
                    <p class="{themeClasses.subtext} text-sm mb-6">JPG, PNG or PDF, file size no more than 10MB</p>
                    <button class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300">
                        Select File
                    </button>
                </div>
            </div>
        </div>
    </div>
</main>

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