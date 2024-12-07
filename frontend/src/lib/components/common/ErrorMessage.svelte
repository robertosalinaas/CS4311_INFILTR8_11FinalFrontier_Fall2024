<script lang="ts">
import { settings } from "$lib/stores/settings";
export let message: string;

$: isDarkTheme = $settings.theme === "dark";
</script>

<div class="mb-8 mx-auto max-w-3xl">
    <div class={`bg-${isDarkTheme ? 'gray-800' : 'white'} border-l-4 border-${isDarkTheme ? 'gray-500' : 'red-500'} p-4 rounded shadow-sm`}>
        <!-- Icon -->
        <div class="flex">
            <!-- Error Icon -->
            <div class="flex-shrink-0">
                <svg
                  class={`h-5 w-5 text-${isDarkTheme ? 'gray-400' : 'red-500'}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clip-rule="evenodd"
                    />
                </svg>
            </div>
            <!-- Message -->
            <div class="ml-3">
                <p class={`text-sm text-${isDarkTheme ? 'gray-300' : 'red-700'}`} role="alert">
                  {message}
                </p>
            </div>
        </div>
    </div>
</div>
