<script lang="ts">
    import { dndzone } from "svelte-dnd-action";
    import { flip } from "svelte/animate";
    import { settings } from "$lib/stores/settings";
    import { EXPLOITS } from "$lib/stores/constants";
    import { createEventDispatcher, onMount } from 'svelte';

    const dispatch = createEventDispatcher<{
        change: Array<{ id: string; value: string }>;
    }>();

    export let title: string;
    export let items: Array<{ id: string; value: string }> = [];
    export let placeholder: string = "Add new item";
    export let type: "ip" | "exploit" = "ip";
    export let id: string = crypto.randomUUID();
    export let disabled: boolean = false;
    
    let newItem = "";
    let error = "";
    let showExploitOptions = false;
    let internalItems = items;

    $: isDarkMode = $settings.theme === "dark";
    $: filteredExploits = type === "exploit" && newItem.trim() 
        ? EXPLOITS.filter(exploit => 
            exploit.toLowerCase().includes(newItem.toLowerCase()) &&
            !internalItems.map(item => item.value).includes(exploit)
          )
        : [];

    function validateIP(ip: string): { isValid: boolean; error?: string } {
        // Remove any whitespace
        ip = ip.trim();

        // Check if empty
        if (!ip) {
            return { isValid: false, error: "IP address cannot be empty" };
        }

        // Regular expression for IPv4 validation
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipv4Regex.test(ip)) {
            return { isValid: false, error: "Invalid IP address format" };
        }

        // Check if each octet is valid (0-255)
        const octets = ip.split('.');
        const validOctets = octets.every(octet => {
            const num = parseInt(octet, 10);
            return num >= 0 && num <= 255;
        });

        if (!validOctets) {
            return { isValid: false, error: "IP address octets must be between 0 and 255" };
        }

        // Check for reserved addresses
        if (ip === "0.0.0.0" || ip === "255.255.255.255") {
            return { isValid: false, error: "Reserved IP address not allowed" };
        }

        return { isValid: true };
    }

    function isDuplicate(value: string): boolean {
        return internalItems.some(item => item.value.toLowerCase() === value.toLowerCase());
    }

    // Watch for external changes to items
    $: if (items !== internalItems) {
        internalItems = items;
    }

    // Only dispatch when internal state changes
    function updateItems(newItems: Array<{ id: string; value: string }>) {
        internalItems = newItems;
        dispatch('change', internalItems);
    }

    function validateItem(value: string): boolean {
        if (!value.trim()) {
            error = "Item cannot be empty";
            return false;
        }
        
        if (isDuplicate(value.trim())) {
            error = `"${value}" already exists`;
            return false;
        }

        if (type === "ip") {
            const validation = validateIP(value);
            if (!validation.isValid) {
                error = validation.error || "Invalid IP format";
                return false;
            }
        } else if (type === "exploit") {
            if (!EXPLOITS.includes(value as any)) {
                error = "Invalid exploit type. Please select from the list.";
                return false;
            }
        }

        error = "";
        return true;
    }

    function addItem() {
        const trimmedValue = newItem.trim();
        if (validateItem(trimmedValue)) {
            const newItemObject = {
                id: crypto.randomUUID(),
                value: trimmedValue
            };
            updateItems([...internalItems, newItemObject]);
            newItem = "";
            error = "";
            showExploitOptions = false;
        }
    }

    function selectExploit(exploit: string) {
        newItem = exploit;
        showExploitOptions = false;
        addItem();
    }

    function removeItem(itemToRemove: { id: string; value: string }) {
        updateItems(internalItems.filter(item => item.id !== itemToRemove.id));
        error = "";
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Enter") {
            event.preventDefault();
            if (type === "exploit" && filteredExploits.length === 1) {
                selectExploit(filteredExploits[0]);
            } else {
                addItem();
            }
        } else if (event.key === "Escape") {
            showExploitOptions = false;
        }
    }

    function handleFocus() {
        if (type === "exploit") {
            showExploitOptions = true;
        }
    }

    function handleBlur(event: FocusEvent) {
        setTimeout(() => {
            showExploitOptions = false;
        }, 200);
    }

    async function handleFileUpload(event: Event) {
        const fileInput = event.target as HTMLInputElement;
        const file = fileInput.files?.[0];
        
        if (!file || !file.name.endsWith('.txt')) {
            error = "Please upload a .txt file";
            setTimeout(() => error = "", 3000);
            return;
        }

        try {
            const text = await file.text();
            const lines = text.split(/[\r\n]+/).map(line => line.trim()).filter(Boolean);
            
            let validItems = 0;
            const newItems = [...internalItems];
            
            for (const line of lines) {
                if (type === "ip") {
                    const validation = validateIP(line);
                    if (validation.isValid && !isDuplicate(line)) {
                        newItems.push({
                            id: crypto.randomUUID(),
                            value: line
                        });
                        validItems++;
                    }
                } else if (type === "exploit") {
                    if (EXPLOITS.includes(line as any) && !isDuplicate(line)) {
                        newItems.push({
                            id: crypto.randomUUID(),
                            value: line
                        });
                        validItems++;
                    }
                }
            }

            if (validItems > 0) {
                updateItems(newItems);
                error = `Added ${validItems} valid items`;
            } else {
                error = "No valid items found in file";
            }
            
        } catch (e) {
            console.error("Error processing file:", e);
            error = "Error processing file";
        } finally {
            setTimeout(() => error = "", 3000);
            fileInput.value = "";
        }
    }

    onMount(() => {
        // Validate initial items if any
        if (internalItems.length > 0) {
            const validatedItems = internalItems.filter(item => {
                if (type === "ip") {
                    const validation = validateIP(item.value);
                    return validation.isValid;
                } else if (type === "exploit") {
                    return EXPLOITS.includes(item.value as any);
                }
                return false;
            });
            
            if (validatedItems.length !== internalItems.length) {
                updateItems(validatedItems);
            }
        }
    });
