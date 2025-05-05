const numbers = [0, 1, 2, 3, 4, 5];

let numberOfEdits = 0;

// rooms.forEach(e => allRooms.push(e.id));
let availableRooms = [];
let nonAvailableRooms = [];
let availableSideRooms = [];
let nonAvailableSideRooms = [];
let selectedRoom1 = "";
let selectedRoom2 = "";
let selectedRoom3 = "";
let availableTimes = [...times];
let timeOptions = "";
let orderedCatering = [];
let editId = "";

const roomManager = () => {
    console.log("=> fn roomManager triggered");

    let tempAvailableRooms = [...availableRooms];
    let tempAvailableSideRooms = [...availableSideRooms];

    const selRoom1 = document.querySelector("#selRoom1");
    const selRoom2 = document.querySelector("#selRoom2");
    const selRoom3 = document.querySelector("#selRoom3");

    // ### ROOM 1 ###
    let selected1 = "selected";
    if (selectedRoom1 === "") selectedRoom1 = selRoom1.value;
    if (selectedRoom1 != "") selected1 = "";
    selRoom1.innerHTML = `<option value="" ${selected1}>Hauptraum *</option>`;
    tempAvailableRooms.forEach(e => {
        let index = rooms.findIndex(el => el.id === e);
        selected1 = selectedRoom1 === e ? "selected" : "";
        selRoom1.insertAdjacentHTML("beforeend", `
            <option value="${e}" ${selected1}>${rooms[index].location}, ${rooms[index].roomName} (${rooms[index].maxParticipants})</option>
            `);
    });
    if (selectedRoom1 != "") {
        let index1 = tempAvailableRooms.findIndex(e => e === selectedRoom1);
        tempAvailableRooms.splice(index1, 1);
        let index1b = tempAvailableSideRooms.findIndex(e => e === selectedRoom1);
        tempAvailableSideRooms.splice(index1b, 1);
    }

    // ### ROOM 2 ###
    let selected2 = "selected";
    selectedRoom2 = selRoom2.value;
    if (selectedRoom2 != "") selected2 = "";
    selRoom2.innerHTML = `<option value="" ${selected2}>Nebenraum 1</option>`;
    tempAvailableSideRooms.forEach(e => {
        let index = rooms.findIndex(el => el.id === e);
        selected2 = selectedRoom2 === e ? "selected" : "";
        selRoom2.insertAdjacentHTML("beforeend", `
            <option value="${e}" ${selected2}>${rooms[index].location}, ${rooms[index].roomName} (${rooms[index].maxParticipants})</option>
            `);
    });
    if (selectedRoom2 != "") {
        let index2 = tempAvailableSideRooms.findIndex(e => e === selectedRoom2);
        tempAvailableSideRooms.splice(index2, 1);
        // ### SPLICE tempAvaiableRooms AS WELL???
    }

    // ### ROOM 3 ###
    let selected3 = "selected";
    selectedRoom3 = selRoom3.value;
    if (selectedRoom3 != "") selected3 = "";
    selRoom3.innerHTML = `<option value="" ${selected3}>Nebenraum 2</option>`;
    tempAvailableSideRooms.forEach(e => {
        let index = rooms.findIndex(el => el.id === e);
        selected3 = selectedRoom3 === e ? "selected" : "";
        selRoom3.insertAdjacentHTML("beforeend", `
            <option value="${e}" ${selected3}>${rooms[index].location}, ${rooms[index].roomName} (${rooms[index].maxParticipants})</option>
            `);
    });
    if (selectedRoom3 != "") {
        let index3 = tempAvailableSideRooms.findIndex(e => e === selectedRoom3);
        tempAvailableSideRooms.splice(index3, 1);
        // ### SPLICE tempAvaiableRooms AS WELL???
    }
    console.log({ tempAvailableRooms });
    console.log({ tempAvailableSideRooms });
    calculatePrice();
}

