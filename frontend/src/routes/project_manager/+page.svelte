<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import Navbar from '$lib/navbar.svelte';
    import { settings } from '$lib/stores/settings';
    import { flip } from 'svelte/animate';
    import { dndzone } from 'svelte-dnd-action';

    interface IPItem {
        id: string;
        ip: string;
    }

    interface Project {
        id: string;
        name: string;
        scopeIPs: IPItem[];
        offLimitIPs: IPItem[];
        allowedExploits: string[];
    }

    interface DndEvent<T = any> {
        detail: {
            items: T[];
        };
    }

    export let isOpen = true;
    let username = '';
    let timeOfDay = '';
    let ipError = '';
    let newExploit = '';
    let newIP = '';
    let newOffLimitIP = '';
    let projects: Project[] = [];
    let selectedProject: Project | null = null;
    let isCreatingProject = false;
    let showProjectDetails = false;
    let scopeDragDisabled = false;
    let offLimitDragDisabled = false;

    let newProject = {
        name: '',
        scopeIPs: [] as IPItem[],
        offLimitIPs: [] as IPItem[],
        allowedExploits: [] as string[]
    };

    // Theme-specific classes
    $: themeClasses = {
        container: $settings.theme === 'light' 
            ? 'bg-gray-100' 
            : $settings.theme === 'dark' 
                ? 'bg-gray-800' 
                : 'bg-yellow-50',
        card: $settings.theme === 'light'
            ? 'bg-white'
            : $settings.theme === 'dark'
                ? 'bg-gray-900'
                : 'bg-yellow-100',
        text: $settings.theme === 'light'
            ? 'text-gray-800'
            : $settings.theme === 'dark'
                ? 'text-gray-100'
                : 'text-gray-900',
        subtext: $settings.theme === 'light'
            ? 'text-gray-600'
            : $settings.theme === 'dark'
                ? 'text-gray-400'  // This line was missing
                : 'text-gray-700',
        border: $settings.theme === 'light'
            ? 'border-gray-200'
            : $settings.theme === 'dark'
                ? 'border-gray-700'
                : 'border-yellow-200'
    };

    function handleDndConsider(event: CustomEvent<DndEvent<IPItem>>, type: 'scope' | 'offlimit') {
        const { items } = event.detail;
        if (type === 'scope') {
            newProject.scopeIPs = [...items];
        } else {
            newProject.offLimitIPs = [...items];
        }
    }

    function handleDndFinalize(event: CustomEvent<DndEvent<IPItem>>, type: 'scope' | 'offlimit') {
        const { items } = event.detail;
        if (type === 'scope') {
            newProject.scopeIPs = [...items];
        } else {
            newProject.offLimitIPs = [...items];
        }
    }

    function resetNewProject() {
        newProject = {
            name: '',
            scopeIPs: [],
            offLimitIPs: [],
            allowedExploits: []
        };
        newIP = '';
        newOffLimitIP = '';
        newExploit = '';
        ipError = '';
    }

    function getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        if (hour < 18) return 'afternoon';
        return 'evening';
    }

    function validateIP(ip: string): boolean {
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(ip)) {
            ipError = 'Invalid IP format';
            return false;
        }
        const parts = ip.split('.');
        const valid = parts.every(part => {
            const num = parseInt(part);
            return num >= 0 && num <= 255;
        });
        if (!valid) {
            ipError = 'IP numbers must be between 0 and 255';
            return false;
        }
        ipError = '';
        return true;
    }

    function addScopeIP() {
        if (newIP && validateIP(newIP)) {
            if (!newProject.scopeIPs.find(item => item.ip === newIP)) {
                newProject.scopeIPs = [...newProject.scopeIPs, { id: newIP, ip: newIP }];
                newIP = '';
                ipError = '';
            } else {
                ipError = 'IP already exists in scope';
            }
        }
    }

    function removeScopeIP(ipItem: IPItem) {
        newProject.scopeIPs = newProject.scopeIPs.filter(item => item.id !== ipItem.id);
    }

    function addOffLimitIP() {
        if (newOffLimitIP && validateIP(newOffLimitIP)) {
            if (!newProject.offLimitIPs.find(item => item.ip === newOffLimitIP)) {
                newProject.offLimitIPs = [...newProject.offLimitIPs, { id: newOffLimitIP, ip: newOffLimitIP }];
                newOffLimitIP = '';
                ipError = '';
            } else {
                ipError = 'IP already exists in off-limit list';
            }
        }
    }

    function removeOffLimitIP(ipItem: IPItem) {
        newProject.offLimitIPs = newProject.offLimitIPs.filter(item => item.id !== ipItem.id);
    }

    function addExploit() {
        if (newExploit && !newProject.allowedExploits.includes(newExploit)) {
            newProject.allowedExploits = [...newProject.allowedExploits, newExploit];
            newExploit = '';
        }
    }

    function removeExploit(exploit: string) {
        newProject.allowedExploits = newProject.allowedExploits.filter(e => e !== exploit);
    }

    async function handleIPFileUpload(event: Event) {
        const fileInput = event.target as HTMLInputElement;
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            const text = await file.text();
            const ips = text.split(/[\n,]/)
                .map(ip => ip.trim())
                .filter(ip => validateIP(ip))
                .map(ip => ({ id: ip, ip }));
            const existingIps = new Set(newProject.scopeIPs.map(item => item.ip));
            const newIps = ips.filter(ip => !existingIps.has(ip.ip));
            newProject.scopeIPs = [...newProject.scopeIPs, ...newIps];
            fileInput.value = ''; // Reset file input
        }
    }

    async function createProject() {
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
            goto('/user_login');
            return;
        }

        if (!newProject.name.trim()) {
            alert('Project name is required');
            return;
        }

        try {
            const payload = {
                name: newProject.name,
                scopeIPs: newProject.scopeIPs.map(item => ({ address: item.ip })),
                offLimitIPs: newProject.offLimitIPs.map(item => ({ address: item.ip })),
                allowedExploits: newProject.allowedExploits.map(exploit => ({ name: exploit }))
            };

            const response = await fetch('http://localhost:3000/api/projects', {
                method: 'POST',
                headers: {
                    'Authorization': sessionId,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                await fetchProjects();
                isCreatingProject = false;
                resetNewProject();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to create project');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Failed to create project. Please try again.');
        }
    }

    async function deleteProject(projectId: string) {
        if (!confirm('Are you sure you want to delete this project?')) {
            return;
        }

        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
            goto('/user_login');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/projects/${projectId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': sessionId
                }
            });

            if (response.ok) {
                await fetchProjects();
                if (selectedProject?.id === projectId) {
                    selectedProject = null;
                    showProjectDetails = false;
                }
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to delete project');
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project. Please try again.');
        }
    }

    async function fetchProjects() {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
        goto('/user_login');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/projects', {
            headers: {
                'Authorization': sessionId
            }
        });

        if (response.ok) {
            const projectsData = await response.json();
            projects = projectsData.map((project: any) => ({
                id: project.id,
                name: project.name,
                scopeIPs: Array.isArray(project.scopeIPs) ? project.scopeIPs.map((ip: any) => ({
                    id: ip.id || ip.address,
                    ip: ip.address || ip.ip
                })) : [],
                offLimitIPs: Array.isArray(project.offLimitIPs) ? project.offLimitIPs.map((ip: any) => ({
                    id: ip.id || ip.address,
                    ip: ip.address || ip.ip
                })) : [],
                allowedExploits: Array.isArray(project.allowedExploits) ? 
                    project.allowedExploits.map((exploit: any) => exploit.name || exploit) : []
            }));
        } else {
            const error = await response.json();
            console.error('Error fetching projects:', error);
            if (response.status === 401) {
                localStorage.removeItem('sessionId');
                goto('/user_login');
            }
        }
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
}


