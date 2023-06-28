import { useEffect, useState } from 'react';
const api_base = 'http://localhost:3001';

function App() {
	const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
	const toggleTheme = () => { document.getElementById("darkmode-toggle").checked ? setTheme('dark') : setTheme('light') };

	const [popupActive, setPopupActive] = useState(false);
	const [sempopupActive, setSemPopupActive] = useState(false);

	const [courses, setCourses] = useState([]);

	const [selectedCourses, setSelectedCourses] = useState(JSON.parse(localStorage.getItem("selected")) || []);
	const [term, setTerm] = useState(localStorage.getItem("term") || "0");
	const [filteredCourses, setFilteredCourses] = useState(JSON.parse(localStorage.getItem("filteredCourses")) || []);
	// eslint-disable-next-line
	const [AOA, setAOA] = useState(JSON.parse(localStorage.getItem("AOA")) || []);
	// eslint-disable-next-line
	const [allCombis, setAllCombis] = useState(JSON.parse(localStorage.getItem("allCombis")) || []);
	const [generated, setGenerated] = useState(localStorage.getItem('generated') || 'false');

	useEffect(() => {
		localStorage.setItem('theme', theme);
		document.body.className = theme;
	  }, [theme]);
	
	// TO RETURN ALL CHOSEN COURSES IN 'SELECTED COURSES'
	useEffect(() => {
		GetCourses();
		fetchCourses();
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
	}

	const saveTerm = term => {
		localStorage.setItem("term", term);
		setTerm(term);
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

	const generateSchedules = () => {
		const arr = GetCourses();
		arr.forEach(c => extractSlots(c));

		var existing = combineArrays(GetAOA());
		localStorage.setItem("AOA", JSON.stringify([]));
		setAOA([]);
		localStorage.setItem("allCombis", JSON.stringify(existing));
		setAllCombis(existing);
		setGenerated('true');
		localStorage.setItem("generated", 'true');
	}

	const extractSlots = course => { // method that builds the "AOA"
		if (course.lec.length !== 0) {
			editArrOfArrs(course.lec);
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
		if (course.sec.length !== 0) {
			editArrOfArrs(course.sec);
		}
	}

	const combineArrays = array_of_arrays => {
		// Start "odometer" with a 0 for each array in array_of_arrays
		let odometer = new Array(array_of_arrays.length);
    	odometer.fill(0); 
		let output = [];

		// const noOfCombis = array_of_arrays.reduce((acc, curr) => acc * curr.length, 1);

    	let newCombination = formCombination( odometer, array_of_arrays );

    	if (newCombination.length > 0) { output.push( newCombination ); }

		while (odometer_increment(odometer, array_of_arrays) && output.length < 30) { // or < limit (chosen by user)
			newCombination = formCombination( odometer, array_of_arrays );
			if (newCombination.length > 0) { output.push( newCombination ); }
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
				if (odometer_index > 0 && accumulator.length === 0) { return []; } // been cleared before
				else if (odometer_index === 0 || !compareSlots(accumulator, array_of_arrays[odometer_index][odometer_value])) {
					const currSlot = array_of_arrays[odometer_index][odometer_value];
					accumulator.push(currSlot);

					if (currSlot.bundled !== undefined) {
						if (array_of_arrays[odometer_index].findIndex(e => e.slot_id === currSlot.bundled[0]) > odometer_value) {
							for ( let i = 0; i < currSlot.bundled.length; i++ ) { // adding all bundled objects to combi
								const bundledObjId = currSlot.bundled[i];
								const bundledObj = array_of_arrays[odometer_index].find(element => element.slot_id === bundledObjId);
								if (compareSlots(accumulator, bundledObj)) { // returns true means return []
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
				} else {
					return [];
				}
			},
			[]			
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
			<button className="resetButton" onClick={resetPage}>Reset</button>
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
								<option selected disabled={true}> -- Select a Semester Below -- </option>
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
				{ selectedCourses.length > 0 && generated === "false" &&
					<button className="generateButton" onClick={generateSchedules}>Start Generating!</button>
				}
			</div>
			<div className="combis">
				{generated === "true" 
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
					)) : (
					<p></p>
				)}
            </div>
	</div>
  );
}

export default App;