const checkAvailability = () => {
    console.log("=> fn checkAvailabilty triggered");

    availableRooms = [];
    nonAvailableRooms = [];
    availableSideRooms = [];
    nonAvailableSideRooms = [];

    let tempBookings = [...bookings];
    let allRooms = [];
    rooms.forEach(e => allRooms.push(e.id));

    if (editId != "") {
        let editIndex = tempBookings.findIndex(e => e.id === editId);
        if (editIndex != -1) {
            tempBookings.splice(editIndex, 1);
        }
    }

    const inpBookStartDate = document.querySelector("#inpBookStartDate");
    const inpBookEndDate = document.querySelector("#inpBookEndDate");
    const selBookStartTime = document.querySelector("#selBookStartTime");
    const selBookEndTime = document.querySelector("#selBookEndTime");
    const inpBookNumberOfParticipants = document.querySelector("#inpBookNumberOfParticipants");
    const selRoom1 = document.querySelector("#selRoom1");
    const bookDiv2 = document.querySelector("#book-div-2");

    let mainRoomIndex = rooms.findIndex(e => e.id === selRoom1.value);
    let mainRoomParticipants = mainRoomIndex != -1 ? rooms[mainRoomIndex].maxParticipants : 10000;
    if (Number(inpBookNumberOfParticipants.value) > mainRoomParticipants) {
        showAlert(`<b>Bitte beachten Sie.</b><br>
            Sie haben mehr TeilnehmerInnen gewählt als für den Raum vorgesehen sind.`, 5000)
    }

    if ((inpBookStartDate.value === "" || inpBookEndDate.value === "" || selBookStartTime.value === "" || selBookEndTime.value === "" || inpBookNumberOfParticipants.value === "") && bookDiv2.classList.contains("collapse-vertically")) {
        return;
    }

    let selectedStartDay = Number((new Date(inpBookStartDate.value)).getTime());
    let selectedEndDay = Number((new Date(inpBookEndDate.value)).getTime());
    let thisStartTime = Number(selBookStartTime.value.substring(0, 2));
    let thisEndTime = Number(selBookEndTime.value.substring(0, 2));

    let requestedTimeSlots = [];
    if (thisStartTime <= 12) {
        requestedTimeSlots.push("morning");
    }
    if ((thisStartTime >= 12 && thisStartTime <= 18) || (thisEndTime > 12 && thisEndTime <= 18) || (thisStartTime <= 12 && thisEndTime >= 18)) {
        requestedTimeSlots.push("afternoon");
    }
    if (thisStartTime > 18 || thisEndTime > 18) {
        requestedTimeSlots.push("evening");
    }
    // console.log("requestedTimeSlots:");
    // console.log(requestedTimeSlots);

    let blocked = [];

    tempBookings.forEach(e => {
        let bookingStartDate = Number((new Date(e.startDate)).getTime());
        let bookingEndDate = Number((new Date(e.endDate)).getTime());
        let bookingStartTime = Number(e.startTime.substring(0, 2));
        let bookingEndTime = Number(e.endTime.substring(0, 2));
        if (bookingStartTime <= 12) {
            blocked.push("morning");
        }
        if ((bookingStartTime >= 12 && bookingStartTime <= 18) || (bookingEndTime > 12 && bookingEndTime <= 18) || (bookingStartTime <= 12 && bookingEndTime >= 18)) {
            blocked.push("afternoon");
        }
        if (bookingStartTime > 18 || bookingEndTime > 18) {
            blocked.push("evening");
        }

        let index = rooms.findIndex(el => el.id === e.rooms[0]);
        
        if (e.state === "active" && 
                (
                    (
                        (bookingStartDate <= selectedStartDay && bookingEndDate >= selectedEndDay) ||
                        (bookingStartDate <= selectedStartDay && bookingEndDate <= selectedEndDay && bookingEndDate >= selectedStartDay
                        ) ||
                        (bookingStartDate >= selectedStartDay && bookingStartDate <= selectedEndDay && bookingEndDate >= selectedStartDay
                        ) ||
                        (bookingStartDate > selectedStartDay && bookingStartDate < selectedEndDay && bookingEndDate < selectedEndDay && bookingEndDate > selectedStartDay)
                    ) && 
                    (
                        (requestedTimeSlots.includes("morning") && blocked.includes("morning")) || (requestedTimeSlots.includes("afternoon") && blocked.includes("afternoon")) || (requestedTimeSlots.includes("evening") && blocked.includes("evening"))
                    )
                    ) /* || 
                        Number(inpBookNumberOfParticipants.value) > rooms[index].maxParticipants */
                )
            {
                e.rooms.forEach(el => {
                    nonAvailableRooms.push(el);
                    // console.log("pushed to nonAvailableRooms: " + el);
                });

                if ([selectedRoom1, selectedRoom2, selectedRoom3].some(room => e.rooms.includes(room))) {
                    availableTimes = availableTimes.filter(el => {
                        if (Number(el.substring(0, 2)) < Number(e.startTime.substring(0, 2)) || Number(el.substring(0, 2)) > Number(e.endTime.substring(0, 2))) {
                            return el;
                        }                
                    });
                };
                // console.log(availableTimes);

                let tempStartValue = selBookStartTime.value;
                let tempEndValue = selBookEndTime.value;
                selBookStartTime.innerHTML = "";
                selBookEndTime.innerHTML = "";
                availableTimes.forEach(el => {
                    selBookStartTime.innerHTML += `<option value="${el}">${el}</option>`;
                    selBookEndTime.innerHTML += `<option value="${el}">${el}</option>`;
                });
                selBookStartTime.value = tempStartValue;
                selBookEndTime.value = tempEndValue;
        };
        nonAvailableRooms = [...new Set(nonAvailableRooms)];
        availableRooms = allRooms.filter(item => !nonAvailableRooms.includes(item));

        if (e.state === "active" && 
            (
                (
                    (bookingStartDate <= selectedStartDay && bookingEndDate >= selectedEndDay) ||
                    (bookingStartDate <= selectedStartDay && bookingEndDate < selectedEndDay && bookingEndDate > selectedStartDay
                    ) ||
                    (bookingStartDate > selectedStartDay && bookingStartDate < selectedEndDay && bookingEndDate >= selectedStartDay
                    ) ||
                    (bookingStartDate > selectedStartDay && bookingStartDate < selectedEndDay && bookingEndDate < selectedEndDay && bookingEndDate > selectedStartDay
                    )
                ) && 
                (
                    (requestedTimeSlots.includes("morning") && blocked.includes("morning")) || 
                    (requestedTimeSlots.includes("afternoon") && blocked.includes("afternoon")) || 
                    (requestedTimeSlots.includes("evening") && blocked.includes("evening"))
                )
            )
        ) {
            e.rooms.forEach(el => nonAvailableSideRooms.push(el));
        };

        nonAvailableSideRooms = [...new Set(nonAvailableSideRooms)];
        availableSideRooms = allRooms.filter(item => !nonAvailableSideRooms.includes(item));


    });

    roomManager();

    bookDiv2.style.display = "block";
    bookDiv2.classList.remove("collapse-vertically");
    bookDiv2.classList.add("slide-open");   
}

