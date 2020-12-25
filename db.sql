DROP DATABASE IF EXISTS lab4;
CREATE DATABASE `lab4` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lab4;

CREATE TABLE `bank`
(
    id int PRIMARY KEY AUTO_INCREMENT,
    username varchar(255) UNIQUE,
    currency int NOT NULL,
    valid tinyint(1) NOT NULL
);

INSERT INTO `bank` VALUES (1, 'test', 100, true);
INSERT INTO `bank` VALUES (2, 'wkj', 30, true);

DROP USER if EXISTS 'admin'@'localhost';
DROP USER if EXISTS 'test'@'localhost';
DROP USER if EXISTS 'wkj'@'localhost';

FLUSH PRIVILEGES;

CREATE USER 'admin'@'localhost' IDENTIFIED WITH mysql_native_password BY'admin';
CREATE USER 'test'@'localhost' IDENTIFIED WITH mysql_native_password BY 'test';
CREATE USER 'wkj'@'localhost' IDENTIFIED WITH mysql_native_password BY 'wkj';

GRANT select,insert,update ON lab4.bank to 'admin'@'localhost';
GRANT select ON mysql.columns_priv to 'admin'@'localhost';
GRANT Grant option ON lab4.bank to 'admin'@'localhost';
GRANT select(currency), select(username), select(valid) ON lab4.bank TO 'test'@'localhost';
GRANT select(currency), select(username), select(valid) ON lab4.bank TO 'wkj'@'localhost';

FLUSH PRIVILEGES;