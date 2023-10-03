const { nanoid } = require('nanoid');
const books = require('./books');

// Menambah buku
const addBookHandler = (request, h) => {
  const
    {
      name, year, author, summary, publisher, pageCount, readPage, reading,
    } = request.payload;

  // Status gagal
  if (!name) {
    return h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    }).code(400);
  }

  if (readPage > pageCount) {
    return h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    }).code(400);
  }

  // status berhasil

  const id = nanoid(16);
  const finished = (pageCount === readPage);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  books.push(newBook);
  return h.response({
    status: 'success',
    message: 'Buku berhasil ditambahkan',
    data: {
      bookId: id,
    },
  }).code(201);
};

// Menampilkan seluruh Buku

const getAllBookHandler = (request, h) => {
  const { name, reading, finished } = request.query;
  const filtered = [...books];

  if (filtered.length === 0) {
    return h.response({
      status: 'success',
      data: {
        books: [],
      },
    }).code(200);
  }

  // hasil filter
  const filters = [];
  if (name !== undefined) {
    const nameLowerCase = name.toLowerCase();
    filters.push((book) => book.name.toLowerCase().includes(nameLowerCase));
  }

  if (reading === true || reading === '1') {
    filters.push((book) => book.reading === true);
  }

  if (reading === '0') {
    filters.push((book) => book.reading === false);
  }

  if (finished === true || finished === '1') {
    filters.push((book) => book.finished === true);
  }

  if (finished === '0') {
    filters.push((book) => book.finished === false);
  }

  if (filters.length > 0) {
    const filteredBooks = filters.reduce((result, filterFn) => result.filter(filterFn), books);
    const filteredBookData = filteredBooks.map((book) => ({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    }));

    return h.response({
      status: 'success',
      data: {
        books: filteredBookData,
      },
    }).code(200);
  }

  // tanpa filter
  return h.response({
    status: 'success',
    data: {
      books: books.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      })),
    },
  }).code(200);
};

const getBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const book = books.filter((n) => n.id === id)[0];

  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

// Dapat mengubah data buku
const editBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  // const updatedAt = new Date().toISOString();

  const bookindex = books.findIndex((book) => book.id === id);

  // gagal tidak terdapat id
  if (bookindex < 0) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan',
    }).code(404);
  }

  // gagal nama tidak ada
  if (!name) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    }).code(400);
  }

  // gagal readpage lebih besar dari pagecount
  if (readPage > pageCount) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',

    }).code(400);
  }

  // sukses
  const updatedAt = new Date().toISOString();

  books[bookindex] = {
    ...books[bookindex],
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
    updatedAt,
  };

  return h.response({
    status: 'success',
    message: 'Buku berhasil diperbarui',
  }).code(200);
};

// Menghapus buku
const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const bookindex = books.findIndex((book) => book.id === id);

  if (bookindex > -1) {
    books.splice(bookindex, 1);
    return h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    }).code(200);
  }

  return h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  }).code(404);
};

module.exports = {
  addBookHandler,
  getAllBookHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
