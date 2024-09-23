<script>
  export let progress = 68;
  export let size = 150;
  export let stroke = 8;
  const radius = 50 - stroke / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = ((100 - progress) / 100) * circumference;
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
    stroke="#e5e5e5"
    stroke-width="{stroke}"
  />
  
  <!-- Progress circle -->
  <circle
    cx="50"
    cy="50"
    r="{radius}"
    fill="none"
    stroke="#6a4fd8"
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
    fill="#6a4fd8"
    font-weight="bold"
    font-size="{size * 0.2}"
    dominant-baseline="middle"
    text-anchor="middle"
  >
    {progress}%
  </text>
</svg>

<style>
  svg {
    margin-bottom: 20px; /* Adjust spacing */
  }
</style>
