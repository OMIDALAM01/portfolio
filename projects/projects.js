import { fetchJSON, renderProjects } from '../global.js';

const projectsContainer = document.querySelector('.projects');

async function loadProjects() {
    const projects = await fetchJSON('../lib/projects.json');
    if (projects) {
        renderProjects(projects, projectsContainer, 'h2');
    }
}

loadProjects();

async function updateProjectCount() {
    const projects = await fetchJSON('../lib/projects.json');
    if (projects) {
        const titleElement = document.querySelector('.projects-title');
        if (titleElement) {
            titleElement.textContent = `${projects.length} Projects`;
        }
    }
}

updateProjectCount();