const times = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];

let today = new Date(Date.now());
let pickedDay = today.getDate();

const renderSpecificDay = () => {
	const inpDay = document.querySelector("#inp-day");
	selectedYear = Number(inpDay.value.substring(0, 4));
	selectedMonth = Number(inpDay.value.substring(5, 7));
	selectedDay = Number(inpDay.value.substring(8));
	renderOneDay(inpDay.value);
}

const oneDayBack = () => {
	selectedDay -= 1;
	if (selectedDay < 1) {
		selectedMonth -= 1;
		if (selectedMonth < 1) {
			selectedMonth = 12;
			selectedYear -= 1;
		}
		selectedDay = new Date(selectedYear, selectedMonth, 0).getDate();
	}
	let monthString = selectedMonth < 10 ? `0${selectedMonth}` : selectedMonth;
	let dayString = selectedDay < 10 ? `0${selectedDay}` : selectedDay;
	let dateString = `${selectedYear}-${monthString}-${dayString}`;
	renderOneDay(dateString);
}

const oneDayForth = () => {
	selectedDay += 1;
	if (selectedDay > new Date(selectedYear, selectedMonth, 0).getDate()) {
		selectedDay = 1;
		selectedMonth += 1;
		if (selectedMonth > 12) {
			selectedMonth = 1;
			selectedYear += 1;
		}
	}
	let monthString = selectedMonth < 10 ? `0${selectedMonth}` : selectedMonth;
	let dayString = selectedDay < 10 ? `0${selectedDay}` : selectedDay;
	let dateString = `${selectedYear}-${monthString}-${dayString}`;
	renderOneDay(dateString);
}

const renderOneDay = (day) => {
	console.log("=> fn renderOneDay triggered");
	if (numberOfEdits > 0) {
		confirmDismissBooking();
		return;
	}
	if (!day || paginator != "day") {
		getCurrentDate();
		day = currentDateString;
		selectedMonth = currentDate.month;
		selectedYear = currentDate.year;
		selectedDay = currentDate.day;
	}
	paginator = "day";
	console.log({ paginator });

	closeAllModals();


	// STYLES
	for (let i = style.sheet.cssRules.length - 1; i >= 0; i--) {
		removeCSSRule(i)
	}
	addCSSRule(`.day-grid-container { 
		grid-template-columns: auto repeat(${rooms.length}, 1fr); 
	}`);
	// first column:
	addCSSRule(`.day-grid-item:nth-child(${rooms.length + 1}n + 1) { 
		background-color: var(--bg-2); 
		border: solid 2px var(--bg-2); 
	}`);
	// first row:
	addCSSRule(`.day-grid-item:nth-child(-n + ${rooms.length + 1}) { 
		background-color: var(--bg-2);
		border: solid 2px var(--bg-2);
		padding: 4px 12px;
	}`);

	// DEFINE HTML
	header.style.display = "grid";
	modalMax.style.display = "block";
	modalMax.innerHTML = `
		<div class="calendar-top-menu">
			<img src="assets/arrow_left.webp" class="icon" alt="Einen Tag zurück" onclick="oneDayBack()">
			<input type="date" id="inp-day" placeholder="Datum wählen" onchange="renderSpecificDay()">
			<img src="assets/arrow_right.webp" class="icon" alt="Einen Tag vor" onclick="oneDayForth()">
			<div>
				<p class="calendar-date color-accent-180">${dayPicker(day)}, ${day.substring(8)}.${day.substring(5, 7)}.${day.substring(0, 4)}</p>
			</div>
			<div></div>
		</div>
		<hr>
		<div class="day-grid-container"></div>
	`;

	const dayGridContainer = document.querySelector(".day-grid-container");
	dayGridContainer.innerHTML = `<div class="day-grid-item"></div>`;
	rooms.forEach(e => {
		dayGridContainer.insertAdjacentHTML("beforeend", `
			<div class="day-grid-item">
				<p class="color-accent-0 small">${e.location}<br><b>${e.roomName}</b><br><span class="color-accent-180">(max. ${e.maxParticipants} Personen)</span></p>
			</div>
			`);
	});
	times.forEach(e => {
		dayGridContainer.insertAdjacentHTML("beforeend", `
			<div class="day-grid-item small">${e}</div>
			`);
			for (let i = 0; i < rooms.length; i++) {
				let id = `${rooms[i].id}_${day}H${e.substring(0, 2)}`;
				dayGridContainer.insertAdjacentHTML("beforeend", `
					<div class="day-grid-item" id="${id}" onclick="checkTimeSlot(this, '${rooms[i].id}', '${id}')"></div>
				`);
			}
	});

	const dayGridItems = document.querySelectorAll(".day-grid-item");
	dayGridItems.forEach(e => {
		let room = e.id.substring(0, 29);
		let hour = Number(e.id.substring(41));

		bookings.forEach(el => {
			if (el.state != "active") return;
			let startDate = new Date(el.startDate);
			let endDate = new Date(el.endDate);
			let selectedDate = new Date(day);
			if (startDate > selectedDate || endDate < selectedDate) return;
			let startTime = Number(el.startTime.substring(0, 2));
			let endTime = Number(el.endTime.substring(0, 2));
			if (startTime > hour || endTime <= hour) return;
			if (!el.rooms.find(element => element === room)) return;
			const thisGridItem = document.querySelector(`#${e.id}`);
			thisGridItem.style.background = "linear-gradient(180deg, var(--accent-0), var(--accent-0-brighter) 5%, var(--accent-0))";
			// thisGridItem.style.backgroundColor = "var(--accent-0)";
			let title = `${el.title}\n${el.firstName} ${el.lastName}\n${el.startTime} - ${el.endTime}`;
			thisGridItem.title = title;
			thisGridItem.setAttribute("data-id", el.id);
			thisGridItem.classList.add("occupied");
		})
	});
}