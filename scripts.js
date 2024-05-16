import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

let page = 1;
let matches = books;

// Encapsulate this code in an arrow function to make it more structured
// Here I am defining the function to create the preview elements for books then append them to parent element

const createPreviewElement = (matches, parentElement) => {
  const fragment = document.createDocumentFragment();
  matches.slice(0, BOOKS_PER_PAGE).forEach(({ author, id, image, title }) => {
    const buttonElement = document.createElement("button");
    buttonElement.classList = "preview";
    buttonElement.setAttribute("data-preview", id);

    buttonElement.innerHTML = `
          <img
            class="preview__image"
            src="${image}"
          />
          
          <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
          </div>
        `;

    fragment.appendChild(buttonElement);
  });
  parentElement.appendChild(fragment);
};

// This function is to create genre options and append them to the genre select element

const createGenreOptions = () => {
  for (const [id, name] of Object.entries(genres)) {
    const element = document.createElement("option");
    element.value = id;
    element.innerText = name;
    genreHTML.appendChild(element);
  }

  document.querySelector("[data-search-genres]").appendChild(genreHtml);

  // this function is to create author options and append them to the author select element

  const createAuthorOptions = () => {
    const authorHTML = document.createDocumentFragment();
    const firstAuthorElement = document.createElement("option");
    firstAuthorElement.value = "any";
    firstAuthorElement.innerText = "All Authors";
    authorHTML.appendChild(firstAuthorElement);

    for (const [id, name] of Object.entries(authors)) {
      const element = document.createElement("option");
      element.value = id;
      element.innerText = name;
      authorHTML.appendChild(element);
    }

    document.querySelector("[data-search-authors]").appendChild(authorHTML);
  };
  createAuthorOptions();

  // this is to set a theme to day and night
  const setTheme = () => {
    const theme = localStorage.getItem("theme");
    if (theme === "night") {
      document.documentElement.style.setProperty(
        "--color-dark",
        "rgb(255, 255, 255)"
      );
    }

    if (theme === "day") {
      document.documentElement.style.setProperty(
        "--color-dark",
        "rgb(0, 0, 0)"
      );
    }

    if (!theme) {
      localStorage.setItem("theme", "day");
      document.documentElement.style.setProperty(
        "--color-dark",
        "rgb(0, 0, 0)"
      );
    }

    document.querySelector("[data-settings-theme]").value = theme;
  };
  setTheme();

  // this is to update the show more button

  const updatedShowMoreButton = () => {
    if (matches.length > BOOKS_PER_PAGE) {
      document.querySelector("[data-list-button]").open = true;
    } else {
      document.querySelector("[data-list-button]").open = false;
    }

    if (matches.length - page * BOOKS_PER_PAGE < 1) {
      document.querySelector("[data-list-button]").innerHTML = `
          <span>Show more</span>
          <span class="list__remaining"> (${
            matches.length - page * BOOKS_PER_PAGE > 0
              ? matches.length - page * BOOKS_PER_PAGE
              : 0
          } remaining)</span>
      `;
    } else {
      document.querySelector("[data-list-button]").innerHTML = `
          <span>Show more</span>
          <span class="list__remaining"> (${
            matches.length - page * BOOKS_PER_PAGE > 0
              ? matches.length - page * BOOKS_PER_PAGE
              : 0
          } remaining)</span>
      `;
    }
  };

  updatedShowMoreButton();

  // Event listeners

  document
    .querySelector("[data-search-cancel]")
    .addEventListener("click", () => {
      document.querySelector("[data-search-overlay]").open = false;
    });

  document
    .querySelector("[data-settings-cancel]")
    .addEventListener("click", () => {
      document.querySelector("[data-settings-overlay]").open = false;
    });

  document
    .querySelector("[data-header-search]")
    .addEventListener("click", () => {
      document.querySelector("[data-search-overlay]").open = true;
      document.querySelector("[data-search-title]").focus();
    });

  document
    .querySelector("[data-header-settings]")
    .addEventListener("click", () => {
      document.querySelector("[data-settings-overlay]").open = true;
    });

  document.querySelector("[data-list-close]").addEventListener("click", () => {
    document.querySelector("[data-list-active]").open = false;
  });

  document
    .querySelector("[data-search-form]")
    .addEventListener("submit", handleSearchForm);

  function handleSearchForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    const result = filterBooks(filters);

    updateSearchResults(result);
  }

  function filterBooks(filters) {
    return books.filter((book) => {
      const genreMatch =
        filters.genre === "any" || book.genres.includes(filters.genre);
      const titleMatch =
        filters.title.trim() === "" ||
        book.title.toLowerCase().includes(filters.title.toLowerCase());
      const authorMatch =
        filters.author === "any" || book.author === filters.author;

      return genreMatch && titleMatch && authorMatch;
    });
  }

  function updateSearchResults(result) {
    page = 1;
    matches = result;

    const listMessage = document.querySelector("[data-list-message]");
    listMessage.classList.toggle("list__message_show", result.length < 1);

    const listItems = document.querySelector("[data-list-items]");
    listItems.innerHTML = "";
    const newItems = document.createDocumentFragment();
    for (const { author, id, image, title } of result.slice(
      0,
      BOOKS_PER_PAGE
    )) {
      const element = createPreviewButton(author, id, image, title);
      newItems.appendChild(element);
    }

    listItems.appendChild(newItems);
    updateShowMoreButton();
    scrollToTopSmoothly();
    closeSearchOverlay();
  }

  function createPreviewButton(author, id, image, title) {
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

    return element;
  }

  function updateShowMoreButton() {
    const listButton = document.querySelector("[data-list-button]");
    const remaining = Math.max(matches.length - page * BOOKS_PER_PAGE, 0);

    listButton.innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${remaining})</span>
  `;
    listButton.disabled = remaining <= 0;
  }

  function scrollToTopSmoothly() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeSearchOverlay() {
    document.querySelector("[data-search-overlay]").open = false;
  }

  document.querySelector("[data-list-button]").addEventListener("click", () => {
    const fragment = document.createDocumentFragment();

    for (const { author, id, image, title } of matches.slice(
      page * BOOKS_PER_PAGE,
      (page + 1) * BOOKS_PER_PAGE
    )) {
      const element = document.createElement("button");
      element.classList = "preview";
      element.setAttribute("data-preview", id);

      element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `;

      fragment.appendChild(element);
    }

    document.querySelector("[data-list-items]").appendChild(fragment);
    page += 1;
  });

  const handleListItemClick = (event) => {
    const targetBookId = event.target.dataset.preview;

    if (!targetBookId) return;
    const activeBook = findBookById(targetBookId);

    if (!activeBook) return;

    displayActiveBook(activeBook);
  };

  document.querySelector("[data-list-items]");
  const findBookById = (id) => {
    return books.find((book) => book.id === id) || null;
  };

  const displayActiveBook = (book) => {
    const listActive = document.querySelector("[data-list-active]");
    const listBlur = document.querySelector("[data-list-blur]");
    const listImage = document.querySelector("[data-list-image]");
    const listTitle = document.querySelector("[data-list-title]");
    const listSubtitle = document.querySelector("[data-list-subtitle]");
    const listDescription = document.querySelector("[data-list-description]");

    if (
      !listActive ||
      !listBlur ||
      !listImage ||
      !listTitle ||
      !listSubtitle ||
      !listDescription
    )
      return;

    listActive.open = true;
    listBlur.src = book.image;
    listImage.src = book.image;
    listTitle.innerText = book.title;
    listSubtitle.innerText = `${authors[book.author]} (${new Date(
      book.published
    ).getFullYear()})`;
    listDescription.innerText = book.description;
  };
  document.querySelector("[data-list-description]").innerText =
    active.description;
};
