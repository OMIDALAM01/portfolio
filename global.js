console.log("IT’S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: "index.html", title: "Home" },
  { url: "projects/index.html", title: "Projects" },
  { url: "contact/index.html", title: "Contact" },
  { url: "resume/index.html", title: "Resume" },
  { url: "https://github.com/OMIDALAM01/portfolio", title: "GitHub" }
];

const ARE_WE_HOME = document.documentElement.classList.contains("home");

let nav = document.createElement("nav");
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  if (!ARE_WE_HOME && !url.startsWith("http")) {
    url = "../" + url;
  }

  let a = document.createElement("a");
  a.href = url;
  a.textContent = title;

  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add("current");
  }

  if (a.host !== location.host) {
    a.target = "_blank";
  }

  nav.append(a);
}
