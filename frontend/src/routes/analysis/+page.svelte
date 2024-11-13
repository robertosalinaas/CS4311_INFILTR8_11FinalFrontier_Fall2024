<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import Navbar from '$lib/navbar.svelte';
    import { settings } from '$lib/stores/settings';
  
    export let isOpen = true;
  
    // Theme-specific classes
    $: themeClasses = {
      container: $settings.theme === 'light' 
          ? 'bg-gray-100' 
          : $settings.theme === 'dark' 
              ? 'bg-gray-800' 
              : 'bg-yellow-50',
      card: $settings.theme === 'light'
          ? 'bg-white'
          : $settings.theme === 'dark'
              ? 'bg-gray-900'
              : 'bg-yellow-100',
      text: $settings.theme === 'light'
          ? 'text-gray-800'
          : $settings.theme === 'dark'
              ? 'text-gray-100'
              : 'text-gray-900',
      subtext: $settings.theme === 'light'
          ? 'text-gray-600'
          : $settings.theme === 'dark'
              ? 'text-gray-400'
              : 'text-gray-700',
      border: $settings.theme === 'light'
          ? 'border-gray-200'
          : $settings.theme === 'dark'
              ? 'border-gray-700'
              : 'border-yellow-200'
    };
  
    // Project Dropdown
    let projects = ["Project 1", "Project 2", "Project 3"];
    let selectedProject = "Project 1";
  
    // Test Results
    let tests = [
      { name: "First Test", score: 87.4 },
      { name: "Second Test", score: 92.8 },
      { name: "Third Test", score: 75.2 },
    ];
  
    // Circular Progress
    let progress = 68;
    let size = 170;
    let stroke = 8;
    let radius = 50 - stroke / 2;
    let circumference = 2 * Math.PI * radius;
    $: offset = ((100 - progress) / 100) * circumference;
    
    $: strokeColor = $settings.theme === 'light' 
        ? '#2563eb'
        : $settings.theme === 'dark'
            ? '#3b82f6'
            : '#2563eb';
  
    $: bgStrokeColor = $settings.theme === 'light'
        ? '#e5e7eb'
        : $settings.theme === 'dark'
            ? '#374151'
            : '#fef3c7';
  
    // Attack scheduling
    let attacks = ['Weak Password', 'SQL Injection', 'Brute Force'];
    let militaryTimes = Array.from({ length: 96 }, (_, i) => {
      const hour = Math.floor(i / 4);
      const minute = (i % 4) * 15;
      return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    });
  
    let selectedAttack1 = 'Weak Password';
    let selectedAttack2 = 'Brute Force';
    let selectedAttack3 = 'SQL Injection';
    let selectedTime1 = '08:00';
    let selectedTime2 = '09:00';
    let selectedTime3 = '08:00';
    let isScheduled = false;
  
    function toggleSchedule() {
      isScheduled = !isScheduled;
    }
  
    onMount(async () => {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        goto('/user_login');
        return;
      }
  
      try {
        const authResponse = await fetch('http://localhost:3000/api/auth/status', {
          headers: {
            'Authorization': sessionId
          }
        });
        
        if (!authResponse.ok) {
          localStorage.removeItem('sessionId');
          goto('/user_login');
          return;
        }
      } catch (error) {
        console.error('Error:', error);
        localStorage.removeItem('sessionId');
        goto('/user_login');
      }
    });
  </script>
  
  <Navbar bind:isOpen />
  
  <main class="p-6 {isOpen ? 'main-expanded' : 'main-collapsed'} min-h-screen transition-all duration-500 ease-in-out {themeClasses.container}">
    <div class="max-w-7xl mx-auto space-y-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column -->
        <div class="flex flex-col gap-6">
          <!-- Project Dropdown -->
          <div class="{themeClasses.card} rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold mb-4 {themeClasses.text}">Select Project</h3>
            <select 
              bind:value={selectedProject}
              class="w-full p-3 rounded-lg border {themeClasses.border} {themeClasses.card} {themeClasses.text}"
            >
              {#each projects as project}
                <option value={project}>{project}</option>
              {/each}
            </select>
          </div>
  
          <!-- Summary -->
          <div class="{themeClasses.card} rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold mb-4 {themeClasses.text}">Summary</h3>
            <div class="space-y-4">
              <div>
                <p class="{themeClasses.text}">Currently Testing Weak password Attack...</p>
                <p class="{themeClasses.subtext}">IP: 192.168.1.1 - Status: Ongoing</p>
              </div>
              <div class="border-t {themeClasses.border}"></div>
              <div>
                <p class="{themeClasses.text}">Currently Testing SQL Injection...</p>
                <p class="{themeClasses.subtext}">IP: 192.168.1.2 - Status: Success</p>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Middle and Right Columns -->
        <div class="lg:col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Test Results -->
          <div class="lg:col-span-2 {themeClasses.card} rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold mb-4 {themeClasses.text}">Test Results</h3>
            <div class="space-y-4">
              {#each tests as test}
                <div>
                  <div class="flex justify-between mb-2">
                    <span class="{themeClasses.text}">{test.name}</span>
                    <span class="{themeClasses.subtext}">{test.score}%</span>
                  </div>
                  <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style="width: {test.score}%"
                    ></div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
  
          <!-- Circular Progress -->
          <div class="{themeClasses.card} rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
            <svg
              width={size}
              height={size}
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={bgStrokeColor}
                stroke-width={stroke}
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={strokeColor}
                stroke-width={stroke}
                stroke-dasharray="{circumference} {circumference}"
                stroke-dashoffset={offset}
                stroke-linecap="round"
                transform="rotate(-90 50 50)"
                class="transition-all duration-500 ease-in-out"
              />
              <text
                x="50"
                y="50"
                fill={strokeColor}
                font-size={size * 0.18}
                dominant-baseline="middle"
                text-anchor="middle"
                font-weight="bold"
                class="transition-colors duration-300"
              >
                {progress}%
              </text>
            </svg>
            <p class="text-2xl font-bold mt-4 {themeClasses.text}">{progress}% Done</p>
          </div>
  
          <!-- Schedule Attacks -->
          <div class="lg:col-span-3 {themeClasses.card} rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold mb-4 {themeClasses.text}">Schedule Attacks</h3>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="font-medium {themeClasses.text}">Attack</div>
              <div class="font-medium {themeClasses.text}">Start Time</div>
              
              <!-- First Attack -->
              <select
                bind:value={selectedAttack1}
                class="p-2 rounded-lg border {themeClasses.border} {themeClasses.card} {themeClasses.text}"
              >
                {#each attacks as attack}
                  <option value={attack}>{attack}</option>
                {/each}
              </select>
              
              <select
                bind:value={selectedTime1}
                class="p-2 rounded-lg border {themeClasses.border} {themeClasses.card} {themeClasses.text}"
              >
                {#each militaryTimes as time}
                  <option value={time}>{time}</option>
                {/each}
              </select>
  
              <!-- Second Attack -->
              <select
                bind:value={selectedAttack2}
                class="p-2 rounded-lg border {themeClasses.border} {themeClasses.card} {themeClasses.text}"
              >
                {#each attacks as attack}
                  <option value={attack}>{attack}</option>
                {/each}
              </select>
              
              <select
                bind:value={selectedTime2}
                class="p-2 rounded-lg border {themeClasses.border} {themeClasses.card} {themeClasses.text}"
              >
                {#each militaryTimes as time}
                  <option value={time}>{time}</option>
                {/each}
              </select>
  
              <!-- Third Attack -->
              <select
                bind:value={selectedAttack3}
                class="p-2 rounded-lg border {themeClasses.border} {themeClasses.card} {themeClasses.text}"
              >
                {#each attacks as attack}
                  <option value={attack}>{attack}</option>
                {/each}
              </select>
              
              <select
                bind:value={selectedTime3}
                class="p-2 rounded-lg border {themeClasses.border} {themeClasses.card} {themeClasses.text}"
              >
                {#each militaryTimes as time}
                  <option value={time}>{time}</option>
                {/each}
              </select>
            </div>
  
            <div class="mt-6 flex justify-center">
              <button
                on:click={toggleSchedule}
                class="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                {isScheduled ? 'Cancel Schedule' : 'Schedule Attack'}
              </button>
            </div>
          </div>
        </div>
  
        <!-- View Results Button -->
        <div class="lg:col-span-3 flex justify-center mt-6">
          <button
            on:click={() => goto('./report')}
            class="px-8 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            View Results
          </button>
        </div>
      </div>
    </div>
  </main>
  
  <style>
    :global(.main-expanded) {
      margin-left: 250px;
    }
  
    :global(.main-collapsed) {
      margin-left: 0;
    }
  
    @media (max-width: 768px) {
      :global(.main-expanded) {
        margin-left: 0;
      }
    }
  </style>