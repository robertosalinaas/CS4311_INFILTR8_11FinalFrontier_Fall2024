<script lang="ts">
  export let value = 68; // Default value
</script>

<svg viewBox="0 0 36 36" class="circular-chart">
  <path
    class="circle-bg"
    d="M18 2.0845
       a 15.9155 15.9155 0 0 1 0 31.831
       a 15.9155 15.9155 0 0 1 0 -31.831"
  />
  <path
    class="circle"
    stroke-dasharray="{value}, 100"
    d="M18 2.0845
       a 15.9155 15.9155 0 0 1 0 31.831
       a 15.9155 15.9155 0 0 1 0 -31.831"
  />
  <text x="18" y="20.35" class="percentage">{value}%</text>
</svg>

<style>
  .circular-chart {
    max-width: 80px; 
    max-height: 80px;
  }

  .circle-bg {
    fill: none;
    stroke: #34495e; 
    stroke-width: 3.8;
  }

  .circle {
    fill: none;
    stroke-width: 2.8;
    stroke: #1abc9c; 
    stroke-linecap: round;
    animation: progress 1s ease-out forwards;
  }

  .percentage {
    font-size: 0.5em; 
    text-anchor: middle;
    fill: #ecf0f1; 
  }
</style>
