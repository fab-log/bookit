// 	 ###### 	 #####  	####### 	 ###### 	 #####  	   #    	#     # 	 ###### 
// 	#       	#     # 	   #    	#       	#     # 	   #    	##    # 	#       
// 	#       	####### 	   #    	######  	######  	   #    	#  #  # 	#   ### 
// 	#       	#     # 	   #    	#       	#  #    	   #    	#   # # 	#     # 
// 	 ###### 	#     # 	   #    	 ###### 	#    #  	   #    	#    ## 	 #####  

const addNewArticle = () => {
	console.log("=> fn addNewArticle triggered");
	const inpNewArticleName = document.querySelector("#inpNewArticleName");
	const inpNewArticleDescription = document.querySelector("#inpNewArticleDescription");
	const inpNewArticlePrice = document.querySelector("#inpNewArticlePrice");
	if (inpNewArticleName.value === "" || inpNewArticleDescription.value === "" || inpNewArticlePrice.value === "") {
		showAlert("Bitte alle Felder ausfüllen");
		return;
	}
	let id = `catering_${Date.now()}_${randomCyphers(10)}`;
	let newCateringObject = {
		name: inpNewArticleName.value,
		description: inpNewArticleDescription.value,
		price: Number(inpNewArticlePrice.value.replace(",", ".")),
		position: catering.length + 1,
		id
	}
	catering.push(newCateringObject);
	tblSetCatering.innerHTML += `
		<tr>
			<td><input type="checkbox" checked id="chb_${newCateringObject.id}"></td>
			<td><input type="text" id="inpName_${newCateringObject.id}" value="${newCateringObject.name}"></td>
			<td><input type="number" id="inpPrice_${newCateringObject.id}" value="${newCateringObject.price.toFixed(2)}"></td>
		</tr>
	`;
	dismiss();
}

const renderAddNewCateringArticle = () => {
	console.log("=> fn renderAddNewCateringArticle triggered");
	modalPopUp.style.display = "block";
	modalPopUp.innerHTML = `
		<h3>Artikel hinzufügen</h3>
		<table>
			<tr>
				<td>Bezeichnung</td><td><input type="text" maxlength="100" id="inpNewArticleName"></td>
			</tr>
			<tr>
				<td>Beschreibung</td><td><input type="text" maxlength="100" value="Einzelpreis: € " id="inpNewArticleDescription"></td>
			</tr>
			<tr>
				<td>Preis <span class="small decent">(pro TeilnehmerIn)</span></td><td><input type="number" max="100" id="inpNewArticlePrice"></td>
			</tr>
		</table>
		<hr>
		<button type="button" onclick="dismiss()">abbrechen</button>
		<button type="button" onclick="addNewArticle()">speichern</button>
	`;
}

const saveCatering = async () => {
	console.log("=> fn saveCatering triggered");
	let toBeRemoved = [];
	for (let i = 0; i < catering.length; i++) {
		if (document.querySelector(`#chb_${catering[i].id}`).checked != true) toBeRemoved.push(catering[i].id);
		let inpName = document.querySelector(`#inpName_${catering[i].id}`);
		let inpPrice = document.querySelector(`#inpPrice_${catering[i].id}`);
		if (inpName.value.replaceAll(" ", "") === "") {
			showAlert("Bitte keine Felder leer lassen", 2000);
			inpName.focus();
			return;
		}
		if (inpPrice.value === "") {
			showAlert("Bitte keine Felder leer lassen", 2000);
			inpPrice.focus();
			return;
		}
		catering[i].name = inpName.value;
		catering[i].price = Number(inpPrice.value.trim().replace(",", "."));

	}
	catering.forEach(e => {
	});
	catering = catering.filter(el => !toBeRemoved.includes(el.id));

	// redefine position in case a room has been removed
	for (let i = 0; i < catering.length; i++) {
		catering[i].position = i + 1;
	}
	
	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(catering)
	};
	const response = await fetch("/bookit.updateCatering", options);
	const serverResponse = await response.json();
	let status = serverResponse.status;
	console.log({ status });
	if (serverResponse.status != "OK") {
		showAlert(`Fehler!<br>${serverResponse.status}<br>Bitte erneut versuchen.`);
		return;
	}
	showAlert("Änderungen wurden gespeichert");
	renderAdminTools();
}

