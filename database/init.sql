CREATE DATABASE IF NOT EXISTS escala_db;

USE escala_db;

-- O Docker mapeia sua pasta ./database para /docker-entrypoint-initdb.d/
SOURCE /docker-entrypoint-initdb.d/create_tables.sql;
SOURCE /docker-entrypoint-initdb.d/seed_data.sql;