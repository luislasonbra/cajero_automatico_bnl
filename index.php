<?php
	// Cargamos la conexion con la base de daatos
	include("conexion.php");
	
	// Verifica si el usuario existe y los parametros son validos
	if (isset($_POST['action']) && $_POST['action'] == 'check_login') {
		// Sanitizar el nombre (eliminar caracteres especiales)
		$tarjetaNumero = htmlspecialchars($_POST['tarjetaNumero'], ENT_QUOTES, 'UTF-8');
		$tarjetaPin = htmlspecialchars($_POST['tarjetaPin'], ENT_QUOTES, 'UTF-8');
		
		// Usar una consulta preparada para evitar inyecciones SQL
		$stmt = $conn->prepare("SELECT * FROM usuarios WHERE nombre = ? AND contrasena = ?");
		$stmt->bind_param("ss", $tarjetaNumero, $tarjetaPin);  // 'ss' significa que los parámetros son cadenas de texto
		
		// Data Null
		$data = null;
		
		// Ejecutar la consulta
		if ($stmt->execute()) {
			$result = $stmt->get_result(); // Obtener el resultado de la consulta
			if ($result->num_rows > 0) {
				$row = $result->fetch_assoc();
				//
				$data = array(
					"status" => "success",
					"message" => "Usuario válido",
					"usuario" => [
						"id_usuario" => $row["id_usuario"],
						"nombre" => $row["nombre"]
					]
				);
			}
			else {
				$data = array(
					"status" => "error",
					"message" => "Usuario o contraseña incorrectos"
				);
			}
		}
		else {
			$data = array(
				"status" => "error_db",
				"message" => "Error al realizar la consulta: " . $stmt->error
			);
		}
		
		// Cerrar la declaración y la conexión
		$stmt->close();
		
		// Establecer el encabezado de tipo de contenido como JSON
		header('Content-Type: application/json');
		// Devolver los datos en formato JSON
		echo json_encode($data);
		// Finaliza el script para que no se ejecute el codigo HTML
		exit;
	}
	// Carga los reportes
	else if (isset($_GET['action']) && $_GET['action'] == 'get_reportes') {
		$id_usuario = $_GET['id_usuario'];
		
		// Consulta para obtener las transacciones del usuario
		$sql = "SELECT 
			u.id_usuario AS UsuarioID,
			u.nombre AS NombreUsuario,
			c.id_cuenta AS CuentaID,
			c.monto AS SaldoCuenta,
			t.id_transaccion AS TransaccionID,
			t.nombre AS NombreTransaccion,
			t.descripcion AS DescripcionTransaccion,
			t.monto AS MontoTransaccion,
			t.fecha AS FechaTransaccion
		FROM 
			Usuarios u
		JOIN 
			Cuentas c ON u.id_usuario = c.id_usuario
		LEFT JOIN 
			Transacciones t ON c.id_cuenta = t.id_cuenta
		WHERE 
			u.id_usuario = ?
		ORDER BY 
			t.fecha DESC";
		
		// Preparar la consulta
		$stmt = $conn->prepare($sql);
		$stmt->bind_param("i", $id_usuario); // 'i' indica que el parámetro es un entero
		
		// Ejecutar la consulta
		$stmt->execute();
		
		// Obtener los resultados
		$result = $stmt->get_result();
		
		// Prepara los datos
		$data = [];
		if ($result->num_rows > 0) {
			// Mostrar los resultados
			while ($row = $result->fetch_assoc()) {
				$data[] = [
					"id_transaccion" => $row["TransaccionID"],
					"nombre" => $row["NombreTransaccion"],
					"descripcion" => $row["DescripcionTransaccion"],
					"monto" => $row["MontoTransaccion"],
					"fecha" => $row["FechaTransaccion"],
					// Datos del Usuario
					"usuario" => [
						"id_usuario" => $row["UsuarioID"],
						"nombre" => $row["NombreUsuario"]
					],
					// Datos de la Cuenta
					"cuenta" => [
						"id_cuenta" => $row["CuentaID"],
						"monto" => $row["SaldoCuenta"]
					]
				];
			}
		}
		// Establecer el encabezado de tipo de contenido como JSON
		header('Content-Type: application/json');
		// Devolver los datos en formato JSON
		echo json_encode($data);
		// Finaliza el script para que no se ejecute el codigo HTML
		exit;
	}
	// Obtiene el monto del usuario
	else if (isset($_GET['action']) && $_GET['action'] == 'get_cuenta_saldo') {
		$id_usuario = $_GET['id_usuario'];
		// Consulta SQL
		$sql = "SELECT * FROM Cuentas WHERE id_usuario=$id_usuario LIMIT 1;"; // consulta SQL
		$result = $conn->query($sql); // ejecutamos consulta
		// Prepara los datos
		$data = null;
		if ($result->num_rows > 0) {
			$row = $result->fetch_assoc();
			$data = array(
				"status" => "success",
				"message" => "ok",
				"saldo" => intval($row["monto"])
			);
		}
		// Establecer el encabezado de tipo de contenido como JSON
		header('Content-Type: application/json');
		// Devolver los datos en formato JSON
		echo json_encode($data);
		// Finaliza el script para que no se ejecute el codigo HTML
		exit;
	}
	// Crea las transacciones
	else if (isset($_POST['action']) && $_POST['action'] == 'create_transaction') {
		$id_usuario = $_POST['id_usuario'];
		$monto = $_POST['monto'];
		// Sanitizar el nombre (eliminar caracteres especiales)
		$nombre = htmlspecialchars($_POST['nombre'], ENT_QUOTES, 'UTF-8');
		$descripcion = htmlspecialchars($_POST['descripcion'], ENT_QUOTES, 'UTF-8');
		
		// Obtener el id_cuenta del usuario
		$sql_cuenta = "SELECT id_cuenta FROM Cuentas WHERE id_usuario = ? LIMIT 1";
		$stmt_cuenta = $conn->prepare($sql_cuenta);
		$stmt_cuenta->bind_param("i", $id_usuario);
		$stmt_cuenta->execute();
		$result_cuenta = $stmt_cuenta->get_result();
		
		// Data Null
		$data = null;
		
		if ($result_cuenta->num_rows > 0) {
			// Obtener id_cuenta
			$row = $result_cuenta->fetch_assoc();
			$id_cuenta = $row['id_cuenta'];
	
			// Ahora, realizar la transacción con el id_cuenta
			$sql_transaccion = "INSERT INTO Transacciones (nombre, descripcion, monto, id_cuenta) VALUES (?, ?, ?, ?)";
			$stmt_transaccion = $conn->prepare($sql_transaccion);
			$stmt_transaccion->bind_param("ssii", $nombre, $descripcion, $monto, $id_cuenta);	
			
			// Ejecutar la consulta
			if ($stmt_transaccion->execute()) {
				$data = array(
					"status" => "success",
					"message" => "La transacción se realizó con éxito."
				);
			}
			else {
				$data = array(
					"status" => "error",
					"message" => "Error: " . $stmt_transaccion->error
				);
			}
			
			// Cerrar la declaración para transacción
			$stmt_transaccion->close();
		}
		else {
			// Si no se encuentra una cuenta para ese usuario
			$data = array(
				"status" => "error",
				"message" => "No se encontró una cuenta asociada al usuario."
			);
		}
		
		// Cerrar la declaración y la conexión
		$stmt_cuenta->close();
		
		// Establecer el encabezado de tipo de contenido como JSON
		header('Content-Type: application/json');
		// Devolver los datos en formato JSON
		echo json_encode($data);
		// Finaliza el script para que no se ejecute el codigo HTML
		exit;
	}
	// Verifica si el usuario existe
	else if (isset($_POST['action']) && $_POST['action'] == 'check_exist_user') {
		// Sanitizar el nombre (eliminar caracteres especiales)
		$tarjetaNumero = htmlspecialchars($_POST['tarjetaNumero'], ENT_QUOTES, 'UTF-8');
		
		// Usar una consulta preparada para evitar inyecciones SQL
		$stmt = $conn->prepare("SELECT U.id_usuario, U.nombre, C.id_cuenta, C.monto FROM usuarios U JOIN cuentas C ON U.id_usuario = C.id_usuario WHERE U.nombre = ?");
		$stmt->bind_param("s", $tarjetaNumero);  // 's' significa que los parámetros son cadenas de texto
		
		// Data Null
		$data = null;
		
		// Ejecutar la consulta
		if ($stmt->execute()) {
			$result = $stmt->get_result(); // Obtener el resultado de la consulta
			if ($result->num_rows > 0) {
				$row = $result->fetch_assoc();
				//
				$data = array(
					"status" => "success",
					"message" => "Usuario válido",
					"usuario" => [
						"id_usuario" => $row["id_usuario"],
						"nombre" => $row["nombre"]
					],
					"cuenta" => [
						"id_cuenta" => $row["id_cuenta"],
						"monto" => $row["monto"],
					]
				);
			}
			else {
				$data = array(
					"status" => "error",
					"message" => "Usuario no encontrado"
				);
			}
		}
		else {
			$data = array(
				"status" => "error_db",
				"message" => "Error al realizar la consulta: " . $stmt->error
			);
		}
		
		// Cerrar la declaración y la conexión
		$stmt->close();
		
		// Establecer el encabezado de tipo de contenido como JSON
		header('Content-Type: application/json');
		// Devolver los datos en formato JSON
		echo json_encode($data);
		// Finaliza el script para que no se ejecute el codigo HTML
		exit;
	}
	
	// Cierra la conexion
	$conn->close();