const cateringMoveOneUp = (id) => {
	let index = catering.findIndex(e => e.id === id);
	let position = catering[index].position;
	if (position === 1) return;
	let indexBefore = catering.findIndex(e => e.position === position - 1);
	catering[index].position = position - 1;
	catering[indexBefore].position = position;
	catering.sort((a, b) => a.position - b.position);
	renderSetCatering();
}

const cateringMoveOneDown = (id) => {
	let index = catering.findIndex(e => e.id === id);
	let position = catering[index].position;
	if (position === catering.length) return;
	let indexAfter = catering.findIndex(e => e.position === position + 1);
	catering[index].position = position + 1;
	catering[indexAfter].position = position;
	catering.sort((a, b) => a.position - b.position);
	renderSetCatering();
}

const renderSetCatering = () => {
	console.log("=> fn renderSetCatering triggered");
	modalMax.innerHTML = `
		<div class="book-main">
			<h3>Catering anpassen</h3>
			<p>Um einen Artikel zu löschen, entfernen Sie einfach vor dem Speichern das Häkchen vor der Bezeichnung</p>
			<hr>
			<table id="tblSetCatering"></table>
			<hr>
			<button type="button" style="float: none;" onclick="renderAddNewCateringArticle()">Artikel hinzufügen</button>
			<hr>
			<button type="button" onclick="saveCatering()">Änderungen speichern</button>
			<button type="button" onclick="renderAdminTools()">abbrechen</button>
            <div class="spacer"></div>
		</div>
	`;
	const tblSetCatering = document.querySelector("#tblSetCatering");
	for (let i = 0; i < catering.length; i++) {
		let arrowUp = `<img src="assets/arrow_right.webp" alt="arrow up" class="arrow-up" onclick="cateringMoveOneUp('${catering[i].id}')"`;
		if (i === 0) arrowUp = "";
		let arrowDown = `<img src="assets/arrow_right.webp" alt="arrow down" class="arrow-down" onclick="cateringMoveOneDown('${catering[i].id}')"`;
		if (i === catering.length - 1) arrowDown = "";
        tblSetCatering.innerHTML += `
            <tr>
                <td><input type="checkbox" checked id="chb_${catering[i].id}"></td>
				<td><input type="text" id="inpName_${catering[i].id}" value="${catering[i].name}"></td>
				<td><input type="number" id="inpPrice_${catering[i].id}" value="${catering[i].price.toFixed(2)}"></td>
				<td>${arrowUp}</td>
				<td>${arrowDown}</td>
            </tr>
        `;
    };
}


// 	 #####  	 #####  	 ###### 	 ###### 	#     # 	 #####  	 #####  	######  	 ###### 
// 	#     # 	#     # 	#       	#       	#     # 	#     # 	#     # 	#     # 	#       
// 	######  	####### 	 #####  	 #####  	#  #  # 	#     # 	######  	#     # 	 #####  
// 	#       	#     # 	      # 	      # 	#  #  # 	#     # 	#  #    	#     # 	      # 
// 	#       	#     # 	######  	######  	 #####  	 #####  	#    #  	######  	######  

const updateUserPassword = async () => {
	console.log("=> fn updateUserPassword triggered");
	const inpSetUserPassword = document.querySelector("#inpSetUserPassword");
	const inpConfirmUserPassword = document.querySelector("#inpConfirmUserPassword");
	if (inpSetUserPassword.value != inpConfirmUserPassword.value) {
		showAlert("Passwörter stimmen nicht überein.");
		inpSetUserPassword.value = "";
		inpConfirmUserPassword.value = "";
		inpSetUserPassword.focus();
		return;
	}
	if (inpSetUserPassword.length < 8) {
		showAlert("Passwort muss eine Länge von mindestens 8 Zeichen haben.");
		inpSetUserPassword.value = "";
		inpConfirmUserPassword.value = "";
		inpSetUserPassword.focus();
		return;
	}
	let data = {
		userPassword: inpSetUserPassword.value
	}
	
	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data)
	};
	const response = await fetch("/bookit.updateUserPassword", options);
	const serverResponse = await response.json();
	let status = serverResponse.status;
	console.log({ status });
	if (serverResponse.status != "OK") {
		showAlert(`Fehler!<br>${serverResponse.status}<br>Bitte erneut versuchen.`);
		return;
	}
	showAlert("Das Nutzerpasswort wurde geändert");
	renderAdminTools();
}

