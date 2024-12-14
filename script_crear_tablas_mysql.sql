-- Crea la Base de Datos
CREATE DATABASE cajero_automatico;

-- Asignamos la base de datos creada como la activa
USE cajero_automatico;

-- Crea la tabla Usuarios
CREATE TABLE IF NOT EXISTS Usuarios (
	id_usuario INT AUTO_INCREMENT PRIMARY KEY,
	nombre VARCHAR(100),
	contrasena VARCHAR(100)
);

-- Crea la tabla Cuentas
CREATE TABLE IF NOT EXISTS Cuentas (
	id_cuenta INT AUTO_INCREMENT PRIMARY KEY,
	monto INT,
	id_usuario INT,
	FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

-- Crea la tabla Transacciones
CREATE TABLE IF NOT EXISTS Transacciones (
	id_transaccion INT AUTO_INCREMENT PRIMARY KEY,
	nombre VARCHAR(100),
	descripcion VARCHAR(255),
	monto INT,
	id_cuenta INT,
	fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (id_cuenta) REFERENCES Cuentas(id_cuenta)
);

-- Crear el Trigger que se ejecuta luego de insertar un usuario
DELIMITER $$
CREATE TRIGGER after_insert_usuario
	AFTER INSERT ON Usuarios
		FOR EACH ROW BEGIN
			INSERT INTO Cuentas (monto, id_usuario) VALUES (0, NEW.id_usuario);
		END$$
DELIMITER ;

-- Crear el Trigger que se ejecuta luego de insertar una transaccion
DELIMITER $$
CREATE TRIGGER after_insert_transaccion
	AFTER INSERT ON Transacciones
	FOR EACH ROW BEGIN
		-- Actualiza el monto de la cuenta asociada
		UPDATE Cuentas SET monto = monto + NEW.monto WHERE id_cuenta = NEW.id_cuenta;
	END$$
DELIMITER ;

-- Crear un usuario
INSERT INTO `usuarios` (`id_usuario`, `nombre`, `contrasena`) VALUES (NULL, '123456789', '1234');
-- Crear un segundo usuario
INSERT INTO `usuarios` (`id_usuario`, `nombre`, `contrasena`) VALUES (NULL, '987654321', '1234');


-- ================================
-- COMANDOS DE PRUEBAS
-- ================================

-- -- Crear una Transaccion
-- INSERT INTO Transacciones (nombre, descripcion, monto, id_cuenta) VALUES ('Retiro', 'Retiro de dinero', -200, 1);

-- -- Crea una Transaccion segun el id_usuario '1'
-- INSERT INTO Transacciones (nombre, descripcion, monto, id_cuenta) VALUES ('Retiro', 'Retiro de dinero', -200, (SELECT id_cuenta FROM Cuentas WHERE id_usuario = 1 LIMIT 1));

-- -- Optener las transacciones
-- SELECT 
--     u.id_usuario AS UsuarioID,
--     u.nombre AS NombreUsuario,
--     c.id_cuenta AS CuentaID,
--     c.monto AS SaldoCuenta,
--     t.id_transaccion AS TransaccionID,
--     t.nombre AS NombreTransaccion,
--     t.descripcion AS DescripcionTransaccion,
--     t.monto AS MontoTransaccion,
--     t.fecha AS FechaTransaccion
-- FROM 
--     Usuarios u
-- JOIN 
--     Cuentas c ON u.id_usuario = c.id_usuario
-- LEFT JOIN 
--     Transacciones t ON c.id_cuenta = t.id_cuenta
-- WHERE 
--     u.id_usuario = 1
-- ORDER BY 
--     t.fecha DESC;

-- -- Obtener la Cuenta basado en el id del usuario
-- SELECT id_cuenta, monto FROM Cuentas WHERE id_usuario = 1;