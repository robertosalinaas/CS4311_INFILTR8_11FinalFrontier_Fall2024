<script>
  let attackType = "Weak password";  // Default attack type
  let startTime = "08:00";  // Default time

  // Function to handle scheduling
  async function scheduleAttack() {
    const response = await fetch('/api/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        attackType,
        startTime
      }),
    });

    if (response.ok) {
      // Handle success (e.g., show notification or refresh data)
      alert("Attack scheduled successfully");
    } else {
      // Handle error (e.g., show error notification)
      alert("Error scheduling attack");
    }
  }
</script>

<div class="schedule-attacks">
  <p class="text-lg font-bold text-center mb-5">Schedule Attacks</p>

  <!-- Attack Type Dropdown -->
  <label for="attackType">Select Attack Type:</label>
  <select id="attackType" bind:value={attackType} class="attack-dropdown">
    <option value="Weak password">Weak password</option>
    <option value="SQL Injection">SQL Injection</option>
    <option value="Brute Force">Brute Force</option>
    <option value="Cross-Site Scripting">Cross-Site Scripting</option>
    <!-- Add more attack types as needed -->
  </select>

  <!-- Start Time Input -->
  <label for="startTime" class="mt-4">Start Time:</label>
  <input type="time" id="startTime" bind:value={startTime} class="start-time-input"/>

  <!-- Schedule Button -->
  <button on:click={scheduleAttack} class="schedule-btn bg-blue-500 text-white rounded px-4 py-2 mt-4">
    Schedule Attack
  </button>
</div>

<style>
  .schedule-attacks {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .attack-dropdown, .start-time-input {
    padding: 8px;
    margin-top: 4px;
    border-radius: 4px;
    border: 1px solid #ccc;
  }
  .schedule-btn {
    cursor: pointer;
    transition: background-color 0.3s;
  }
  .schedule-btn:hover {
    background-color: #1c4f91;
  }
</style>
