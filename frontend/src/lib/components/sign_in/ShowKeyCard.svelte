<script lang="ts">
export let userKey: string;
export let onClose: () => void;
export let onCopy: () => void;
</script>

<!-- Card Header Content -->
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 transform transition-all">
        <div class="bg-yellow-50 px-6 py-4 rounded-t-lg border-b border-yellow-100">
            <div class="flex items-center justify-between">
                <!-- Icon -->
                <div class="flex items-center">
                    <svg
                      class="h-8 w-8 text-yellow-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                <div class="ml-3">
                <!-- Message -->
                <h3 class="text-lg font-medium text-yellow-800">Important: Save Your User Key!</h3>
            </div>
        </div>
        <!-- Close Button -->
        <button
          class="text-yellow-500 hover:text-yellow-600"
          on:click={onClose}
          aria-label="Close modal"
        >
            <svg
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
            </svg>
        </button>
    </div>
</div>

<!-- Card Main Content -->
<div class="px-6 py-4">
    <div class="space-y-4">
        <!-- UserKey -->
        <p class="text-sm text-yellow-700">This key is required for password recovery. Store it securely!</p>
        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div class="bg-white p-4 rounded border border-yellow-300 font-mono text-lg text-center break-all" role="textbox" aria-label="User recovery key">
                {userKey}
            </div>
        </div>
        <!-- Copy UserKey -->
        <button
          class="w-full flex items-center justify-center px-4 py-2 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          on:click={onCopy}
          aria-label="Copy user key to clipboard"
        >
            <svg
              class="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
            </svg>
            Copy to Clipboard
        </button>
      </div>
    </div>
  </div>
</div>
