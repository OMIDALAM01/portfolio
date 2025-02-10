import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let query = '';

const searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
    query = event.target.value.toLowerCase(); // Convert input to lowercase for case-insensitive search

    filterProjects();
});

function filterProjects() {
    fetchJSON('./lib/projects.json').then(projects => {
        const filteredProjects = projects.filter(project => 
            project.title.toLowerCase().includes(query) // Check if title contains query
        );
        renderProjects(filteredProjects, projectsContainer, 'h2');
    });
}

import { fetchJSON, renderProjects } from '../global.js';

const projectsContainer = document.querySelector('.projects');

async function loadProjects() {
    const projects = await fetchJSON('./lib/projects.json');
    if (projects) {
        renderProjects(projects, projectsContainer, 'h2');
        
        // Process and render the pie chart using project data
        const pieData = processProjectData(projects); // Process data dynamically
        renderPieChart(pieData); // Render the pie chart with actual project data
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

    const pie = d3.pie().value(d => d.value);
    const pieData = pie(data);

    svg.selectAll('path')
    .data(pieData)
    .join('path')
    .attr('d', arcGenerator)
    .attr('fill', (d, i) => color(i))
    .attr('transform', `translate(${radius}, ${radius})`);

    renderLegend(data, color);
}

function renderLegend(data, color) {
    const legend = d3.select('.legend');

    legend.selectAll('li').remove();

    data.forEach((d, idx) => {
        legend.append('li')
            .attr('style', `--color:${color(idx)}`)
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

const pieData = [
    { value: 1, label: 'Apples' },
    { value: 2, label: 'Oranges' },
    { value: 3, label: 'Mangos' },
    { value: 4, label: 'Pears' },
    { value: 5, label: 'Limes' },
    { value: 5, label: 'Cherries' }
];

renderPieChart(pieData);

function processProjectData(projects) {
    // Group and count projects by year
    const rolledData = d3.rollups(
        projects,
        v => v.length, // Count the number of projects in each year
        d => d.year // Group by year
    );

    // Convert the grouped data into the format required for the pie chart
    return rolledData.map(([year, count]) => ({
        value: count,
        label: year
    }));
}
