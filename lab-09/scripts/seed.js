const { getDatabase } = require('../src/config/db');

async function seed() {
  console.log('Seeding SQLite database...');
  const db = await getDatabase();
  await db.exec(`
    DROP TABLE IF EXISTS book;
    CREATE TABLE book (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price INTEGER NOT NULL,
      pages INTEGER NOT NULL
    );
    INSERT INTO book (title, author, price, pages) VALUES
      ('Domain-Driven Design', 'Eric Evans', 780, 560),
      ('Continuous Delivery', 'Jez Humble, David Farley', 690, 512),
      ('The Pragmatic Programmer', 'David Thomas, Andrew Hunt', 720, 352);
  `);
  console.log('Database seeded successfully with 3 records.');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
