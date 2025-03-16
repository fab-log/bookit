let admin = false;

const userLogin = async (event) => {
	event.preventDefault();
	const inpLoginUserPassword = document.querySelector("#inpLoginUserPassword");
	let data = {
		password: inpLoginUserPassword.value
	}
	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data)
	};
	const response = await fetch("/bookit.loginUser", options);
	const serverResponse = await response.json();
	let status = serverResponse.status;
	console.log({ status });
	if (serverResponse.status != "OK") {
		showAlert(`Fehler!<br>${serverResponse.status}<br>Bitte erneut versuchen.`);
		inpLoginUserPassword.value = "";
		inpLoginUserPassword.focus();
		return;
	}
	admin = false;
	await getBookings();
	await getCatering();
	await getRooms();
	await getSeatings();
	await getFees();
	await getEquipment();
	renderHome();
}

const adminLogin = async (event) => {
	event.preventDefault();
	const inpLoginAdminPassword = document.querySelector("#inpLoginAdminPassword");
	let data = {
		password: inpLoginAdminPassword.value
	}
	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data)
	};
	const response = await fetch("/bookit.loginAdmin", options);
	const serverResponse = await response.json();
	let status = serverResponse.status;
	console.log({ status });
	if (serverResponse.status != "OK") {
		showAlert(`Fehler!<br>${serverResponse.status}<br>Bitte erneut versuchen.`);
		inpLoginAdminPassword.value = "";
		inpLoginAdminPassword.focus();
		return;
	}
	admin = true;
	await getBookings();
	await getCatering();
	await getRooms();
	await getSeatings();
	await getFees();
	await getEquipment();
	renderHome();
	console.log({ admin });
}

const toggleAdminLogin = (event) => {
	event.preventDefault();
	const frmAdminLogin = document.querySelector("#frmAdminLogin");
	if (frmAdminLogin.classList.contains("slide-open")) {
		frmAdminLogin.classList.remove("slide-open");
		frmAdminLogin.classList.add("collapse-vertically");
		document.querySelector("#inpLoginUserPassword").focus();
		setTimeout(() => {
			frmAdminLogin.innerHTML = "";			
		}, 1000);
	} else {
		frmAdminLogin.innerHTML = `
			<form>
				<input type="password" placeholder="Admin-Passwort" id="inpLoginAdminPassword"><br>
				<button type="submit" id="btnAdminLogin" onclick="adminLogin(event)">anmelden</button>
			</form>
		`;
		frmAdminLogin.classList.remove("collapse-vertically");
		frmAdminLogin.classList.add("slide-open");
		setTimeout(() => {
			document.querySelector("#inpLoginAdminPassword").focus();			
		}, 300);
	}
}

const renderLogin = () => {
	console.log("=> fn renderLogin triggered");
	paginator = "login";
	console.log({ paginator });
	closeAllModals();
	modalPopUp.style.display = "block";
	// <img src="assets/key.webp" alt="Schlüssel" class="icon"></img>
	modalPopUp.innerHTML = `
		<img src="assets/logo.webp" alt="Logo" style="width: 250px;"><br>
		<h2>Anmelden</h2>
		<p>Diese Seite ist nicht öffentlich. Bitte geben Sie Ihr Passwort ein.</p>
		<hr>
		<form>
			<input type="password" placeholder="Passwort" id="inpLoginUserPassword"><br>
			<button type="submit" id="btnUserLogin" onclick="userLogin(event)">anmelden</button>
		</form>
		<hr>
		<p onclick="toggleAdminLogin(event)" class="small pseudo-link">Als Administrator anmelden</p>
		<div id="frmAdminLogin">
		</div>
	`;
	document.querySelector("#inpLoginUserPassword").focus();
}

renderLogin();