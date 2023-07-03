import { useEffect, useState } from 'react';
const api_base = 'http://localhost:3001';

function App() {
	const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
	const toggleTheme = () => { document.getElementById("darkmode-toggle").checked ? setTheme('dark') : setTheme('light') };

	const [popupActive, setPopupActive] = useState(false);
	const [sempopupActive, setSemPopupActive] = useState(false);
	const [limitpopupActive, setLimitPopupActive] = useState(false);
	const [filterPopupActive, setFilterPopupActive] = useState(false);
	const [lecSecPopupActive, setLecSecPopupActive] = useState(false);
	const [moreFixedSlotsPopupActive, setMoreFixedSlotsPopupActive] = useState(false);
	const [courses, setCourses] = useState([]);

	// eslint-disable-next-line
	const [AOA, setAOA] = useState(JSON.parse(localStorage.getItem("AOA")) || []);
	// eslint-disable-next-line
	const [allCombis, setAllCombis] = useState(JSON.parse(localStorage.getItem("allCombis")) || []);
	// eslint-disable-next-line
	const [breaks, setBreaks] = useState(JSON.parse(localStorage.getItem("breaks")) || []);
	// eslint-disable-next-line
	const [fixedSlots, setFixedSlots] = useState(JSON.parse(localStorage.getItem("fixedSlots")) || []);
	// eslint-disable-next-line
	const [offDay, setOffDay] = useState(localStorage.getItem('offDay') || "");
	const [selectedCourses, setSelectedCourses] = useState(JSON.parse(localStorage.getItem("selected")) || []);
	const [term, setTerm] = useState(localStorage.getItem("term") || "0");
	const [filteredCourses, setFilteredCourses] = useState(JSON.parse(localStorage.getItem("filteredCourses")) || []);
	const [generated, setGenerated] = useState(localStorage.getItem('generated') || 'false');
	const [limit, setLimit] = useState(localStorage.getItem('limit') || "10");
	const [beginning, setBeginning] = useState(localStorage.getItem("beginning")||"800");
	const [ending, setEnding] = useState(localStorage.getItem("ending")||"2200");

	useEffect(() => {
		localStorage.setItem('theme', theme);
		document.body.className = theme;
	  }, [theme]);
	
	// TO RETURN ALL CHOSEN COURSES IN 'SELECTED COURSES'
	useEffect(() => {
		GetCourses();
		fetchCourses();
		toggleTheme();
	}, []);

	const GetCourses = () => {
		return JSON.parse(localStorage.getItem("selected"));
	}

	// TO RETURN ALL COURSES IN DATABASE
	const fetchCourses = () => {
		fetch(api_base + '/courses/all')
			.then(res => res.json())
			.then(data => setCourses(data))
			.catch((err) => console.error("Error: ", err));
	}

	// TO ADD ONE SPECIFIC COURSE TO THE ARRAY 'SELECTEDCOURSES' PROVIDED IT IS NOT ALREADY ADDED
    const addCourse = course => {
		const obj = JSON.parse(course); // obj is course to be added
		if (!(selectedCourses.some(object => (object._id === obj._id)))) {
			var existing = selectedCourses; // array of selected courses
			existing.push(obj);
			localStorage.setItem("selected", JSON.stringify(existing));
			setSelectedCourses(existing);
		}
		setPopupActive(false);
		localStorage.setItem("filteredCourses", JSON.stringify([]));
		setFilteredCourses([]);
    }

	// TO DELETE ONE SPECIFIC COURSE FROM THE ARRAY 'SELECTEDCOURSES'
	const deleteCourse = id => {
		var existing = selectedCourses; // array of selected courses
		const newArray = existing.filter(course => course._id !== id);
		localStorage.setItem("selected", JSON.stringify(newArray));
		setSelectedCourses(newArray);
	}

	const saveBreak = obj => { // obj looks something like this: "Monday1000"
		if (obj === "") {}
		else {
			var existing = GetBreaks();
			if (!(existing.some(object => (object.id === obj)))) {
				var day = obj.split("day")[0] + "day";
				var time = obj.split("day")[1];
				var newBreak = { id: obj, day: day, startBreak: time, endBreak: Number(time) + 100 };
				existing.push(newBreak);
				localStorage.setItem("breaks", JSON.stringify(existing));
				setBreaks(existing);
			}
		}
	}

	const saveOffDay = day => {
		localStorage.setItem("offDay", day);
		setOffDay(day);
	}

	const deletePeriod = id => {
		var existing = GetBreaks(); 
		const newArray = existing.filter(period => period.id !== id);
		localStorage.setItem("breaks", JSON.stringify(newArray));
		setBreaks(newArray);
	}

	const blockBreaks = combi => {
		const currBreaks = GetBreaks();
		return !combi.some(slot => currBreaks.some(period => slot.day === period.day && 
			((slot.startTime >= period.startBreak && slot.startTime < period.endBreak) || 
			(slot.endTime <= period.endBreak && slot.endTime > period.startBreak))));
	}

	const addFixedSlot = (CATName, slotName) => {
		var existing = GetFixedSlots(); // slots that are already added
		var currCourse = GetAOA().filter(arr => arr[0].CAT === CATName)[0]; // array like CS2030S Lectures, IS1108 Sectionals
		existing.filter(object => (object.CAT !== CATName)); // delete previously-added slots of the same CAT
		// eslint-disable-next-line
		currCourse.map(slot => { if (slot.slot_name === slotName) { existing.push(slot); } }); // add all slots with slotName
		localStorage.setItem("fixedSlots", JSON.stringify(existing));
		setFixedSlots(existing);
	}

	const findFreeDays = () => {
		var existing = GetFixedSlots().map(slot => slot.day);
		var result = [];
		if (!existing.includes("Monday")) { result.push("Monday"); }
		if (!existing.includes("Tuesday")) { result.push("Tuesday"); }
		if (!existing.includes("Wednesday")) { result.push("Wednesday"); }
		if (!existing.includes("Thursday")) { result.push("Thursday"); }
		if (!existing.includes("Friday")) { result.push("Friday"); }
		return result;
	}

	const resetPage = () => {
		saveTerm("0");
		localStorage.setItem("selected", JSON.stringify([]));
		setSelectedCourses([]);
		localStorage.setItem("AOA", JSON.stringify([]));
		setAOA([]);
		localStorage.setItem("allCombis", JSON.stringify([]));
		setAllCombis([]);
		localStorage.setItem("filteredCourses", JSON.stringify([]));
		setFilteredCourses([]);
		localStorage.setItem("generated", 'false');
		setGenerated('false');
		localStorage.setItem("limit", '10');
		setLimit("10");
		saveBeginning("800");
		saveEnding("2200");
		localStorage.setItem("breaks", JSON.stringify([]));
		setBreaks([]);
		localStorage.setItem("fixedSlots", JSON.stringify([]));
		setFixedSlots([]);
		localStorage.setItem("offDay", "");
		setOffDay("");
	}

	const resetButKeepCourses = () => {
		localStorage.setItem("AOA", JSON.stringify([]));
		setAOA([]);
		localStorage.setItem("allCombis", JSON.stringify([]));
		setAllCombis([]);
		localStorage.setItem("filteredCourses", JSON.stringify([]));
		setFilteredCourses([]);
		localStorage.setItem("generated", 'false');
		setGenerated('false');
		localStorage.setItem("limit", '10');
		setLimit("10");
		saveBeginning(800);
		saveEnding(2200);
		localStorage.setItem("breaks", JSON.stringify([]));
		setBreaks([]);
		localStorage.setItem("fixedSlots", JSON.stringify([]));
		setFixedSlots([]);
		localStorage.setItem("offDay", "");
		setOffDay("");
	}

	const saveTerm = term => {
		localStorage.setItem("term", term);
		setTerm(term);
	}

	const saveBeginning = beginning => {
		localStorage.setItem("beginning", beginning);
		setBeginning(beginning);
	}

	const saveEnding = ending => {
		localStorage.setItem("ending", ending);
		setEnding(ending);
	}

	const allBeginnings = () => {
		var earliest = Math.round(GetFixedSlots().map(slot => slot.startTime).reduce((a, b) => Math.min(a, b), 2200) / 100) * 100;
		var arr = [];
		for (let i = 0; i < ((earliest - 800) / 100) + 1; i++) {
			arr.push(earliest - i * 100);
		}
		return arr;
	}

	const allEndings = () => {
		var latest = Math.ceil(GetFixedSlots().map(slot => slot.endTime).reduce((a, b) => Math.max(a, b), 800) / 100) * 100;
		var arr = [];
		for (let i = 0; i < ((2200 - latest) / 100) + 1; i++) {
			arr.push(latest + i * 100);
		}
		return arr;
	}

	const allBreaks = () => {
		var earliest = JSON.parse(localStorage.getItem("beginning")); // e.g. 1000
		var latest = JSON.parse(localStorage.getItem("ending")); // e.g. 1800
		var all = [];
		for (let i = 0; i < (latest - earliest) / 100; i++) { // populate all with break slots from start to end time
			all.push(Number(earliest) + (i * 100));
		}
		return [ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday" ].filter(day => day !== GetOffDay())
			.map(day => all.reduce(
				function (acc, value) {
					const curr = { id: day + JSON.stringify(value), day: day, startTime: value, endTime: Number(value + 100) };
					if (!helper(GetFixedSlots(), curr)) {
						acc.push(curr);
					}
					return acc;
				}
			, []
			)).flatMap(arr => arr);
	}

	const helper = (slots, newBreak) => { // return true means break clashes with some fixedSlot
		return slots.some(slot =>
			(newBreak.day === slot.day) &&
				((newBreak.startTime < slot.endTime && newBreak.endTime > slot.startTime) || 
				(slot.startTime < newBreak.endTime && slot.endTime > newBreak.startTime))
		);
	}

	const isTermChosen = () => {
		return term !== "0";
	}

	const GetAvailCourses = () => {
		if (isTermChosen()) {
			return courses.filter(course => course.term === term);
		} else {
			return [];
		}
	}

	const GetAOA = () => {
		return JSON.parse(localStorage.getItem("AOA"));
	}

	const editArrOfArrs = arr => {
		var existing = GetAOA();
		existing.push(arr);
		localStorage.setItem("AOA", JSON.stringify(existing));
		setAOA(existing);
	}

	const GetAllCombis = () => {
		return JSON.parse(localStorage.getItem("allCombis"));
	}

	const GetBreaks = () => {
		return JSON.parse(localStorage.getItem("breaks"));
	}

	const GetFixedSlots = () => {
		return JSON.parse(localStorage.getItem("fixedSlots"));
	}

	const GetOffDay = () => {
		return localStorage.getItem("offDay");
	}

	const generateSchedules = () => {
		var existing = combineArrays(GetAOA());
		localStorage.setItem("AOA", JSON.stringify([]));
		setAOA([]);
		localStorage.setItem("allCombis", JSON.stringify(existing));
		setAllCombis(existing);
		setGenerated('true');
		localStorage.setItem("generated", 'true');
	}

	const compareTime = (combi, currBeginning, currEnding) => {
		return !combi.some(slot  => (slot.startTime < currBeginning || slot.endTime > currEnding));
	}

	const compareDay = slot => { // return true means no clash
		if (GetOffDay().length === 0) { // no off day chosen, so slot will always be suitable
			return true;
		} else {
			return slot.day !== GetOffDay();
		}
	}

	const extractSlots = () => { // method that builds the "AOA"
		// eslint-disable-next-line
		GetCourses().map(course => {
			if (course.lec.length !== 0) {
				editArrOfArrs(course.lec);
			}
			if (course.sec.length !== 0) {
				editArrOfArrs(course.sec);
			}
			if (course.tut.length !== 0) {
				editArrOfArrs(course.tut);
			}
			if (course.rec.length !== 0) {
				editArrOfArrs(course.rec);
			}
			if (course.lab.length !== 0) {
				editArrOfArrs(course.lab);
			}
		});
	}

	const updateAOA = () => {
		var existing = GetAOA();
		var cats = [...new Map(GetFixedSlots().map((item) => [item["CAT"], item])).values()].map(slot => slot.CAT);
		// looks like ["MA2101 lec", "MA2101 tut", "MA2108 lec", "GESS1037 sec"]
		var newAOA = existing.filter(arr => !cats.includes(arr[0].CAT)); // only arrays where slot was not chosen is left in AOA
		localStorage.setItem("AOA", JSON.stringify(newAOA));
		setAOA(newAOA);
	}

	const combineArrays = array_of_arrays => {
		// Start "odometer" with a 0 for each array in array_of_arrays
		let odometer = new Array(array_of_arrays.length);
    	odometer.fill(0); 
		let currBeginning = Number(beginning);
		let currEnding = Number(ending);
		// let currBreaks = GetBreaks();
		let output = [];

		let newCombination = formCombination( odometer, array_of_arrays );

    	if ((newCombination.length > 0) && (compareTime(newCombination, currBeginning, currEnding)) 
			&& (blockBreaks(newCombination))) { 
				output.push( newCombination ); 
		}

		while (odometer_increment(odometer, array_of_arrays) && output.length < JSON.parse(limit)) {
			newCombination = formCombination( odometer, array_of_arrays );
			if ((newCombination.length > 0) && (compareTime(newCombination, currBeginning, currEnding)) 
				&& (blockBreaks(newCombination))) { 
					output.push( newCombination ); 
			}
		}

		return output;
	}

	const compareSlots = (combi, newSlot) => { 
	// returns true if any frequency overlaps at all (so combi should be eliminated)
		return combi.some(slot =>
				(newSlot.day === slot.day) &&
					((newSlot.startTime < slot.endTime && newSlot.endTime > slot.startTime) || 
					(slot.startTime < newSlot.endTime && slot.endTime > newSlot.startTime)) &&
					(compareFrequency(slot, newSlot))
		);
	}

	const compareFrequency = (s1, s2) => {
		if (s1.frequency.length <= s2.frequency.length) {
			return s1.frequency.some(hz => s2.frequency.includes(hz));
		} else {
			return s2.frequency.some(hz => s1.frequency.includes(hz));
		}
	}

	// Translate "odometer" to combinations from array_of_arrays
	const formCombination = (odometer, array_of_arrays) => {
		return odometer.reduce(
			function(accumulator, odometer_value, odometer_index) {
				if (accumulator.length === 0) { return []; } // been cleared before
				else if (!compareSlots(accumulator, array_of_arrays[odometer_index][odometer_value]) &&
						compareDay(array_of_arrays[odometer_index][odometer_value])) {
					const currSlot = array_of_arrays[odometer_index][odometer_value];
					accumulator.push(currSlot);

					if (currSlot.bundled !== undefined) {
						if (array_of_arrays[odometer_index].findIndex(e => e.slot_id === currSlot.bundled[0]) > odometer_value) {
							for ( let i = 0; i < currSlot.bundled.length; i++ ) { // adding all bundled objects to combi
								const bundledObjId = currSlot.bundled[i];
								const bundledObj = array_of_arrays[odometer_index].find(element => element.slot_id === bundledObjId);
								if (compareSlots(accumulator, bundledObj) || !compareDay(bundledObj)) { // returns true means return []
									accumulator = [];
									break;
								} else {
									accumulator.push(bundledObj);
								}
							}
						} else {
							accumulator = [];
						}					
					}

					return accumulator;
				} else { // clear array if the new slot clashes with something already in accumulator or falls on off day
					return [];
				}
			},
			GetFixedSlots().concat()			
		);
	}

	const odometer_increment = (odometer, array_of_arrays) => {
	
		for (let i_odometer_digit = odometer.length - 1; i_odometer_digit >= 0; i_odometer_digit--) { 
	
			let maxee = array_of_arrays[i_odometer_digit].length - 1;         
	
			if (odometer[i_odometer_digit] + 1 <= maxee) {
				// increment, and you're done...
				odometer[i_odometer_digit]++;
				return true;
			} else {
				if (i_odometer_digit - 1 < 0) {
					// No more digits left to increment, end of the line...
					return false;
				} else {
					// Can't increment this digit, cycle it to zero and continue
					// the loop to go over to the next digit...
					odometer[i_odometer_digit] = 0;
					continue;
				}
			}
		}
		
	}

	const printCombi = index => {
		// print allCombis.filter(combi => combi.length > 0)[index]
	}

	const filterCourses = (searchTerm) => {
		if (searchTerm === "") {
			localStorage.setItem("filteredCourses", JSON.stringify([]));
			setFilteredCourses([]);
		} else {
			const filtered = GetAvailCourses().filter(course => course.code.toLowerCase().includes(searchTerm.toLowerCase()));
			localStorage.setItem("filteredCourses", JSON.stringify(filtered));
			setFilteredCourses(filtered);
		}
	}

  return (
    <div className="App">
			<h1>Welcome to the Schedule Generator!</h1>
			{ selectedCourses.length === 0 && generated === "false" && <h2>Start by selecting a semester below</h2> }
			{ selectedCourses.length > 0 && generated === "false" &&
				( (selectedCourses[0].term === "1" && <h4>Your Semester 1 Courses</h4>) ||
				(selectedCourses[0].term === "2" && <h4>Your Semester 2 Courses</h4>) ||
				(selectedCourses[0].term === "3" && <h4>Your Special Term I Courses</h4>) ||
				(selectedCourses[0].term === "4" && <h4>Your Special Term II Courses</h4>) ) }
			{ generated === "true" && <h4>Your Combinations</h4> }
			<button className="resetEverythingButton" onClick={resetPage}>Reset Everything</button>
			<button className="resetButton" onClick={resetButKeepCourses}>Reset (Keep Courses)</button>
			<div className="courses">
				{selectedCourses.length > 0 && generated === "false" && selectedCourses.map(course => (
						<div className={"course"} key={course._id}>

							<div className="text">{course.code} {course.name}</div>

							<div className="delete-course" onClick={() => deleteCourse(course._id)}>X</div>
						</div>
				))}
            </div>
			<div className={`App ${theme}`}>
				<input type="checkbox" id="darkmode-toggle" className="darkmode-input" onClick={toggleTheme}/>
				<label htmlFor="darkmode-toggle">
					<svg className="sun" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<g id="Environment / Sun">
						<path id="Vector" d="M12 4V2M12 20V22M6.41421 6.41421L5 5M17.728 17.728L19.1422 19.1422M4 12H2M20 12H22M17.7285 6.41421L19.1427 5M6.4147 17.728L5.00049 19.1422M12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17Z" stroke="#202B3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
					</g>
					</svg>
					<svg className="moon" width="800px" height="800px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
						<path className="crescent" d="M895.573333 652.096a21.504 21.504 0 0 0-20.693333-5.504A406.186667 406.186667 0 0 1 768 661.333333c-223.509333 0-405.333333-181.824-405.333333-405.333333 0-35.136 4.949333-71.104 14.741333-106.88a21.333333 21.333333 0 0 0-26.197333-26.218667C156.970667 175.957333 21.333333 353.514667 21.333333 554.666667c0 247.04 200.96 448 448 448 201.173333 0 378.709333-135.637333 431.744-329.856a21.333333 21.333333 0 0 0-5.504-20.714667z" fill="none" />
						<path className="stars" d="M725.333333 106.666667c-35.285333 0-64-28.714667-64-64a21.333333 21.333333 0 1 0-42.666666 0c0 35.285333-28.714667 64-64 64a21.333333 21.333333 0 1 0 0 42.666666c35.285333 0 64 28.714667 64 64a21.333333 21.333333 0 1 0 42.666666 0c0-35.285333 28.714667-64 64-64a21.333333 21.333333 0 1 0 0-42.666666zM981.333333 362.666667c-35.285333 0-64-28.714667-64-64a21.333333 21.333333 0 1 0-42.666666 0c0 35.285333-28.714667 64-64 64a21.333333 21.333333 0 1 0 0 42.666666c35.285333 0 64 28.714667 64 64a21.333333 21.333333 0 1 0 42.666666 0c0-35.285333 28.714667-64 64-64a21.333333 21.333333 0 1 0 0-42.666666z" fill="none" />
					</svg>
				</label>
			</div>
			<div>
				{selectedCourses.length === 0 && <div>
					<button className="SemButton" id="chooseSemButton" onClick={e => { setSemPopupActive(true); }}>Select a Semester</button>
					{sempopupActive ? (
						<div className="sempopup">
						<div className="closeSemPopup" onClick={() => setSemPopupActive(false)}>X</div>
						<div className="semContent">
							<select className="choose-semester-input"
								onChange={e => saveTerm(e.target.value)}>
								<option> -- Select a Semester Below -- </option>
								<option value="1">Semester 1</option>
								<option value="2">Semester 2</option>
								<option value="3">Special Term I</option>
								<option value="4">Special Term II</option>
							</select>
							{isTermChosen() && 
								<div className="semButton" onClick={() => setSemPopupActive(false)}>Confirm Semester</div>
							}
						</div>
						</div>
				) : ''}
				</div> }
			</div>

			<div>
			{isTermChosen() && sempopupActive === false && generated === "false" &&
				<div className="addPopup" onClick={() => setPopupActive(true)}>+</div>
			}

			{popupActive ? (
					<div className="popup">
						<div className="closePopup" onClick={() => setPopupActive(false)}>X</div>
						<div className="content">
							<h3>Select to Add Course</h3>
							<input type="text" className="add-course-input"
							onChange={e => filterCourses(e.target.value)}
							placeholder="Type to Search for a Course"/>
							{filteredCourses.length > 0 && <ul className="courseList">
								{filteredCourses.map(course => (
									<li key={JSON.stringify(course)}
									onClick={() => addCourse(JSON.stringify(course))}
									>{course.code} {course.name}</li>
								))}
							</ul>}
						</div>
					</div>
				) : ''}
			</div>
			<div>
			{selectedCourses.length > 0 && generated === "false" && limitpopupActive === false &&
				<div className="limit" onClick={() => setLimitPopupActive(true)}>Set Limit</div>
			}

			{limitpopupActive ? (
					<div className="limitpopup">
						<div className="closeLimitPopup" onClick={() => setLimitPopupActive(false)}>X</div>
						<div className="content">
							<h3>Select A Limit</h3>
							<h4>This limit will be the maximum number of combinations that are generated.</h4>
							<h5>Note: the greater the limit, the more time this program will take to complete. Our team is still working on improving efficiency. Thank you for your patience!</h5>
							<select className="select-limit"
							onChange={e => { setLimit(e.target.value); setLimitPopupActive(false) }}>
								<option>Select Limit</option>
								<option value="5">5</option>
								<option value="10">10 (Recommended Default)</option>
								<option value="15">15</option>
								<option value="20">20</option>
								<option value="100">100</option>
							</select>
						</div>
					</div>
				) : ''}
			</div>
			<div>
				{selectedCourses.length > 0 && generated ==="false" && GetFixedSlots().length === 0 &&
					<button className="generateButton" onClick={e => {setLecSecPopupActive(true); extractSlots()}}>Choose Slots</button>
				}

				{ lecSecPopupActive ? (
					<div className="LecSecPopup">
					<div className="closeLecSecPopup" onClick={() => setLecSecPopupActive(false)}>X</div>
						<div className="content">
							<h3>Select Your Lecture and Sectional Slots</h3>
							<h4>Please select one from each course</h4>

								{GetAOA().filter(course => course[0].CAT.includes("lec") || course[0].CAT.includes("sec"))
									.map(course => (
									<select className="add-lec-sec-slot" onChange={e => addFixedSlot(course[0].CAT, e.target.value)}>
										<option>Select Lecture/Sectional Slot</option>
										{ [...new Map(course.map((item) => [item["slot_name"], item])).values()].map(slot => (
											<option value={slot.slot_name}>{slot.CAT} {slot.slot_name}</option>
										)) }
									</select>
								))}

							{GetFixedSlots().length > 0 && GetCourses().length > 0 && findFreeDays().length > 0 &&
								<select className="choose-off-day" onChange={e => saveOffDay(e.target.value)}>
									<option>Choose A Day Off</option>
									{findFreeDays().map(day => (
										<option value={day}>{day}</option>
									))}
								</select>
							}
							{ GetFixedSlots().length > 0 && GetCourses().length > 0 &&
							<button className="GenerateButton" onClick={() => {setLecSecPopupActive(false); setFilterPopupActive(true); updateAOA()}}>Confirm Slots</button>}
							{ GetFixedSlots().length > 0 && GetCourses().length > 0 &&
							<button className="MoreFixedSlots" onClick={() => {setLecSecPopupActive(false); setMoreFixedSlotsPopupActive(true)}}>Set More Slots</button>}
						</div>
					</div>
				) : ''}
				{ moreFixedSlotsPopupActive ? (
					<div className="LecSecPopup">
					<div className="closeLecSecPopup" onClick={() => setMoreFixedSlotsPopupActive(false)}>X</div>
						<div className="content">
							<h3>Select Your Tutorial and Lab Slots</h3>
							<h4>Please only select the must-have tut/lab slots, leave the rest to be generated</h4>

								{GetAOA().filter(course => course[0].CAT.includes("tut") || course[0].CAT.includes("lab") || course[0].CAT.includes("rec"))
									.map(course => (
									<select className="add-lec-sec-slot" onChange={e => addFixedSlot(course[0].CAT, e.target.value)}>
										<option>Select Tutorial/Lab Slot</option>
										{ [...new Map(course.map((item) => [item["slot_name"], item])).values()].map(slot => (
											<option value={slot.slot_name}>{slot.CAT} {slot.slot_name}</option>
										)) }
									</select>
								))}

							{ GetFixedSlots().length > 0 && GetCourses().length > 0 &&
							<button className="GenerateButton" onClick={() => {setMoreFixedSlotsPopupActive(false); setFilterPopupActive(true); updateAOA()}}>Confirm Slots</button>}
						</div>
					</div>
				) : ''}
			</div>
			<div>
				{filterPopupActive ? (
					<div className="filterPopup">
						<div className="closeFilterPopup" onClick={() => setFilterPopupActive(false)}>X</div>
							<div className="content">
								<h3>Select Your Filters</h3>
								<h4>Start time is the earliest you will start your day. End time is the latest you will end your day.</h4>
								<select className="choose-beginning-input" onChange={e => saveBeginning(e.target.value)}>
									<option>Select a Start Time</option>
									{ // eslint-disable-next-line
									allBeginnings().map(time => <option value={time}>{time / 100}:00</option>) }
								</select>
								<p><br/></p>
								<select className="choose-ending-input" onChange={e => saveEnding(e.target.value)}>
									<option>Select an End Time</option>
									{ // eslint-disable-next-line
									allEndings().map(time => <option value={time}>{time / 100}:00</option>) }
								</select>
								<p><br/></p>
								<select className="choose-breaks-input" onChange={e => saveBreak(e.target.value)}>
									<option>Select a Break</option>
									<option value="">No Break</option>
									
									{allBreaks().map(br =>
										<option value={br.id}>{br.day} {br.startTime} to {br.endTime}</option>
									)}
										
								</select>
								{GetBreaks().length > 0 && GetBreaks().map(period => (
									<div className="breaks" key={period.id}>
										<div className="period">{period.day} {period.startBreak} to {period.endBreak}</div>
										<div className="delete-period" onClick={() => deletePeriod(period.id)}>X</div>
									</div>
								))}		
							</div>
							{ GetFixedSlots().length > 0 && GetCourses().length > 0 &&
							<button className="GenerateButton" onClick={() => {generateSchedules(); setFilterPopupActive(false)}}>Start Generating</button>}
					</div>
				) : ''}
			</div>
			<div className="combis">
				{generated === "true" && GetAllCombis().length > 0
					? GetAllCombis().map((combi, index) => (
							<div className="combi">
								<button onClick={printCombi(index)} className="print-combi">Download</button>
									<table>
										<tr><th>Combination {index + 1}:</th></tr>
										{ combi.map((slot, id) => (
										<div className="slotInfo">
											<tr>
												<td>{slot.CAT} {slot.slot_name}:</td>
												<td>{slot.day} from {slot.startTime} to {slot.endTime}</td>
											</tr>
										</div>
									))
									}
									</table>
							</div>
					)) : ( generated === "true" && GetAllCombis().length === 0
							? <h3>Sorry, there are no combinations that fit your criteria.</h3>
							: (<p></p>)
						)}
            </div>
	</div>
  );
}

export default App;