const updateAdminPassword = async () => {
	console.log("=> fn updateAdminPassword triggered");
	const inpSetAdminPassword = document.querySelector("#inpSetAdminPassword");
	const inpConfirmAdminPassword = document.querySelector("#inpConfirmAdminPassword");
	if (inpSetAdminPassword.value != inpConfirmAdminPassword.value) {
		showAlert("Passwörter stimmen nicht überein.");
		inpSetAdminPassword.value = "";
		inpConfirmAdminPassword.value = "";
		inpSetAdminPassword.focus();
		return;
	}
	if (inpSetAdminPassword.length < 8) {
		showAlert("Passwort muss eine Länge von mindestens 8 Zeichen haben.");
		inpSetAdminPassword.value = "";
		inpConfirmAdminPassword.value = "";
		inpSetAdminPassword.focus();
		return;
	}
	let data = {
		adminPassword: inpSetAdminPassword.value
	}
	
	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data)
	};
	const response = await fetch("/bookit.updateAdminPassword", options);
	const serverResponse = await response.json();
	let status = serverResponse.status;
	console.log({ status });
	if (serverResponse.status != "OK") {
		showAlert(`Fehler!<br>${serverResponse.status}<br>Bitte erneut versuchen.`);
		return;
	}
	showAlert("Das Administratorpasswort wurde geändert");
	renderAdminTools();
}

const renderSetPasswords = () => {
	console.log("=> fn renderSetPasswords triggered");
	modalMax.innerHTML = `
		<div class="book-main">
			<h3>Passwörter ändern</h3>
			<hr>
			<p><b>Allgemeines Nutzerpasswort</b></p>
			<input type="password" id="inpSetUserPassword" placeholder="Neues Passwort"><br>
			<input type="password" id="inpConfirmUserPassword" placeholder="Passwort wiederholen">
			<br>
			<button type="button" style="width: fit-content;" onclick="updateUserPassword()">Nutzerpasswort ändern</button>
			<button type="button" onclick="renderAdminTools()">abbrechen</button>
            <div class="spacer"></div>
			<hr>
			<p><b>Administratorpasswort</b></p>
			<input type="password" id="inpSetAdminPassword" placeholder="Neues Passwort"><br>
			<input type="password" id="inpConfirmAdminPassword" placeholder="Passwort wiederholen">
			<br>
			<button type="button" style="width: fit-content;" onclick="updateAdminPassword()">Administratorpasswort ändern</button>
			<button type="button" onclick="renderAdminTools()">abbrechen</button>
            <div class="spacer"></div>
		</div>
	`;
}


// 	 #####  	 #####  	 #####  	#     # 	 ###### 
// 	#     # 	#     # 	#     # 	##   ## 	#       
// 	######  	#     # 	#     # 	# # # # 	 #####  
// 	#  #    	#     # 	#     # 	#  #  # 	      # 
// 	#    #  	 #####  	 #####  	#     # 	######  

const addNewRoom = () => {
	console.log("=> fn addNewRoom triggered");
	const inpNewRoomLocation = document.querySelector("#inpNewRoomLocation");
	const inpNewRoomName = document.querySelector("#inpNewRoomName");
	const inpNewRoomFloor = document.querySelector("#inpNewRoomFloor");
	const inpNewRoomMaxParticipants = document.querySelector("#inpNewRoomMaxParticipants");
	if (inpNewRoomLocation.value === "" || inpNewRoomName.value === "" || inpNewRoomFloor.value === "" || inpNewRoomMaxParticipants.value === "") {
		showAlert("Bitte alle Felder ausfüllen");
		return;
	}
	let id = `room_${Date.now()}_${randomCyphers(10)}`;
	let newRoomObject = {
		id,
		location: inpNewRoomLocation.value,
		roomName: inpNewRoomName.value,
		floor: inpNewRoomFloor.value,
		maxParticipants: Number(inpNewRoomMaxParticipants.value),
		position: rooms.length + 1
	}
	rooms.push(newRoomObject);
	tblSetRooms.innerHTML += `
		<tr>
			<td><input type="checkbox" checked id="chb_${newRoomObject.id}"></td>
			<td><input type="text" class="horizontal-margin-0" id="inpLocation_${newRoomObject.id}" value="${newRoomObject.location}"></td>
			<td><input type="text" class="horizontal-margin-0" id="inpName_${newRoomObject.id}" value="${newRoomObject.roomName}"></td>
			<td><input type="text" class="horizontal-margin-0" id="inpFloor_${newRoomObject.id}" value="${newRoomObject.floor}"></td>
			<td><input type="number" class="horizontal-margin-0" style="width: 100px;" id="inpMaxParticipants_${newRoomObject.id}" value="${newRoomObject.maxParticipants}"></td>
		</tr>
	`;
	dismiss();
}

