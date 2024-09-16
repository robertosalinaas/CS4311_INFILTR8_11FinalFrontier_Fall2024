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
    <p>{test.name}</p>
    <ProgressBar value={test.score} />
  {/each}
</div>

<style>
  .test-results p {
    font-weight: bold;
    color: white; 
    margin-bottom: 5px;
  }
</style>
