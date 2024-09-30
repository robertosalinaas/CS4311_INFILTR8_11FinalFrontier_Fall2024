<script>
    export let isOpen = true;
    import Navbar from '$lib/navbar.svelte';
    import { goto } from '$app/navigation';
  
    // Import the components needed for the testing page
    import CircularProgress from '../../lib/CircularProgress.svelte';
    import Summary from '../../lib/Summary.svelte';
    import TestResults from '../../lib/TestResults.svelte';
    import ProjectDropdown from '../../lib/ProjectDropdown.svelte';
  
    // Example options for the dropdowns (Schedule Attacks)
    let attacks = ['Weak Password', 'SQL Injection', 'Brute Force'];
  
    // Generate all military time options (00:00 to 23:59)
    let militaryTimes = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        militaryTimes.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
  
    // Selected values for each attack and start time
    let selectedAttack1 = 'Weak Password';
    let selectedAttack2 = 'Brute Force';
    let selectedAttack3 = 'SQL Injection';
  
    let selectedTime1 = '08:00';
    let selectedTime2 = '09:00';
    let selectedTime3 = '08:00';
  
    // Toggle state for scheduling attacks
    let isScheduled = false;
  
    // Function to toggle the schedule attack state
    function toggleSchedule() {
      isScheduled = !isScheduled;
      if (isScheduled) {
        console.log("Attacks scheduled!");
      } else {
        console.log("Attack scheduling canceled!");
      }
    }
  </script>
  
  <Navbar bind:isOpen />
  
  <!-- Main page content with refined grid and spacing -->
  <main class="{isOpen ? 'ml-64' : 'ml-0'} grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 md:p-8 lg:p-10">
  
    <!-- Left Column: Project Dropdown and Summary -->
    <div class="col-span-1 flex flex-col gap-4">
        <h2 class="text-3xl font-bold">Testing</h2>
        <div class="project-dropdown w-full">
            <ProjectDropdown />
        </div>
  
        <!-- Reduced height for summary section -->
        <div class="summary bg-gray-100 p-4 rounded-lg shadow-lg h-[350px] overflow-y-auto">
            <Summary />
        </div>
    </div>
  
    <!-- Middle and Right Column: Test Results, Circular Progress, and Schedule Attacks -->
    <div class="col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Middle Column: Test Results -->
      <div class="test-results col-span-2 bg-white p-4 rounded-lg shadow-lg">
        <p class="text-lg font-bold mb-4">First Test</p>
        <TestResults />
      </div>
  
      <!-- Circular Progress Section -->
      <div class="circular-progress bg-white p-4 rounded-lg shadow-lg flex flex-col items-center justify-center">
        <CircularProgress progress={68} size={170} stroke={8} />
        <p class="text-2xl font-bold mt-4">68% Done</p>
      </div>
  
      <!-- Wider and shorter Schedule Attacks Section -->
      <div class="schedule bg-gray-100 p-4 rounded-lg shadow-lg col-span-3 w-full"> <!-- Removed max-height for better fit -->
        <p class="text-lg font-bold text-center mb-3">Schedule Attacks</p>
  
        <!-- Grid structure for Attack and Start-Time pairs -->
        <div class="grid grid-cols-2 gap-4">
          <!-- Attack and Start-Time Headers -->
          <div class="text-sm font-semibold">Attack</div>
          <div class="text-sm font-semibold">Start-Time</div>
          
          <!-- Attack 1 and Start-Time 1 -->
          <select bind:value={selectedAttack1} class="p-2 border rounded-md bg-white">
            {#each attacks as attack}
              <option value={attack}>{attack}</option>
            {/each}
          </select>
          
          <select bind:value={selectedTime1} class="p-2 border rounded-md bg-white">
            {#each militaryTimes as time}
              <option value={time}>{time}</option>
            {/each}
          </select>
          
          <!-- Attack 2 and Start-Time 2 -->
          <select bind:value={selectedAttack2} class="p-2 border rounded-md bg-white">
            {#each attacks as attack}
              <option value={attack}>{attack}</option>
            {/each}
          </select>
          
          <select bind:value={selectedTime2} class="p-2 border rounded-md bg-white">
            {#each militaryTimes as time}
              <option value={time}>{time}</option>
            {/each}
          </select>
          
          <!-- Attack 3 and Start-Time 3 -->
          <select bind:value={selectedAttack3} class="p-2 border rounded-md bg-white">
            {#each attacks as attack}
              <option value={attack}>{attack}</option>
            {/each}
          </select>
          
          <select bind:value={selectedTime3} class="p-2 border rounded-md bg-white">
            {#each militaryTimes as time}
              <option value={time}>{time}</option>
            {/each}
          </select>
        </div>
  
        <!-- Toggle Schedule Button -->
        <div class="mt-4 flex justify-center">
          <button on:click={toggleSchedule} class="bg-blue-500 text-white py-2 px-6 rounded-md shadow-lg transition ease-in-out duration-300">
            {isScheduled ? 'Cancel Schedule' : 'Schedule Attack'}
          </button>
        </div>
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
    /* Main layout adjustments */
    main {
      position: relative;
    }
  
    /* Adjusted summary box */
    .summary {
      height: 350px; /* Reduced height */
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
  
    /* Schedule dropdown styling */
    select {
      width: 100%;
    }
  
    /* Schedule container adjustments */
    .schedule {
      width: 100%;
      margin: 0 auto;
    }
  </style>
  