const saveRooms = async () => {
	console.log("=> fn saveRooms triggered");
	let toBeRemoved = [];
	for (let i = 0; i < rooms.length; i++) {
		if (document.querySelector(`#chb_${rooms[i].id}`).checked != true) toBeRemoved.push(rooms[i].id);
		let inpLocation = document.querySelector(`#inpLocation_${rooms[i].id}`);
		let inpName = document.querySelector(`#inpName_${rooms[i].id}`);
		let inpFloor = document.querySelector(`#inpFloor_${rooms[i].id}`);
		let inpMaxParticipants = document.querySelector(`#inpMaxParticipants_${rooms[i].id}`);
		if (inpLocation.value === "") {
			showAlert("Bitte keine Felder leer lassen", 2000);
			inpLocation.focus();
			return;
		}
		if (inpName.value === "") {
			showAlert("Bitte keine Felder leer lassen", 2000);
			inpName.focus();
			return;
		}
		if (inpFloor.value === "") {
			showAlert("Bitte keine Felder leer lassen", 2000);
			inpFloor.focus();
			return;
		}
		if (inpMaxParticipants.value === "") {
			showAlert("Bitte keine Felder leer lassen", 2000);
			inpMaxParticipants.focus();
			return;
		}
		rooms[i].location = inpLocation.value;
		rooms[i].roomName = inpName.value;
		rooms[i].floor = inpFloor.value;
		rooms[i].maxParticipants = Number(inpMaxParticipants.value);
	}
	rooms = rooms.filter(el => !toBeRemoved.includes(el.id)).sort((a, b) => a.position - b.position);

	// redefine position in case a room has been removed
	for (let i = 0; i < rooms.length; i++) {
		rooms[i].position = i + 1;
	}
	
	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(rooms)
	};
	const response = await fetch("/bookit.updateRooms", options);
	const serverResponse = await response.json();
	let status = serverResponse.status;
	console.log({ status });
	if (serverResponse.status != "OK") {
		showAlert(`Fehler!<br>${serverResponse.status}<br>Bitte erneut versuchen.`);
		return;
	}

	showAlert("Änderungen wurden gespeichert");
	renderAdminTools();
}

const roomsMoveOneUp = (id) => {
	let index = rooms.findIndex(e => e.id === id);
	let position = rooms[index].position;
	if (position === 1) return;
	let indexBefore = rooms.findIndex(e => e.position === position - 1);
	rooms[index].position = position - 1;
	rooms[indexBefore].position = position;
	rooms.sort((a, b) => a.position - b.position);
	renderSetRooms();
}

const roomsMoveOneDown = (id) => {
	let index = rooms.findIndex(e => e.id === id);
	let position = rooms[index].position;
	if (position === rooms.length) return;
	let indexAfter = rooms.findIndex(e => e.position === position + 1);
	rooms[index].position = position + 1;
	rooms[indexAfter].position = position;
	rooms.sort((a, b) => a.position - b.position);
	renderSetRooms();
}

const renderAddNewRoom = () => {
	console.log("=> fn renderAddNewRoom triggered");
	modalPopUp.style.display = "block";
	modalPopUp.innerHTML = `
		<h3>Raum hinzufügen</h3>
		<table>
			<tr>
				<td>Ort</td><td><input type="text" maxlength="100" id="inpNewRoomLocation"></td>
			</tr>
			<tr>
				<td>Raumname</td><td><input type="text" maxlength="100" id="inpNewRoomName"></td>
			</tr>
			<tr>
				<td>Geschoss</td><td><input type="text" maxlength="100" id="inpNewRoomFloor"></td>
			</tr>
			<tr>
				<td>max. TeilnehmerInnenzahl</td><td><input type="number" max="150" id="inpNewRoomMaxParticipants"></td>
			</tr>
		</table>
		<hr>
		<button type="button" onclick="dismiss()">abbrechen</button>
		<button type="button" onclick="addNewRoom()">speichern</button>
	`;
}

