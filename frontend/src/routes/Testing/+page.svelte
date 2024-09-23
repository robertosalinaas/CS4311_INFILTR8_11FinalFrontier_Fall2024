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

<!-- Main page content with improved layout -->
<main class="{isOpen ? 'ml-64' : 'ml-0'} grid grid-cols-1 lg:grid-cols-[300px_2fr_1fr] gap-5 p-8 lg:p-12">

<!-- Left Sidebar: Project Dropdown & Summary -->
<div class="space-y-5">
  <h2 class="text-3xl font-semibold">Testing</h2>
  <div class="project-dropdown max-w-[300px]">
    <ProjectDropdown />
  </div>
  <div class="summary bg-gray-800 text-white p-5 rounded-lg shadow-lg h-[300px]">
    <Summary />
  </div>
</div>

<!-- Middle Section: Schedule Attacks and Test Results -->
<div class="space-y-5">
  <div class="schedule bg-white p-5 rounded-lg shadow-md">
    <p class="text-lg font-bold text-center mb-5"></p>
    <ScheduleAttacks />
  </div>
  <div class="tests bg-white p-5 rounded-lg shadow-md">
    <TestResults />
  </div>
</div>

<!-- Right Sidebar: Progress Section with Circular Progress -->
<div class="flex flex-col items-center space-y-5">
  <!-- Progress Card -->
  <div class="bg-white p-6 rounded-lg shadow-md flex flex-col items-center space-y-3 w-full">
    <p class="text-lg font-bold">Overall Progress</p>
    <CircularProgress progress={68} size={170} stroke={8} />
    <p class="text-sm text-gray-500">68% Completed</p>
    <p class="text-sm text-gray-500">Next phase: Data analysis</p>
  </div>

  <!-- Additional Metrics Card (Optional) -->
  <div class="bg-white p-6 rounded-lg shadow-md flex flex-col items-center space-y-3 w-full">
    <p class="text-lg font-bold">Metrics Overview</p>
    <p class="text-sm text-gray-500">Attack Duration: 2h 30m</p>
    <p class="text-sm text-gray-500">Current IP: 192.168.1.5</p>
    <p class="text-sm text-gray-500">Status: Ongoing</p>
  </div>
</div>

<!-- View Results Button (Centered below the grid) -->
<div class="col-span-full flex justify-center mt-5">
  <button on:click={() => goto('./report')} class="bg-blue-500 hover:bg-blue-700 text-white py-4 px-6 rounded-md text-md shadow-md transition ease-in-out duration-300">
    View Results
  </button>
</div>
</main>

<style>
.schedule {
  min-height: 150px;
}
.summary {
  min-height: 250px;
}
</style>