const fillEndDate = () => {
    const inpBookStartDate = document.querySelector("#inpBookStartDate");
    const inpBookEndDate = document.querySelector("#inpBookEndDate");
    inpBookEndDate.value = inpBookStartDate.value;
}

const dismiss = () => {
    modalPopUp.innerHTML = "";
    modalPopUp.style.display = "none";
}

const confirmDismissBooking = () => {
    if (numberOfEdits > 0) {
        modalPopUp.style.display = "block";
        modalPopUp.innerHTML = `
            <h3>Daten verwerfen</h3>
            <p>Alle eingegebenen Daten gehen verloren.<br>
            Wollen Sie fortfahren?</p>
            <hr>
            <button type="button" onclick="dismiss()">zurückkehren</button>
            <button type="button" onclick="renderHome(0)">Daten verwerfen</button>
        `;
    } else {
        renderHome();
    }
}

const calculatePrice = () => {
    console.log("=> fn calculatePrice triggered");
    const inpBookStartDate = document.querySelector("#inpBookStartDate");
    const inpBookEndDate = document.querySelector("#inpBookEndDate");
    const selBookStartTime = document.querySelector("#selBookStartTime");
    const selBookEndTime = document.querySelector("#selBookEndTime");
    let participants = document.querySelector("#inpBookNumberOfParticipants").value;
    let totalCatering = 0;
    orderedCatering = [];

    let days = 1;
    let lastDayOfMonth = new Date(inpBookStartDate.value.substring(0, 4), inpBookStartDate.value.substring(5, 7), 0).getDate();
    if (new Date(inpBookEndDate.value) - new Date(inpBookStartDate.value) != 0) {
        let startMonth = new Date(inpBookStartDate.value).getMonth();
        let endMonth = new Date(inpBookEndDate.value).getMonth();
        let startDate = new Date(inpBookStartDate.value).getDate();
        let endDate = new Date(inpBookEndDate.value).getDate();
        if (endDate > startDate && endMonth === startMonth) {
            days = endDate - startDate + 1;
        }
        if (endDate < startDate && endMonth > startMonth) {
            days = lastDayOfMonth - startDate + endDate + 1;
        }
    }

    for (let i = 0; i < catering.length; i++) {
        if (document.querySelector(`#inpBookCatering${i + 1}`).checked) {
            let price = days * participants * catering[i].price;
            document.querySelector(`#cateringPrice${i + 1}`).innerHTML = `€ ${price.toFixed(2)}`;
            totalCatering += price;
            orderedCatering.push(catering[i].id);
        } else {
            document.querySelector(`#cateringPrice${i + 1}`).innerHTML = "";
        }
    }
    document.querySelector("#totalCatering").innerHTML = `€ ${(totalCatering).toFixed(2)}`;

    let room1Id = document.querySelector("#selRoom1").value;
    let room1Index = rooms.findIndex(e => e.id === room1Id);
    let room1Fee = room1Index === -1 ? 0 : rooms[room1Index].fee;

    let room2Id = document.querySelector("#selRoom2").value;
    let room2Index = rooms.findIndex(e => e.id === room2Id);
    let room2Fee = room2Index === -1 ? 0 : rooms[room2Index].fee;

    let room3Id = document.querySelector("#selRoom3").value;
    let room3Index = rooms.findIndex(e => e.id === room3Id);
    let room3Fee = room3Index === -1 ? 0 : rooms[room3Index].fee;

    let fee = room1Fee + room2Fee * (1 - fees.discount) + room3Fee * (1 - fees.discount);

    let time = selBookEndTime.value.substring(0, 2) - selBookStartTime.value.substring(0, 2);
    if (time <= 4) fee = fee * 0.5;

    let totalRooms = days * fee;
    let roomCalculation = document.querySelector("#roomCalculation");
    let sumRoom = document.querySelector("#sumRoom");
    sumRoom.innerHTML = "";
    roomCalculation.innerHTML = "Summe Raumbuchungen";
    if (days > 1) {
        roomCalculation.innerHTML = `${days} x € ${fee} =`;
        sumRoom.innerHTML = "Summe Raumbuchungen";
    }
    document.querySelector("#totalRooms").innerHTML = `€ ${(totalRooms).toFixed(2)}`;
    const htmlTotal = document.querySelector("#total");
    htmlTotal.style.color = "var(--color-accent-180)";
    htmlTotal.innerHTML = `<u><b>€ ${(totalRooms + totalCatering).toFixed(2)}</b></u>`;
}