const renderSetRooms = () => {
	console.log("=> fn renderSetRooms triggered");
	modalMax.innerHTML = `
		<div class="book-main" style="max-width: calc(100% - 24px);">
			<h3>Räume anpassen</h3>
			<p>Um einen Raum zu löschen, entfernen Sie einfach vor dem Speichern das Häkchen vor der Bezeichnung</p>
			<hr>
			<table id="tblSetRooms"></table>
			<hr>
			<button type="button" style="float: none;" onclick="renderAddNewRoom()">Raum hinzufügen</button>
			<hr>
			<button type="button" onclick="saveRooms()">Änderungen speichern</button>
			<button type="button" onclick="renderAdminTools()">abbrechen</button>
            <div class="spacer"></div>
		</div>
	`;
	const tblSetRooms = document.querySelector("#tblSetRooms");
	tblSetRooms.innerHTML = `
		<tr>
			<th>aktiv</th>
			<th>Ort</th>
			<th>Raumname</th>
			<th>Geschoss</th>
			<th>max. TN</th>
			<th class="small">hoch</th>
			<th class="small">runter</th>
		</tr>
	`;
	for (let i = 0; i < rooms.length; i++) {
		let arrowUp = `<img src="assets/arrow_right.webp" alt="arrow up" class="arrow-up" onclick="roomsMoveOneUp('${rooms[i].id}')"`;
		if (i === 0) arrowUp = "";
		let arrowDown = `<img src="assets/arrow_right.webp" alt="arrow down" class="arrow-down" onclick="roomsMoveOneDown('${rooms[i].id}')"`;
		if (i === rooms.length - 1) arrowDown = "";
        tblSetRooms.innerHTML += `
            <tr>
                <td><input type="checkbox" checked id="chb_${rooms[i].id}"></td>
				<td><input type="text" class="horizontal-margin-0" id="inpLocation_${rooms[i].id}" value="${rooms[i].location}"></td>
				<td><input type="text" class="horizontal-margin-0" id="inpName_${rooms[i].id}" value="${rooms[i].roomName}"></td>
				<td><input type="text" class="horizontal-margin-0" id="inpFloor_${rooms[i].id}" value="${rooms[i].floor}"></td>
				<td><input type="number" class="horizontal-margin-0" style="width: 100px;" id="inpMaxParticipants_${rooms[i].id}" value="${rooms[i].maxParticipants}"></td>
				<td>${arrowUp}</td>
				<td>${arrowDown}</td>
            </tr>
        `;
    };
}


// 	####### 	 ###### 	 ###### 	 ###### 
// 	   #    	#       	#       	#       
// 	  ###   	######  	######  	 #####  
// 	   #    	#       	#       	      # 
// 	   #    	 ###### 	 ###### 	######  

const saveFees = async () => {
	console.log("=> fn saveFees triggered");
	for (let key in fees) {
		let inpFees = document.querySelector(`#inpFees_${key}`);
		if (inpFees.value === "") {
			showAlert("Bitte füllen Sie alle Felder aus", 2000);
			inpFees.focus();
			return;
		}
		fees[key] = Number(inpFees.value.replace(",", "."));
	}
	
	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(fees)
	};
	const response = await fetch("/bookit.updateFees", options);
	const serverResponse = await response.json();
	let status = serverResponse.status;
	console.log({ status });
	if (serverResponse.status != "OK") {
		showAlert(`Fehler!<br>${serverResponse.status}<br>Bitte erneut versuchen.`);
		return;
	}

	showAlert("Änderungen wurden gespeichert");
	renderAdminTools();
}

const renderSetFees = () => {
	console.log("=> fn renderSetFees triggered");
	modalMax.innerHTML = `
		<div class="book-main">
			<h3>Gebühren anpassen</h3>
			<p>Es können lediglich die Preise angepasst werden.</p>
			<hr>
			<table id="tblSetFees"></table>
			<p class="small">discount = Nachlass für Nebenräume | 0.25 entspricht 25%</p>
			<hr>
			<button type="button" onclick="saveFees()">Änderungen speichern</button>
			<button type="button" onclick="renderAdminTools()">abbrechen</button>
            <div class="spacer"></div>
		</div>
	`;
	const tblSetFees = document.querySelector("#tblSetFees");
	for (let key in fees) {
        tblSetFees.innerHTML += `
            <tr>
				<td>${key}</td>
				<td><input type="text" id="inpFees_${key}" value="${fees[key]}"></td>
            </tr>
        `;
    };
}


