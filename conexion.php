<?php

	// Configura laa conexion con la base de datos
	$servidor="localhost";
	$usuario="root";
	$contraseña="";
	$base_de_datos="cajero_automatico";

	$conn = new mysqli($servidor, $usuario, $contraseña, $base_de_datos); 
	if ($conn->connect_error) { 
		die("Conexión fallida: " . $conn->connect_error); 
	}

?>