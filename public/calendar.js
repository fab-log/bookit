const dayPicker = (timestamp) => {
	let date = new Date(timestamp);
	let dayName = date.getDay();
	return daysOfTheWeek[dayName];
}

const renderRoomSelect = () => {
	let roomOptions = `<option value="" selected disabled>Raum wählen</option>`;
	rooms.forEach(e => {
		roomOptions += `<option value=${e.id}>${e.location}, ${e.roomName} (${e.maxParticipants})</option>`;
	});
	return roomOptions;
}

let currentRoom = "";
let currentRoomString = "";
let roomIndex;

const renderMonthSelect = () => {
	let calendarMonthOptions = `<option value="" disabled selected>Monat wählen</option>`;
	let today = Date.now();
	let date = new Date(today);
	let year = date.getFullYear() - 1;
	let month = date.getMonth() + 1;
	let monthString = months[date.getMonth()];
	for (let i = 0; i < 36; i++) {
		let selected = "";
		// if (year === currentDate.year && month === currentDate.month) selected = "selected";
		let value = `${year}_${month}`;
		let text = `${monthString} ${year}`;
		calendarMonthOptions += `<option value="${value}" ${selected}>${text}</option>`;
		month += 1;
		if (month > 12) {
			month = 1;
			year += 1;
		}
		monthString = months[month - 1];
	}
	return calendarMonthOptions;
}

const checkTimeSlot = (element, room, id) => {
	console.log("=> fn checkTimeSlot triggered");
	let dateString = id.substring(30, 40);
	let pickedDate = new Date(dateString);
	let today = new Date(currentDateString);
	if (element.classList.contains("occupied")) {
		if (admin === true) {
			let bookingId = element.getAttribute("data-id");
			renderEditBooking(bookingId);
		} else {
			let bookingId = element.getAttribute("data-id");
			let index = bookings.findIndex(e => e.id === bookingId);
			let orderedEquipment = "";
			bookings[index].equipment.forEach(e => {
				if (Number(e[0] != 0)) {
					let eqmIndex = equipment.findIndex(el => el.id === e[1]);
					if (eqmIndex === -1) {
						orderedEquipment += "<i>[nicht mehr verfügbare Ausrüstung]</i><br>";
					} else {
						let eqmName = equipment[eqmIndex].name;
						orderedEquipment += `${e[0]} x ${eqmName}<br>`;						
					}
				}
			});
			let phone2 = "";
			if (bookings[index].phone2 && bookings[index].phone2 != "") {
				phone2 = `<a href="tel:+49${bookings[index].phone2.trim().substring(1).replaceAll(" ", "").replaceAll("/", "").replaceAll("-", "")}">${bookings[index].phone2}</a><br>`
			}

			let cateringString = "Catering<br>";
			bookings[index].catering.forEach(e => {
				let cateringIndex = catering.findIndex(el => el.id === e);
				if (cateringIndex === -1) {
					cateringString += "- <i>[nicht mehr verfügbarer Artikel]</i><br>";
				} else {
					cateringString += `- ${catering[cateringIndex].name}<br>`;
				}
			});
			showAlert(`
				<p style="float: right; margin-top:-36px;" onclick="closeAlert()"><b>X</b></p>
				<b>Dieser Termin ist bereits vergeben</b>.
				<hr>
				<p class="align-left"><b>${bookings[index].title}</b><br>
				${bookings[index].startDate.substring(8)}.${bookings[index].startDate.substring(5, 7)}.${bookings[index].startDate.substring(0, 4)} - ${bookings[index].endDate.substring(8)}.${bookings[index].startDate.substring(5, 7)}.${bookings[index].startDate.substring(0, 4)}<br>
				${bookings[index].startTime} - ${bookings[index].endTime}<br><br>
				<b>${bookings[index].firstName} ${bookings[index].lastName}</b><br>
				<a href="tel:+49${bookings[index].phone1.trim().substring(1).replaceAll(" ", "").replaceAll("/", "").replaceAll("-", "")}">${bookings[index].phone1}</a><br>
				${phone2}
				<a href="mailto:${bookings[index].email}">${bookings[index].email}</a><br><br>
				${bookings[index].participants} TeilnehmerInnen<br>
				Bestuhlung: ${bookings[index].seating}<br>
				${orderedEquipment}<br>
				${cateringString}</p>
				`, 10000);
		}
	} else {
		if (pickedDate < today) {
			showAlert("Der Termin liegt in der Vergangenheit.");
			return;
		}
		if (pickedDate <= today) {
			showAlert("Für heute kann kein Termin mehr gebucht werden.");
			return;
		}
		let timeString = id.substring(41) + ":00";
		renderGuidedMenu(dateString, timeString, room);
	}
}