// 	 ###### 	 ###### 	 #####  	####### 	   #    	#     # 	 ###### 
// 	#       	#       	#     # 	   #    	   #    	##    # 	#       
// 	 #####  	######  	####### 	   #    	   #    	#  #  # 	#   ### 
// 	      # 	#       	#     # 	   #    	   #    	#   # # 	#     # 
// 	######  	 ###### 	#     # 	   #    	   #    	#    ## 	 #####  

const addNewSeating = () => {
	console.log("=> fn addNewSeating triggered");
	const inpNewSeating = document.querySelector("#inpNewSeating");
	if (inpNewSeating.value === "") {
		showAlert("Bitte fülle das Feld aus");
		return;
	}
	seatings.push(inpNewSeating.value);
	tblSetSeatings.innerHTML += `
		<tr>
			<td><input type="checkbox" checked id="chb_${seatings.length -1}"></td>
			<td><input type="text" id="inpSeating_${seatings.length -1}" value="${inpNewSeating.value}"></td>
		</tr>
	`;
	dismiss();
}

const saveSeatings = async () => {
	console.log("=> fn saveSeatings triggered");
	let toBeRemoved = [];
	for (let i = 0; i < seatings.length; i++) {
		if (document.querySelector(`#chb_${i}`).checked != true) toBeRemoved.push(seatings[i]);
		let inpSeating = document.querySelector(`#inpSeating_${i}`);
		if (inpSeating.value === "") {
			showAlert("Bitte füllen Sie das Feld aus", 2000);
			inpSeating.focus();
			return;
		}
		seatings[i] = inpSeating.value;
	}
	seatings = seatings.filter(el => !toBeRemoved.includes(el));
	
	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(seatings)
	};
	const response = await fetch("/bookit.updateSeatings", options);
	const serverResponse = await response.json();
	let status = serverResponse.status;
	console.log({ status });
	if (serverResponse.status != "OK") {
		showAlert(`Fehler!<br>${serverResponse.status}<br>Bitte erneut versuchen.`);
		return;
	}

	showAlert("Änderungen wurden gespeichert");
	renderAdminTools();
}

const renderAddNewSeating = () => {
	console.log("=> fn renderAddNewSeating triggered");
	modalPopUp.style.display = "block";
	modalPopUp.innerHTML = `
		<h3>Bestuhlung hinzufügen</h3>
		<input type="text" maxlength="100" id="inpNewSeating">
		<hr>
		<button type="button" onclick="dismiss()">abbrechen</button>
		<button type="button" onclick="addNewSeating()">speichern</button>
	`;
}

const renderSetSeatings = () => {
	console.log("=> fn renderSetSeatings triggered");
	modalMax.innerHTML = `
		<div class="book-main">
			<h3>Bestuhlung anpassen</h3>
			<p>Um einen Eintrag zu löschen, entfernen Sie einfach vor dem Speichern das Häkchen vor der Bezeichnung</p>
			<hr>
			<table id="tblSetSeatings"></table>
			<hr>
			<button type="button" style="float: none;" onclick="renderAddNewSeating()">Bestuhlung hinzufügen</button>
			<hr>
			<button type="button" onclick="saveSeatings()">Änderungen speichern</button>
			<button type="button" onclick="renderAdminTools()">abbrechen</button>
            <div class="spacer"></div>
		</div>
	`;
	const tblSetSeatings = document.querySelector("#tblSetSeatings");
	for (let i = 0; i < seatings.length; i++) {
        tblSetSeatings.innerHTML += `
            <tr>
                <td><input type="checkbox" checked id="chb_${i}"></td>
				<td><input type="text" id="inpSeating_${i}" value="${seatings[i]}"></td>
            </tr>
        `;
    };
}


// 	 ###### 	 #####  	#     # 	   #    	 #####  	#     # 	 ###### 	#     # 	####### 
// 	#       	#     # 	#     # 	   #    	#     # 	##   ## 	#       	##    # 	   #    
// 	######  	#   # # 	#     # 	   #    	######  	# # # # 	######  	#  #  # 	   #    
// 	#       	 #####  	#     # 	   #    	#       	#  #  # 	#       	#   # # 	   #    
// 	 ###### 	      # 	 #####  	   #    	#       	#     # 	 ###### 	#    ## 	   #    

