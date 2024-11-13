<script lang="ts">
    let isAuthenticated = false;
    let isLoading = false;
    let username = '';
    let password = '';
    let errorMessage = '';

    // New user form
    let newUsername = '';
    let newPassword = '';
    let newRole = 'user';

    // Users fetched from the backend
    let users = [];

    // Admin login function
    async function handleLogin() {
        isLoading = true;
        errorMessage = '';

        try {
            const response = await fetch('http://localhost:3000/api/admin_login', {
            method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                isAuthenticated = true;
                await fetchUsers(); // Fetch users after successful login
            } else if (response.status === 403) {
                errorMessage = 'Access denied. Admins only.';
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

    async function handleCreateUser() {
        isLoading = true;

        try {
            const response = await fetch('http://localhost:3000/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: newUsername,
                    password: newPassword,
                    role: newRole,
                }),
            });

            if (response.ok) {
                const newUser = await response.json();
                users = [...users, newUser.user]; // Update user list with the new user
                newUsername = '';
                newPassword = '';
                newRole = 'user';
            } else {
                const error = await response.json();
                console.error('Error creating user:', error.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error creating user:', error);
        } finally {
            isLoading = false;
        }
    }

    async function deleteUser(username: string) {
        isLoading = true;

        try {
            const response = await fetch(`http://localhost:3000/api/users/${username}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                users = users.filter(user => user.username !== username); // Remove the user from the list
            } else {
                console.error('Error deleting user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        } finally {
            isLoading = false;
        }
    }

    async function fetchUsers() {
        isLoading = true;

        try {
            const response = await fetch('http://localhost:3000/api/users');
            if (response.ok) {
                users = await response.json();
            } else {
                console.error('Error fetching users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            isLoading = false;
        }
    }

    // Fetch users when authenticated
    if (isAuthenticated) {
        fetchUsers();
    }
</script>

<div class="min-h-screen bg-gray-50">
    <header class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div class="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
            <h1 class="text-4xl font-bold">INFILTR8 Admin Panel</h1>
            {#if isAuthenticated}
                <button 
                    on:click={() => isAuthenticated = false}
                    class="text-lg text-white hover:text-gray-300 transition-colors duration-300"
                >
                    Logout
                </button>
            {/if}
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-8">
        {#if !isAuthenticated}
            <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg">
                <div class="px-6 py-8">
                    <h2 class="text-center text-3xl font-bold text-gray-800">Admin Login</h2>
                    <form on:submit|preventDefault={handleLogin} class="space-y-8 mt-6">
                        <div>
                            <label for="username" class="block text-lg font-medium text-gray-700">Username</label>
                            <input 
                                type="text" 
                                id="username" 
                                bind:value={username} 
                                class="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg px-4 py-3"
                                placeholder="Enter ADMIN username"
                                required 
                            />
                        </div>
                        <div>
                            <label for="password" class="block text-lg font-medium text-gray-700">Password</label>
                            <input 
                                type="password" 
                                id="password" 
                                bind:value={password} 
                                class="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg px-4 py-3"
                                placeholder="Enter ADMIN password"
                                required 
                            />
                        </div>
                        {#if errorMessage}
                            <p class="text-red-600 text-lg">{errorMessage}</p>
                        {/if}
                        <button 
                            type="submit" 
                            class="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 text-lg font-medium"
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
                    href="/user_login"
                    class="inline-block bg-gray-200 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors duration-300 text-lg font-medium"
                >
                    Go to User Login
                </a>
            </div>
                </div>
            </div>
        {:else}
            <div class="grid gap-6 md:grid-cols-2">
                <section class="bg-white rounded-lg shadow-lg p-6">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Create New User</h2>
                    <form on:submit|preventDefault={handleCreateUser} class="space-y-6">
                        <div>
                            <label for="newUsername" class="block text-lg font-medium text-gray-700">Username</label>
                            <input 
                                type="text" 
                                id="newUsername" 
                                bind:value={newUsername} 
                                class="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg px-4 py-3"
                                placeholder="Enter new username"
                                required 
                            />
                        </div>
                        <div>
                            <label for="newPassword" class="block text-lg font-medium text-gray-700">Password</label>
                            <input 
                                type="password" 
                                id="newPassword" 
                                bind:value={newPassword} 
                                class="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg px-4 py-3"
                                placeholder="Enter new password"
                                required 
                            />
                        </div>
                        <div>
                            <label for="newRole" class="block text-lg font-medium text-gray-700">Role</label>
                            <select 
                                id="newRole" 
                                bind:value={newRole} 
                                class="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg px-4 py-3"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <button 
                            type="submit" 
                            class="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300 text-lg font-medium"
                        >
                            Create User
                        </button>
                    </form>
                </section>

                <section class="bg-white rounded-lg shadow-lg">
                    <div class="px-6 py-4 border-b">
                        <h2 class="text-2xl font-bold text-gray-800">User Management</h2>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Username</th>
                                    <th class="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Role</th>
                                    <th class="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                {#each users as user}
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-6 py-4 text-lg text-gray-800">{user.username}</td>
                                        <td class="px-6 py-4 text-lg">
                                            <span class="px-2 inline-flex text-lg leading-5 font-semibold rounded-full
                                                {user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                'bg-green-100 text-green-800'}">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 text-lg">
                                            <button 
                                                on:click={() => deleteUser(user.username)} 
                                                class="text-red-600 hover:text-red-800 transition-colors duration-300 font-medium"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        {/if}
    </main>
</div>
