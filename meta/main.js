import * as d3 from "https://d3js.org/d3.v7.min.js";

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
    console.log("Processed Commits:", commits);
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

document.addEventListener("DOMContentLoaded", async () => {
    await loadData();
});
