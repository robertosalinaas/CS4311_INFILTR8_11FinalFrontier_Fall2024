<script lang="ts">
    import { goto } from '$app/navigation';
    let isAuthenticated = false;
    let isLoading = false;
    let username = '';
    let password = '';
    let errorMessage = '';

    async function handleLogin() {
        isLoading = true;
        errorMessage = '';

        try {
            const response = await fetch('http://localhost:3000/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                // Store the session ID
                localStorage.setItem('sessionId', data.sessionId);
                goto('/home');
            } else {
                const error = await response.json();
                errorMessage = error.message || 'Invalid credentials';
            }
        } catch (error) {
            console.error('Error during login:', error);
            errorMessage = 'Error connecting to server';
        } finally {
            isLoading = false;
        }
    }

    // Clear any existing session data on component mount
    import { onMount } from 'svelte';
    onMount(() => {
        localStorage.removeItem('sessionId');
    });
</script>

<div class="min-h-screen bg-gray-50">
    <header class="bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <div class="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
            <h1 class="text-4xl font-bold">User Login</h1>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-8">
        <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg">
            <div class="px-6 py-8">
                <h2 class="text-center text-3xl font-bold text-gray-800">Login</h2>
                <form on:submit|preventDefault={handleLogin} class="space-y-8 mt-6">
                    <div>
                        <label for="username" class="block text-lg font-medium text-gray-700">Username</label>
                        <input 
                            type="text" 
                            id="username" 
                            bind:value={username} 
                            class="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-lg px-4 py-3"
                            placeholder="Enter your username"
                            required 
                        />
                    </div>
                    <div>
                        <label for="password" class="block text-lg font-medium text-gray-700">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            bind:value={password} 
                            class="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-lg px-4 py-3"
                            placeholder="Enter your password"
                            required 
                        />
                    </div>
                    {#if errorMessage}
                        <p class="text-red-600 text-lg">{errorMessage}</p>
                    {/if}
                    <button 
                        type="submit" 
                        class="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300 text-lg font-medium"
                        disabled={isLoading}
                    >
                        {#if isLoading}
                            Authenticating...
                        {:else}
                            Sign In
                        {/if}
                    </button>
                </form>
                            <!-- Added User Login Button -->
            <div class="mt-6 text-center">
                <a 
                    href="/admin"
                    class="inline-block bg-gray-200 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors duration-300 text-lg font-medium"
                >
                    Go to ADMIN Login
                </a>
            </div>
            </div>
        </div>
    </main>
</div>
