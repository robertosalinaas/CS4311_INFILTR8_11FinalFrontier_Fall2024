<script lang="ts">
    import { settings } from "$lib/stores/settings";
    import { themeClasses } from "$lib/utils/themeClasses";

    export let project: {
        name: string;
        scopeIPs: Array<{ id: string; value: string }>;
        allowedExploits: string[];
    };

    $: isDarkMode = $settings.theme === 'dark';
</script>

<div class="rounded-lg shadow-lg overflow-hidden {$themeClasses.card}">
    <div class="p-6">
        <h3 class="text-lg font-medium mb-4 {$themeClasses.text}">
            Selected Project: {project.name}
        </h3>
        
        <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                    <h4 class="text-sm font-medium {$themeClasses.text}">
                        Scope IPs
                    </h4>
                    <div class="text-sm {$themeClasses.textSecondary}">
                        {project.scopeIPs.length} IPs configured
                    </div>
                    <div class="flex flex-wrap gap-2">
                        {#each project.scopeIPs as ip}
                            <span class="px-2 py-1 text-xs rounded-full border
                                {isDarkMode 
                                    ? 'bg-gray-800 text-gray-200 border-gray-700' 
                                    : 'bg-white text-gray-800 border-gray-200'}">
                                {ip.value}
                            </span>
                        {/each}
                    </div>
                </div>
                
                <div class="space-y-2">
                    <h4 class="text-sm font-medium {$themeClasses.text}">
                        Allowed Archetypes
                    </h4>
                    <div class="text-sm {$themeClasses.textSecondary}">
                        {project.allowedExploits.length} Archetypes configured
                    </div>
                    <div class="flex flex-wrap gap-2">
                        {#each project.allowedExploits as exploit}
                            <span class="px-2 py-1 text-xs rounded-full border
                                {isDarkMode 
                                    ? 'bg-gray-800 text-gray-200 border-gray-700' 
                                    : 'bg-white text-gray-800 border-gray-200'}">
                                {exploit}
                            </span>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>