const resetRooms = () => {
    document.querySelector("#selRoom1").value = "";
    selectedRoom1 = "";
    document.querySelector("#selRoom2").value = "";
    selectedRoom2 = "";
    document.querySelector("#selRoom3").value = "";
    selectedRoom3 = "";
    roomManager();
}

let alertNoCateringShown = false;
const dismissAlertNoCatering = () => {
    modalPopUp.innerHTML = "";
    modalPopUp.style.display = "none";
    alertNoCateringShown = true;
};

const setBookDefinitions = () => {
    const inpAccount = document.querySelector("#inpAccount");
    const inpAccount2 = document.querySelector("#inpAccount2");
    const inpEventName = document.querySelector("#inpEventName");
    const taEventDescription = document.querySelector("#taEventDescription");
    const inpFirstName = document.querySelector("#inpFirstName");
    const inpLastName = document.querySelector("#inpLastName");
    const inpEmail = document.querySelector("#inpEmail");
    const inpPhone1 = document.querySelector("#inpPhone1");
    const inpPhone2 = document.querySelector("#inpPhone2");
    const inpBookStartDate = document.querySelector("#inpBookStartDate");
    const inpBookEndDate = document.querySelector("#inpBookEndDate");
    const selBookStartTime = document.querySelector("#selBookStartTime");
    const selBookEndTime = document.querySelector("#selBookEndTime");
    const inpBookNumberOfParticipants = document.querySelector("#inpBookNumberOfParticipants");
    const selRoom1 = document.querySelector("#selRoom1");
    const selRoom2 = document.querySelector("#selRoom2");
    const selRoom3 = document.querySelector("#selRoom3");
    const selSeating = document.querySelector("#selSeating");
    const inpBookVegetarian = document.querySelector("#inpBookVegetarian");
    const inpBookVegan = document.querySelector("#inpBookVegan");
    const inpBookMoslem = document.querySelector("#inpBookMoslem");
    const taAnnotations = document.querySelector("#taAnnotations");
    const selScreen = document.querySelector("#selScreen");
    const selFlipchart = document.querySelector("#selFlipchart");
    const selMediaTools = document.querySelector("#selMediaTools");
    const selPinBoard = document.querySelector("#selPinBoard");
    const bookDiv2 = document.querySelector("#book-div-2");
}

