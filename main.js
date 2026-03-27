const STORAGE_KEY = 'BOOKSHELF_APPS';
let books = [];

// DOM Elements
const bookForm = document.getElementById('bookForm');
const searchBookForm = document.getElementById('searchBook');
const searchBookTitle = document.getElementById('searchBookTitle');
const incompleteBookList = document.getElementById('incompleteBookList');
const completeBookList = document.getElementById('completeBookList');

// Edit Modal Elements
const editBookModal = document.getElementById('editBookModal');
const editBookForm = document.getElementById('editBookForm');
const closeModal = document.getElementById('closeModal');
const editBookId = document.getElementById('editBookId');
const editBookTitle = document.getElementById('editBookTitle');
const editBookAuthor = document.getElementById('editBookAuthor');
const editBookYear = document.getElementById('editBookYear');
const editBookIsComplete = document.getElementById('editBookIsComplete');

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return { id, title, author, year: Number(year), isComplete };
}

function findBook(bookId) {
  return books.find((book) => book.id === bookId);
}

function findBookIndex(bookId) {
  return books.findIndex((book) => book.id === bookId);
}

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event('ondatasaved'));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    books = data;
  }
  document.dispatchEvent(new Event('ondataloaded'));
}

function makeBookElement(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;

  const container = document.createElement('div');
  container.setAttribute('data-bookid', id);
  container.setAttribute('data-testid', 'bookItem');

  const textTitle = document.createElement('h3');
  textTitle.setAttribute('data-testid', 'bookItemTitle');
  textTitle.innerText = title;

  const textAuthor = document.createElement('p');
  textAuthor.setAttribute('data-testid', 'bookItemAuthor');
  textAuthor.innerText = `Penulis: ${author}`;

  const textYear = document.createElement('p');
  textYear.setAttribute('data-testid', 'bookItemYear');
  textYear.innerText = `Tahun: ${year}`;

  const buttonContainer = document.createElement('div');

  const toggleButton = document.createElement('button');
  toggleButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
  toggleButton.innerText = isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
  toggleButton.addEventListener('click', () => {
    toggleBookComplete(id);
  });

  const deleteButton = document.createElement('button');
  deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
  deleteButton.innerText = 'Hapus Buku';
  deleteButton.addEventListener('click', () => {
    deleteBook(id);
  });

  const editButton = document.createElement('button');
  editButton.setAttribute('data-testid', 'bookItemEditButton');
  editButton.innerText = 'Edit Buku';
  editButton.addEventListener('click', () => {
    openEditModal(id);
  });

  buttonContainer.append(toggleButton, deleteButton, editButton);
  container.append(textTitle, textAuthor, textYear, buttonContainer);

  return container;
}

function renderBooks(booksToRender = books) {
  incompleteBookList.innerHTML = '';
  completeBookList.innerHTML = '';

  for (const bookItem of booksToRender) {
    const bookElement = makeBookElement(bookItem);
    if (bookItem.isComplete) {
      completeBookList.append(bookElement);
    } else {
      incompleteBookList.append(bookElement);
    }
  }
}

function addBook() {
  const title = document.getElementById('bookFormTitle').value;
  const author = document.getElementById('bookFormAuthor').value;
  const year = document.getElementById('bookFormYear').value;
  const isComplete = document.getElementById('bookFormIsComplete').checked;

  const id = generateId();
  const bookObject = generateBookObject(id, title, author, year, isComplete);
  books.push(bookObject);

  renderBooks();
  saveData();
}

function toggleBookComplete(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  
  bookTarget.isComplete = !bookTarget.isComplete;
  renderBooks();
  saveData();
}

function deleteBook(bookId) {
  const bookIndex = findBookIndex(bookId);
  if (bookIndex === -1) return;

  const confirmDelete = confirm('Apakah kamu yakin ingin menghapus buku ini?');
  if (confirmDelete) {
    books.splice(bookIndex, 1);
    renderBooks();
    saveData();
  }
}

// Edit Mode Integration
function openEditModal(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  editBookId.value = bookTarget.id;
  editBookTitle.value = bookTarget.title;
  editBookAuthor.value = bookTarget.author;
  editBookYear.value = bookTarget.year;
  editBookIsComplete.checked = bookTarget.isComplete;

  editBookModal.classList.add('show');
}

function closeEditModal() {
  editBookModal.classList.remove('show');
}

function saveEditBook() {
  const idStr = editBookId.value;
  const title = editBookTitle.value;
  const author = editBookAuthor.value;
  const year = editBookYear.value;
  const isComplete = editBookIsComplete.checked;

  const bookTarget = findBook(Number(idStr));
  if (bookTarget == null) return;

  bookTarget.title = title;
  bookTarget.author = author;
  bookTarget.year = Number(year);
  bookTarget.isComplete = isComplete;

  renderBooks();
  saveData();
  closeEditModal();
}

function searchBooks() {
  const query = searchBookTitle.value.toLowerCase().trim();
  if (query === '') {
    renderBooks();
    return;
  }
  const filteredBooks = books.filter((book) => book.title.toLowerCase().includes(query));
  renderBooks(filteredBooks);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  if (isStorageExist()) {
    loadDataFromStorage();
  }

  bookForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addBook();
    bookForm.reset();
  });

  searchBookForm.addEventListener('submit', (e) => {
    e.preventDefault();
    searchBooks();
  });

  searchBookTitle.addEventListener('keyup', (e) => {
    searchBooks();
  });

  // Modal Listeners
  closeModal.addEventListener('click', closeEditModal);
  window.addEventListener('click', (e) => {
    if (e.target === editBookModal) {
      closeEditModal();
    }
  });

  editBookForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveEditBook();
  });
});

document.addEventListener('ondataloaded', () => {
  renderBooks();
});
