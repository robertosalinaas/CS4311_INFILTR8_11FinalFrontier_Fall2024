<script lang="ts">
  export let value: number = 0;
</script>

<div class="progress">
  <div class="progress-bar" style="width: {value}%;">{value}%</div>
</div>

<style>
  .progress {
    background-color: #e5e5e5;  /* Light gray background */
    border-radius: 10px;
    overflow: hidden;
    height: 15px;
    margin: 10px 0;
  }

  .progress-bar {
    background-color: #6a4fd8;  /* Purple color */
    height: 100%;
    color: #fff;
    text-align: center;
    white-space: nowrap;
    transition: width 0.4s ease;
    line-height: 15px;
    border-radius: 5px;  /* Slightly rounded corners */
  }
</style>
