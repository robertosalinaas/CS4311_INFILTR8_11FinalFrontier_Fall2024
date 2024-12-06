<script lang="ts">
export let themeClasses;
export let title: string;
</script>

<div class="{themeClasses.card} rounded-xl shadow-md border {themeClasses.border}">
    <div class="p-6">
        <h2 class="text-2xl font-semibold mb-4 {themeClasses.text}">{title}</h2>
        <slot></slot>
    </div>
</div>

