<script lang="ts">
  let attacks = ["Weak password Attack", "SQL Injection", "Phishing"];
  let times = ["08:00", "10:00", "12:00"];
</script>

<div class="schedule">
  <div class="row">
    {#each Array(3) as _, i}
      <div class="col">
        <select>
          {#each attacks as attack}
            <option value={attack}>{attack}</option>
          {/each}
        </select>

        <select>
          {#each times as time}
            <option value={time}>{time}</option>
          {/each}
        </select>
      </div>
    {/each}
  </div>
</div>

<style>
  .row {
    display: flex;
    justify-content: space-between;
  }

  .col {
    flex: 1;
    margin-right: 10px;
  }

  select {
    width: 100%;
    padding: 10px;
    background-color: #34495e; /* Match navbar background */
    color: white;
    border-radius: 4px;
    border: none;
    margin-bottom: 10px;
    transition: background-color 0.3s ease;
  }

  select:hover {
    background-color: #1abc9c; /* Match navbar hover */
  }
</style>
