-- Rode no SQL Editor do Neon (livros digitais: sem estoque, leitura liberada após a compra)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(160) NOT NULL,
  category VARCHAR(60) NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price > 0),
  synopsis TEXT,
  cover_url TEXT NULL,      -- NULL = livro sem capa
  file_url TEXT NULL,       -- arquivo (PDF) liberado só para quem comprou
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  book_id INT REFERENCES books(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,        -- título e preço da época da compra
  unit_price NUMERIC(10,2) NOT NULL
);
-- Biblioteca do leitor: quem comprou pode ler
CREATE TABLE user_books (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  order_id INT REFERENCES orders(id) ON DELETE SET NULL,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, book_id)      -- impede comprar o mesmo livro duas vezes
);
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  answer TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
