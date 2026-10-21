-- 1. Crear tabla USER primero (de ella dependen otras tablas)
CREATE TABLE USER (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    mail VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    owner BOOLEAN NOT NULL DEFAULT FALSE,
    admin BOOLEAN NOT NULL DEFAULT FALSE
);

-- 2. Crear tabla PRODUCT (independiente de chat e imágenes)
CREATE TABLE PRODUCT (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(500),
    price INT NOT NULL
);

-- 3. Crear tabla IMAGES (depende directamente de PRODUCT)
CREATE TABLE IMAGES (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    image_url VARCHAR(255) NOT NULL,
    product_id INT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES PRODUCT(Id) ON DELETE CASCADE
);

-- 4. Crear tabla CHAT (depende de USER y de PRODUCT)
CREATE TABLE CHAT (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    user INT NOT NULL,
    product_id INT NOT NULL,
    FOREIGN KEY (user) REFERENCES USER(Id),
    FOREIGN KEY (product_id) REFERENCES PRODUCT(Id)
);

-- 5. Crear tabla MESSAGE (depende directamente de CHAT)
CREATE TABLE MESSAGE (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    text VARCHAR(1000) NOT NULL,
    time DATETIME NOT NULL,
    chat_id INT NOT NULL,
    FOREIGN KEY (chat_id) REFERENCES CHAT(Id)
);
