CREATE DATABASE bamazon
USE bamazon;

CREATE TABLE products (
  item_id int AUTO_INCREMENT,
  product_name varchar(30) NOT NULL,
  department_name varchar(30) NOT NULL,
  price INT NOT NULL,
  stock_quantity INT NOT NULL,
  PRIMARY KEY(item_id)
);


