DROP DATABASE IF EXISTS bamazonDB;
CREATE database bamazonDB;

USE bamazonDB;

CREATE TABLE products
(
	item_id INT AUTO_INCREMENT NOT NULL,
	product_name VARCHAR(100),
	department_name VARCHAR(100),
	price DECIMAL(10,2),
	stock_quantity INT (10) NOT NULL,
	PRIMARY KEY (item_id)
);

SELECT * FROM products;