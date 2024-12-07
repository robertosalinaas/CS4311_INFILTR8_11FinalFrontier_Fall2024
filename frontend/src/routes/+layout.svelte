<script lang="ts">
    import "../app.css";
    import { page } from '$app/stores';
    
    // Get the current route for dynamic titles
    $: path = $page.url.pathname;
    $: title = getTitle(path);
    
    // Function to get the title based on the current route
    function getTitle(path: string): string {
        switch(path) {
            case '/':
                return 'INFILTR8 - Account';
            case '/support':
                return 'INFILTR8 - Support';
            case '/analysis':
                return 'INFILTR8 - Analysis';
            case '/settings':
                return 'INFILTR8 - Settings';
            case '/dashboard':
                return 'INFILTR8 - Projects';
            case '/dashboard_create_project':
                return 'INFILTR8 - Create';
            case '/reports':
                return 'INFILTR8 - Reports';
            default:
                return 'INFILTR8';
        }
    }
</script>

<svelte:head>
    <title>{title}</title>
    <meta name="description" content="INFILTR8 - Network Vulnerability Analysis Tool" />
</svelte:head>

<slot />