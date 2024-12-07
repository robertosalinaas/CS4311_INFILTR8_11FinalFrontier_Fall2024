<script lang="ts">
export let isLoading: boolean;
export let resetPasswordForm: {
    userKey: string;
    newPassword: string;
    confirmPassword: string;
};
export let onSubmit: (event: Event) => void;
</script>

<div class="bg-white rounded-lg shadow-lg overflow-hidden">
    <!-- Header -->
    <div class="bg-slate-600 px-6 py-4">
        <h2 class="text-xl font-semibold text-white">Reset Password</h2>
        <p class="text-slate-300 text-sm mt-1">Forgot your password?</p>
    </div>
    <!-- Form -->
    <div class="p-6">
        <form on:submit={onSubmit} class="space-y-4">
            <!-- UserKey -->
            <div>
                <label 
                  for="user-key" 
                  class="block text-sm font-medium text-slate-700">User Key</label
                >
                <input
                  id="user-key"
                  type="text"
                  bind:value={resetPasswordForm.userKey}
                  required
                  class="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                />
            </div>
            <!-- New Password -->
            <div>
                <label
                  for="reset-password"
                  class="block text-sm font-medium text-slate-700">New Password</label
                >
                <input
                  id="reset-password"
                  type="password"
                  bind:value={resetPasswordForm.newPassword}
                  required
                  class="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                />
            </div>
            <!-- Confirm New Password -->
            <div>
                <label
                  for="confirm-reset-password"
                  class="block text-sm font-medium text-slate-700">Confirm New Password</label
                >
                <input
                  id="confirm-reset-password"
                  type="password"
                  bind:value={resetPasswordForm.confirmPassword}
                  required
                  class="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                />
            </div>
            <!-- Submit Form Button -->
            <button
              type="submit"
              disabled={isLoading}
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
                {#if isLoading}
                    <svg
                      class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        />
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    Resetting Password...
                {:else}
                    Reset Password
                {/if}
            </button>
        </form>
    </div>
</div>
