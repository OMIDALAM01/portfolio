import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import "https://cdn.jsdelivr.net/npm/d3-fetch@3/+esm";

let data = [];
let commits = [];
let brushSelection = null;

async function loadData() {
    data = await d3.csv('../meta/loc.csv', (row) => ({
        ...row,
        line: Number(row.line),
        depth: Number(row.depth),
        length: Number(row.length),
        date: new Date(row.date + "T00:00" + row.timezone),
        datetime: new Date(row.datetime)
    }));

    console.log("Raw Data:", data);

    processCommits();
    displayStats();
    createScatterplot();
}

function processCommits() {
    commits = d3.groups(data, (d) => d.commit)
        .map(([commit, lines]) => {
            let first = lines[0];

            let ret = {
                id: commit,
                url: `https://github.com/YOUR_REPO/commit/${commit}`,
                author: first.author,
                date: first.date,
                time: first.time,
                timezone: first.timezone,
                datetime: first.datetime,
                hourFrac: first.datetime.getHours() + first.datetime.getMinutes() / 60,
                totalLines: lines.length,
                lines: lines
            };

            return ret;
        });
}

function displayStats() {
    const d1 = d3.select('#stats').append('dl').attr('class', 'stats');

    d1.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    d1.append('dd').text(data.length);

    d1.append('dt').text('Total commits');
    d1.append('dd').text(commits.length);

    d1.append('dt').text('Number of files');
    d1.append('dd').text(d3.group(data, (d) => d.file).size);

    d1.append('dt').text('Max depth');
    d1.append('dd').text(d3.max(data, (d) => d.depth));

    d1.append('dt').text('Longest line');
    d1.append('dd').text(d3.max(data, (d) => d.length));
}

function createScatterplot() {
    const width = 1000;
    const height = 600;
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom
    };

    const svg = d3.select('#chart')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('overflow', 'visible');

    const xScale = d3.scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime))
        .range([usableArea.left, usableArea.right])
        .nice();

    const yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([usableArea.bottom, usableArea.top]);

    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3.scaleSqrt()
        .domain([minLines, maxLines])
        .range([2, 30]);

    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

    const gridlines = svg.append('g')
        .attr('class', 'gridlines')
        .attr("transform", `translate(${usableArea.left}, 0)`)
        .call(d3.axisLeft(yScale).tickFormat("").tickSize(-usableArea.width));

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

    svg.append('g')
        .attr('transform', `translate(0, ${usableArea.bottom})`)
        .call(xAxis);

    svg.append('g')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(yAxis);

    const dots = svg.append('g')
        .attr('class', 'dots');

    const circles = dots.selectAll('circle')
        .data(sortedCommits)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', (d) => rScale(d.totalLines))
        .attr('fill', 'steelblue')
        .style('fill-opacity', 0.7)
        .on('mouseenter', (event, commit) => {
            updateTooltipContent(commit);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
            d3.select(event.currentTarget).style('fill-opacity', 1);
        })
        .on('mousemove', (event) => {
            updateTooltipPosition(event);
        })
        .on('mouseleave', function () {
            updateTooltipContent({});
            updateTooltipVisibility(false);
            d3.select(this).style('fill-opacity', 0.7);
        });

    const brush = d3.brush()
        .extent([[usableArea.left, usableArea.top], [usableArea.right, usableArea.bottom]])
        .on("start brush end", brushed);

    svg.append("g")
        .attr("class", "brush")
        .call(brush);

    function brushed(event) {
        let selection = event.selection;
        if (!selection) {
            brushSelection = null;
            updateSelection();
            return;
        }

        brushSelection = selection;
        updateSelection();
    }

    function isCommitSelected(commit) {
        if (!brushSelection) return false;
        const [[x0, y0], [x1, y1]] = brushSelection;
        const cx = xScale(commit.datetime);
        const cy = yScale(commit.hourFrac);
        return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
    }

    function updateSelection() {
        const selectedCommits = brushSelection
            ? commits.filter(isCommitSelected)
            : [];

        circles.classed('selected', (d) => isCommitSelected(d));

        const countElement = document.getElementById('selection-count');
        countElement.textContent = `${selectedCommits.length || "No"} commits selected`;

        updateLanguageBreakdown(selectedCommits);
    }
}

function updateSelectionCount(selectedCommits) {
    document.getElementById('selection-count').textContent = `${
        selectedCommits.length || "No"
    } commits selected`;
}

function updateLanguageBreakdown(selectedCommits) {
    const container = document.getElementById('language-breakdown');

    if (selectedCommits.length === 0) {
        container.innerHTML = '';
        return;
    }

    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);

    const breakdown = d3.rollup(
        lines,
        (v) => v.length,
        (d) => d.type
    );

    container.innerHTML = '';

    for (const [language, count] of breakdown) {
        const proportion = count / lines.length;
        const formatted = d3.format('.1%')(proportion);

        container.innerHTML += `
            <dt>${language}</dt>
            <dd>${count} lines (${formatted})</dd>
        `;
    }
}

function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    if (Object.keys(commit).length === 0) return;

    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime.toLocaleString('en', { dateStyle: 'full' });
}

function updateTooltipVisibility(isVisible) {
    document.getElementById('commit-tooltip').hidden = !isVisible;
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY + 10}px`;
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadData();
});
