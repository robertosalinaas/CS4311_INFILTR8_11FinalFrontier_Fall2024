<script lang="ts">
  export let isLoading: boolean;
  export let createAccountForm: {
      username: string;
      password: string;
      confirmPassword: string;
  };
  export let onSubmit: (event: Event) => void;
  </script>
  
  <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <!-- Header -->
      <div class="bg-blue-600 px-6 py-4">
          <h2 class="text-xl font-semibold text-white">Create Account</h2>
          <p class="text-blue-100 text-sm mt-1">New to the platform?</p>
      </div>
      <!-- Form -->
      <div class="p-6">
          <form on:submit={onSubmit} class="space-y-4">
              <!-- Form Inputs Grid -->
              <div class="grid grid-cols-1 gap-4">
                  <!-- Username -->
                  <div>
                      <label
                        for="new-username"
                        class="block text-sm font-medium text-slate-700">Username</label
                      >
                      <input
                        id="new-username"
                        type="text"
                        bind:value={createAccountForm.username}
                        required
                        class="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                  </div>
                  <!-- Password -->
                  <div>
                      <label
                        for="new-password"
                        class="block text-sm font-medium text-slate-700">Password</label
                      >
                      <input
                        id="new-password"
                        type="password"
                        bind:value={createAccountForm.password}
                        required
                        class="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                  </div>
                  <!-- Confirm Password -->
                  <div>
                      <label
                        for="confirm-new-password"
                        class="block text-sm font-medium text-slate-700">Confirm Password</label
                      >
                      <input
                        id="confirm-new-password"
                        type="password"
                        bind:value={createAccountForm.confirmPassword}
                        required
                        class="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                  </div>
              </div>
              <!-- Submit Form Button -->
              <button
                type="submit"
                disabled={isLoading}
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
                      Creating Account...
                  {:else}
                      Create Account
                  {/if}
              </button>
          </form>
      </div>
  </div>