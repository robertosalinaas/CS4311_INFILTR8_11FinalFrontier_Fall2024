<script>
    export let isOpen = true; 
    import Navbar from '$lib/navbar.svelte';

    // Import the components needed for the testing page
    import CircularProgress from '../../lib/CircularProgress.svelte';
    import ScheduleAttacks from '../../lib/ScheduleAttacks.svelte';
    import Summary from '../../lib/Summary.svelte';
    import TestResults from '../../lib/TestResults.svelte';
</script>

<style>
    main {
        transition: margin-left 0.3s ease;
    }
    
    .main-collapsed {
        margin-left: 0;
    }
    
    .main-expanded {
        margin-left: 250px;
    }
</style>

<Navbar bind:isOpen/>

<!-- Main page content -->
<main class="{isOpen ? 'main-expanded' : 'main-collapsed'}">
    <CircularProgress />
    <TestResults />
    <ScheduleAttacks />
    <Summary />
</main>