async function selectProject(projectId: string) {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
        goto('/user_login');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/projects/${projectId}`, {
            headers: {
                'Authorization': sessionId
            }
        });

        if (response.ok) {
            const projectData = await response.json();
            selectedProject = {
                id: projectData.id,
                name: projectData.name,
                scopeIPs: Array.isArray(projectData.scopeIPs) ? projectData.scopeIPs.map((ip: any) => ({
                    id: ip.id || ip.address,
                    ip: ip.address || ip.ip
                })) : [],
                offLimitIPs: Array.isArray(projectData.offLimitIPs) ? projectData.offLimitIPs.map((ip: any) => ({
                    id: ip.id || ip.address,
                    ip: ip.address || ip.ip
                })) : [],
                allowedExploits: Array.isArray(projectData.allowedExploits) ? 
                    projectData.allowedExploits.map((exploit: any) => exploit.name || exploit) : []
            };
            showProjectDetails = true;
        } else {
            const error = await response.json();
            alert(error.message || 'Failed to fetch project details');
        }
    } catch (error) {
        console.error('Error fetching project details:', error);
        alert('Failed to fetch project details. Please try again.');
    }
}


    onMount(async () => {
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
            goto('/user_login');
            return;
        }

        try {
            const authResponse = await fetch('http://localhost:3000/api/auth/status', {
                headers: {
                    'Authorization': sessionId
                }
            });
            
            if (!authResponse.ok) {
                localStorage.removeItem('sessionId');
                goto('/user_login');
                return;
            }

            const userData = await authResponse.json();
            username = userData.user.username;
            timeOfDay = getTimeOfDay();
            
            await fetchProjects();
        } catch (error) {
            console.error('Error:', error);
            localStorage.removeItem('sessionId');
            goto('/user_login');
        }
    });
</script>

<Navbar bind:isOpen />

<main class="p-6 {isOpen ? 'main-expanded' : 'main-collapsed'} min-h-screen transition-all duration-500 ease-in-out {themeClasses.container}">
    <div class="max-w-7xl mx-auto space-y-8">
        <!-- Greeting -->
        <div class="mb-8 mt-4 ml-2">
            <div class="flex flex-col">
                <div class="flex items-center gap-2">
                    <h1 class="text-3xl lg:text-4xl font-bold {themeClasses.text}">
                        Good {timeOfDay},
                    </h1>
                    {#if username}
                        <span class="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 text-transparent bg-clip-text">
                            {username}!
                        </span>
                    {/if}
                </div>
                <p class="{themeClasses.subtext} text-xl mt-2">Manage your projects and their settings</p>
            </div>
        </div>

        <!-- Projects Grid -->
        <div class="{themeClasses.card} rounded-xl shadow-lg p-8">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-semibold {themeClasses.text}">Your Projects</h2>
                <button
                    type="button"
                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    on:click={() => {
                        isCreatingProject = !isCreatingProject;
                        showProjectDetails = false;
                        if (!isCreatingProject) resetNewProject();
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                    {isCreatingProject ? 'Cancel' : 'New Project'}
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each projects as project}
                    <div 
                        class="relative p-6 rounded-lg border {themeClasses.border} hover:shadow-md transition-all duration-200"
                        class:ring-2={selectedProject?.id === project.id}
                        class:ring-blue-500={selectedProject?.id === project.id}
                    >
                        <div class="flex flex-col h-full">
                            <div class="flex justify-between items-start mb-4">
                                <h3 class="text-lg font-semibold {themeClasses.text}">{project.name}</h3>
                                <button
                                    type="button"
                                    class="text-red-500 hover:text-red-700 p-2"
                                    on:click|stopPropagation={() => deleteProject(project.id)}
                                    aria-label="Delete project"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <div class="flex-grow space-y-3 {themeClasses.subtext}">
                                <div class="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clip-rule="evenodd" />
                                    </svg>
                                    <span>Scope IPs: {project.scopeIPs.length}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd" />
                                    </svg>
                                    <span>Off-limit IPs: {project.offLimitIPs.length}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                                    </svg>
                                    <span>Exploits: {project.allowedExploits.length ? `${project.allowedExploits.length} specified` : 'All allowed'}</span>
                                </div>
                            </div>                            
                            <button
                            class="mt-4 w-full py-2 px-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            on:click={() => {
                                selectProject(project.id);
                                isCreatingProject = false;
                            }}
                        >
                            View Details
                        </button>
                        
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Create/Edit Project Form -->
        {#if isCreatingProject}
            <div class="{themeClasses.card} rounded-xl shadow-lg p-8">
                <h2 class="text-2xl font-semibold mb-6 {themeClasses.text}">Create New Project</h2>
                <form on:submit|preventDefault={createProject} class="space-y-8">
                    <!-- Project Name -->
                    <div>
                        <label for="projectName" class="block font-medium mb-2 {themeClasses.text}">Project Name</label>
                        <input
                            id="projectName"
                            type="text"
                            bind:value={newProject.name}
                            class="w-full p-3 rounded-lg border {themeClasses.border} {themeClasses.card} {themeClasses.text}"
                            required
                            placeholder="Enter project name"
                        />
                    </div>

                    <!-- Scope IPs -->
                    <div>
                        <label for="scopeIP" class="block font-medium mb-2 {themeClasses.text}">Scope IP List</label>
                        <div class="flex space-x-2 mb-2">
                            <input
                                id="scopeIP"
                                type="text"
                                bind:value={newIP}
                                placeholder="Enter IP address (e.g., 192.168.1.1)"
                                class="flex-1 p-3 rounded-lg border {themeClasses.border} {themeClasses.card} {themeClasses.text}"
                                on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addScopeIP())}
                            />
                            <button
                                type="button"
                                class="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                on:click={addScopeIP}
                            >
                                Add IP
                            </button>
                        </div>
                        {#if ipError}
                            <p class="text-red-500 text-sm mt-1">{ipError}</p>
                        {/if}
                        <section
                            use:dndzone={{items: newProject.scopeIPs, flipDurationMs: 200, dragDisabled: scopeDragDisabled, idField: 'id'}}
                            on:consider={(e) => handleDndConsider(e, 'scope')}
                            on:finalize={(e) => handleDndFinalize(e, 'scope')}
                            class="space-y-2 mt-4"
                        >
                            {#each newProject.scopeIPs as item (item.id)}
                                <div 
                                class="flex items-center justify-between p-2 rounded-lg border {themeClasses.border} cursor-move {$settings.theme === 'light' ? 'bg-gray-50' : $settings.theme === 'dark' ? 'bg-gray-800' : 'bg-yellow-50'}"
                                animate:flip={{duration: 200}}
                            >
                                <div class="flex items-center gap-2">
                                    <svg class="h-5 w-5 text-gray-500 cursor-grab" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                                    </svg>
                                    <span class="{$settings.theme === 'light' ? 'text-gray-900' : $settings.theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}">{item.ip}</span>
                                </div>
                                <button
                                    type="button"
                                    class="text-red-500 hover:text-red-700"
                                    on:click={() => removeScopeIP(item)}
                                >
                                    Remove
                                </button>
                            </div>
                            {/each}
                        </section>
                        <div class="mt-4">
                            <label for="ipFile" class="block font-medium mb-2 {themeClasses.text}">Upload IP List</label>
                            <input
                                id="ipFile"
                                type="file"
                                accept=".txt"
                                on:change={handleIPFileUpload}
                                class="w-full"
                            />
                        </div>
                    </div>

                    <!-- Off-Limit IPs -->
                    <div>
                        <label for="offLimitIP" class="block font-medium mb-2 {themeClasses.text}">Off-Limit IP List</label>
                        <div class="flex space-x-2 mb-2">
                            <input
                                id="offLimitIP"
                                type="text"
                                bind:value={newOffLimitIP}
                                placeholder="Enter IP address"
                                class="flex-1 p-3 rounded-lg border {themeClasses.border} {themeClasses.card} {themeClasses.text}"
                                on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addOffLimitIP())}
                            />
                            <button
                                type="button"
                                class="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700"
                                on:click={addOffLimitIP}
                            >
                                Add IP
                            </button>
                        </div>
                        {#if ipError}
                            <p class="text-red-500 text-sm mt-1">{ipError}</p>
                        {/if}
                        <section
                            use:dndzone={{items: newProject.offLimitIPs, flipDurationMs: 200, dragDisabled: offLimitDragDisabled, idField: 'id'}}
                            on:consider={(e) => handleDndConsider(e, 'offlimit')}
                            on:finalize={(e) => handleDndFinalize(e, 'offlimit')}
                            class="space-y-2 mt-4"
                        >
                            {#each newProject.offLimitIPs as item (item.id)}
                            <!-- In the Off-Limit IPs section -->
                            <div 
                                class="flex items-center justify-between p-2 rounded-lg border {themeClasses.border} cursor-move {$settings.theme === 'light' ? 'bg-gray-50' : $settings.theme === 'dark' ? 'bg-gray-800' : 'bg-yellow-50'}"
                                animate:flip={{duration: 200}}
                            >
                                <div class="flex items-center gap-2">
                                    <svg class="h-5 w-5 text-gray-500 cursor-grab" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                                    </svg>
                                    <span class="{$settings.theme === 'light' ? 'text-gray-900' : $settings.theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}">{item.ip}</span>
                                </div>
                                <button
                                    type="button"
                                    class="text-red-500 hover:text-red-700"
                                    on:click={() => removeOffLimitIP(item)}
                                >
                                    Remove
                                </button>
                            </div>
                            {/each}
                        </section>
                    </div>

                    <!-- Exploits -->
                    <div>
                        <label for="exploits" class="block font-medium mb-2 {themeClasses.text}">Allowed Exploits</label>
                        <p class="text-sm {themeClasses.subtext} mb-4">Leave empty to allow all exploits</p>
                        <div class="flex space-x-2">
                            <input
                                id="exploits"
                                type="text"
                                bind:value={newExploit}
                                placeholder="Enter exploit name"
                                class="flex-1 p-3 rounded-lg border {themeClasses.border} {themeClasses.card} {themeClasses.text}"
                                on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addExploit())}
                            />
                            <button
                                type="button"
                                class="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700"
                                on:click={addExploit}
                            >
                                Add Exploit
                            </button>
                        </div>
                        <div class="space-y-2 mt-4">
                            {#each newProject.allowedExploits as exploit (exploit)}
                                <div 
                                    class="flex items-center justify-between p-2 rounded-lg border {themeClasses.border} cursor-move {$settings.theme === 'light' ? 'bg-gray-50' : $settings.theme === 'dark' ? 'bg-gray-800' : 'bg-yellow-50'}"
                                    animate:flip={{duration: 200}}
                                >
                                    <div class="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 cursor-grab" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                                        </svg>
                                        <span class="{$settings.theme === 'light' ? 'text-gray-900' : $settings.theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}">{exploit}</span>
                                    </div>
                                    <button
                                        type="button"
                                        class="text-red-500 hover:text-red-700"
                                        on:click={() => removeExploit(exploit)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            {/each}
                        </div>
                    </div>

                    <!-- Form Buttons -->
                    <div class="flex justify-end space-x-4 mt-8">
                        <button
                            type="button"
                            class="px-6 py-2 rounded-lg border {themeClasses.border} {themeClasses.text} hover:bg-gray-100"
                            on:click={() => {
                                isCreatingProject = false;
                                resetNewProject();
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            class="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        {/if}

        <!-- Project Details View -->
        <!-- Project Details View -->
        {#if showProjectDetails && selectedProject}
            <div class="{themeClasses.card} rounded-xl shadow-lg p-8">
                <div class="space-y-6">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-semibold {themeClasses.text}">{selectedProject.name}</h2>
                            <button
                            type="button"
                            class="text-red-500 hover:text-red-700 p-2"
                            on:click={() => {
                                deleteProject(selectedProject.id);
                            }}
                            aria-label="Delete project"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    
                    <div>
                        <h3 class="font-medium mb-2 {themeClasses.text} flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clip-rule="evenodd" />
                            </svg>
                            Scope IP List ({selectedProject.scopeIPs.length})
                        </h3>
                        {#if selectedProject.scopeIPs.length === 0}
                            <p class="p-2 rounded-lg {themeClasses.border} {themeClasses.text} {$settings.theme === 'light' ? 'bg-gray-50' : $settings.theme === 'dark' ? 'bg-gray-800' : 'bg-yellow-50'}">
                                No scope IPs defined
                            </p>
                        {:else}
                            <div class="space-y-2">
                                {#each selectedProject.scopeIPs as item}
                                    <div class="p-2 rounded-lg {themeClasses.border} {themeClasses.text} {$settings.theme === 'light' ? 'bg-gray-50' : $settings.theme === 'dark' ? 'bg-gray-800' : 'bg-yellow-50'}">
                                        {item.ip}
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>

                    <div>
                        <h3 class="font-medium mb-2 {themeClasses.text} flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd" />
                            </svg>
                            Off-Limit IP List ({selectedProject.offLimitIPs.length})
                        </h3>
                        {#if selectedProject.offLimitIPs.length === 0}
                            <p class="p-2 rounded-lg {themeClasses.border} {themeClasses.text} {$settings.theme === 'light' ? 'bg-gray-50' : $settings.theme === 'dark' ? 'bg-gray-800' : 'bg-yellow-50'}">
                                No off-limit IPs defined
                            </p>
                        {:else}
                            <div class="space-y-2">
                                {#each selectedProject.offLimitIPs as item}
                                    <div class="p-2 rounded-lg {themeClasses.border} {themeClasses.text} {$settings.theme === 'light' ? 'bg-gray-50' : $settings.theme === 'dark' ? 'bg-gray-800' : 'bg-yellow-50'}">
                                        {item.ip}
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>

                    <div>
                        <h3 class="font-medium mb-2 {themeClasses.text} flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                            </svg>
                            Exploits ({selectedProject.allowedExploits.length ? `${selectedProject.allowedExploits.length} specified` : 'All allowed'})
                        </h3>
                        {#if selectedProject.allowedExploits.length === 0}
                            <p class="p-2 rounded-lg {themeClasses.border} {themeClasses.text} {$settings.theme === 'light' ? 'bg-gray-50' : $settings.theme === 'dark' ? 'bg-gray-800' : 'bg-yellow-50'}">
                                All exploits allowed
                            </p>
                        {:else}
                            <div class="space-y-2">
                                {#each selectedProject.allowedExploits as exploit}
                                    <div class="p-2 rounded-lg {themeClasses.border} {themeClasses.text} {$settings.theme === 'light' ? 'bg-gray-50' : $settings.theme === 'dark' ? 'bg-gray-800' : 'bg-yellow-50'}">
                                        {exploit}
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        {/if}
    </div>
</main>

<style>
    :global(.main-expanded) {
        margin-left: 250px;
    }

    :global(.main-collapsed) {
        margin-left: 0;
    }

    @media (max-width: 768px) {
        :global(.main-expanded) {
            margin-left: 0;
        }
    }
</style>
