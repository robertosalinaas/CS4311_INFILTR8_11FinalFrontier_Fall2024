<script lang="ts">
// Components
import Navbar from "$lib/components/navbar/Navbar.svelte";
import PageHeader from '$lib/components/common/PageHeader.svelte';
import TextSizeSlider from "$lib/components/settings/TextSizeSlider.svelte";
import SettingsCard from "$lib/components/settings/SettingsCard.svelte";
import Icons from "$lib/components/icons/Icons.svelte";
import AuthGuard from '$lib/components/common/AuthGuard.svelte';

// Theme and Settings
import { settings } from "$lib/stores/settings";
import { themeClasses } from "$lib/utils/themeClasses";

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
        <!-- Settings Header -->
        <PageHeader title="Settings" subtitle="Customize your application experience" centered={true} />

        <div class="grid gap-8">
            <!-- Theme Settings -->  
            <SettingsCard title="Theme Preferences" {themeClasses}>
                <Icons {themeClasses} />
            </SettingsCard>

            <!-- Text Size Settings -->
            <SettingsCard title="Text Size" {themeClasses}>
                <TextSizeSlider {themeClasses} />
            </SettingsCard>
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
