import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import "https://cdn.jsdelivr.net/npm/d3-fetch@3/+esm";

let data = [];
let commits = [];

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
                totalLines: lines.length
            };

            Object.defineProperty(ret, 'lines', {
                value: lines,
                writable: false,
                enumerable: false,
                configurable: false
            });

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

    d1.append('dt').text('Most active time of day');
    const workByPeriod = d3.rollups(
        data,
        (v) => v.length,
        (d) => new Date(d.datetime).toLocaleString('en', { hour: '2-digit', hour12: false })
    );
    const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
    d1.append('dd').text(maxPeriod ? `${maxPeriod}:00` : "N/A");
}

function createScatterplot() {
    const width = 1000;
    const height = 600;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("overflow", "visible");

    // Define scales
    const xScale = d3.scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime))
        .range([0, width])
        .nice();

    const yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([height, 0]);

    // Append dots to scatterplot
    const dots = svg.append("g").attr("class", "dots");

    dots.selectAll("circle")
        .data(commits)
        .join("circle")
        .attr("cx", (d) => xScale(d.datetime))
        .attr("cy", (d) => yScale(d.hourFrac))
        .attr("r", 5)
        .attr("fill", "steelblue");

    const xAxis = d3.axisBottom(xScale).ticks(5);
    const yAxis = d3.axisLeft(yScale).ticks(10);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Date");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .text("Time of Day");
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadData();
});