const addNewEquipment = () => {
	console.log("=> fn addNewEquipment triggered");
	const inpNewEquipment = document.querySelector("#inpNewEquipment");
	if (inpNewEquipment.value === "") {
		showAlert("Bitte fülle das Feld aus");
		return;
	}
	let newId = `equipment_${Date.now()}_${randomCyphers(10)}`;
	equipment.push(
		{
			id: newId,
			name: inpNewEquipment.value
		}
	);
	tblSetEquipment.innerHTML += `
		<tr>
			<td><input type="checkbox" checked id="chb_${equipment.length -1}"></td>
			<td><input type="text" id="inpEquipment_${equipment.length -1}" value="${inpNewEquipment.value}"></td>
		</tr>
	`;
	dismiss();
}

const saveEquipment = async () => {
	console.log("=> fn saveEquipment triggered");
	let toBeRemoved = [];
	for (let i = 0; i < equipment.length; i++) {
		if (document.querySelector(`#chb_${i}`).checked != true) toBeRemoved.push(equipment[i].id);
		let inpEquipment = document.querySelector(`#inpEquipment_${i}`);
		if (inpEquipment.value === "") {
			showAlert("Bitte füllen Sie das Feld aus", 2000);
			inpEquipment.focus();
			return;
		}
		equipment[i] = {
			id: equipment[i].id,
			name: inpEquipment.value
		}
	}
	equipment = equipment.filter(el => !toBeRemoved.includes(el.id));
	
	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(equipment)
	};
	const response = await fetch("/bookit.updateEquipment", options);
	const serverResponse = await response.json();
	let status = serverResponse.status;
	console.log({ status });
	if (serverResponse.status != "OK") {
		showAlert(`Fehler!<br>${serverResponse.status}<br>Bitte erneut versuchen.`);
		return;
	}

	showAlert("Änderungen wurden gespeichert");
	renderAdminTools();
}

const renderAddNewEquipment = () => {
	console.log("=> fn renderAddNewEquipment triggered");
	modalPopUp.style.display = "block";
	modalPopUp.innerHTML = `
		<h3>Ausrüstung hinzufügen</h3>
		<input type="text" maxlength="100" id="inpNewEquipment">
		<hr>
		<button type="button" onclick="dismiss()">abbrechen</button>
		<button type="button" onclick="addNewEquipment()">speichern</button>
	`;
}

const renderSetEquipment = () => {
	console.log("=> fn renderSetEquipment triggered");
	modalMax.innerHTML = `
		<div class="book-main">
			<h3>Ausstattung anpassen</h3>
			<p>Um einen Eintrag zu löschen, entfernen Sie einfach vor dem Speichern das Häkchen vor der Bezeichnung</p>
			<hr>
			<table id="tblSetEquipment"></table>
			<hr>
			<button type="button" style="float: none;" onclick="renderAddNewEquipment()">Ausrüstung hinzufügen</button>
			<hr>
			<button type="button" onclick="saveEquipment()">Änderungen speichern</button>
			<button type="button" onclick="renderAdminTools()">abbrechen</button>
            <div class="spacer"></div>
		</div>
	`;
	const tblSetEquipment = document.querySelector("#tblSetEquipment");
	for (let i = 0; i < equipment.length; i++) {
        tblSetEquipment.innerHTML += `
            <tr>
                <td><input type="checkbox" checked id="chb_${i}"></td>
				<td><input type="text" id="inpEquipment_${i}" value="${equipment[i].name}"></td>
            </tr>
        `;
    };
}

// 	####### 	 #####  	 #####  	#       	 ###### 
// 	   #    	#     # 	#     # 	#       	#       
// 	   #    	#     # 	#     # 	#       	 #####  
// 	   #    	#     # 	#     # 	#       	      # 
// 	   #    	 #####  	 #####  	 ###### 	######  

