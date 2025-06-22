const renderTerms = () => {
	if (modalPopUp.style.display === "block") {
		modalPopUp.style.display = "none";
		modalPopUp.innerHTML = ""		;
	} else {
		modalPopUp.style.display = "block";
		modalPopUp.innerHTML = `
			<img src="assets/x.webp" alt="X" class="x" onclick="dismiss()">
			<h3>Buchungsbedingungen und Preise</h3>
			<hr>
			<div class="terms-grid-container">
				<a href="assets/Preise_BTZ.pdf" target="_blank" onclick="dismiss()">
					<figure>
						<img src="assets/screenshot_preise.png" alt="Screenshot Preise">
						<figcaption>Preise</figcaption>
					</figure>
				</a>
				<a href="assets/Buchungsbedingungen_BTZ.pdf" target="_blank" onclick="dismiss()">
					<figure>
						<img src="assets/screenshot_bedingungen.png" alt="Screenshot Buchungsbedingungen">
						<figcaption>Buchungsbedingungen</figcaption>
					</figure>
				</a>
			</div>
		`;
	}
}

const logout = () => {
	admin = false;
	window.location.reload();
}

const renderHome = (edits) => {
	console.log("=> fn renderHome triggered");
	if (edits === 0) numberOfEdits = 0;
	if (numberOfEdits > 0) {
		confirmDismissBooking();
		return;
	}
	paginator = "home";
	pageHistory.push("home");
	history.pushState({ page: "home" }, "", "");
	console.log({ paginator });
	editId = "";
	closeAllModals();
	header.style.display = "none";
	let figureModeString;
	if (document.body.classList.contains("dark")) {
		figureModeString = `
			<img src="assets/sun.webp" alt="Sonne">
			<figcaption>Heller Modus</figcaption>
		`;
	} else {
		figureModeString = `
			<img src="assets/moon.webp" alt="Mond">
			<figcaption>Dunkler Modus</figcaption>
		`;
	}
	modalMax.style.display = "block";
	modalMax.innerHTML = `
		<div class="home-header">
			<img src="assets/logo.webp" alt="logo" style="width: 250px;">
			<h2>Tagungsräume im BTZ oder MCZ buchen</h2>
		</div>
		<div class="home-grid-container">
			<div class="home-grid-item" onclick="renderCalendar(selectedYear, selectedMonth)">
				<img src="assets/agenda.webp" alt="Screenshot Kalender">
				<h3>Kalender</h3>
				<p>Schauen Sie im Kalender nach, an welchen Tagen Räume buchbar sind.</p>
			</div>
			<div class="home-grid-item" onclick="renderOneDay(lastSelectedDay)">
				<img src="assets/one.webp" alt="Screenshot Kalender">
				<h3>Tagesansicht</h3>
				<p>Übersicht aller Räume an einem bestimmten Tag.</p>
			</div>
			<div class="home-grid-item" onclick="renderGuidedMenu()">
				<img src="assets/booking.webp" alt="Screenshot Kalender">
				<h3>Buchen</h3>
				<p>Öffnen Sie direkt den Buchungsdialog.</p>
			</div>
			<div class="home-grid-item" onclick="renderTerms()">
				<img src="assets/euro.webp" alt="Screenshot Kalender">
				<h3>Preise und Bedingungen</h3>
				<p>Was kostet mich eine Buchung und was muss ich beachten?</p>
			</div>
		</div>
		<hr>
		<div class="home-footer">

			<figure id="figToggleMode" onclick="toggleMode()">
				${figureModeString}
			</figure>

			<figure onclick="logout()">
				<img src="assets/logout.webp" alt="log out">
				<figcaption>abmelden</figcaption>
			</figure>

		</div>
	`;
	if (admin === true) {
		const homeFooter = document.querySelector(".home-footer");
		homeFooter.style.gridTemplateColumns = "auto auto auto";
		homeFooter.insertAdjacentHTML("afterbegin", `
			<figure onclick="renderAdminTools()">
				<img src="assets/settings.webp" alt="log out">
				<figcaption>Adminbereich</figcaption>
			</figure>		
		`);
	}
}
// ### DARK MODE ###

let config = {};

const toggleMode = () => {

    const figToggleMode = document.querySelector("#figToggleMode");
	
	if (document.body.classList.contains("dark")) {
		document.body.classList.remove("dark");
        figToggleMode.innerHTML = `
			<img src="assets/moon.webp" alt="Mond">
			<figcaption>Dunkler Modus</figcaption>
		`;
		config.mode = "light";
		localStorage.setItem("bookitConfig", JSON.stringify(config));
	} else {
		document.body.classList.add("dark");
        figToggleMode.innerHTML = `
			<img src="assets/sun.webp" alt="Sonne">
			<figcaption>Heller Modus</figcaption>
		`;
		config.mode = "dark";
		localStorage.setItem("bookitConfig", JSON.stringify(config));
	}
}

const checkLocalStorage = () => {
    console.log("=> fn checkLocalStorage triggered");
    if (!localStorage.getItem("bookitConfig")) {
      config.mode = "light";
	  console.log("mode: " + config.mode);
      return;
    }
    config = JSON.parse(localStorage.getItem("bookitConfig"));
    if (config.mode === "dark") {
      toggleMode();
	  console.log("mode: " + config.mode);
    } else {
      config.mode = "light";
	  console.log("mode: " + config.mode);
	}
}
