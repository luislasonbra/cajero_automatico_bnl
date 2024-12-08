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
		<div class="table-responsive w-100">
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

$(document).ready(() => {
	// LOGIN
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
				}
				else {
					// Si la respuesta contiene un mensaje de error, lo muestra en un alerta
					alert(response.message);
				}
			},
			error: (xhr, status, error) => {
				console.error('Error en la solicitud:', error);
			}
		});
		
	});
});

function formatWithCommas(value) {
	const number = parseFloat(value); // Convertir a número
	if (isNaN(number)) return "Invalid input";
	return number.toLocaleString('en-US'); // Cambia 'en-US' por otra región si es necesario
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

function show_login() {
	// Oculta el primer menu
	hide_and_add_class('#opciones-wrapper');
	// Muestra el menu de opciones
	show_and_remove_class('#operations-wrapper');
}

function show_transacction(id) {
	// Comprueba de que los id existan
	if (id < 0 || id >= MENU_OPCIONES.length) return;
	
	// Realiza los cambios dinamicamente
	$('#operations-wrapper').html(MENU_OPCIONES[id]);
	
	// Carga los datos al comienzo si es necesario.
	if (id == 4) consultar_saldo();
	else if (id == 5) loadReportes();
}

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
		alert("No ha iniciado sesión");
	}
}

// Retiro de efectivo
function realizar_retiro() {
	if (LOGIN_USUARIO == null) {
		alert("No ha iniciado sesión");
		return;
	}
	// alert("Retiro de efectivo");
	
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
					alert("No tiene saldo suficiente en su cuenta.");
				}
				else {
					alert("El monto a retirar debe ser mayor a 0.");
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
						alert('La transacción se realizó con éxito.');
						show_transacction(0);
					}
					else {
						alert(response.message);
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

function realizar_deposito() {
	if (LOGIN_USUARIO == null) {
		alert("No ha iniciado sesión");
		return;
	}
	
	// Monto a depósitar
	const monto = parseInt($('#operations-wrapper .body .mb-3 #monto').val());
	if (monto <= 0) {
		alert("El monto a depósitar debe ser mayor a 0.");
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
				alert('El depósito se realizó con éxito.');
				show_transacction(0);
			}
			else {
				alert(response.message);
			}
		},
		error: (xhr, status, error) => {
			console.error('Error en la solicitud:', error);
		}
	});
}

function realizar_transferencia() {
	alert("Transferencia");
}

function consultar_saldo() {
	if (LOGIN_USUARIO == null) {
		alert("No ha iniciado sesión");
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