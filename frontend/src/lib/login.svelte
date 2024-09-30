<script>
     import { goto } from '$app/navigation';
    let username = '';
    let password = '';
  
    function handleLogin() {
      // Handle login logic here
      console.log('Username:', username);
      console.log('Password:', password);
        goto('/main');
    }
  </script>
  
  <style>
  
    .login-container {
      background: rgba(38, 92, 145, 0.8);
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
      width: 300px;
      text-align: center;
    }
  
    .login-container h2 {
      color: white;
      margin-bottom: 1.5rem;
    }
  
    .login-container input {
      width: 100%;
      padding: 0.75rem;
      margin-bottom: 1rem;
      border: none;
      border-radius: 4px;
      background: #34495e;
      color: white;
    }
  
    .login-container input::placeholder {
      color: #bdc3c7;
    }
  
    .login-container button {
      width: 100%;
      padding: 0.75rem;
      border: none;
      border-radius: 4px;
      background: #1abc9c;
      color: white;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
  
    .login-container button:hover {
      background: #16a085;
    }
  
    .blur-background {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      backdrop-filter: blur(10px);
      z-index: -1;
      background: #058269;
    }
    .wraper{
        display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 100px;
      
    }
    h1{
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 50px;
        margin-top: 100px;
    
    }
    
   
  </style>
   <h1> Welcome to INFILTR8</h1>
  <div class = "wraper">
   
  <div class="blur-background"></div>
  
  <div class="login-container">
    <h2>Login</h2>
    <input type="text" placeholder="Username" bind:value={username} />
    <input type="password" placeholder="Password" bind:value={password} />
    <button on:click={handleLogin}>Login</button>
  </div>
</div>