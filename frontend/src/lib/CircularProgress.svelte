<script>
  export let progress = 68;
  export let size = 150;  // Default size
  export let stroke = 8;  // Default stroke width
  const radius = 50 - stroke / 2;  // Adjust the radius based on stroke width
  const circumference = 2 * Math.PI * radius;  // Calculate the circumference
  const offset = ((100 - progress) / 100) * circumference;  // Calculate the offset for the progress
</script>

<svg
  width="{size}"
  height="{size}"
  viewBox="0 0 100 100"
  xmlns="http://www.w3.org/2000/svg"
>
  <!-- Background circle -->
  <circle
    cx="50"
    cy="50"
    r="{radius}"
    fill="none"
    stroke="lightgray"
    stroke-width="{stroke}"
  />
  
  <!-- Progress circle -->
  <circle
    cx="50"
    cy="50"
    r="{radius}"
    fill="none"
    stroke="purple"
    stroke-width="{stroke}"
    stroke-dasharray="{circumference} {circumference}"
    stroke-dashoffset="{offset}"
    stroke-linecap="round"
    transform="rotate(-90 50 50)"
  />
  
  <!-- Percentage Text -->
  <text
    x="50"
    y="50"
    class="fill-purple-600 font-bold"
    font-size="{size * 0.2}"
    dominant-baseline="middle"
    text-anchor="middle"
  >
    {progress}%
  </text>
</svg>
