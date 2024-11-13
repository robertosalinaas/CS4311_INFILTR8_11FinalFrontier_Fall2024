<script>
  import Navbar from '$lib/navbar.svelte';
  
  let isOpen = true; // For controlling the Navbar state

  let notifications = [
    { title: 'Notification error!', description: 'A target IP "10.0.0.2" was not found!', status: 'Unread', time: '4.4.2019; 13:44' },
    { title: 'Filed updated', description: 'cyber_Dependencies.pcap', status: 'Read', time: '4.4.2019; 13:44' },
    { title: 'Error message!', description: 'Target Files are missing!', status: 'Read', time: '4.4.2019; 13:44' },
  ];
</script>

<Navbar bind:isOpen />

<main class="{isOpen ? 'main-expanded' : 'main-collapsed'} flex flex-col p-6 bg-slate-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
  <!-- Left section -->
  <div>
    <!-- Greeting -->
    <h1 class="text-4xl lg:text-6xl font-bold">Good morning!</h1>

    <!-- Notifications -->
    <div class="mt-6 lg:mt-10 bg-white">
      <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Notifications</h2>
      <div class="space-y-4">
        {#each notifications as notification}
          <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-md shadow-md flex flex-col sm:flex-row justify-between">
            <div>
              <h3 class="font-bold text-gray-900 dark:text-gray-100">{notification.title}</h3>
              <p class="text-sm text-gray-900 dark:text-gray-100">{notification.description}</p>
            </div>
            <div class="text-right mt-2 sm:mt-0">
              <span class="text-pink-500 font-bold">{notification.status}</span>
              <p class="text-xs text-gray-500 dark:text-gray-400">{notification.time}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Right section -->
  <div class="mt-6 lg:mt-0">
    <!-- System Performance -->
    <div class="bg-white dark:bg-gray-800 p-6 rounded-md shadow-md mb-8">
      <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">System Performance</h2>
      <div class="space-y-4">
        <div class="flex justify-between">
          <span class="text-gray-900 dark:text-gray-100">CPU</span>
          <span class="text-gray-900 dark:text-gray-100">31%</span>
        </div>
        <div class="bg-yellow-500 h-2 rounded-full" style="width: 31%;"></div>

        <div class="flex justify-between">
          <span class="text-gray-900 dark:text-gray-100">GPU</span>
          <span class="text-gray-900 dark:text-gray-100">10%</span>
        </div>
        <div class="bg-purple-500 h-2 rounded-full" style="width: 10%;"></div>

        <div class="flex justify-between">
          <span class="text-gray-900 dark:text-gray-100">Memory</span>
          <span class="text-gray-900 dark:text-gray-100">1.2 Gb/4 Gb</span>
        </div>
        <div class="bg-blue-500 h-2 rounded-full" style="width: 30%;"></div>

        <div class="flex justify-between">
          <span class="text-gray-900 dark:text-gray-100">Network</span>
          <span class="text-gray-900 dark:text-gray-100">132,645 KB</span>
        </div>
        <div class="bg-red-500 h-2 rounded-full" style="width: 50%;"></div>
      </div>
    </div>

    <!-- Create New Project -->
    <div class="bg-white dark:bg-gray-800 p-6 rounded-md shadow-md">
      <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Create new project</h2>
      <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 lg:p-8 text-center">
        <div class="mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V4a1 1 0 00-1-1H3zm5 7a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm3 2a1 1 0 100 2H9a1 1 0 000-2h2z" clip-rule="evenodd" />
          </svg>
        </div>
        <p class="text-gray-500 dark:text-gray-400 mb-2">Select a file or drag and drop here</p>
        <p class="text-xs text-gray-400 dark:text-gray-500 mb-4">JPG, PNG or PDF, file size no more than 10MB</p>
        <button class="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors">Select File</button>
      </div>
    </div>
  </div>
</div>
</main>

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
