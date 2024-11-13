<script lang="ts">
    import { goto } from '$app/navigation';
    import { settings } from '$lib/stores/settings';
    
    export let isOpen = true;
  
    function toggleNavbar() {
      isOpen = !isOpen;
    }

    async function handleLogout() {
        try {
            const sessionId = localStorage.getItem('sessionId');
            if (!sessionId) {
                goto('/user_login');
                return;
            }

            const response = await fetch('http://localhost:3000/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': sessionId
                }
            });

            if (response.ok) {
                localStorage.removeItem('sessionId');
                goto('/user_login');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

    // Theme-specific classes remain the same
    $: navbarThemeClass = {
        base: $settings.theme === 'light' 
            ? 'bg-white text-gray-800 border-r border-gray-200' 
            : $settings.theme === 'dark' 
                ? 'bg-gray-900 text-white border-r border-gray-700' 
                : 'bg-yellow-50 text-gray-900 border-r border-yellow-200',
        button: $settings.theme === 'light'
            ? 'hover:bg-gray-100'
            : $settings.theme === 'dark'
                ? 'hover:bg-gray-800'
                : 'hover:bg-yellow-100',
        logoutButton: $settings.theme === 'light'
            ? 'hover:bg-red-100 hover:text-red-600'
            : $settings.theme === 'dark'
                ? 'hover:bg-red-900 hover:text-red-400'
                : 'hover:bg-red-100 hover:text-red-600'
    };
</script>

<nav class="navbar {navbarThemeClass.base}" class:closed={!isOpen}>
    <!-- Logo and Brand -->
    <div class="INFILTR8">INFILTR8</div>
    
    <!-- Navigation Links -->
    <div class="nav-content">
        <div class="nav-buttons">
            <button class={navbarThemeClass.button} on:click={() => goto('/home')}>
                Dashboard
            </button>
            <button class={navbarThemeClass.button} on:click={() => goto('/project_manager')}>
                Project Manager
            </button>
            <button class={navbarThemeClass.button} on:click={() => goto('/prep_nessus')}>
                Process Recon Data
            </button>
            <button class={navbarThemeClass.button} on:click={() => goto('/analysis')}>
                Analysis
            </button>
            <button class={navbarThemeClass.button} on:click={() => goto('/reports')}>
                Reports
            </button>
        </div>
        
        <!-- Bottom Buttons -->
        <div class="bottom-buttons">
            <button class={navbarThemeClass.button} on:click={() => goto('/settings')}>
                Settings
            </button>
            <button class={navbarThemeClass.button} on:click={() => goto('/support')}>
                Support
            </button>
            <button 
                class="flex items-center gap-2 {navbarThemeClass.logoutButton}"
                on:click={handleLogout}
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
            </button>
        </div>
    </div>

    <!-- Toggle Button -->
    <button class="toggle-button {navbarThemeClass.base}" on:click={toggleNavbar}>
        {#if isOpen}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        {:else}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        {/if}
    </button>
</nav>

<style>
    .navbar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        width: 250px;
        display: flex;
        flex-direction: column;
        transition: all 0.3s ease;
        box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
        z-index: 1000;
    }

    .navbar.closed {
        transform: translateX(-250px);
    }

    .INFILTR8 {
        padding: 1.5rem;
        font-size: 1.8rem;
        font-weight: bold;
        text-align: center;
    }

    .nav-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow-y: auto;
        padding: 1rem;
    }

    .nav-buttons, .bottom-buttons {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .nav-buttons button, .bottom-buttons button {
        width: 100%;
        text-align: left;
        padding: 0.75rem 1rem;
        border-radius: 0.375rem;
        transition: all 0.2s ease;
    }

    .toggle-button {
        position: absolute;
        top: 1rem;
        right: -3rem;
        width: 3rem;
        height: 3rem;
        border-radius: 0 0.5rem 0.5rem 0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .toggle-button svg {
        width: 1.5rem;
        height: 1.5rem;
    }

    @media (max-width: 768px) {
        .navbar {
            transform: translateX(-250px);
        }

        .navbar:not(.closed) {
            transform: translateX(0);
        }
    }
</style>