import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

async function loadLatestProjects() {
    try {
        const projects = await fetchJSON('./projects/lib/projects.json');
        if (projects) {
            const latestProjects = projects.slice(0, 3);
            const projectsContainer = document.querySelector('.projects');
            renderProjects(latestProjects, projectsContainer, 'h2');
        }
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

loadLatestProjects();

async function displayGitHubStats() {
    try {
        const githubData = await fetchGitHubData('OMIDALAM01');
        if (githubData) {
            const profileStats = document.querySelector('#profile-stats');
            if (profileStats) {
                profileStats.innerHTML = `
                    <p>Name: ${githubData.name}</p>
                    <p>Followers: ${githubData.followers}</p>
                    <p>Following: ${githubData.following}</p>
                    <p>Public Repos: ${githubData.public_repos}</p>
                    <p><a href="${githubData.html_url}" target="_blank">View GitHub Profile</a></p>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading GitHub stats:', error);
    }
}

displayGitHubStats();


