<script>
  import { goto } from '$app/navigation';
  import Navbar from '$lib/navbar.svelte';

  export let isOpen = true;

  function handleHelp() {
      goto('/support/docs');
  }
</script>

<Navbar bind:isOpen />

<style>
  main {
      transition: margin-left 0.3s ease;
  }

  .main-collapsed {
      margin-left: 0;
  }

  .main-expanded {
      margin-left: 250px; /* Adjust this width based on your navbar width */
  }

  @media (max-width: 1024px) {
      .main-expanded {
          margin-left: 0;
      }
  }
</style>

<main class="{isOpen ? 'main-expanded' : 'main-collapsed'}">
  <div class="relative flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <button
          on:click={handleHelp}
          class="absolute top-5 right-5 bg-blue-500 dark:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 dark:hover:bg-blue-800 transition ease-in-out duration-300"
      >
          <!-- Help icon (SVG) -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
              <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.25 15.75a3 3 0 113-3m-1.5 5.25h.008v.008H9.75v-.008m2.25 0a7.5 7.5 0 110-15 7.5 7.5 0 010 15z"
              />
          </svg>
      </button>

      <!-- Video placeholder box -->
      <div class="flex items-center justify-center w-3/4 h-3/4 bg-gray-300 dark:bg-gray-700 border-4 border-gray-400 dark:border-gray-600 rounded-lg shadow-lg">
          <p class="text-xl text-gray-700 dark:text-gray-300">Video Placeholder</p>
      </div>
  </div>
</main>
