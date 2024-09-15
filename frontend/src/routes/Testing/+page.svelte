<script>    
    import Navbar from '$lib/navbar.svelte';
    import CircularProgress from '../../lib/CircularProgress.svelte'; // Import any components needed for the testing page
    import TestResults from '../../lib/TestResults.svelte'; 
    import ScheduleAttacks from '../../lib/ScheduleAttacks.svelte'; 
    import Summary from '../../lib/Summary.svelte';
</script>
<Navbar />
<CircularProgress />
<TestResults />
<ScheduleAttacks />
<Summary />
