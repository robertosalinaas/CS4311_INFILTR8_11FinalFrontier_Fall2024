<script>
    export let isOpen = true;
    import Navbar from '$lib/navbar.svelte';
    import { goto } from '$app/navigation';
  
    // Import the components needed for the testing page
    import CircularProgress from '../../lib/CircularProgress.svelte';
    import ScheduleAttacks from '../../lib/ScheduleAttacks.svelte';
    import Summary from '../../lib/Summary.svelte';
    import TestResults from '../../lib/TestResults.svelte';
    import ProjectDropdown from '../../lib/ProjectDropdown.svelte';
  </script>
  
  <Navbar bind:isOpen />
  
  <!-- Main page content with refined grid and spacing -->
  <main class="{isOpen ? 'ml-64' : 'ml-0'} grid grid-cols-1 lg:grid-cols-3 gap-6 p-8 md:p-10 lg:p-12">
  
    <!-- Left Column: Project Dropdown and Summary -->
    <div class="col-span-1 flex flex-col gap-4">
        <h2 class="text-3xl font-bold">Testing</h2>
        <div class="project-dropdown w-full">
            <ProjectDropdown />
        </div>
  
        <!-- Enlarged summary section with reduced scrolling -->
        <div class="summary bg-gray-100 p-6 rounded-lg shadow-lg h-[450px] overflow-y-auto">
            <Summary />
        </div>
    </div>
  
    <!-- Middle and Right Column: Test Results, Circular Progress, and Schedule Attacks -->
    <div class="col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Middle Column: Test Results -->
      <div class="test-results col-span-2 bg-white p-6 rounded-lg shadow-lg">
        <p class="text-lg font-bold mb-4">First Test</p>
        <TestResults />
      </div>
  
      <!-- Circular Progress Section -->
      <div class="circular-progress bg-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
        <CircularProgress progress={68} size={170} stroke={8} />
        <p class="text-2xl font-bold mt-4">68% Done</p>
      </div>
  
      <!-- Schedule Attacks Section -->
      <div class="schedule bg-gray-100 p-6 rounded-lg shadow-lg col-span-2 lg:col-span-3">
        <p class="text-lg font-bold text-center mb-5">Schedule Attacks</p>
        <ScheduleAttacks />
      </div>
    </div>
  
    <!-- View Results Button -->
    <div class="flex justify-center items-center col-span-3">
      <button on:click={() => goto('./report')} class="view-results bg-blue-600 hover:bg-blue-800 text-white py-4 px-8 rounded-full shadow-lg transition ease-in-out duration-300">
        View Result
      </button>
    </div>
  </main>
  
  <style>
    /* Add any additional styles here */
    main {
      position: relative;
    }
  
    /* Enlarged summary box */
    .summary {
      height: 450px; /* Increased height */
      overflow-y: auto;
    }
  
    /* Circular progress adjustments */
    .circular-progress {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
  
    /* Full width button at the bottom */
    .view-results {
      width: 220px;
    }
  
    /* Adjust button shadow and hover for better contrast */
    .view-results:hover {
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    }
  
    .test-results, .schedule {
      overflow: hidden;
    }
  </style>
  