</script>

<div class="space-y-4">
    <div class="space-y-2">
        <label 
            for="{id}-input"
            class="block text-sm font-medium {isDarkMode ? 'text-gray-200' : 'text-gray-700'}"
        >
            {title}
        </label>
        <div class="flex gap-2 relative {disabled ? 'opacity-50 pointer-events-none' : ''}">
            <div class="flex-1 space-y-1">
                <input
                    id="{id}-input"
                    type="text"
                    bind:value={newItem}
                    {placeholder}
                    on:keydown={handleKeydown}
                    on:focus={handleFocus}
                    on:blur={handleBlur}
                    class="w-full px-3 py-2 rounded-md border transition-colors
                        {isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-gray-200 focus:outline-none focus:border-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}
                        {error ? (isDarkMode ? 'border-gray-500' : 'border-red-500') : ''}"
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? `${id}-error` : undefined}
                />
                {#if error}
                    <p 
                        id="{id}-error" 
                        class="text-sm {isDarkMode ? 'text-gray-400' : 'text-red-500'}"
                        role="alert"
                    >
                        {error}
                    </p>
                {/if}

                {#if showExploitOptions && type === "exploit" && filteredExploits.length > 0}
                    <div 
                        class="absolute z-10 w-full mt-1 rounded-md shadow-lg
                            {isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}"
                    >
                        {#each filteredExploits as exploit}
                            <button
                                type="button"
                                class="w-full text-left px-4 py-2 text-sm first:rounded-t-md last:rounded-b-md
                                    {isDarkMode 
                                        ? 'hover:bg-gray-700 text-gray-200' 
                                        : 'hover:bg-gray-100 text-gray-900'}"
                                on:click={() => selectExploit(exploit)}
                            >
                                {exploit}
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
            <button
                type="button"
                on:click={addItem}
                class="px-4 py-2 rounded-md transition-colors
                    {isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 focus:outline-none focus:border-gray-500'
                        : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}"
                aria-label="Add item"
            >
                Add
            </button>
            
            <!-- File Upload Button -->
            <div class="relative">
                <input
                    id="{id}-file"
                    type="file"
                    accept=".txt"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    on:change={handleFileUpload}
                    aria-label="Upload text file"
                />
                <button
                    type="button"
                    class="px-4 py-2 rounded-md transition-colors
                        {isDarkMode
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 focus:outline-none focus:border-gray-500'
                            : 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'}"
                    aria-label="Upload from file"
                >
                    <svg 
                        class="h-5 w-5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path 
                            stroke-linecap="round" 
                            stroke-linejoin="round" 
                            stroke-width="2" 
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <section
        use:dndzone={{items: internalItems, flipDurationMs: 200}}
        on:consider={(e) => updateItems(e.detail.items)}
        on:finalize={(e) => updateItems(e.detail.items)}
        class="space-y-2"
    >
        {#each internalItems as item (item.id)}
            <div
                class="flex items-center justify-between p-2 rounded-md group
                    {isDarkMode 
                        ? 'bg-gray-800 border border-gray-700 text-gray-200' 
                        : 'bg-gray-50 border border-gray-200 text-gray-900'}"
                animate:flip={{duration: 200}}
            >
                <div class="flex items-center gap-2">
                    <svg 
                        class="h-4 w-4 cursor-grab
                            {isDarkMode ? 'text-gray-500' : 'text-gray-400'}" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path 
                            stroke-linecap="round" 
                            stroke-linejoin="round" 
                            stroke-width="2" 
                            d="M4 8h16M4 16h16"
                        />
                    </svg>
                    <span>{item.value}</span>
                </div>
                <button
                    type="button"
                    on:click={() => removeItem(item)}
                    class="opacity-0 group-hover:opacity-100 transition-opacity
                        {isDarkMode 
                            ? 'text-gray-500 hover:text-gray-300' 
                            : 'text-gray-400 hover:text-red-500'}"
                    aria-label="Remove {item.value}"
                >
                    <svg 
                        class="h-4 w-4" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path 
                            stroke-linecap="round" 
                            stroke-linejoin="round" 
                            stroke-width="2" 
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
        {/each}
    </section>
</div>