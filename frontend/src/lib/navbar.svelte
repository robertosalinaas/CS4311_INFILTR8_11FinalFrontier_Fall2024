<script>
  import { goto } from '$app/navigation';
  export let isOpen = true;

  function toggleNavbar() {
    isOpen = !isOpen;
  }
</script>

<style>
  /* Main Navbar Styles */
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 250px;
    background-color: #2c3e50;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: transform 0.3s ease;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    z-index: 1000; /* Ensure the navbar stays on top */
  }

  .navbar.closed {
    transform: translateX(-100%);
  }

  .INFILTR8 {
    padding: 1.5rem;
    font-size: 1.8rem;
    font-weight: bold;
    text-align: center;
    background-color: #34495e;
  }

  .nav-buttons, .bottom-buttons {
    display: flex;
    flex-direction: column;
    padding: 1rem;
  }

  .nav-buttons button, .bottom-buttons button {
    margin: 0.5rem 0;
    padding: 0.75rem;
    background-color: #34495e;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s ease;
  }

  .nav-buttons button:hover, .bottom-buttons button:hover {
    background-color: #1abc9c;
  }

  /* Toggle Button Styles (Semicircle) */
  .toggle-button {
    position: absolute;
    top: 1.5rem;
    right: -2.3rem;
    width: 50px;
    height: 25px; /* Half height of the button for semicircle effect */
    background-color: #2c3e50;
    color: white;
    border: none;
    cursor: pointer;
    padding: 10px;
    border-radius: 25px 25px 0 0; /* Semicircular top */
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
    transition: background-color 0.3s ease, transform 0.2s ease;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1100; /* Keep above navbar */
    transform: rotate(90deg); 
  }

  .toggle-button:hover {
    background-color: #1abc9c;
    transform: scale(1.1) rotate(90deg);
  }

  .toggle-button svg {
    width: 24px;
    height: 24px;
  }

  /* Hover for Close Icon */
  .toggle-button-close:hover {
    transform: scale(1.1);
  }

  /* Scrollbar for the Navbar when content exceeds */
  .nav-content {
    overflow-y: auto;
    flex-grow: 1;
    padding-bottom: 20px;
  }

  /* Transparent scroll background */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
</style>

<nav class:closed={!isOpen} class="navbar">
  <!-- Logo and INFILTR8 Label -->
  <div class="INFILTR8">INFILTR8</div>
  
  <!-- Main Navbar Content with Scroll -->
  <div class="nav-content">
    <div class="nav-buttons">
      <button on:click={() => goto('/dashboard')}>Dashboard</button>
      <button on:click={() => goto('./project')}>Project Manager</button>
      <button on:click={() => goto('./Testing')}>Analysis</button>
      <button on:click={() => goto('./report')}>Reports</button>
      <button on:click={() => goto('./allowedandlimitsIPList')}>AllowIP & Off-LimitIP</button>
      <button on:click={() => goto('./process_nessus')}>Process Recon Data</button>
    </div>
    
    <!-- Bottom Buttons -->
    <div class="bottom-buttons">
      <button on:click={() => goto('/settings')}>Settings</button>
      <button on:click={() => goto('/support')}>Supports</button>
    </div>
  </div>

  <!-- Toggle Button for Open/Close -->
  <button class="toggle-button" on:click={toggleNavbar}>
    {#if isOpen}
      <!-- Close (X) Icon -->
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="toggle-button-close">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    {:else}
      <!-- Hamburger (☰) Icon -->
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    {/if}
  </button>
</nav>