const saveBooking = async (event, bookingId) => {
    event.preventDefault();
    console.log("=> fn saveBooking triggered");

    let id = bookingId ? bookingId : `booking_${Date.now()}_${randomCyphers(10)}`;  // NEVER CHANGE! LENGTH IS CRUCIAL
    let state = "active";
    if (bookingId) {
        let index = bookings.findIndex(e => e.id === bookingId);
        state = bookings[index].state;
    }

    setBookDefinitions();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(?:\+?\d{1,3})?\d{5,}$/;

    if (inpBookStartDate.value === "") {
        showAlert("Bitte ein Startdatum angeben.");
        inpBookStartDate.focus();
        console.log("Heloo");
        return;
    }
    if (inpBookEndDate.value === "") {
        showAlert("Bitte ein Enddatum angeben.");
        inpBookEndDate.focus();
        return;
    }
    if (new Date(inpBookEndDate.value).getTime() < new Date(inpBookStartDate.value).getTime()) {
        showAlert("Das Enddatum liegt vor dem Startdatum.");
        inpBookEndDate.focus();
        return;
    }
    if (selBookStartTime.value === "") {
        showAlert("Bitte eine Startzeit angeben.");
        selBookStartTime.focus();
        return;
    }
    if (selBookEndTime.value === "") {
        showAlert("Bitte eine Endzeit angeben.");
        selBookEndTime.focus();
        return;
    }
    if (Number(selBookEndTime.value.substring(0, 2)) < Number(selBookStartTime.value.substring(0, 2))) {
        showAlert("Die Endzeit liegt vor der Startzeit.");
        selBookEndTime.focus();
        return;
    }
    if (inpBookNumberOfParticipants.value === "" || Number(inpBookNumberOfParticipants.value) < 1) {
        showAlert("Bitte eine Teilnehmerzahl größer 1 angeben.");
        inpBookNumberOfParticipants.focus();
        return;
    }
    if (selRoom1.value === "") {
        showAlert("Bitte einen Hauptraum angeben.");
        selRoom1.focus();
        return;
    }
    if (inpEventName.value === "") {
        showAlert("Bitte einen Namen für die Veranstaltung angeben.");
        inpEventName.focus();
        return;
    }
    if (inpFirstName.value === "") {
        showAlert("Bitte einen Vornamen angeben.");
        inpFirstName.focus();
        return;
    }
    if (inpLastName.value === "") {
        showAlert("Bitte einen Nachnamen angeben.");
        inpLastName.focus();
        return;
    }
    if (inpEmail.value === "" || emailRegex.test(inpEmail.value.trim()) === false) {
        showAlert("Bitte eine korrekte E-Mail-Adresse angeben.");
        inpEmail.focus();
        return;
    }
    if (inpPhone1.value === "" || phoneRegex.test(inpPhone1.value.replaceAll(" ", "")) === false) {
        showAlert("Bitte eine korrekte 1. Telefonnummer angeben.");
        inpPhone1.focus();
        return;
    }
    if (inpPhone2.value != "" && phoneRegex.test(inpPhone2.value.replaceAll(" ", "")) === false) {
        showAlert("Bitte eine korrekte 2. Telefonnummer angeben.");
        inpPhone2.focus();
        return;
    }
    if (inpAccount.value === "") {
        showAlert("Bitte eine Kostenstelle angeben.");
        inpAccount.focus();
        return;
    }
    let trimmedAccount = inpAccount.value.toString().trim();
    if (trimmedAccount.length < 8 || trimmedAccount.length > 8) {
        showAlert("Die Kostenstelle muss aus 8 Zahlen bestehen.");
        inpAccount.focus();
        return;
    }
    if (inpAccount2.value === "" || inpAccount2.value.length < 4) {
        showAlert("Bitte eine gültige Kostenart angeben.");
        inpAccount2.focus();
        return;
    }
    if (selSeating.value === "") {
        showAlert("Bitte eine Bestuhlung wählen.");
        selSeating.focus();
        return;
    }

    let rooms = [];
    rooms.push(selRoom1.value);
    if (selRoom2.value != "") rooms.push(selRoom2.value);
    if (selRoom3.value != "") rooms.push(selRoom3.value);

    let thisEquipment = [];
    equipment.forEach(e => {
        if (document.querySelector(`#sel_${e.id}`) && document.querySelector(`#sel_${e.id}`).value > 0) {
            thisEquipment.push([Number(document.querySelector(`#sel_${e.id}`).value), e.id]);
        }
    });

    // alertNoCateringShown = false;
    if (orderedCatering.length === 0 && alertNoCateringShown === false) {
        modalPopUp.innerHTML = `
            <h3>Hinweis</h3>
            <p>Sie haben kein Catering gewählt.</p>
            <p>Sie können das Catering nun auswählen, ansonsten klicken Sie einfach erneut auf <i>'Verbindlich buchen'</i>.</p>
            <hr>
            <button type="button" onclick="dismissAlertNoCatering()">OK</button>
        `;
        modalPopUp.style.display = "block";
    } else {
        let newBooking = {
            id,
            account: inpAccount.value,
            account2: inpAccount2.value,
            state,
            title: inpEventName.value,
            description: taEventDescription.value,
            firstName: inpFirstName.value,
            lastName: inpLastName.value,
            email: inpEmail.value,
            phone1: inpPhone1.value,
            phone2: inpPhone2.value,
            startDate: inpBookStartDate.value,
            endDate: inpBookEndDate.value,
            startTime: selBookStartTime.value,
            endTime: selBookEndTime.value,
            participants: Number(inpBookNumberOfParticipants.value),
            rooms,
            seating: selSeating.value,
            equipment: thisEquipment,
            catering: orderedCatering,
            vegetarianMeals: Number(inpBookVegetarian.value),
            veganMeals: Number(inpBookVegan.value),
            moslemMeals: Number(inpBookMoslem.value),
            annotation: taAnnotations.value,
            totalCatering: Number(document.querySelector("#totalCatering").innerText.substring(2)),
            totalRooms: Number(document.querySelector("#totalRooms").innerText.substring(2)),
            total: Number(document.querySelector("#total").innerText.substring(2)),
        }
    
        console.log(JSON.stringify(newBooking, null, 2));
        if (bookingId) {
            let data = newBooking;
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
            };
            const response = await fetch("/bookit.updateBookings", options);
            const serverResponse = await response.json();
            console.log("Updating bookings. Status: " + serverResponse.status);
            if (serverResponse.status != "OK") {
                showAlert(`Fehler!<br>${serverResponse.status}<br>Bitte erneut versuchen.`);
                return;
            }
            bookings = serverResponse.bookings;
            // bookings.push(newBooking);
            if (data.state === "cancelled") {
                showAlert("Buchung wurde storniert");
            } else {
                showAlert("Änderungen wurden gespeichert.");
            }
            console.log({ bookings });
        } else {
            let data = newBooking
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
            };
            const response = await fetch("/bookit.newBooking", options);
            const serverResponse = await response.json();
            console.log("Save new booking. Status: " + serverResponse.status);
            if (serverResponse.status != "OK") {
                showAlert(`Fehler!<br>${serverResponse.status}<br>Bitte erneut versuchen.`);
                return;
            }
            bookings = serverResponse.bookings;
            // bookings.push(newBooking);
            showAlert("Die Buchung wurde gespeichert.");
            console.log({ bookings });
        }
        alertNoCateringShown = false;
        renderHome(0);
    }
}

