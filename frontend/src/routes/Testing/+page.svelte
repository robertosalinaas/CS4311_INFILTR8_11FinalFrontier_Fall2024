<script>
    export let isOpen = true;
    import Navbar from '$lib/navbar.svelte';
    import {goto} from '$app/navigation';
  
    // Import the components needed for the testing page
    import CircularProgress from '../../lib/CircularProgress.svelte';
    import ScheduleAttacks from '../../lib/ScheduleAttacks.svelte';
    import Summary from '../../lib/Summary.svelte';
    import TestResults from '../../lib/TestResults.svelte';
</script>

<Navbar bind:isOpen />

<!-- Main page content with refined grid and spacing -->
<main class="{isOpen ? 'ml-64' : 'ml-0'} grid grid-cols-1 gap-5 p-8 md:grid-cols-[2fr_3fr_1fr] md:gap-8 md:p-12">
    
    <!-- Summary Section -->
    <div class="summary  bg-gray-100 p-5 rounded-lg shadow-md flex flex-col justify-center">
      <Summary />
    </div>

    <!-- Test Results Section -->
    <div class="tests bg-gray-100 p-5 rounded-lg shadow-md flex flex-col justify-center">
      <TestResults />
    </div>

    <!-- Circular Progress Section -->
    <div class="circular-progress rounded-full  flex justify-center items-center">
      <CircularProgress progress={68} size={150} stroke={8} />
    </div>

    <!-- Schedule Attacks Section (spans full width) -->
    <div class="schedule bg-gray-100 p-5 rounded-lg col-span-1 md:col-span-3 shadow-md">
        <p class="text-lg font-bold text-center mb-5">Schedule Attacks</p>
      <ScheduleAttacks />
    </div>

    <!-- View Results Button -->
    <button on:click={() => goto('./report')}  class="view-results bg-blue-500 hover:bg-blue-700 text-white  py-4 px-6 rounded-md mx-auto  w-full text-md shadow-md transition ease-in-out duration-300">
      View Results
    </button>
</main>

<style>
  /* Extra Tailwind classes have been applied for layout and design improvements */
</style>