?>

<!DOCTYPE html>
<html lang="es" data-bs-theme="dark"> <!--  data-bs-theme="dark" -->
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Cajero Automatico BNL</title>
	<link rel="stylesheet" href="css/style.css">
	<!-- Dependencias de bootstrap -->
	<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
		rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
		crossorigin="anonymous">
	<!-- Bootstrap Icons -->
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
	<!-- Agrega soporte a JQuery para facilitar la carga de datos -->
	<script src="js/jquery-3.7.1.min.js"></script>
	<script src="js/scripts.js"></script>
</head>
<body class="bg-dark text-light">
	<main class="box d-flex justify-content-center">
		<div class="d-flex flex-column justify-content-center align-items-center">
			<!-- Opciones -->
			<div class="box-container text-center" id="opciones-wrapper">
				<p class="title">Bienvenido a BNL</p>
				<p class="sub-title">Por favor, inserte su tarjeta</p>
				<div class="buttons">
					<button type="button" class="btn btn-primary" onclick="show_login();"><i class="bi bi-credit-card-fill"></i><br> Insertar tarjeta</button>
					<button type="button" class="btn btn-success" onclick="showAlertModal('Alerta', 'No disponible.');"><i class="bi bi-person-fill"></i><br> Administrador</button>
				</div>
			</div>
			
			<!-- Contenedor dinamico -->
			<div class="box-wrapper box-container text-center d-none" id="operations-wrapper">
				<p class="title">Inicio de Sesión</p>
				<div class="body">
					<div class="mb-3">
						<label for="tarjetaNumero" class="form-label">Número de tarjeta:</label>
						<input type="text" class="form-control" id="tarjetaNumero" required placeholder="123456789">
					</div>
					<div class="mb-3">
						<label for="tarjetaPin" class="form-label">PIN:</label>
						<input type="password" class="form-control" id="tarjetaPin" required placeholder="1234">
					</div>
					<!-- Login -->
					<button type="button" class="w-100 btn btn-primary btn-login"><i class="bi bi-arrow-up-right-circle-fill"></i><br> Iniciar Sesión</button>
				</div>
			</div>
			
		</div>
	</main>
	
	<!-- Ventana Modal -->
	<div class="modal fade" id="dinamicModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="dinamicModalLabel" aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h1 class="modal-title fs-5" id="dinamicModalLabel">Modal title</h1>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body"></div>
				
				<!-- Centrar:  d-flex justify-content-center -->
				<div class="modal-footer">
					<button type="button" class="btn btn-primary" data-bs-dismiss="modal">Aceptar</button>
					<!-- <button type="button" class="btn btn-primary">Understood</button> -->
				</div>
			</div>
		</div>
	</div>
	
	<!-- Dependencias de bootstrap -->
	<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
		integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
</body>
</html>