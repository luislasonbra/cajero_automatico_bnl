// Esto se puede proteger desde PHP
const MENU_OPCIONES = [
	// Selección de Operación
	`<p class="title">Selección de Operación</p>
	<div class="body btn-group-vertical w-100" role="group" aria-label="Basic example">
		<button type="button" class="mb-2 btn btn-primary"	onclick="show_transacction(1);"><i class="bi bi-currency-dollar"></i><br> Retiro de efectivo</button>
		<button type="button" class="mb-2 btn btn-primary"	onclick="show_transacction(2);"><i class="bi bi-piggy-bank"></i><br> Depósito</button>
		<button type="button" class="mb-2 btn btn-primary"	onclick="show_transacction(3);"><i class="bi bi-currency-exchange"></i><br> Transferencia</button>
		<button type="button" class="btn btn-primary"		onclick="show_transacction(4);"><i class="bi bi-wallet2"></i><br> Consulta de saldo</button>
		
		<!-- Ver reporte -->
		<button type="button" class="mt-3 btn btn-primary" onclick="show_transacction(5);"><i class="bi bi-eye"></i><br> Ver Reporte</button>
	</div>`,
	
	// Retiro de efectivo
	`<p class="title">Retiro de efectivo</p>
	<div class="body">
		<div class="mb-3">
			<label for="monto" class="form-label">Monto:</label>
			<input type="number" class="form-control" id="monto" required value="0">
		</div>
	</div>
	<div class="buttons btn-group-vertical w-100">
		<button type="button" class="mb-2 btn btn-danger" onclick="show_transacction(0);"><i class="bi bi-x"></i><br> Cancelar</button>
		<button type="button" class="btn btn-primary" onclick="realizar_retiro();"><i class="bi bi-arrow-right-square-fill"></i><br> Realizar transacción</button>
	</div>`,
	
	// Depósito
	`<p class="title">Depósito</p>
	<div class="body">
		<div class="mb-3">
			<label for="monto" class="form-label">Monto:</label>
			<input type="number" class="form-control" id="monto" required value="0">
		</div>
	</div>
	<div class="buttons btn-group-vertical w-100">
		<button type="button" class="mb-2 btn btn-danger" onclick="show_transacction(0);"><i class="bi bi-x"></i><br> Cancelar</button>
		<button type="button" class="btn btn-primary" onclick="realizar_deposito();"><i class="bi bi-arrow-right-square-fill"></i><br> Realizar transacción</button>
	</div>`,
	
	// Transferencia
	`<p class="title">Transferencia</p>
	<div class="body">
		<div class="mb-3">
			<label for="monto" class="form-label">Monto:</label>
			<input type="number" class="form-control" id="monto" required value="0">
		</div>
		<div class="mb-3">
			<label for="cuentaDestino" class="form-label">Número de cuenta del destinatario:</label>
			<input type="text" class="form-control" id="cuentaDestino" required>
		</div>
	</div>
	<div class="buttons btn-group-vertical w-100">
		<button type="button" class="mb-2 btn btn-danger" onclick="show_transacction(0);"><i class="bi bi-x"></i><br> Cancelar</button>
		<button type="button" class="btn btn-primary" onclick="realizar_transferencia();"><i class="bi bi-arrow-right-square-fill"></i><br> Realizar transacción</button>
	</div>`,
	
	// Consulta de saldo
	`<p class="title">Consulta de saldo</p>
	<div class="body">
		<div class="mb-3">
			<p>Saldo disponible:</p>
			<p class="saldo">0</p>
		</div>
	</div>
	<div class="buttons btn-group-vertical w-100">
		<button type="button" class="mb-2 btn btn-danger" onclick="show_transacction(0);"><i class="bi bi-x"></i><br> Cancelar</button>
		<button type="button" class="btn btn-primary" onclick="consultar_saldo();"><i class="bi bi-arrow-clockwise"></i><br> Actualizar</button>
	</div>`,
	
	// Reporte 'table-dark'
	`<p class="title">Reportes</p>
	<div class="body btn-group-vertical w-100" role="group" aria-label="Basic example">
		<div class="table-responsive w-100 table-scroll">
			<!-- table table-sm table-bordered table-hover table-striped -->
			<table class="table table-bordered table-hover table-striped reportes-table">
				<thead>
					<tr>
						<th scope="col">ID</th>
						<th scope="col">Nombre</th>
						<th scope="col">Descripción</th>
						<th scope="col">Monto</th>
						<th scope="col">Fecha</th>
						<th scope="col">ID Cuenta</th>
					</tr>
				</thead>
				<tbody>
					<tr><td colspan="6" align="center">No hay Registros</td></tr>
				</tbody>
			</table>
		</div>
		<div class="btn-group-vertical w-100">
			<button type="button" class="mb-2 btn btn-primary" onclick="loadReportes();"><i class="bi bi-arrow-clockwise"></i><br> Actualizar</button>
			<button type="button" class="btn btn-danger" onclick="show_transacction(0);"><i class="bi bi-x"></i><br> Cancelar</button>
		</div>
	</div>`
];

