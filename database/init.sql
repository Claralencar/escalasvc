CREATE DATABASE IF NOT EXISTS escala_db;

USE escala_db;

SOURCE /docker-entrypoint-initdb.d/create_tables.sql;
SOURCE /docker-entrypoint-initdb.d/seed_data.sql;
