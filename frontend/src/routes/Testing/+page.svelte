<script>
  export let isOpen = true;
  import Navbar from '$lib/navbar.svelte';
  import {goto} from '$app/navigation';

  // Import the components needed for the testing page
  import CircularProgress from '../../lib/CircularProgress.svelte';
  import ScheduleAttacks from '../../lib/ScheduleAttacks.svelte';
  import Summary from '../../lib/Summary.svelte';
  import TestResults from '../../lib/TestResults.svelte';
  import ProjectDropdown from '../../lib/ProjectDropdown.svelte';
</script>

<Navbar bind:isOpen />

<!-- Main page content with refined grid and spacing -->
<main class="{isOpen ? 'ml-64' : 'ml-0'} grid grid-cols-1 md:grid-cols-3 gap-8 p-8 md:p-12">

  <!-- Left Column: Project Dropdown and Summary -->
  <div class="  col-span-1 row-span-4 flex flex-col gap-6">
      <h2 class="text-3xl font-semibold">Testing</h2>
      <div class="project-dropdown max-w-[300px]">
          <ProjectDropdown />
      </div>

      <div class="summary  rounded-lg  flex-auto">
          <Summary />
      </div>
  </div>

  <div class=" col-span-2 row-span-1">
    <div class="relative circular-progress rounded-full flex justify-end items-center">
        <CircularProgress progress={68} size={170} stroke={8} />
    </div>
  </div>


  <!-- Middle Column: Test Results and Schedule Attacks -->
  <div class="col-span-2  row-span-3 flex flex-col gap-6">
      <div class="tests bg-gray-100 p-5 rounded-lg shadow-md">
          <TestResults />
      </div>

      <div class="schedule bg-gray-100 p-5 rounded-lg shadow-md">
          <p class="text-lg font-bold text-center mb-5">Schedule Attacks</p>
          <ScheduleAttacks />
      </div>

      <!-- View Results Button -->
      <div class="flex justify-center">
          <button on:click={() => goto('./report')} class="view-results bg-blue-500 hover:bg-blue-700 text-white py-4 px-6 rounded-md shadow-md transition ease-in-out duration-300">
              View Results
          </button>
      </div>
  </div>
</main>

<style>
  /* Add any additional styles here */
  main {
      position: relative;
  }
</style>
