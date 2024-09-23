<script lang="ts">
  import ProgressBar from '$lib/ProgressBar.svelte';

  let tests = [
    { name: "First Test", score: 87.4 },
    { name: "Second Test", score: 137.8 },
    { name: "Third Test", score: 92.8 },
  ];
</script>

<div class="test-results">
  {#each tests as test}
    <div class="test-item">
      <p>{test.name}</p>
      <ProgressBar value={test.score} />
    </div>
  {/each}
</div>

<style>
  .test-results {
    margin-bottom: 20px;
  }

  .test-item {
    margin-bottom: 10px;
  }

  p {
    margin: 0;
    font-weight: bold;
    color: #34495e;
  }
</style>