// Esto tambien 'se almacena informacion crucial del usuario'
// No se debe de manejar desde el forn-end
var LOGIN_USUARIO = null;


// =============================
// Informacion del Token
// =============================
let token = null;
let tokenExpiration = null; // Para almacenar la fecha de expiración del token

// Convert seconds to milliseconds
const seconds2Milliseconds = (seconds) => seconds * 1000;

// Convert minutes to milliseconds
const minutes2Milliseconds = (minutes) => minutes * 60 * 1000;

// Convert milliseconds to minutes
const milliseconds2Minutes = (milliseconds) => milliseconds / (60 * 1000);

// Generar un token
function generateToken() {
	token = Math.random().toString(36).substring(2); // Token aleatorio
	tokenExpiration = Date.now() + minutes2Milliseconds(1); // Expira en 1 minutos
}

// Validar token
const isTokenValid = () => token && Date.now() < tokenExpiration;


// ===================================================
// Se Ejecuta al Terminar la carga del HTML
// ===================================================
$(document).ready(() => {
	// Carga el controlador del Login
	loginControlEvent();
});

// Initialize el control de tokens
function initializeToken() {
	// Generar un nuevo token al iniciar sesión
	generateToken();
	// Verifica si el token esta activo
	const checkExpireTokenInterval = setInterval(() => {
		console.log("checkExpireTokenInterval: " + !isTokenValid());
		// Comprueba el token
		if (!isTokenValid()) {
			// Elimina el intervalo
			clearInterval(checkExpireTokenInterval);
			// Muestra un mensaje de alerta
			showAlertModal("El token ha expirado", "Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.", () => insertLogin());
			return;
		}
	}, seconds2Milliseconds(10));
}

function formatWithCommas(value) {
	const number = parseFloat(value); // Convertir a número
	if (isNaN(number)) return "Invalid input";
	return number.toLocaleString('en-US'); // Cambia 'en-US' por otra región si es necesario
}

function showAlertModal(title, message, callback) {
	const modal = $('#dinamicModal');
	const modalDialog = modal.find('.modal-dialog');
	const modalContent = modalDialog.find('.modal-content');
	const modalHeader = modalContent.find('.modal-header');
	const modalBody = modalContent.find('.modal-body');
	// const modalFooter = modalContent.find('.modal-footer');
	
	// Realiza el cambio del contenido
	modalHeader.find('#dinamicModalLabel').text(title);
	
	//
	modalBody.html(message);
	
	// Mostrar el modal
	modal.modal('show');
	
	//
	modal.off('hidden.bs.modal', callback);
	modal.on('hidden.bs.modal', callback);
	
	//
	return modal;
}

// Recargamos la pagina web
function refreshPage() {
	location.reload();
}

