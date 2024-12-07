# INFILTR8 - Intelligent Network Findings with In-Depth Learning for Targeted Reconnaissance

INFILTR8 is a cybersecurity tool designed to facilitate and expedite penetration testing. It leverages machine learning (ML) models to analyze reconnaissance files and produce a prioritized list of entry points for penetration testing. This tool is developed and maintained by the Cyber Experimentation & Analysis Division (CEAD).

## What is INFILTR8?

INFILTR8 aims to streamline reconnaissance analysis, enabling penetration testers to quickly identify the most critical vulnerabilities in a given target scope. By analyzing imported reconnaissance data (e.g., Nmap scans, vulnerability scan outputs) and applying ML-driven heuristic scoring, INFILTR8 generates a ranked list of potential entry points for further examination.

## System Requirements

- **Operating System**: Kali Linux
- **Hardware**: Minimum of 4GB RAM, 4-core 2.5GHz CPU, 20GB available storage
- **Software**: Chrome or Firefox for accessing the web interface

## Frameworks and Libraries Used

- **Svelte**: A modern framework for building user interfaces.
- **SvelteKit**: Framework for building Svelte applications with routing and server-side rendering.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **TypeScript**: For type safety in JavaScript.
- **Vite**: Fast build tool and development server.
- **PostCSS**: Tool for transforming CSS with plugins.
- **Autoprefixer**: Adds vendor prefixes for better browser compatibility.
- **Svelte Check**: Tool for checking Svelte code for errors.
- **NeoConfetti Svelte**: A library/plugin for special UI effects (if applicable).

## How to Use INFILTR8

1. **Login**: Enter your credentials on the login page.
2. **Create Project**: Start a new penetration test project by uploading your reconnaissance files and setting the scope (e.g., IP lists, vulnerability types).
3. **Run Analysis**: Execute the analysis based on your project settings. You can view real-time progress and adjust settings as needed.
4. **Export Results**: Once the analysis is complete, export the ranked vulnerability list in XML or PDF format for further action.

## Team Information

*Team 11: Final Frontier*  
*Course*: Software Engineering II

**Team Members:**
1. Alan Holguin
2. Akinjayeju Akinyemi
3. Luis Cedillo
4. Micheal Ike
5. Francisco Jimenez
6. Alejandro Rodriguez
7. Roberto Salinas

---

## Development

### Setup

The following instructions assume you are running Kali Linux on an Intel machine. Before proceeding, ensure you have the required software versions installed. The output below provides example versions for reference:

    ┌──(lcedillo㉿lcedilloLINUX)-[~]
    └─$ git --version
    git version 2.45.2

    ┌──(lcedillo㉿lcedilloLINUX)-[~]
    └─$ python --version
    Python 3.12.7

    ┌──(lcedillo㉿lcedilloLINUX)-[~]
    └─$ pip --version
    pip 24.3.1 from /usr/lib/python3/dist-packages/pip (python 3.12)

    ┌──(lcedillo㉿lcedilloLINUX)-[~]
    └─$ node --version
    v18.20.5

    ┌──(lcedillo㉿lcedilloLINUX)-[~]
    └─$ npm --version
    10.8.2

    ┌──(lcedillo㉿lcedilloLINUX)-[~]
    └─$ docker --version
    Docker version 26.1.5+dfsg1, build a72d7cd

    ┌──(lcedillo㉿lcedilloLINUX)-[~]
    └─$ docker-compose --version
    docker-compose version 1.29.2, build unknown

    ┌──(lcedillo㉿lcedilloLINUX)-[~]
    └─$ sudo neo4j --version
    neo4j 4.4.26

### Steps to Run INFILTR8

1. **Clone the Repository**  
   From your home directory (or preferred working directory), clone the INFILTR8 repository:

       ┌──(lcedillo㉿lcedilloLINUX)-[~]
       └─$ git clone https://github.com/robertosalinaas/CS4311_INFILTR8_11FinalFrontier_Fall2024.git

   Example output:

       Cloning into 'CS4311_INFILTR8_11FinalFrontier_Fall2024'...
       remote: Enumerating objects: 22130, done.
       remote: Counting objects: 100% (74/74), done.
       remote: Compressing objects: 100% (62/62), done.
       remote: Total 22130 (delta 20), reused 46 (delta 9), pack-reused 22056 (from 1)
       Receiving objects: 100% (22130/22130), 70.00 MiB | 5.80 MiB/s, done.
       Resolving deltas: 100% (6044/6044), done.

2. **Navigate into the Repository Directory**  

       ┌──(lcedillo㉿lcedilloLINUX)-[~]
       └─$ cd CS4311_INFILTR8_11FinalFrontier_Fall2024

3. **Build the Docker Images**  
   INFILTR8 uses Docker for containerization. To build the Docker images without using the cache:

       ┌──(lcedillo㉿lcedilloLINUX)-[~/CS4311_INFILTR8_11FinalFrontier_Fall2024]
       └─$ sudo docker-compose build --no-cache

   Example output:

       Building frontend
       [+] Building 31.0s (10/10) FINISHED 

       Building backend
       [+] Building 243.6s (13/13) FINISHED

4. **Run the Application**  
   Once the build completes successfully, run:

       ┌──(lcedillo㉿lcedilloLINUX)-[~/CS4311_INFILTR8_11FinalFrontier_Fall2024]
       └─$ sudo docker-compose up

   The application will then be ready at:

       http://localhost:5173/

5. **DEMO VIDEO LINK YOUTUBE**
    https://youtu.be/ijx5CJB7IYI

### Additional Notes

- **Credentials**: If authentication is required, ensure you have the proper credentials. These may be set up in the backend environment or provided by your deployment configuration.
- **Configuration Files**: The `docker-compose.yml` and `.env` files may contain configuration values for database connections, API endpoints, and other settings. Adjust these as needed based on your environment.

---

## License

INFILTR8 is provided under the terms specified by the project’s license (if applicable). For more details, see the `LICENSE` file in this repository.

## Contact

For inquiries, support, or contribution guidelines, please contact the CEAD team or submit an issue/pull request in the GitHub repository.
