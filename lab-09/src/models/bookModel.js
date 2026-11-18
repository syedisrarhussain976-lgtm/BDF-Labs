const { getDatabase } = require('../config/db');

const BookModel = {
  async findAll() {
    const db = await getDatabase();
    return db.all('SELECT * FROM book ORDER BY id ASC;');
  },

  async findById(id) {
    const db = await getDatabase();
    return db.get('SELECT * FROM book WHERE id = ?;', [id]);
  },

  async create({ title, author, price, pages }) {
    const db = await getDatabase();
    const result = await db.run(
      'INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);',
      [title, author, price, pages]
    );
    return result.lastID;
  },

  async update(id, { title, author, price, pages }) {
    const db = await getDatabase();
    await db.run(
      'UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;',
      [title, author, price, pages, id]
    );
  },

  async delete(id) {
    const db = await getDatabase();
    await db.run('DELETE FROM book WHERE id = ?;', [id]);
  }
};

module.exports = BookModel;