// Muestra un div y elimina la clase 'd-none'
function show_and_remove_class(id) {
	$(id).removeClass('d-none');
	$(id).show();
}

// Oculta un div y agrega la clase 'd-none'
function hide_and_add_class(id) {
	$(id).addClass('d-none');
	$(id).hide();
}

// Muestra el formulario de login
function show_login() {
	// Oculta el primer menu
	hide_and_add_class('#opciones-wrapper');
	// Muestra el menu de opciones
	show_and_remove_class('#operations-wrapper');
}

// Inserta el formulario de login
function insertLogin() {
	const login = `<p class="title">Inicio de Sesión</p>
	<div class="body">
		<div class="mb-3">
			<label for="tarjetaNumero" class="form-label">Número de tarjeta:</label>
			<input type="text" class="form-control" id="tarjetaNumero" required value="123456789">
		</div>
		<div class="mb-3">
			<label for="tarjetaPin" class="form-label">PIN:</label>
			<input type="password" class="form-control" id="tarjetaPin" required value="1234">
		</div>
		<!-- Login -->
		<button type="button" class="w-100 btn btn-primary btn-login"><i class="bi bi-arrow-up-right-circle-fill"></i><br> Iniciar Sesión</button>
	</div>`;
	
	// Realiza los cambios dinamicamente
	$('#operations-wrapper').html(login);
	
	// LLama la controlador de los eventos del login
	loginControlEvent();
}

// Agrega el controlador de login
function loginControlEvent() {
	// ================================
	// LOGIN
	// ================================
	const loginWrapper = $('#operations-wrapper');
	const body = loginWrapper.find('.body');
	// Buttons
	const btnLogin = body.find('.btn-login');
	btnLogin.on('click', (e) => {
		const tarjetaNumero = body.find('#tarjetaNumero').val();
		const tarjetaPin = body.find('#tarjetaPin').val();
		
		// Realiza una solicitud AJAX para agregar una ciudad
		$.ajax({
			url: 'index.php',
			type: 'POST',
			data: { action: 'check_login', tarjetaNumero: tarjetaNumero, tarjetaPin: tarjetaPin },
			dataType: 'json',
			success: (response) => {
				if (response.status == 'success') {
					LOGIN_USUARIO = response.usuario;
					show_transacction(0);
					console.log(response.usuario);
					// Initializa el control por token
					initializeToken();
				}
				else {
					// Si la respuesta contiene un mensaje de error, lo muestra en un alerta
					showAlertModal("Alerta", response.message);
				}
			},
			error: (xhr, status, error) => {
				console.error('Error en la solicitud:', error);
			}
		});
	});
}

// Muestra la opcion deseada
function show_transacction(id) {
	// Comprueba de que los id existan
	if (id < 0 || id >= MENU_OPCIONES.length) return;
	
	// Realiza los cambios dinamicamente
	$('#operations-wrapper').html(MENU_OPCIONES[id]);
	
	// Carga los datos al comienzo si es necesario.
	if (id == 4) consultar_saldo();
	else if (id == 5) loadReportes();
}

// Carga los Reportes
function loadReportes() {
	if (LOGIN_USUARIO) {
		// Cargamos la data
		$.ajax({
			url: 'index.php',
			type: 'GET',
			data: { action: 'get_reportes', id_usuario: LOGIN_USUARIO.id_usuario, },
			dataType: 'json',
			success: (response) => {
				// Limpiar la tabla antes de agregar nuevos datos
				$('.reportes-table tbody').empty();
				if (response.length > 0) {
					// Si hay reportes, agregarlos a la tabla
					for (let i = 0; i < response.length; i++) {
						const element = response[i];
						// const encodedJson = '\'' + encodeURIComponent(JSON.stringify(element)) + '\'';
						$('.reportes-table tbody').append(
							'<tr><th scope="row">' + element.id_transaccion + '</th>' +
							'<td>' + element.nombre + '</td>' +
							'<td>' + element.descripcion + '</td>' +
							'<td>' + element.monto + '</td>' +
							'<td>' + element.fecha + '</td>' +
							'<td>' + element.cuenta.id_cuenta + '</td>' +
							'</tr>'
						);
					}
				}
				else {
					// Si no hay reportes, mostrar un mensaje
					$('.reportes-table tbody').append('<tr><td colspan="7" align="center">No hay reportes Registrados</td></tr>');
				}
			},
			error: (xhr, status, error) => {
				console.error('Error en la solicitud:', error);
			}
		});
	}
	else {
		showAlertModal("Alerta", "No ha iniciado sesión");
	}
}

