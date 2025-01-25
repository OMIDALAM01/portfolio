console.log("IT'S ALIVE!");

function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

let pages = [
    { url: './', title: 'Home' },
    { url: './projects/', title: 'Projects' },
    { url: './contact/', title: 'Contact' },
    { url: './resume/', title: 'Resume' },
    { url: 'https://github.com/OMIDALAM01/portfolio', title: 'GitHub' }
];

const nav = document.createElement('nav');
document.body.prepend(nav);

const ARE_WE_HOME = document.documentElement.classList.contains('home');

for (let p of pages) {
    let url = p.url;

    // Adjust relative paths for non-home pages
    if (!ARE_WE_HOME && !url.startsWith('http')) {
        url = '../' + url;
    }

    const a = document.createElement('a');
    a.href = url;
    a.textContent = p.title;

    // Add target="_blank" for external links
    if (p.url.startsWith('http')) {
        a.target = '_blank';
    }

    nav.append(a);

    // Highlight the current page
    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    }
}

// Dark Mode Switch
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

// Persist Theme Preference with localStorage
const select = document.querySelector('.color-scheme select');

function setColorScheme(scheme) {
    document.documentElement.style.setProperty('color-scheme', scheme === 'auto' ? '' : scheme);
    localStorage.colorScheme = scheme;
    select.value = scheme;
}

// Event Listener for Dropdown
select.addEventListener('input', (event) => {
    const scheme = event.target.value;
    setColorScheme(scheme);
    console.log('Color scheme changed to', scheme);
});

// Load Saved Preference on Page Load
if (localStorage.colorScheme) {
    setColorScheme(localStorage.colorScheme);
} else {
    setColorScheme('auto'); // Default to 'auto'
}