const renderGuidedMenu = (date, time, room) => {
    console.log("=> fn renderGuidedMenu triggered");
    paginator = "book";
    console.log({ paginator });
    selectedRoom1 = room ? room : "";
    header.style.display = "grid";
    timeOptions = "";
    times.forEach(e => {
        timeOptions += `<option value="${e}">${e}</option>`;
    });
    let numberOptions = "";
    numbers.forEach(e => {
        numberOptions += `<option value="${e}">${e}</option>`;
    });

    let equipmentSection = "";
    for (let i = 0; i < equipment.length; i++) {
        equipmentSection += `
            <p>${equipment[i].name}</p>
            <select id="sel_${equipment[i].id}">
                <option value="0" selected>0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
            </select>
        `;
    }

    modalMax.innerHTML = `
        <div class="book-main">
			<img src="assets/x.webp" alt="X" class="x" onclick="confirmDismissBooking()">
            <h2>Veranstaltung buchen</h2>
            <p>Bitte füllen Sie alle Felder mit <span class="decent">*</span> Sternchen aus</p>
            <hr>
            <form id="frmBooking">
                <h3>Termin</h3>
                <div class="two-columns">
                    <p>An welchem Tag soll die Veranstaltung beginnen? <span class="decent">*</span></p>
                    <input type="date" id="inpBookStartDate" min="${currentDateString}" oninput="fillEndDate(); checkAvailability()">
                    <p>An welchem Tag soll die Veranstaltung enden? <span class="decent">*</span></p>
                    <input type="date" id="inpBookEndDate" min="${currentDateString}" oninput="checkAvailability()">
                    <p>Ab wieviel Uhr wird der Raum benötigt? <span class="decent">*</span></p>
                    <select id="selBookStartTime" oninput="checkAvailability()">
                        <option value="" selected disabled>Startzeit</option>
                        ${timeOptions}
                    </select>
                    <p>Bis wieviel Uhr wird der Raum benötigt? <span class="decent">*</span></p>
                    <select id="selBookEndTime" oninput="checkAvailability()">
                        <option value="" selected disabled>Endzeit</option>
                        ${timeOptions}
                    </select>
                </div>
                <hr>
                <h3>TeilnehmerInnen</h3>
                <div class="two-columns">
                    <p>Mit wie vielen TeilnehmerInnen rechnen Sie maximal? <span class="decent">*</span></p>
                    <input type="number" id="inpBookNumberOfParticipants" min="2" max="100" oninput="checkAvailability()"><span id="span-room-available"></span>
                </div>
                <hr>
                <div id="book-div-2" class="collapse-vertically">
                    <h3>Räume</h3>
                    <p>Diese Räume stehen Ihnen am gewählten Datum zur Verfügung</p>
                    <select id="selRoom1" class="select-wide" onchange="roomManager()">
                        <option value="" selected disabled>Hauptraum *</option>
                    </select>
                    <br>
                    <select id="selRoom2" class="select-wide" onchange="roomManager()">
                        <option value="" selected disabled>Nebenraum 1</option>
                    </select>
                    <select id="selRoom3" class="select-wide" onchange="roomManager()">
                        <option value="" selected disabled>Nebenraum 2</option>
                    </select>
                    <p class="small pseudo-link" onclick="resetRooms()">Räume zurücksetzen</p>
                    <hr>
                    <h3>Veranstaltung</h3>
                    <div class="two-columns">
                        <p>Name der Veranstaltung <span class="decent">*</span></p>
                        <input type="text" id="inpEventName" maxlength="150" placeholder="Name der Veranstaltung">
                        <p>Beschreibung der Veranstaltung <span class="small decent">(optional)</span></p>
                        <textarea id="taEventDescription" maxlength="500" rows="6" placeholder="Beschreibung (optional)"></textarea>
                    </div>
                    <hr>
                    <h3>AnsprechpartnerIn</h3>
                    <div class="two-columns">
                        <p>Vorname <span class="decent">*</span></p>
                        <input type="text" id="inpFirstName" maxlength="150" placeholder="Vorname">
                        <p>Nachname <span class="decent">*</span></p>
                        <input type="text" id="inpLastName" maxlength="150" placeholder="Nachname">
                        <p>E-Mail <span class="decent">*</span></p>
                        <input type="email" id="inpEmail" maxlength="150" placeholder="E-Mail">
                        <p>Telefonnummer <span class="decent">*</span></p>
                        <input type="tel" id="inpPhone1" maxlength="100" placeholder="Telefonnummer">
                        <p>2. Telefonnummer</p>
                        <input type="tel" id="inpPhone2" maxlength="100" placeholder="2. Telefonnummer">
                    </div>
                    <hr>
                    <h3>Abrechnung</h3>
                    <div class="two-columns">
                        <p>Kostenstelle <span class="decent">*</span></p>
                        <input type="number" id="inpAccount" min="10000" max="999999999999">
                        <p>Kostenkonto <span class="decent">*</span></p>
                        <input type="number" id="inpAccount2" min="10000" max="999999999999">
                    </div>
                    <hr>
                    <h3>Raumausstattung</h3>
                    <div class="two-columns">
                        <p>Bestuhlung <span class="decent">*</span></p>
                        <select id="selSeating">
                            <option value="" selected disabled>Bestuhlung</option>
                        </select>
                        ${equipmentSection}
                    </div>
                    <hr>
                    <h3>Catering</h3>
                    <table id="tableCatering"></table><br>
                    <div class="two-columns">
                        <p>Anzahl vegetarischer TeilnehmerInnen</p>
                        <input type="number" id="inpBookVegetarian" min="0" value="0">
                        <p>Anzahl veganer TeilnehmerInnen</p>
                        <input type="number" id="inpBookVegan" min="0" value="0">
                        <p>Anzahl muslimischer TeilnehmerInnen</p>
                        <input type="number" id="inpBookMoslem" min="0" value="0">
                    </div>
                    <hr>
                    <h3>Kosten</h3>
                    <table id="tableInvoice"></table>
                    <hr>
                    <h3>Anmerkungen oder Wünsche</h3>
                    <textarea id="taAnnotations" maxlength="500" rows="4" style="width: calc(100% - 48px);" placeholder="Anmerkungen oder Wünsche"></textarea>
                    <hr>
                    <div id="divEdit"></div>
                    <button type="submit" id="btnBook" onclick="saveBooking(event)">Verbindlich buchen</button>
                    <button type="button" id="btnDismiss" onclick="confirmDismissBooking()">verwerfen</button>
                    <div class="spacer"></div>
                </div>
            </form>
        </div>
    `;

    document.querySelector("#frmBooking").addEventListener("change", () => {
        numberOfEdits += 1;
    });

    const selSeating = document.querySelector("#selSeating");
    seatings.forEach(e => {
        selSeating.insertAdjacentHTML("beforeend", `<option value="${e}">${e}</option>`)
    });

    const tableCatering = document.querySelector("#tableCatering");
    for (let i = 0; i < catering.length; i++) {
        let descriptionString = catering[i].description.length > 50 ? catering[i].description.substring(0, 50) + " ... 🛈" : catering[i].description;
        tableCatering.innerHTML += `
            <tr>
                <td><input type="checkbox" id="inpBookCatering${i + 1}" data-id="${catering[i].id}" onchange="calculatePrice()"></td>
                <td><label for="inpBookCatering${i + 1}">${catering[i].name} <br><span class="small decent" title="${catering[i].description}" >${descriptionString} - € ${(catering[i].price).toFixed(2)}</span></label></td>
                <td><label for="inpBookCatering${i + 1}"></label></td>
                <td id="cateringPrice${i + 1}"></td>
            </tr>
        `;
    };
    tableInvoice.innerHTML += `
        <tr>
            <td></td>
            <td></td>
            <td style="text-align: right;">Summe Catering</td>
            <td id="totalCatering"></td>
        </tr>
        <tr>
            <td></td>
            <td id="sumRoom" style="text-align: right;"></td>
            <td id="roomCalculation" style="text-align: right;"></td>
            <td id="totalRooms"></td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td style="text-align: right; color: var(--color-accent-180);"><u><b>Summe gesamt</b></u></td>
            <td id="total"></td>
        </tr>
    `;

    const inpBookStartDate = document.querySelector("#inpBookStartDate");
    const inpBookEndDate = document.querySelector("#inpBookEndDate");
    const selBookStartTime = document.querySelector("#selBookStartTime");

    if (date && time && room) {
        inpBookStartDate.value = date;
        inpBookEndDate.value = date;
        selBookStartTime.value = time;
        selBookEndTime.focus();
    }
}