const oneMonthBack = () => {
	selectedMonth -= 1;
	if (selectedMonth < 1) {
		selectedMonth = 12;
		selectedYear -= 1;
	}
	renderCalendar(selectedYear, selectedMonth);
}

const oneMonthForth = () => {
	selectedMonth += 1;
	if (selectedMonth > 12) {
		selectedMonth = 1;
		selectedYear += 1;
	}
	renderCalendar(selectedYear, selectedMonth);
}

const renderSpecificMonth = () => {
	const selCalendarMonth = document.querySelector("#sel-calendar-month");
	let rawValue = selCalendarMonth.value;
	let year = Number(rawValue.substring(0, 4));
	let month = Number(rawValue.substring(5));
	selectedYear = year;
	selectedMonth = month;
	renderCalendar(year, month);
}

const renderCalendar = (year, month) => {
	console.log("=> fn renderCalendar triggered");
	if (numberOfEdits > 0) {
		confirmDismissBooking();
		return;
	}
	if (!year || !month) {		//  || paginator != "calendar"
		getCurrentDate();
		year = currentDate.year;
		month = currentDate.month;
		selectedYear = currentDate.year;
		selectedMonth = currentDate.month;
	}
	paginator = "calendar";
	pageHistory.push("calendar");
	history.pushState({ page: "calendar" }, "", "");
	console.log({ paginator });

	// HANDLE LENGTH OF MONTH
	let lastDayOfMonth = new Date(year, month, 0).getDate();
	for (let i = style.sheet.cssRules.length - 1; i >= 0; i--) {
		removeCSSRule(i)
	}	
	if (lastDayOfMonth === 30) {
		style.sheet.cssRules.length = 0;
    	addCSSRule('.calendar-grid-item:nth-child(32n) { visibility: hidden; }');
	}
	if (lastDayOfMonth === 29) {
		style.sheet.cssRules.length = 0;
    	addCSSRule('.calendar-grid-item:nth-child(32n), .calendar-grid-item:nth-child(32n - 1) { visibility: hidden; }');
	}
	if (lastDayOfMonth === 28) {
		style.sheet.cssRules.length = 0;
    	addCSSRule('.calendar-grid-item:nth-child(32n), .calendar-grid-item:nth-child(32n - 1), .calendar-grid-item:nth-child(32n - 2) { visibility: hidden; }');
	}

	closeAllModals();

	// DEFINE HTML
	header.style.display = "grid";
	modalMax.style.display = "block";
	modalMax.innerHTML = `
		<div class="calendar-top-menu">
			<img src="assets/arrow_left.webp" class="icon" alt="Einen Monat zurück" onclick="oneMonthBack()">
			<select id="sel-calendar-month" onchange="renderSpecificMonth()">${renderMonthSelect()}
			</select>
			<img src="assets/arrow_right.webp" class="icon" alt="Einen Monat vor" onclick="oneMonthForth()">
			<p id="current-month" class="calendar-date color-accent-180">${months[month - 1]} ${year}</p>
			<div></div>
		</div>
		<hr>
	`;
	
	let iteration = 1;
	rooms.forEach(element => {

		currentRoom = rooms[iteration - 1].id;

		modalMax.innerHTML += `<h3 class="color-accent-180">${element.location}, ${element.roomName} <span class="small">(max. ${element.maxParticipants} Personen)</span></h3>`;
		modalMax.innerHTML += `<div class="calendar-grid-container" id="element_${iteration}">`;
		let calendarGridContainer = document.querySelector(`#element_${iteration}`);

		// ADD IDs TO GRID ITEMS AND STYLE WEEKENDS
		let timeOfDay = "";
		let time = "";
		let id = "";
		let selectedDate;
		let selectedDateString = "";
		let selectedMonthString = "";
	
		for (let i = 0; i < 128; i++) {
		
			let text = "";
			selectedDate = i;
	
			if (i === 0) text = "Zeit";
			if (i === 32) text = "Vormittag";
			if (i === 64) text = "Nachmittag";
			if (i === 96) text = "Abend";
			if (i > 0 && i < 32) text = i;
			if (i > 32 && i < 64) {
				time = "08:00";
				timeOfDay = "morning"
				selectedDate = i - 32;
			}
			if (i > 64 && i < 96) {
				time = "13:00";
				timeOfDay = "afternoon";
				selectedDate = i - 64;
			}
			if (i > 96) {
				time = "18:00";
				timeOfDay = "evening";
				selectedDate = i - 96;
			}
			selectedDateString = selectedDate.toString();
			if (selectedDate < 10) selectedDateString = `0${selectedDate}`;
			selectedMonthString = month.toString();
			if (month < 10) selectedMonthString = `0${month}`;
			let day = new Date(`${year}-${month}-${selectedDate}`);
			id = `${element.id}_${year}-${selectedMonthString}-${selectedDateString}_${time.substring(0, 2)}`;
	
			calendarGridContainer.insertAdjacentHTML("beforeend", `
				<div class="calendar-grid-item" id="${id}" onclick="checkTimeSlot(this, '${currentRoom}', '${id}')">
					${text}
				</div>`
			);
			let currentItem = document.getElementById(id);
			if (day.getDay() === 0 || day.getDay() === 6) {
				currentItem.style.padding = "4px";
				currentItem.style.border = "2px solid var(--bg-4)";
			}
	
		};
		calendarGridContainer.innerHTML += "</div><br>";
	
		// MARK BOOKED SLOTS
		bookings.forEach(e => {

			if (e.state != "active") return;
	
			let roomFound = false;
			e.rooms.forEach(el => {
				if (currentRoom === el) roomFound = true;
			});
			if (roomFound === false) return;
	
			let startTimeNumber = Number(e.startTime.substring(0, 2));
			let endTimeNumber = Number(e.endTime.substring(0, 2));
			let startDayNumber = Number(e.startDate.substring(8));
			let endDayNumber = Number(e.endDate.substring(8));
	
			let startDayOne = e.startDate;
	
			const renderDay = () => {
				let idStrings = [];
				let idString = `${element.id}_${startDayOne}`;
				let timeString = "_18";
				if (startTimeNumber < 18) {
					timeString = "_13";
					if (endTimeNumber > 18) {
						let idString2 = idString + "_18";
						idStrings.push(idString2);
					}
				}
				if (startTimeNumber < 12) {
					timeString = "_08";
					if (endTimeNumber > 14) {
						let idString2 = idString + "_13";
						idStrings.push(idString2);
					}
					if (endTimeNumber > 18) {
						let idString3 = idString + "_18";
						idStrings.push(idString3);
					}
				}
				idString += timeString;
				idStrings.push(idString);
	
				idStrings.forEach(el => {
					if (document.querySelector(`#${el}`)) {
						const thisItem = document.querySelector(`#${el}`);
						thisItem.style.background = "linear-gradient(180deg, var(--accent-0), var(--accent-0-brighter) 5%, var(--accent-0))";
						// thisItem.style.backgroundColor = "var(--accent-0)";
						let title = `${e.title}\n${e.firstName} ${e.lastName}\n${e.startTime} - ${e.endTime}`;
						thisItem.title = title;
						thisItem.setAttribute("data-id", e.id);
						thisItem.classList.add("occupied");
					}
				});
			}
	
			let daysCount = endDayNumber - startDayNumber + 1;
			if (daysCount < 1) {
				daysCount = lastDayOfMonth - startDayNumber + endDayNumber + 1;
			}
	
			for (let itm = 0; itm < daysCount; itm++) {
				renderDay();
				let itmStartYear = Number(startDayOne.substring(0, 4));
				let itmStartMonth = Number(startDayOne.substring(5, 7));
				startDayNumber += 1;
				if (startDayNumber > lastDayOfMonth) {
					startDayNumber = 1;
					itmStartMonth += 1;
					if (itmStartMonth > 12) {
						itmStartMonth = 1;
						itmStartYear += 1;
					}
				}
				let startDayNumberString = startDayNumber < 10 ? `0${startDayNumber}` : startDayNumber.toString();
				let itmStartMonthString = itmStartMonth < 10 ? `0${itmStartMonth}` : itmStartMonth.toString();
				startDayOne = `${itmStartYear}-${itmStartMonthString}-${startDayNumberString}`;
			}
	
		});
		iteration += 1;
	});
}