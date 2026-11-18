const BookModel = require('../models/bookModel');

const BookController = {
  async getAllBooks(req, res) {
    try {
      const books = await BookModel.findAll();
      res.status(200).json(books);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getBookById(req, res) {
    try {
      const { id } = req.params;
      const book = await BookModel.findById(id);
      if (!book) {
        return res.status(404).json({ error: 'Book Not Found' });
      }
      res.status(200).json(book);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createBook(req, res) {
    try {
      const { title, author, price, pages } = req.body;
      if (!title || !author || price === undefined || pages === undefined) {
        return res.status(400).json({ error: 'Missing required book fields' });
      }
      const newBookId = await BookModel.create({ title, author, price, pages });
      res.status(201).json({ message: 'Book Created Successfully', bookId: newBookId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateBook(req, res) {
    try {
      const { id } = req.params;
      const existing = await BookModel.findById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Book Not Found' });
      }
      await BookModel.update(id, req.body);
      res.status(200).json({ message: 'Book Updated Successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteBook(req, res) {
    try {
      const { id } = req.params;
      const existing = await BookModel.findById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Book Not Found' });
      }
      await BookModel.delete(id);
      res.status(200).json({ message: 'Book Deleted Successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = BookController;