const cancelBooking = async (id) => {
    console.log("=> fn cancelBooking triggered");
    let index = bookings.findIndex(e => e.id === id);
    bookings[index].state = "cancelled";
    console.log("state in 'cancelBooking()': " + bookings[index].state);
    await saveBooking(event, id);
    editId = "";
    renderHome();
}

const renderCancelBooking = (id) => {
    modalPopUp.style.display = "block";
    modalPopUp.innerHTML = `
        <h3>Buchung stornieren?</h3>
        <hr>
        <button type="button" onclick="dismiss()">abbrechen</button>
        <button type="button" onclick="cancelBooking('${id}')">stornieren</button>
    `;
}

const editBooking = async (id) => {
    console.log("=> fn editBooking triggered");
    await saveBooking(event, id);
    editId = "";
}

const renderEditBooking = (id) => {
    console.log("=> fn renderEditBooking triggered");
    console.log({ id });
    renderGuidedMenu();
    setBookDefinitions();
    const bookDiv2 = document.querySelector("#book-div-2");
    bookDiv2.style.display = "block";
    bookDiv2.classList.remove("collapse-vertically");
    bookDiv2.classList.add("slide-open");
    let index = bookings.findIndex(e => e.id === id);
    if (index === -1) {
        showAlert("Fehler!<br>Buchung nicht gefunden.");
        return;
    };
    editId = bookings[index].id;

    selectedRoom1 = bookings[index].rooms[0];
    selectedRoom2 = bookings[index].rooms[1] ? bookings[index].rooms[1] : "";
    selectedRoom3 = bookings[index].rooms[2] ? bookings[index].rooms[2] : "";

    checkAvailability();  // needs to be called twice: before and after setting the selRoom values
    
    inpAccount.value = bookings[index].account;
    inpAccount2.value = bookings[index].account2;
    inpEventName.value = bookings[index].title;
    taEventDescription.value = bookings[index].description;
    inpFirstName.value = bookings[index].firstName;
    inpLastName.value = bookings[index].lastName;
    inpEmail.value = bookings[index].email
    inpPhone1.value = bookings[index].phone1;
    inpPhone2.value = bookings[index].phone2 ? bookings[index].phone2 : "";
    inpBookStartDate.value = bookings[index].startDate;
    inpBookEndDate.value = bookings[index].endDate;
    selBookStartTime.value = bookings[index].startTime;
    selBookEndTime.value = bookings[index].endTime;
    inpBookNumberOfParticipants.value = bookings[index].participants;

    selRoom1.value = bookings[index].rooms[0];
    selRoom2.value = bookings[index].rooms[1] ? bookings[index].rooms[1] : "";
    selRoom3.value = bookings[index].rooms[2] ? bookings[index].rooms[2] : "";

    checkAvailability();  // needs to be called twice: before and after setting the selRoom values

    selSeating.value = bookings[index].seating;

    equipment.forEach(e => {
        let eqmIndex = bookings[index].equipment.findIndex(el => el[1] === e.id);
        if (eqmIndex === -1) {
            return;
        } else {
            let inputId = document.querySelector(`#sel_${e.id}`);
            inputId.value = bookings[index].equipment[eqmIndex][0];
        }
    });

    /* let screenIndex = bookings[index].equipment.findIndex(e => e[1] === "Bildschirm");
    selScreen.value = screenIndex === -1 ? 0 : bookings[index].equipment[screenIndex][0];
    let flipchartIndex = bookings[index].equipment.findIndex(e => e[1] === "Flipchart");
    selFlipchart.value = flipchartIndex === -1 ? 0 : bookings[index].equipment[flipchartIndex][0];
    let mediaToolsIndex = bookings[index].equipment.findIndex(e => e[1] === "Medienkoffer");
    selMediaTools.value = mediaToolsIndex === -1 ? 0 : bookings[index].equipment[mediaToolsIndex][0];
    let pinBoardIndex = bookings[index].equipment.findIndex(e => e[1] === "Pinnwand");
    selPinBoard.value = pinBoardIndex === -1 ? 0 : bookings[index].equipment[pinBoardIndex][0]; */

    bookings[index].catering.forEach(e => {
        let dataId = document.querySelector(`[data-id="${e}"]`);
        if (!dataId) {
            return;
        } else {
            dataId.checked = true;
        }
    });

    inpBookVegetarian.value = bookings[index].vegetarianMeals;
    inpBookVegan.value = bookings[index].veganMeals;
    taAnnotations.value = bookings[index].annotation;
    inpBookMoslem.value = bookings[index].moslemMeals ? bookings[index].moslemMeals : 0;

    document.querySelector("#btnBook").style.display = "none";
    document.querySelector("#btnDismiss").style.display = "none";
    document.querySelector("#divEdit").innerHTML = `
        <button type="button" onclick="editBooking('${bookings[index].id}')">Änderungen speichern</button>
        <button type="button" onclick="renderCancelBooking('${bookings[index].id}')">Buchung stornieren</button>
        <button type="button" onclick="renderHome()">abbrechen</button>
    `;
    calculatePrice();
    
}

// document.querySelector("#btnUserLogin").click();    // ### TO BE REMOVED!!! ###