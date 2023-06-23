import { useEffect, useState } from 'react';
const api_base = 'http://localhost:3001';

function App() {
	const [popupActive, setPopupActive] = useState(false);
	const [sempopupActive, setSemPopupActive] = useState(false);

	const [courses, setCourses] = useState([]);
	const [selectedCourses, setSelectedCourses] = useState(JSON.parse(localStorage.getItem("selected")) || []);
	const [term, setTerm] = useState(localStorage.getItem("term") || "0");
	// eslint-disable-next-line
	const [AOA, setAOA] = useState(JSON.parse(localStorage.getItem("AOA")) || []);
	// eslint-disable-next-line
	const [AOAInfo, setAOAInfo] = useState(JSON.parse(localStorage.getItem("AOAInfo")) || []);
	// eslint-disable-next-line
	const [allCombis, setAllCombis] = useState(JSON.parse(localStorage.getItem("allCombis")) || []);
	// eslint-disable-next-line
	const [allCombisInfo, setAllCombisInfo] = useState(JSON.parse(localStorage.getItem("allCombisInfo")) || []);
	const [filteredCourses, setFilteredCourses] = useState(JSON.parse(localStorage.getItem("filteredCourses")) || []);

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

	// setting up available courses
	localStorage.setItem("term1", JSON.stringify(courses.filter(course => course.term === "1")));
	localStorage.setItem("term2", JSON.stringify(courses.filter(course => course.term === "2")));
	localStorage.setItem("term3", JSON.stringify(courses.filter(course => course.term === "3")));
	localStorage.setItem("term4", JSON.stringify(courses.filter(course => course.term === "4")));

	// TO ADD ONE SPECIFIC COURSE TO THE ARRAY 'SELECTEDCOURSES' PROVIDED IT IS NOT ALREADY ADDED
    const addCourse = async course => {
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
	const deleteCourse = async id => {
		var existing = selectedCourses; // array of selected courses
		const newArray = existing.filter(course => course._id !== id);
		localStorage.setItem("selected", JSON.stringify(newArray));
		setSelectedCourses(newArray);
	}

	const resetPage = async () => {
		saveTerm("0");
		localStorage.setItem("selected", JSON.stringify([]));
		setSelectedCourses([]);
		localStorage.setItem("AOA", JSON.stringify([]));
		setAOA([]);
		localStorage.setItem("allCombis", JSON.stringify([]));
		setAllCombis([]);
		localStorage.setItem("AOAInfo", JSON.stringify([]));
		setAOAInfo([]);
		localStorage.setItem("allCombisInfo", JSON.stringify([]));
		setAllCombisInfo([]);
		localStorage.setItem("filteredCourses", JSON.stringify([]));
		setFilteredCourses([]);
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
			return JSON.parse(localStorage.getItem("term" + term));
		} else {
			return [];
		}
	}

	const GetAOA = () => {
		return JSON.parse(localStorage.getItem("AOA"));
	}

	const GetAOAInfo = () => {
		return JSON.parse(localStorage.getItem("AOAInfo"));
	}

	const editArrOfArrs = arr => {
		var existing = GetAOA();
		existing.push(arr);
		localStorage.setItem("AOA", JSON.stringify(existing));
		setAOA(existing);
	}

	const editArrOfArrsInfo = (code, type) => {
		var existing = GetAOAInfo();
		var currInfo = { code: code, type: type };
		existing.push(currInfo);
		localStorage.setItem("AOAInfo", JSON.stringify(existing));
		setAOAInfo(existing);
	}

	const GetAllCombis = () => {
		return JSON.parse(localStorage.getItem("allCombis"));
	}

	const GetAllCombisInfo = () => {
		return JSON.parse(localStorage.getItem("allCombisInfo"));
	}

	const generateSchedules = async () => {
		const arr = GetCourses();
		arr.forEach(c => extractSlots(c));
		var existing = combineArrays(GetAOA());
		localStorage.setItem("allCombis", JSON.stringify(existing));
		setAllCombis(existing);
		checkForRepeats();
		checkForTimeOverlap();
	}

	const expandAllCombisInfo = () => {
		var existing = GetAllCombisInfo();
		existing.push([]);
		localStorage.setItem("allCombisInfo", JSON.stringify(existing));
		setAllCombisInfo(existing);
	}

	const editAllCombisInfo = obj => {
		const currLength = GetAllCombisInfo().length;
		const currCombi = GetAllCombisInfo()[currLength - 1];
		const currArray = GetAllCombisInfo();
		currCombi.push(obj);
		currArray.pop();
		currArray.push(currCombi);
		localStorage.setItem("allCombisInfo", JSON.stringify(currArray));
		setAllCombisInfo(currArray);
	}

	const extractSlots = course => { // method that builds the "AOA" and "AOAInfo"
		if (course.lec.length !== 0) {
			editArrOfArrs(course.lec);
			editArrOfArrsInfo(course.code, "Lec");
		}
		if (course.tut.length !== 0) {
			editArrOfArrs(course.tut);
			editArrOfArrsInfo(course.code, "Tut");
		}
		if (course.rec.length !== 0) {
			editArrOfArrs(course.rec);
			editArrOfArrsInfo(course.code, "Rec");
		}
		if (course.lab.length !== 0) {
			editArrOfArrs(course.lab);
			editArrOfArrsInfo(course.code, "Lab");
		}
	}

	const combineArrays = array_of_arrays => {
		// Start "odometer" with a 0 for each array in array_of_arrays
		let odometer = new Array(array_of_arrays.length);
    	odometer.fill(0); 
		let output = [];

		expandAllCombisInfo();
    	let newCombination = formCombination( odometer, array_of_arrays );

    	output.push( newCombination );

		while (odometer_increment(odometer, array_of_arrays)) {
			expandAllCombisInfo();
			newCombination = formCombination( odometer, array_of_arrays );
			output.push( newCombination );
		}

		return output;
	}

	const checkForRepeats = async () => {
		var existing = GetAllCombis().filter(combi => combi.length > 0);
		var existingInfo = GetAllCombisInfo().filter(combi => combi.length > 0);

		for (let i = 0; i < existing.length - 1; i++) {
			for (let j = i + 1; j < existing.length; j++) {
				if (compareArr(existing[i], existing[j])) {
					existing.splice(i, 1, []);
					localStorage.setItem("allCombis", JSON.stringify(existing));
					setAllCombis(existing);
					
					existingInfo.splice(i, 1, []);
					localStorage.setItem("allCombisInfo", JSON.stringify(existingInfo));
					setAllCombisInfo(existingInfo);

					break;
				}
			}
		}
	}

	const compareArr = (arr1, arr2) => {
		const copy1 = arr1.concat();
		const copy2 = arr2.concat();
		copy1.sort((s1, s2) => { 
			if (s1.slot_id < s2.slot_id) { 
				return -1; 
			} else if (s1.slot_id > s2.slot_id) { 
				return 1; 
			} else { return 0; 
			}
		});
		copy2.sort((s1, s2) => { 
			if (s1.slot_id < s2.slot_id) { 
				return -1; 
			} else if (s1.slot_id > s2.slot_id) { 
				return 1; 
			} else { return 0; 
			}
		});
		for (let i = 0; i < copy1.length; i++) {
			if (copy1[i].slot_id !== copy2[i].slot_id) {
				return false;
			}
			continue;
		}
		return true;
	}

	const checkForTimeOverlap = async () => {
		var existing = GetAllCombis().filter(combi => combi.length > 0);
		var existingInfo = GetAllCombisInfo().filter(combi => combi.length > 0);

		for (let i = 0; i < existing.length; i++) {
			if (compareSlots(existing[i])) {
				existing.splice(i, 1, []);
				localStorage.setItem("allCombis", JSON.stringify(existing));
				setAllCombis(existing);
						
				existingInfo.splice(i, 1, []);
				localStorage.setItem("allCombisInfo", JSON.stringify(existingInfo));
				setAllCombisInfo(existingInfo);
			}
		}
	}

	const compareSlots = combi => {
		for (let j = 0; j < combi.length - 1; j++) {
			for (let k = j + 1; k < combi.length; k++) {
				if (combi[j].day === combi[k].day &&
					((combi[k].startTime < combi[j].endTime && combi[j].startTime <= combi[k].startTime) || 
					(combi[j].startTime < combi[k].endTime && combi[k].startTime <= combi[j].startTime))) {
					if (compareFrequency(combi[j], combi[k])) { // return true if frequency overlap at all
						return true;
					}
				}
				continue;
			}
		}
		return false;
	}

	const compareFrequency = (s1, s2) => {
		if (s1.frequency.length <= s2.frequency.length) {
			for (let i = 0; i < s1.frequency.length; i++ ) {
				if (s2.frequency.includes(s1.frequency[i])) {
					return true;
				}
			}
			return false;
		} else {
			for (let i = 0; i < s2.frequency.length; i++ ) {
				if (s1.frequency.includes(s2.frequency[i])) {
					return true;
				}
			}
			return false;
		}
	}

	// Translate "odometer" to combinations from array_of_arrays
	const formCombination = (odometer, array_of_arrays) => {
		return odometer.reduce(
			function(accumulator, odometer_value, odometer_index) {
				const currSlot = array_of_arrays[odometer_index][odometer_value];
				const currArr = array_of_arrays[odometer_index];
				if (currSlot.bundled !== undefined) {
					for ( let i = 0; i < currSlot.bundled.length; i++ ) {
						const bundledObjId = currSlot.bundled[i];
						const bundledObj = currArr.find(element => element.slot_id === bundledObjId);
						accumulator.push(bundledObj);
						editAllCombisInfo(GetAOAInfo()[odometer_index]);

					}					
				}
				accumulator.push(currSlot);
				editAllCombisInfo(GetAOAInfo()[odometer_index]);
				return accumulator;
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
			{ selectedCourses.length === 0 && <h2>Start by selecting a semester below</h2> }
			{ selectedCourses.length > 0 && 
				( (selectedCourses[0].term === "1" && <h4>Your Semester 1 Courses</h4>) ||
				(selectedCourses[0].term === "2" && <h4>Your Semester 2 Courses</h4>) ||
				(selectedCourses[0].term === "3" && <h4>Your Special Term I Courses</h4>) ||
				(selectedCourses[0].term === "4" && <h4>Your Special Term II Courses</h4>) ) }
			<button className="resetButton" onClick={resetPage}>Reset</button>
			<div className="courses">
				{(selectedCourses.length > 0 && GetAllCombis().length === 0)
					? selectedCourses.map(course => (
						<div className={"course"} key={course._id}>

							<div className="text">{course.code} {course.name}</div>

							<div className="delete-course" onClick={() => deleteCourse(course._id)}>x</div>
						</div>
				)) : (
					<p></p>
				)}
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
			{isTermChosen() && sempopupActive === false && GetAllCombis().length === 0 &&
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
				{ selectedCourses.length > 0 && GetAllCombis().length === 0 &&
					<button className="generateButton" onClick={generateSchedules}>Start Generating!</button>
				}
			</div>
			<div className="combis">
				{GetAllCombis().length > 0 
					? GetAllCombis().filter(combi => combi.length > 0).map((combi, index) => (
							<div className="combi">
								<button onClick={printCombi(index)} className="print-combi">Download</button>
									<table>
										<tr><th>Combination {index + 1}:</th></tr>
										{ combi.map((slot, id) => (
										<div className="slotInfo">
											<tr>
												<td>{GetAllCombisInfo().filter(combi => combi.length > 0)[index][id].code} {GetAllCombisInfo().filter(combi => combi.length > 0)[index][id].type} {slot.slot_name}:</td>
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