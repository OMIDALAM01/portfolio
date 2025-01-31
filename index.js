import { fetchJSON, renderProjects } from './global.js';

async function loadLatestProjects() {
    const projects = await fetchJSON('./projects/lib/projects.json');
    if (projects) {
        const latestProjects = projects.slice(0, 3);
        const projectsContainer = document.querySelector('.projects');
        renderProjects(latestProjects, projectsContainer, 'h2');
    }
}

loadLatestProjects();
