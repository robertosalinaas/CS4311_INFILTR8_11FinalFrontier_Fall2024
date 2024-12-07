<script lang="ts">
import { settings } from "$lib/stores/settings";
export let message: string;

$: isDarkTheme = $settings.theme === "dark";
</script>

<div class="mb-8 mx-auto max-w-3xl">
    <div class={`bg-${isDarkTheme ? 'gray-800' : 'white'} border-l-4 border-${isDarkTheme ? 'gray-500' : 'green-500'} p-4 rounded shadow-sm`}>
        <!-- Icon -->
        <div class="flex">
            <!-- Checkmark Icon -->
            <div class="flex-shrink-0">
                <svg
                  class={`h-5 w-5 text-${isDarkTheme ? 'gray-400' : 'green-500'}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                </svg>
            </div>
            <!-- Message -->
            <div class="ml-3">
                <p class={`text-sm text-${isDarkTheme ? 'gray-300' : 'green-700'} whitespace-pre-line`} role="alert">
                  {message}
                </p>
            </div>
        </div>
    </div>
</div>