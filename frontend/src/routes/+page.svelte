<script lang="ts">
    // Components
    import PageHeader from "$lib/components/common/PageHeader.svelte";
    import SignInCard from "$lib/components/sign_in/SignInCard.svelte";
    import CreateAccountCard from "$lib/components/sign_in/CreateAccountCard.svelte";
    import ResetPasswordCard from "$lib/components/sign_in/ResetPasswordCard.svelte";
    import ShowKeyCard from "$lib/components/sign_in/ShowKeyCard.svelte";
    import SuccessMessage from "$lib/components/common/SuccessMessage.svelte";
    import ErrorMessage from "$lib/components/common/ErrorMessage.svelte";
      
    // Navigation
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
      
    // API Handlers
    import { handleCreateAccount } from '$lib/utils/handleCreateAccount';
    import { handleSignIn } from '$lib/utils/handleSignIn';
    import { handleResetPassword } from '$lib/utils/handleResetPassword';
    import { navigationStore } from '$lib/stores/navigationStore';
      
    // State variables
    let isLoading = false;
    let error = "";
    let successMessage = "";
    let showUserKey = false;
    let userKey = "";
    let activeForm: 'signin' | 'create' | 'reset' = 'signin';
      
    // Form states
    let signInForm = {
        username: "",
        password: "",
    };
      
    let createAccountForm = {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    };
      
    let resetPasswordForm = {
        userKey: "",
        newPassword: "",
        confirmPassword: "",
    };
    
    // Initialize page
    onMount(() => {
        // Reset navigation history when arriving at login page
        navigationStore.reset();
        if (localStorage.getItem('authToken')) {
            localStorage.clear();
        }
    });
    
    // CREATE ACCOUNT -> talks with utils HandleCreateAccount
    async function onCreateAccount(event: Event) {
        isLoading = true;
        const result = await handleCreateAccount(event, createAccountForm);
        isLoading = result.isLoading;
        error = result.error ?? "";
        successMessage = result.successMessage ?? "";
    
        // If account creation was successful (we have a userKey)
        if (result.userKey) {
            userKey = result.userKey;
            showUserKey = result.showUserKey ?? false;
            
            // Reset the form
            createAccountForm = {
                username: "",
                email: "",
                password: "",
                confirmPassword: "",
            };
        }
    }
    
    // RESET PASSWORD -> talks with utils HandleResetPassword
    async function onResetPassword(event: Event) {
        isLoading = true;
        const result = await handleResetPassword(event, resetPasswordForm);
        isLoading = result.isLoading;
        error = result.error ?? "";
        successMessage = result.successMessage ?? "";
        
        // If password reset was successful
        if (result.successMessage) {
            // Reset the form
            resetPasswordForm = {
                userKey: "",
                newPassword: "",
                confirmPassword: "",
            };
            
            showUserKey = false;
        }
    }
    
    // SIGN IN -> talks with utils HandleSignIn
    async function onSignIn(event: Event) {
        isLoading = true;
        const result = await handleSignIn(event, signInForm);
        isLoading = result.isLoading;
        error = result.error ?? "";
        successMessage = result.successMessage ?? "";
        
        // If sign in was successful (we have a token)
        if (result.token) {
            // Reset the form
            signInForm = {
                username: "",
                password: "",
            };
            
            // Update success message with the username from the result
            successMessage = `Welcome back, ${result.username}!`;
            
            // Set initial navigation route before redirecting
            navigationStore.setLastRoute('/dashboard');
            
            // Redirect to dashboard (using goto)
            await goto('/dashboard');
        }
    }
</script>

<!-- Page Container -->
<div class="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
    <!-- Header Section -->
    <PageHeader title="INFLTR8" subtitle="" centered={true} />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 pb-12">
        <!-- Error Message -->
        {#if error}
            <ErrorMessage message={error} />
        {/if}

        <!-- Success Message -->
        {#if successMessage}
            <SuccessMessage message={successMessage} />
        {/if}

        <!-- Show User Key Card -->
        {#if showUserKey}
            <ShowKeyCard
                {userKey}
                onClose={() => (showUserKey = false)}
                onCopy={() => {
                    navigator.clipboard.writeText(userKey);
                    successMessage = "User key copied to clipboard!";
                }}
            />
        {/if}

        <!-- Form Selection Buttons -->
        <div class="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <button
                class="px-4 py-2 text-sm font-medium rounded-full border transition-colors
                    {activeForm === 'signin' 
                        ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}"
                on:click={() => activeForm = 'signin'}
            >
                Sign In
            </button>
            <button
                class="px-4 py-2 text-sm font-medium rounded-full border transition-colors
                    {activeForm === 'create' 
                        ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}"
                on:click={() => activeForm = 'create'}
            >
                Create Account
            </button>
            <button
                class="px-4 py-2 text-sm font-medium rounded-full border transition-colors
                    {activeForm === 'reset' 
                        ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}"
                on:click={() => activeForm = 'reset'}
            >
                Reset Password
            </button>
        </div>

        <!-- Auth Forms Container -->
        <div class="max-w-2xl mx-auto">
            {#if activeForm === 'signin'}
                <SignInCard {isLoading} {signInForm} onSubmit={onSignIn} />
            {:else if activeForm === 'create'}
                <CreateAccountCard
                    {isLoading}
                    {createAccountForm}
                    onSubmit={onCreateAccount}
                />
            {:else if activeForm === 'reset'}
                <ResetPasswordCard
                    {isLoading}
                    {resetPasswordForm}
                    onSubmit={onResetPassword}
                />
            {/if}
        </div>
    </main>
</div>