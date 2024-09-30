<script>
    import { onMount } from 'svelte';
    import Navbar from '$lib/navbar.svelte';
  
    let isOpen = true;
    let file;
    let uploadStatus = '';
    let isUploading = false;
    let generatedFiles = [];
  
    async function handleFileUpload() {
      if (!file) {
        uploadStatus = 'Please select a file to upload.';
        return;
      }
  
      isUploading = true;
      uploadStatus = 'Uploading...';
  
      const formData = new FormData();
      formData.append('file', file);
  
      try {
        const response = await fetch('http://localhost:3000/upload', {
          method: 'POST',
          body: formData
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const result = await response.json();
        uploadStatus = `File uploaded successfully: ${result.filename}`;
        generatedFiles = result.csvFiles || [];
      } catch (error) {
        console.error('Error uploading file:', error);
        uploadStatus = `Error uploading file: ${error.message}`;
      } finally {
        isUploading = false;
      }
    }
  
    function handleFileChange(event) {
      file = event.target.files[0];
    }

    function downloadFile(filename) {
      window.location.href = `http://localhost:3000/download/${filename}`;
    }
</script>

<Navbar bind:isOpen />

<main class="{isOpen ? 'main-expanded' : 'main-collapsed'} bg-gray-100 min-h-screen transition-all duration-300">
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">Process File</h1>

    <div class="bg-white p-6 rounded-md shadow-md mb-8">
      <h2 class="text-xl font-bold mb-4 text-gray-700">Upload Nessus Dataset</h2>
      
      <div class="mb-4">
        <input
          type="file"
          accept=".nessus"
          on:change={handleFileChange}
          class="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      <button
        on:click={handleFileUpload}
        disabled={isUploading}
        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? 'Uploading...' : 'Upload File'}
      </button>

      {#if uploadStatus}
        <p class="mt-4 text-sm {uploadStatus.includes('Error') ? 'text-red-500' : 'text-green-500'}">
          {uploadStatus}
        </p>
      {/if}
    </div>

    {#if generatedFiles.length > 0}
      <div class="bg-white p-6 rounded-md shadow-md">
        <h2 class="text-xl font-bold mb-4 text-gray-700">Generated Files</h2>
        <ul class="list-disc pl-5">
          {#each generatedFiles as file}
            <li class="mb-2">
              <span class="text-sm font-medium text-gray-700">{file}</span>
              <button
                on:click={() => downloadFile(file)}
                class="ml-4 text-blue-500 hover:underline"
                title="Download file"
              >
                Download
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
</main>

<style>
  main {
    transition: margin-left 0.3s ease;
  }

  .main-collapsed {
    margin-left: 0;
  }

  .main-expanded {
    margin-left: 250px; /* Adjust this width based on your navbar width */
  }

  @media (max-width: 1024px) {
    .main-expanded {
      margin-left: 0;
    }
  }
</style>