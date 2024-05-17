import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

// Initialize page and matches
let page = 1;
let matches = books;

// ******** QUERY SELECTORS ******* //
const selectors = {
  // Book List
  dataListItems: document.querySelector("[data-list-items]"),
  listButton: document.querySelector("[data-list-button]"),
  dataSearchGenres: document.querySelector("[data-search-genres]"),
  dataSearchAuthors: document.querySelector("[data-search-authors]"),

  // Search Modal
  dataSearchOverlay: document.querySelector("[data-search-overlay]"),
  dataListActive: document.querySelector("[data-list-active]"),
  dataSearchTitle: document.querySelector("[data-search-title]"),
  dataSearchCancel: document.querySelector("[data-search-cancel]"),
  dataHeaderSearch: document.querySelector("[data-header-search]"),
  dataListClose: document.querySelector("[data-list-close]"),
  dataSearchForm: document.querySelector("[data-search-form]"),
  dataListMessage: document.querySelector("[data-list-message]"),

  // Theme Modal
  dataSettingsOverlay: document.querySelector("[data-settings-overlay]"),
  dataSettingsTheme: document.querySelector("[data-settings-theme]"),
  dataSettingsCancel: document.querySelector("[data-settings-cancel]"),
  dataHeaderSettings: document.querySelector("[data-header-settings]"),
  dataSettingsForm: document.querySelector("[data-settings-form]"),
};

// Function to render books
function renderBooks() {
  const starting = document.createDocumentFragment();
  for (const { author, id, image, title } of matches.slice(0, BOOKS_PER_PAGE)) {
    const element = document.createElement("button");
    element.classList = "preview";
    element.setAttribute("data-preview", id);
    element.innerHTML = `
      <img class="preview__image" src="${image}" />
      <div class="preview__info">
          <h3 class="preview__title">${title}</h3>
          <div class="preview__author">${authors[author]}</div>
      </div>
    `;
    starting.appendChild(element);
  }
  selectors.dataListItems.appendChild(starting);
}

// Function to render genres
function renderGenres() {
  const genreHtml = document.createDocumentFragment();
  const firstGenreElement = document.createElement("option");
  firstGenreElement.value = "any";
  firstGenreElement.innerText = "All Genres";
  genreHtml.appendChild(firstGenreElement);
  for (const [id, name] of Object.entries(genres)) {
    const element = document.createElement("option");
    element.value = id;
    element.innerText = name;
    genreHtml.appendChild(element);
  }
  selectors.dataSearchGenres.appendChild(genreHtml);
}

// Function to render authors
function renderAuthors() {
  const authorsHtml = document.createDocumentFragment();
  const firstAuthorElement = document.createElement("option");
  firstAuthorElement.value = "any";
  firstAuthorElement.innerText = "All Authors";
  authorsHtml.appendChild(firstAuthorElement);
  for (const [id, name] of Object.entries(authors)) {
    const element = document.createElement("option");
    element.value = id;
    element.innerText = name;
    authorsHtml.appendChild(element);
  }
  selectors.dataSearchAuthors.appendChild(authorsHtml);
}

// Function to set theme
function setTheme() {
  const prefersDarkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = prefersDarkMode ? "night" : "day";
  selectors.dataSettingsTheme.value = theme;
  document.documentElement.style.setProperty(
    "--color-dark",
    prefersDarkMode ? "255, 255, 255" : "10, 10, 20"
  );
  document.documentElement.style.setProperty(
    "--color-light",
    prefersDarkMode ? "10, 10, 20" : "255, 255, 255"
  );
}

// Function to update books when "Show more" button is clicked
function showMoreButton() {
  const remaining = matches.length - page * BOOKS_PER_PAGE;
  selectors.listButton.innerText = "Show more";
  selectors.listButton.disabled = remaining <= 0;
  const remainingSpan = document.createElement("span");
  remainingSpan.className = "list__remaining";
  remainingSpan.textContent = ` (${remaining > 0 ? remaining : 0})`;
  selectors.listButton.innerHTML = "";
  selectors.listButton.appendChild(document.createTextNode("Show more"));
  selectors.listButton.appendChild(remainingSpan);
}