// Retiro de efectivo
function realizar_retiro() {
	if (LOGIN_USUARIO == null) {
		showAlertModal("Alerta", "No ha iniciado sesión");
		return;
	}
	
	// Realiza una solicitud AJAX para comprobar el saldo
	$.ajax({
		url: 'index.php',
		type: 'GET',
		data: { action: 'get_cuenta_saldo', id_usuario: LOGIN_USUARIO.id_usuario },
		dataType: 'json',
		success: (response) => {
			// Monto a retirar
			const monto = parseInt($('#operations-wrapper .body .mb-3 #monto').val());
			if (monto < 1 || monto > response.saldo) {
				if (monto > response.saldo) {
					showAlertModal("Alerta", "No tiene saldo suficiente en su cuenta.");
				}
				else {
					showAlertModal("Alerta", "El monto a retirar debe ser mayor a 0.");
				}
				return;
			}
			
			// ===========================================================
			// Proceder con el retiro
			// ===========================================================
			
			// Realiza una solicitud AJAX para retirar el dinero indicado
			$.ajax({
				url: 'index.php',
				type: 'POST',
				data: {
					action: 'create_transaction',
					id_usuario: LOGIN_USUARIO.id_usuario,
					nombre: 'Retiro',
					descripcion: 'Retiro de dinero',
					monto: -monto
				},
				dataType: 'json',
				success: (response) => {
					if (response.status == 'success') {
						showAlertModal("Alerta", 'La transacción se realizó con éxito.', () => show_transacction(0));
					}
					else {
						showAlertModal("Alerta", response.message);
					}
				},
				error: (xhr, status, error) => {
					console.error('Error en la solicitud:', error);
				}
			});
		},
		error: (xhr, status, error) => {
			console.error('Error en la solicitud:', error);
		}
	});
}

// Realiza la accion de deposito
function realizar_deposito() {
	if (LOGIN_USUARIO == null) {
		showAlertModal("Alerta", "No ha iniciado sesión");
		refreshPage();
		return;
	}
	
	// Monto a depósitar
	const monto = parseInt($('#operations-wrapper .body .mb-3 #monto').val());
	if (monto <= 0) {
		showAlertModal("Alerta", "El monto a depósitar debe ser mayor a 0.");
		return;
	}
	
	// Realiza una solicitud AJAX para depositar el dinero
	$.ajax({
		url: 'index.php',
		type: 'POST',
		data: {
			action: 'create_transaction',
			id_usuario: LOGIN_USUARIO.id_usuario,
			nombre: 'Depósito',
			descripcion: 'Depósito de dinero',
			monto: monto
		},
		dataType: 'json',
		success: (response) => {
			if (response.status == 'success') {
				showAlertModal("Alerta", 'El depósito se realizó con éxito.', () => show_transacction(0));
			}
			else {
				showAlertModal("Alerta", response.message);
			}
		},
		error: (xhr, status, error) => {
			console.error('Error en la solicitud:', error);
		}
	});
}

