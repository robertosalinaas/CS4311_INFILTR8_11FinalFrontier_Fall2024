<script lang="ts">
// Components
import NavItems from './NavItems.svelte';
import AuthGuard from '$lib/components/common/AuthGuard.svelte';

// Navigation
import { goto } from "$app/navigation";

// Theme and Settings
import { navbarThemeClasses } from "$lib/utils/themeClasses";
import '$lib/components/navbar/navbar.css';

// API Handlers
import { handleLogout } from '$lib/utils/handleLogOut';

// Navbar
export let isOpen = true;
function toggleNavbar() {
    isOpen = !isOpen;
}

// LOGOUT -> talks with utils HandleLogout
async function onLogOut() {
    const result = await handleLogout();
    
    if (result.successMessage) {        
        // Redirect to home page
        await goto('/');
    }
}
</script>

<AuthGuard>
<nav class="navbar {$navbarThemeClasses.base}" class:closed={!isOpen}>
    <div class="INFILTR8">INFILTR8</div>
    <NavItems {onLogOut} />
    <button 
        class="toggle-button {$navbarThemeClasses.toggleButton}" 
        on:click={toggleNavbar}
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
    >
        {#if isOpen}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        {:else}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        {/if}
    </button>
</nav>
</AuthGuard>

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
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
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

        .toggle-button {
            top: 1rem;
            right: 1rem;
            border-radius: 0.5rem;
        }
    }
</style>