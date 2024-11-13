<script lang="ts">
  export let value: number = 0;
</script>

<div class="progress">
  <div class="progress-bar" style="width: {value}%;">{value}%</div>
</div>

<style>
  .progress {
    --background-color: #34495e;
    border-radius: 10px;
    overflow: hidden;
    height: 15px;
    margin: 10px 0;
  }

  .progress-bar {
    --background-color: #1abc9c;
    height: 100%;
    color: #fff;
    text-align: center;
    white-space: nowrap;
    transition: width 0.4s ease;
    line-height: 15px; 
  }
</style>