// Realiza la accion de transferir dinero a otra cuenta
function realizar_transferencia() {
	if (LOGIN_USUARIO == null) {
		showAlertModal("Alerta", "No ha iniciado sesión");
		return;
	}
	
	// Monto
	const monto = parseInt($('#operations-wrapper .body .mb-3 #monto').val());
	if (monto <= 0) {
		showAlertModal("Alerta", "El monto a transferir debe ser mayor a 0.");
		return;
	}
	// Comprobamos que la cuenta no sea la misma
	const tarjetaNumero = $('#operations-wrapper .body .mb-3 #cuentaDestino').val();
	if (LOGIN_USUARIO.nombre === tarjetaNumero) {
		showAlertModal("Alerta", "No se puede realizar esta transacción a la misma cuenta");
		return;
	}
	else if (tarjetaNumero == null || tarjetaNumero === "") {
		showAlertModal("Alerta", "El número de cuenta no puede estar vacío.");
		return;
	}
	
	// Comprobamos si hay fondos suficientes
	$.ajax({
		url: 'index.php',
		type: 'GET',
		data: { action: 'get_cuenta_saldo', id_usuario: LOGIN_USUARIO.id_usuario },
		dataType: 'json',
		success: (response) => {
			const saldo = response.saldo;
			
			// Si el saldo es menor que el monto no se puede realizar la transaccion
			if (saldo < monto) {
				showAlertModal("Alerta", "Fondos insuficientes.");
				return;
			}
			
			// Comprobamos que la cuenta de destino exista
			$.ajax({
				url: 'index.php',
				type: 'POST',
				data: { action: 'check_exist_user', tarjetaNumero: tarjetaNumero },
				dataType: 'json',
				success: (response) => {
					console.log(response);
					if (response.status == 'success') {
						const transactionUser = response.usuario;
						
						// Realiza la operacion de deposito a la cuenta de destino
						$.ajax({
							url: 'index.php',
							type: 'POST',
							data: { action: 'create_transaction', id_usuario: transactionUser.id_usuario, nombre: 'Depósito', descripcion: 'Depósito de dinero', monto: monto },
							dataType: 'json',
							success: (response2) => {
								if (response2.status == 'success') {
									
									// Retiramos el dinero de la cuenta actual
									$.ajax({
										url: 'index.php',
										type: 'POST',
										data: { action: 'create_transaction', id_usuario: LOGIN_USUARIO.id_usuario, nombre: 'Retiro', descripcion: 'Retiro de dinero', monto: -monto },
										dataType: 'json',
										success: (response3) => {
											if (response3.status == 'success') {
												showAlertModal("Alerta", "La transferencia se realizó con éxito.", () => show_transacction(0));
											}
											else {
												showAlertModal("Alerta", response3.message);
											}
										},
										error: (xhr, status, error) => {
											console.error('Error al procesar el retiro:', error);
										}
									});
									
								}
								else {
									showAlertModal("Alerta", "Error al depositar el dinero: " + response2.message);
								}
							},
							error: (xhr, status, error) => {
								console.error('Error al procesar el depósito:', error);
							}
						});
						
					}
					else {
						showAlertModal("Alerta", "Esta cuenta no existe.");
					}
				},
				error: (xhr, status, error) => {
					console.error('Error al verificar la cuenta de destino:', error);
				}
			});
			
		},
		error: (xhr, status, error) => {
			console.error('Error al obtener el saldo:', error);
		}
	});
}

// Actualizar el monto actual de la cuenta
function consultar_saldo() {
	if (LOGIN_USUARIO == null) {
		showAlertModal("Alerta", "No ha iniciado sesión");
		return;
	}
	
	// Realiza una solicitud AJAX para comprobar el saldo
	$.ajax({
		url: 'index.php',
		type: 'GET',
		data: { action: 'get_cuenta_saldo', id_usuario: LOGIN_USUARIO.id_usuario },
		dataType: 'json',
		success: (response) => {
			// Carga el saldo
			const saldo = $('#operations-wrapper .body .mb-3 .saldo');
			saldo.text("$" + formatWithCommas(response.saldo));
		},
		error: (xhr, status, error) => {
			console.error('Error en la solicitud:', error);
		}
	});
}