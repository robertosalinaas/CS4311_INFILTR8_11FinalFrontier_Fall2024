<script lang="ts">
    import { settings } from "$lib/stores/settings";
    import { createEventDispatcher } from 'svelte';

    export let isProcessing = false;
    export let id: string = crypto.randomUUID();

    const dispatch = createEventDispatcher<{
        ipsFound: string[];
        fileSelected: { name: string; file: File };
    }>();

    let error = "";
    let dragOver = false;

    $: isDarkMode = $settings.theme === "dark";

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

    async function extractIPsFromNessus(text: string): Promise<string[]> {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "text/xml");
            const ips = new Set<string>();

            // Function to check if IP is likely a real host IP
            const isLikelyHostIP = (ip: string): boolean => {
                const parts = ip.split('.').map(n => parseInt(n, 10));
                
                // Filter out obvious non-host patterns
                const unlikelyPatterns = [
                    // Broadcast addresses
                    ip === '255.255.255.0' || ip === '255.255.255.255' || ip === '255.0.0.0',
                    // Obvious version numbers (all parts less than 20)
                    parts.every(n => n < 20),
                    // Sequences that look exactly like versions (1.2.3.4)
                    parts.every((num, i) => i === 0 || num === parts[i-1] + 1),
                    // Reserved and special use addresses
                    ip === '0.0.0.0',
                    parts[0] === 0, // Leading zero networks
                    parts[0] === 127 && parts[1] === 0 && parts[2] === 0 && parts[3] === 1, // Localhost
                ];

                if (unlikelyPatterns.some(pattern => pattern)) {
                    return false;
                }

                // Common private IP ranges
                const privateRanges = [
                    ip.startsWith('10.'),
                    ip.startsWith('172.16.') || (ip.startsWith('172.') && parseInt(ip.split('.')[1]) >= 16 && parseInt(ip.split('.')[1]) <= 31),
                    ip.startsWith('192.168.'),
                ];

                // Public IP ranges
                const isPublicIP = 
                    parts[0] >= 1 && 
                    parts[0] <= 223 && 
                    parts[0] !== 127 && // Loopback
                    !(parts[0] === 169 && parts[1] === 254); // Link-local

                // Additional validation for likely host IPs
                const isLikelyHost = 
                    // At least one part should be greater than 1
                    parts.some(n => n > 1) &&
                    // Last octet shouldn't be 0 (network address) or 255 (broadcast)
                    parts[3] !== 0 && parts[3] !== 255;

                return (privateRanges.some(range => range) || isPublicIP) && isLikelyHost;
            };

            // Function to extract IP from a string using regex
            const extractIPFromString = (str: string) => {
                const ipRegex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
                const matches = str.match(ipRegex);
                return (matches || []).filter(ip => isLikelyHostIP(ip));
            };

            // Prioritize these elements for host IPs
            const hostElements = xmlDoc.getElementsByTagName("ReportHost");
            for (const host of hostElements) {
                const ip = host.getAttribute("name");
                if (ip && validateIP(ip).isValid && isLikelyHostIP(ip)) {
                    ips.add(ip);
                }
            }

            // Secondary IP sources
            const ipElements = [
                "host-ip",
                "address",
                "addr",
                "ip-address",
                "host"
            ];

            // Process each element type
            ipElements.forEach(elementName => {
                const elements = xmlDoc.getElementsByTagName(elementName);
                Array.from(elements).forEach(element => {
                    if (element.textContent) {
                        extractIPFromString(element.textContent).forEach(ip => {
                            if (validateIP(ip).isValid) ips.add(ip);
                        });
                    }
                });
            });

            // Convert Set to Array and sort IPs
            const sortedIPs = Array.from(ips).sort((a, b) => {
                const aNum = a.split('.').map(num => parseInt(num, 10));
                const bNum = b.split('.').map(num => parseInt(num, 10));
                for (let i = 0; i < 4; i++) {
                    if (aNum[i] !== bNum[i]) return aNum[i] - bNum[i];
                }
                return 0;
            });

            if (sortedIPs.length === 0) {
                throw new Error("No valid host IPs found in the file");
            }

            return sortedIPs;
        } catch (e) {
            console.error("Error parsing Nessus file:", e);
            throw new Error(e instanceof Error ? e.message : "Invalid Nessus file format");
        }
    }

    async function handleFileUpload(event: Event): Promise<void> {
        const fileInput = event.target as HTMLInputElement;
        await processFile(fileInput.files?.[0]);
        fileInput.value = ""; // Reset input
    }

    async function handleDrop(event: DragEvent): Promise<void> {
        event.preventDefault();
        dragOver = false;
        const file = event.dataTransfer?.files?.[0];
        await processFile(file);
    }

    async function processFile(file?: File): Promise<void> {
        if (!file) return;
        
        if (!file.name.endsWith('.nessus')) {
            error = "Please upload a .nessus file";
            setTimeout(() => error = "", 3000);
            return;
        }

        try {
            isProcessing = true;
            const text = await file.text();
            const ips = await extractIPsFromNessus(text);

            if (ips.length === 0) {
                error = "No valid IPs found in the Nessus file";
            } else {
                dispatch('fileSelected', { 
                    name: file.name,
                    file: file
                });
                dispatch('ipsFound', ips);
                error = `Found ${ips.length} valid IPs`;
            }
        } catch (e) {
            console.error("Error processing file:", e);
            error = "Error processing Nessus file. Please check the file format.";
        } finally {
            isProcessing = false;
            setTimeout(() => error = "", 3000);
        }
    }
</script>

<div
    {id}
    role="button"
    tabindex="0"
    aria-label="Upload Nessus file"
    class="relative border-2 border-dashed rounded-lg p-6 text-center
        {dragOver 
            ? isDarkMode ? 'border-gray-500' : 'border-gray-400'
            : isDarkMode ? 'border-gray-700' : 'border-gray-300'}
        {isDarkMode ? 'bg-gray-800' : 'bg-white'}"
    on:dragover|preventDefault={() => dragOver = true}
    on:dragleave|preventDefault={() => dragOver = false}
    on:drop|preventDefault={handleDrop}
    on:keydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) fileInput.click();
        }
    }}
>
    <input
        id="{id}-input"
        type="file"
        accept=".nessus"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        on:change={handleFileUpload}
        disabled={isProcessing}
        aria-hidden="true"
    />
    
    <div class="space-y-2">
        <svg 
            class="mx-auto h-12 w-12 text-gray-400" 
            stroke="currentColor" 
            fill="none" 
            viewBox="0 0 48 48" 
            aria-hidden="true"
        >
            <path 
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round"
            />
        </svg>
        <div class="text-sm {isDarkMode ? 'text-gray-200' : 'text-gray-600'}" role="status">
            {#if isProcessing}
                <div class="flex items-center justify-center gap-2">
                    <svg
                        class="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                        />
                        <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    <span>Processing file...</span>
                </div>
            {:else}
                <p class="text-sm">
                    Drop your .nessus file here, or <span class="{isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'}">browse</span>
                </p>
                <p class="text-xs text-gray-500">Only .nessus files are supported</p>
            {/if}
        </div>
    </div>

    {#if error}
        <p class="mt-2 text-sm {isDarkMode ? 'text-gray-400' : 'text-gray-500'}" role="alert">
            {error}
        </p>
    {/if}
</div>