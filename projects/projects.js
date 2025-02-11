import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let selectedIndex = -1;

let query = '';

const searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
    query = event.target.value.toLowerCase();

    filterProjects();
});

function filterProjects() {
    fetchJSON('./lib/projects.json').then(projects => {
        let filteredProjects = projects;

        if (selectedIndex !== -1) {
            const selectedYear = pieData[selectedIndex]?.label;
            filteredProjects = filteredProjects.filter(project => project.year === selectedYear);
        }

        if (query) {
            filteredProjects = filteredProjects.filter(project => 
                Object.values(project).join('\n').toLowerCase().includes(query)
            );
        }

        renderProjects(filteredProjects, projectsContainer, 'h2');

        const pieData = processProjectData(filteredProjects);
        renderPieChart(pieData);
    });
}

import { fetchJSON, renderProjects } from '../global.js';

const projectsContainer = document.querySelector('.projects');

async function loadProjects() {
    const projects = await fetchJSON('./lib/projects.json');
    if (projects) {
        renderProjects(projects, projectsContainer, 'h2');
        
        const pieData = processProjectData(projects);
        renderPieChart(pieData);
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
    svg.selectAll('*').remove();

    if (!data.length) return;

    const width = 100;
    const radius = width / 2;

    const color = d3.scaleOrdinal(d3.schemeTableau10);

    const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

    const pie = d3.pie().value(d => d.value);
    const pieData = pie(data);

    const paths = svg.selectAll('path')
        .data(pieData)
        .join('path')
        .attr('d', arcGenerator)
        .attr('fill', (d, i) => color(i))
        .attr('transform', `translate(${radius}, ${radius})`)
        .attr('cursor', 'pointer')
        .on('click', (event, d) => {
            selectedIndex = selectedIndex === d.index ? -1 : d.index;
            filterProjectsByYear(data[selectedIndex]?.label || null);
        });

    renderLegend(data, color);
}

function renderLegend(data, color) {
    const legend = d3.select('.legend');
    legend.selectAll('*').remove();

    legend.selectAll('li')
        .data(data)
        .join('li')
        .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''))
        .attr('style', (_, i) => `--color:${color(i)}`)
        .html((d) => `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
        .on('click', (_, i) => {
            selectedIndex = selectedIndex === i ? -1 : i;
            updatePieChart();
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
    const rolledData = d3.rollups(
        projects,
        v => v.length,
        d => d.year
    );

    return rolledData.map(([year, count]) => ({
        value: count,
        label: year
    }));
}

function updatePieChart() {
    d3.selectAll('path')
        .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));

    d3.selectAll('.legend li')
        .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));
}

function filterProjectsByYear(selectedYear) {
    fetchJSON('./lib/projects.json').then(projects => {
        let filteredProjects = projects;

        if (selectedYear) {
            filteredProjects = filteredProjects.filter(project => project.year === selectedYear);
        }

        if (query) {
            filteredProjects = filteredProjects.filter(project => 
                Object.values(project).join('\n').toLowerCase().includes(query)
            );
        }

        renderProjects(filteredProjects, projectsContainer, 'h2');

        const pieData = processProjectData(filteredProjects);
        renderPieChart(pieData);
    });
}

