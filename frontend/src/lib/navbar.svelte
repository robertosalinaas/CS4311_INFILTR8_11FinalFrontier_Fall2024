<script>
    import { goto } from '$app/navigation';
    export let isOpen = true;

    function toggleNavbar() {
      isOpen = !isOpen;
    }
  </script>

  <style>
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

    .toggle-button {
      position: absolute;
      top: 1rem;
      right: -2.5rem;
      background-color: #2c3e50;
      color: white;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
      transition: background-color 0.3s ease;
    }

    .toggle-button:hover {
      background-color: #1abc9c;
    }
  </style>

  <nav class:closed={!isOpen} class="navbar">
    <div class="INFILTR8">INFILTR8</div>
    <div class="nav-buttons">
      <button on:click={() => goto('/dashboard')}>Dashboard</button>
      <button on:click={() => goto('./project')}>Project Manager</button>
      <button on:click={() => goto('./Testing')}>Analysis</button>
      <button on:click={() => goto('./report')}>Reports</button>
      <button on:click={() => goto('./allowedandlimitsIPList')}>AllowIP & Off-LimitIP</button>
      <button on:click={() => goto('./process_nessus')}>Process Recon Data</button>
    </div>
    <div class="bottom-buttons">
      <button on:click={() => goto('/settings')}>Settings</button>
      <button on:click={() => goto('/support')}>Supports</button>
    </div>
    <button class="toggle-button" on:click={toggleNavbar}>
      {isOpen ? '×' : '☰'}
    </button>
  </nav>
