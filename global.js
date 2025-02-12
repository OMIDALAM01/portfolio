console.log("IT'S ALIVE!");

function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

let pages = [
    { url: './', title: 'Home' },
    { url: './projects/', title: 'Projects' },
    { url: './contact/', title: 'Contact' },
    { url: './resume/', title: 'Resume' },
    { url: './meta/', title: 'Meta'},
    { url: 'https://github.com/OMIDALAM01/portfolio', title: 'GitHub' }
];

const nav = document.createElement('nav');
document.body.prepend(nav);

const ARE_WE_HOME = document.documentElement.classList.contains('home');

for (let p of pages) {
    let url = p.url;

    if (!ARE_WE_HOME && !url.startsWith('http')) {
        url = '../' + url;
    }

    const a = document.createElement('a');
    a.href = url;
    a.textContent = p.title;

    if (p.url.startsWith('http')) {
        a.target = '_blank';
    }

    nav.append(a);

    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    }
}

document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
        Theme:
        <select>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Automatic</option>
        </select>
    </label>
`
);

const select = document.querySelector('.color-scheme select');

function setColorScheme(scheme) {
    document.documentElement.style.setProperty('color-scheme', scheme === 'auto' ? '' : scheme);
    localStorage.colorScheme = scheme;
    select.value = scheme;
}

select.addEventListener('input', (event) => {
    const scheme = event.target.value;
    setColorScheme(scheme);
    console.log('Color scheme changed to', scheme);
});

if (localStorage.colorScheme) {
    setColorScheme(localStorage.colorScheme);
} else {
    setColorScheme('auto');
}

export async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
    if (!containerElement) {
        console.error('Invalid container element');
        return;
    }

    containerElement.innerHTML = '';
    projects.forEach(project => {
        const article = document.createElement('article');
        article.innerHTML = `
            <${headingLevel}>${project.title}</${headingLevel}>
            <img src="${project.image}" alt="${project.title}">
            <p>${project.description}</p>
            <p class="project-year">c. ${project.year}</p>
        `;
        containerElement.appendChild(article);
    });
}

export async function fetchGitHubData(username) {
    const url = `https://api.github.com/users/${username}`;
    try {
        const data = await fetchJSON(url);
        return data;
    } catch (error) {
        console.error("Error fetching GitHub data:", error);
        return null;
    }
}