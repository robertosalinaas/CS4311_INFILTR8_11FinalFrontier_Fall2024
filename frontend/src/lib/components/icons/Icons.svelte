<script lang="ts">
import ThemeOption from '$lib/components/settings/ThemeOption.svelte';
export let themeClasses: any;
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <ThemeOption
        themeName="light"
        icon={`
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4"/>
                <path stroke-linecap="round" d="M12 2v2"/>
                <path stroke-linecap="round" d="M12 20v2"/>
                <path stroke-linecap="round" d="M4.93 4.93l1.41 1.41"/>
                <path stroke-linecap="round" d="M17.66 17.66l1.41 1.41"/>
                <path stroke-linecap="round" d="M2 12h2"/>
                <path stroke-linecap="round" d="M20 12h2"/>
                <path stroke-linecap="round" d="M6.34 17.66l-1.41 1.41"/>
                <path stroke-linecap="round" d="M19.07 4.93l-1.41 1.41"/>
            </svg>
        `}
        label="Light"
        description="Bright and clear"
        {themeClasses}
    />

    <ThemeOption
        themeName="dark"
        icon={`
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
        `}
        label="Dark"
        description="Easy on the eyes"
        {themeClasses}
    />
</div>

<style>
    div {
        width: 100%;
        max-width: 100%;
    }

    @media (min-width: 768px) {
        div {
            max-width: none;
        }
    }
</style>