// Function to setup event listeners
function setupEventListeners() {
  // Canceling the search modal
  selectors.dataSearchCancel.addEventListener("click", () => {
    selectors.dataSearchOverlay.open = false;
  });
  // Opening the search modal
  selectors.dataHeaderSearch.addEventListener("click", () => {
    selectors.dataSearchOverlay.open = true;
    selectors.dataSearchTitle.focus();
  });
  // Search modal drop down list of book title / author / genre
  selectors.dataListClose.addEventListener("click", () => {
    selectors.dataListActive.open = false;
  });
  // Searching books
  selectors.dataSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    const result = [];
    for (const book of books) {
      let genreMatch = filters.genre === "any";
      for (const singleGenre of book.genres) {
        if (genreMatch) break;
        if (singleGenre === filters.genre) {
          genreMatch = true;
        }
      }
      if (
        (filters.title.trim() === "" ||
          book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
        (filters.author === "any" || book.author === filters.author) &&
        genreMatch
      ) {
        result.push(book);
      }
    }
    page = 1;
    matches = result;
    if (result.length < 1) {
      selectors.dataListMessage.classList.add("list__message_show");
    } else {
      selectors.dataListMessage.classList.remove("list__message_show");
    }
    selectors.dataListItems.innerHTML = "";
    const newItems = document.createDocumentFragment();
    for (const { author, id, image, title } of result.slice(
      0,
      BOOKS_PER_PAGE
    )) {
      const element = document.createElement("button");
      element.classList = "preview";
      element.setAttribute("data-preview", id);
      element.innerHTML = `
        <img class="preview__image" src="${image}" />
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
      `;
      newItems.appendChild(element);
    }
    selectors.dataListItems.appendChild(newItems);
    selectors.listButton.disabled = matches.length - page * BOOKS_PER_PAGE < 1;
    showMoreButton();
    window.scrollTo({ top: 0, behavior: "smooth" });
    selectors.dataSearchOverlay.open = false;
  });
  // Canceling the theme modal
  selectors.dataSettingsCancel.addEventListener("click", () => {
    selectors.dataSettingsOverlay.open = false;
  });
  // Opening the theme modal
  selectors.dataHeaderSettings.addEventListener("click", () => {
    selectors.dataSettingsOverlay.open = true;
  });
  // Changing theme
  selectors.dataSettingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    if (theme === "night") {
      document.documentElement.style.setProperty(
        "--color-dark",
        "255, 255, 255"
      );
      document.documentElement.style.setProperty("--color-light", "10, 10, 20");
    } else {
      document.documentElement.style.setProperty("--color-dark", "10, 10, 20");
      document.documentElement.style.setProperty(
        "--color-light",
        "255, 255, 255"
      );
    }
    selectors.dataSettingsOverlay.open = false;
  });
  showMoreButton();
  // Show more button
  selectors.listButton.addEventListener("click", () => {
    const fragment = document.createDocumentFragment();
    for (const { author, id, image, title } of matches.slice(
      page * BOOKS_PER_PAGE,
      (page + 1) * BOOKS_PER_PAGE
    )) {
      const element = document.createElement("button");
      element.classList = "preview";
      element.setAttribute("data-preview", id);
      element.innerHTML = `
        <img class="preview__image" src="${image}" />
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
      `;
      fragment.appendChild(element);
    }
    selectors.dataListItems.appendChild(fragment);
    page += 1;
    showMoreButton();
  });
  // Book preview
  selectors.dataListItems.addEventListener("click", (event) => {
    const pathArray = Array.from(event.path || event.composedPath());
    let active = null;
    for (const node of pathArray) {
      if (active) break;
      if (node?.dataset?.preview) {
        let result = null;
        for (const singleBook of books) {
          if (result) break;
          if (singleBook.id === node?.dataset?.preview) result = singleBook;
        }
        active = result;
      }
    }
    if (active) {
      selectors.dataListActive.open = true;
      document.querySelector("[data-list-blur]").src = active.image;
      document.querySelector("[data-list-image]").src = active.image;
      document.querySelector("[data-list-title]").innerText = active.title;
      document.querySelector("[data-list-subtitle]").innerText = `${
        authors[active.author]
      } (${new Date(active.published).getFullYear()})`;
      document.querySelector("[data-list-description]").innerText =
        active.description;
    }
  });
}

showMoreButton();

// Call functions to initialize the application
document.addEventListener("DOMContentLoaded", function () {
  console.log("scripts.js and the DOM are loaded");
  renderBooks();
  renderGenres();
  renderAuthors();
  setTheme();
  showMoreButton();
  setupEventListeners();
});
