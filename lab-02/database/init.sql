-- SQLite Database Initialization Script for Lab 02
CREATE TABLE IF NOT EXISTS book (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    price INTEGER NOT NULL,
    pages INTEGER NOT NULL
);

INSERT INTO book (title, author, price, pages) VALUES
('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 450, 320),
('The Hobbit', 'J.R.R. Tolkien', 550, 310),
('To Kill a Mockingbird', 'Harper Lee', 380, 281),
('1984', 'George Orwell', 320, 328),
('Clean Code', 'Robert C. Martin', 650, 464);
