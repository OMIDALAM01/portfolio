import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

import { fetchJSON, renderProjects } from '../global.js';

const projectsContainer = document.querySelector('.projects');

async function loadProjects() {
    const projects = await fetchJSON('./lib/projects.json');
    if (projects) {
        renderProjects(projects, projectsContainer, 'h2');
    }
}

loadProjects();

async function updateProjectCount() {
    const projects = await fetchJSON('./lib/projects.json');
    if (projects) {
        const titleElement = document.querySelector('.projects-title');
        if (titleElement) {
            titleElement.textContent = `${projects.length} Projects`;
        }
    }
}

updateProjectCount();

function renderPieChart(data) {
    const svg = d3.select('#projects-plot');
    const width = 100;
    const radius = width / 2;

    const color = d3.scaleOrdinal(d3.schemeTableau10);

    const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

    const pie = d3.pie();
    const pieData = pie(data);

    svg.selectAll('path')
        .data(pieData)
        .join('path')
        .attr('d', arcGenerator)
        .attr('fill', (d, i) => color(i))
        .attr('transform', `translate(${radius - 50}, ${radius - 50})`);
}

const pieData = [1, 2, 3, 4, 5];
renderPieChart(pieData);