const renderAdminTools = () => {
	console.log("=> fn renderAdminTools triggered");
	closeAllModals();
	header.style.display = "grid";
	modalMax.style.display = "block";
	modalMax.innerHTML = `
		<h2 class="align-center">Adminbereich</h3>
		<div class="admin-grid-container">
			<div class="admin-grid-item" onclick="renderSetPasswords()">
				<img src="assets/lock.webp" alt="Schloss">
				<h3>Passwörter</h3>
				<p>Passwörter für alle NutzerInnen oder für den Adminbereich ändern.</p>
			</div>

			<div class="admin-grid-item" onclick="renderSetCatering()">
				<img src="assets/coffee.webp" alt="Schloss">
				<h3>Catering</h3>
				<p>Preise anpassen, Artikel enfernen oder hinzufügen.</p>
			</div>

			<div class="admin-grid-item" onclick="renderSetRooms()">
				<img src="assets/room.webp" alt="Schloss">
				<h3>Räume</h3>
				<p>Raumdaten ändern, Räume hinzufügen oder entfernen.</p>
			</div>

			<div class="admin-grid-item" onclick="renderSetFees()">
				<img src="assets/euro.webp" alt="Schloss">
				<h3>Gebühren</h3>
				<p>Raumgebühren anpassen.</p>
			</div>

			<div class="admin-grid-item" onclick="renderSetSeatings()">
				<img src="assets/chair.webp" alt="Schloss">
				<h3>Bestuhlung</h3>
				<p>Möglichkeiten der Bestuhlung anpassen, hinzufügen oder entfernen.</p>
			</div>

			<div class="admin-grid-item" onclick="renderSetEquipment()">
				<img src="assets/tools.webp" alt="Schloss">
				<h3>Ausrüstung</h3>
				<p>Ausstattung der Räume anpassen.</p>
			</div>

			<div></div>

			<div class="admin-grid-item" onclick="exportData()">
				<img src="assets/download.webp" alt="Schloss">
				<h3>Datenexport</h3>
				<p>Buchungsdaten als csv-Datei herunterladen.</p>
			</div>
		</div>
	`;
}

const exportData = () => {
	const bookingsClone = structuredClone(bookings);
	for (let i = 0; i < bookingsClone.length; i++) {
		let roomsString = "";
		let equipmentString = "";
		let cateringString = "";
		bookingsClone[i].rooms.forEach(e => {
			let index = rooms.findIndex(el => el.id === e);
			roomsString += `${rooms[index].location} - ${rooms[index].roomName} | `;
		});
		bookingsClone[i].equipment.forEach(e => {
			let index = equipment.findIndex(el => el.id === e[1]);
			equipmentString += `${e[0]} x ${equipment[index].name} | `;
		});
		bookingsClone[i].catering.forEach(e => {
			let index = catering.findIndex(el => el.id === e);
			cateringString += `${catering[index].name} | `;
		});

		// cut trailing '|'
		roomsString = roomsString.length > 0 ? roomsString.substring(0, roomsString.length - 3) : roomsString;
		equipmentString = equipmentString.length > 0 ? equipmentString.substring(0, equipmentString.length - 3) : equipmentString;
		cateringString = cateringString.length > 0 ? cateringString.substring(0, cateringString.length - 3) : cateringString;

		bookingsClone[i].rooms = roomsString;
		bookingsClone[i].equipment = equipmentString;
		bookingsClone[i].catering = cateringString;
	}
	let csv = `Titel,Status,vom,bis zum,von,bis,AnsprechpartnerIn,E-Mail,Tel. 1,Tel 2,Kostenstelle,Kostenkonto,TeilnehmerInnen,Räume,Bestuhlung,Ausrüstung,Catering,Kosten Catering,Kosten Räume,Kosten gesamt,Anmerkungen,\n`;
	bookingsClone.forEach(e => {
		csv += `${e.title.replaceAll(",", " /")},${e.state.replaceAll(",", " /")},${e.startDate.replaceAll(",", " /")},${e.endDate.replaceAll(",", " /")},${e.startTime.replaceAll(",", " /")},${e.endTime.replaceAll(",", " /")},${e.firstName.replaceAll(",", " /")} ${e.lastName.replaceAll(",", " /")},${e.email.replaceAll(",", " /")},${e.phone1.replaceAll(",", " /")},${e.phone2.replaceAll(",", " /") || ""},${e.account},${e.account2},${e.participants},${e.rooms.replaceAll(",", " /")},${e.seating.replaceAll(",", " /")},${e.equipment.replaceAll(",", " /")},${e.catering.replaceAll(",", " /")},${e.totalCatering || ""},${e.totalRooms || ""},${e.total || ""},${e.annotation.replaceAll(",", " /")}\n`;
	});
	let timestamp = Date.now();
	let now = new Date(timestamp);
	let dateString = now.toISOString().substring(0, 16).replaceAll(":", "-");
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);    
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookit_${dateString}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

