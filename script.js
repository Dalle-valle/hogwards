"use strict";

window.addEventListener("DOMContentLoaded", start);

let allStudents = [];
let allExpelled = [];
let families = {};
let hasBeenHacked = false;
const detail = document.querySelector("#details");

// load json
loadJSON("https://petlatkea.dk/2020/hogwarts/students.json", prepareObjects);
loadJSON("https://petlatkea.dk/2020/hogwarts/families.json", prepareBlood);

// The prototype for all students:
const Student = {
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "",
  image: "",
  house: "",
  bloodstatus: "",
  prefect: false,
  inquisitorial: false,
  expelled: false,
  rank: "",
};

// settings for filter and sort
const settings = {
  filter: "all",
  sortBy: "firstName",
  sortDir: "asc",
};

function start() {
  console.log("ready");

  // add eventlistener to filter and sort
  registerButtons();
}

// add eventlisteners to buttons

function registerButtons() {
  document.querySelectorAll("[data-action='filter']").forEach((button) => button.addEventListener("click", selectFilter));

  document.querySelectorAll("[data-action='sort']").forEach((field) => field.addEventListener("click", selectSort));
}

// load json
async function loadJSON(url, callback) {
  const response = await fetch(url);

  const data = await response.json();
  console.log(data);
  callback(data);
}

// prepare the data
function prepareObjects(jsonData) {
  allStudents = jsonData.map(prepareObject);

  buildList();
}

// prepare the objects of students
// clean the data and push to prototype
function prepareObject(jsonObject) {
  const student = Object.create(Student);
  // split names
  const fullname = jsonObject.fullname.trim();
  student.firstName = capitalization(fullname.substring(0, fullname.indexOf(" ")));
  student.middleName = capitalization(fullname.substring(fullname.indexOf(" ") + 1, fullname.lastIndexOf(" ")));
  if (student.middleName === " ") {
    student.middleName = null;
  }

  student.lastName = capitalization(fullname.substring(fullname.lastIndexOf(" ") + 1));

  if (student.lastName.includes("-")) {
    const before = student.lastName.substring(0, student.lastName.indexOf("-"));
    const after = student.lastName.substring(student.lastName.indexOf("-") + 1);

    const newLastName = capitalization(before) + "-" + capitalization(after);

    student.lastName = newLastName;
  }

  // clean the houses
  student.house = capitalization(jsonObject.house);
  student.gender = jsonObject.gender;
  student.image = `images/${student.lastName}_${student.firstName.substring(0, 1)}.png`;
  student.image = student.image.toLowerCase();
  if (student.lastName.includes("-")) {
    const ifDash = student.lastName.substring(student.lastName.indexOf("-") + 1);
    student.image = `images/${ifDash}_${student.firstName.substring(0, 1)}.png`;
  }

  // hardcode the images remaining
  if (student.firstName === "Padma") {
    student.image = `images/patil_padma.png`;
  }
  if (student.firstName === "Parvati") {
    student.image = `images/patil_parvati.png`;
  }

  // add special picture to Leanne
  if (student.lastName === "Leanne") {
    student.image = `images/alma.png`;
  }
  // set ranks depending on status
  if (student.prefect === true) {
    student.rank = "prefect";
  } else if (student.inquisitorial === true) {
    student.rank = "Squadmember";
  } else {
    student.rank = "Student";
  }

  // return the object
  return student;
}

// blood status. Code collabbed with Ardiadna and Jonas++

function prepareBlood(jsondata) {
  console.log(jsondata);
  families = jsondata;

  // making sure the students have the right blood-status
  allStudents.forEach((student) => {
    if (families.half.includes(student.lastName)) {
      student.bloodstatus = "half";
    } else if (families.pure.includes(student.lastName) && !families.half.includes(student.lastName)) {
      student.bloodstatus = "pure";
    } else {
      student.bloodstatus = "muggle";
    }
  });
  buildList();
}

// delegator function setting filters
function buildList() {
  const currentList = filterList(allStudents);
  const sortedList = sortList(currentList);
  displayList(sortedList);
}

// displaying students and keeping statistics updated
function displayList(students) {
  // clear the list
  document.querySelector("#list").innerHTML = "";

  // update stats

  document.querySelector(".students_huff").textContent =
    "Current students in Hufflepuff: " + allStudents.filter((student) => student.house === "Hufflepuff").length;

  document.querySelector(".students_raven").textContent =
    "Current students in Ravenclaw: " + allStudents.filter((student) => student.house === "Ravenclaw").length;

  document.querySelector(".students_slyth").textContent =
    "Current students in Slytherin: " + allStudents.filter((student) => student.house === "Slytherin").length;

  document.querySelector(".students_gryf").textContent =
    "Current students in Gryffindor: " + allStudents.filter((student) => student.house === "Gryffindor").length;
  document.querySelector(".students_expel").textContent = "Current students expelled: " + allExpelled.length;

  document.querySelector(".students_prefect").textContent =
    "Current amount of prefects: " + allStudents.filter((student) => student.prefect === true).length;

  if (student.prefect === true) {
    student.rank = "Prefect";
  } else if (student.inquisitorial === true) {
    student.rank = "Squadmember";
  } else {
    student.rank = "Student";
  }
  // build a new list
  students.forEach(displayStudent);
}

// adding the clone data

function displayStudent(student) {
  // create clone
  let studentContainer = document.querySelector("#list");
  let studentTemplate = document.querySelector("#student");
  const clone = studentTemplate.content.cloneNode(true);

  // set clone data to display on list view

  clone.querySelector("[data-field=name]").textContent = `${student.firstName} ${student.middleName} ${student.lastName}`;
  clone.querySelector("[data-field=house]").textContent = `of house ${student.house}`;

  clone.querySelector("[data-field=rank]").textContent = `Rank: ${student.rank}`;

  // click student to open singleview
  clone.querySelector("article").addEventListener("click", () => showDetail(student));
  clone.querySelector("article").addEventListener("click", removeClass);
  // check gender and put a symbol for each
  if (student.gender === "girl") {
    clone.querySelector("[data-field=gender]").textContent = "♀";
    clone.querySelector(".gender").style.color = "#EAB5AC";
  } else if (student.gender === "boy") {
    clone.querySelector("[data-field=gender]").textContent = "♂";
    clone.querySelector(".gender").style.color = "blue";
  }
  clone.querySelector(".img").src = student.image;

  studentContainer.appendChild(clone);
}

function removeClass() {
  detail.classList.remove("hide");
}

// singleview for each student

function showDetail(student) {
  detail.querySelector(".close").addEventListener("click", closeDetail);
  detail.querySelector("img").src = student.image;
  detail.querySelector(".name").textContent = `${student.firstName} ${student.middleName} ${student.lastName}`;
  detail.querySelector("[data-field=blood]").textContent = `🩸 Blood-Status: ${student.bloodstatus}`;
  detail.querySelector(".rank").textContent = `Rank: ${student.rank}`;
  // sets button colors depending on house
  if (student.house === "Slytherin") {
    detail.querySelector(".btn1").style.color = "#125111";
    detail.querySelector(".btn1").style.border = "4px solid #125111";
    detail.querySelector(".btn2").style.color = "#125111";
    detail.querySelector(".btn2").style.border = "4px solid #125111";
    detail.querySelector(".btn3").style.color = "#125111";
    detail.querySelector(".btn3").style.border = "4px solid #125111";
    detail.querySelector(".name").style.color = "#125111";
    detail.querySelector(".close").style.border = "4px solid #125111";
    detail.querySelector(".close").style.color = "#125111";
  } else if (student.house === "Gryffindor") {
    detail.querySelector(".btn1").style.color = "#9D1513";
    detail.querySelector(".btn1").style.border = "4px solid #9D1513";
    detail.querySelector(".btn2").style.color = "#9D1513";
    detail.querySelector(".btn2").style.border = "4px solid #9D1513";
    detail.querySelector(".btn3").style.color = "#9D1513";
    detail.querySelector(".btn3").style.border = "4px solid #9D1513";
    detail.querySelector(".name").style.color = "#9D1513";
    detail.querySelector(".close").style.border = "4px solid #9D1513";
    detail.querySelector(".close").style.color = "#9D1513";
  } else if (student.house === "Hufflepuff") {
    detail.querySelector(".btn1").style.color = "#D6A80F";
    detail.querySelector(".btn1").style.border = "4px solid #D6A80F";
    detail.querySelector(".btn2").style.color = "#D6A80F";
    detail.querySelector(".btn2").style.border = "4px solid #D6A80F";
    detail.querySelector(".btn3").style.color = "#D6A80F";
    detail.querySelector(".btn3").style.border = "4px solid #D6A80F";
    detail.querySelector(".name").style.color = "#D6A80F";
    detail.querySelector(".close").style.border = "4px solid #D6A80F";
    detail.querySelector(".close").style.color = "#D6A80F";
  } else if (student.house === "Ravenclaw") {
    detail.querySelector(".btn1").style.color = "#0793BA";
    detail.querySelector(".btn1").style.border = "4px solid #0793BA";
    detail.querySelector(".btn2").style.color = "#0793BA";
    detail.querySelector(".btn2").style.border = "4px solid #0793BA";
    detail.querySelector(".btn3").style.color = "#0793BA";
    detail.querySelector(".btn3").style.border = "4px solid #0793BA";
    detail.querySelector(".name").style.color = "#0793BA";
    detail.querySelector(".close").style.border = "4px solid #0793BA";
    detail.querySelector(".close").style.color = "#0793BA";
  }

  // add evenlisteners to buttons
  detail.querySelector(".expel").addEventListener("click", clickExpel);
  detail.querySelector(".inquisitorial").addEventListener("click", clickInquis);
  function closeDetail(event) {
    detail.classList.add("hide");
  }

  // expell a student
  function clickExpel(event) {
    expelStudent(student);
    addAnimation();

    // since Leanne's picture is my dog, try expelling her
    if (student.lastName === "Leanne") {
      hackTheSystem();
    }
  }

  //  make inquisitor
  function clickInquis(event) {
    inquisStudent(student);
    closeDetail();
  }

  //  make prefect
  function clickPrefect(event) {
    addPrefect();
    closeDetail();
  }
  // set eventlistener to button
  detail.querySelector(".prefect").dataset.prefect = student.prefect;

  detail.querySelector(".prefect").addEventListener("click", clickPrefect);
  // make prefect

  function addPrefect() {
    if (student.prefect === true) {
      student.prefect = false;
    } else {
      tryToMakeAPrefect(student);
    }
    buildList();
  }

  // check if the member can be a prefect

  function tryToMakeAPrefect(selectedStudent) {
    const prefects = allStudents.filter((student) => student.prefect);
    const numberOfPrefects = prefects.length;
    const other = prefects.filter((student) => student.house === selectedStudent.house).shift();

    // if there is another of the same type

    if (other !== undefined) {
      console.log(`there can be only one prefect of each type`);
      removeOther(other);
    } else if (numberOfPrefects >= 2) {
      console.log(`there can only be two prefects`);
      removeAorB(prefects[0], prefects[1]);
    } else {
      makePrefect(selectedStudent);
    }
    hackTheSystem function and additional hacking-features
    // removes the other
    function removeOther(other) {
      // ask the user to ignore or remove 'other'
      document.querySelector("#onlyonekind").classList.remove("hide");
      document.querySelector("#onlyonekind .closebutton").addEventListener("click", closeDialogue);
      document.querySelector("#onlyonekind [data-action=remove1]").addEventListener("click", clickRemoveOther);

      // if user ignores - do nothing
      function closeDialogue() {
        document.querySelector("#onlyonekind").classList.add("hide");
        document.querySelector("#onlyonekind .closebutton").removeEventListener("click", closeDialogue);
        document.querySelector("#onlyonekind [data-action=remove1]").removeEventListener("click", clickRemoveOther);
      }

      // show name on warning
      document.querySelector("#onlyonekind .student1").textContent = other.firstName + ` of house ${student.house}`;

      // if remove other:
      function clickRemoveOther() {
        removePrefect(other);
        makePrefect(selectedStudent);
        buildList();
        closeDialogue();
      }
    }

    // give the user an option to remove A or B
    function removeAorB(prefectA, prefectB) {
      //         // ask the user to ignore or remove

      document.querySelector("#onlytwo").classList.remove("hide");
      document.querySelector("#onlytwo .closebutton").addEventListener("click", closeDialogue);
      document.querySelector("#onlytwo [data-action=remove1]").addEventListener("click", clickRemoveA);
      document.querySelector("#onlytwo [data-action=remove2]").addEventListener("click", clickRemoveB);

      // show names on warnings

      document.querySelector("#onlytwo .student1").textContent = prefectA.name;
      document.querySelector("#onlytwo .student2").textContent = prefectB.name;
      // if user ignores - do nothing

      function closeDialogue() {
        document.querySelector("#onlytwo").classList.add("hide");
        document.querySelector("#onlytwo .closebutton").removeEventListener("click", closeDialogue);
        document.querySelector("#onlytwo [data-action=remove1]").removeEventListener("click", clickRemoveA);
        document.querySelector("#onlytwo [data-action=remove2]").removeEventListener("click", clickRemoveB);
      }
    }

    // if removeA
    function clickRemoveA() {
      removePrefect(prefectA);
      makePrefect(selectedStudent);
      buildList();
      closeDialogue();
    }
    // if removeB
    function clickRemoveB() {
      removePrefect(prefectB);
      makePrefect(selectedStudent);
      buildList();
      closeDialogue();
    }
    // remove a student already a prefect
    function removePrefect(prefectStudent) {
      prefectStudent.prefect = false;
      student.rank = "Student";
    }
    function makePrefect(student) {
      student.prefect = true;
      student.rank = "Prefect";
    }
  }
  // rebuild list
  buildList();
}

// expell a student
function expelStudent(student) {
  if (student.expelled === false) {
    allExpelled.push(student);
    allStudents.splice(allStudents.indexOf(student), 1);
    student.expelled = true;
    student.rank = "expelled";
    if (student.firstName === "Daniel") {
      student.expelled = false;
    }
  }
  // rebuild list
  buildList();
}

// add animation to expelled student and play sound
function addAnimation() {
  document.querySelector("#details").classList.add("dissapear");
  document.querySelector("#details").addEventListener("animationend", removeDissapear);
  if (student.lastName === "Leanne") {
  } else {
    document.querySelector("#typekey1").play();
  }
}

// remove animation
function removeDissapear() {
  document.querySelector("#details").classList.remove("dissapear");
  document.querySelector("#details").classList.add("hide");
}

// make a student inquisitor
function inquisStudent(student) {
  if (student.house === "Slytherin") {
    student.inquisitorial = true;
    student.rank = "Squadmember";
  } else if (student.bloodstatus === "pure") {
    student.inquisitorial = true;
    student.rank = "Squadmember";
  } else {
    student.inquisitorial = false;
    sorry();
  }
  // if system is hacked, remove all from inquisitorial status
  if (hasBeenHacked === true) {
    setTimeout(removeFromInquisitorial, 10000, student);
  }
  // rebuild list
  buildList();
}
function removeFromInquisitorial(student) {
  student.inquisitorial = false;
}

// warning if student is not pure blood or slytherin
function sorry() {
  document.querySelector("#nocando").classList.remove("hide");
  document.querySelector("#nocando .closebutton").addEventListener("click", closeDetail);
  function closeDetail() {
    document.querySelector("#nocando .closebutton").removeEventListener("click", closeDetail);
    document.querySelector("#nocando").classList.add("hide");
  }
}

// select filter
function selectFilter(event) {
  const filter = event.target.dataset.filter;
  console.log(`user selected ${filter}`);
  setFilter(filter);
}

// set the filter
function setFilter(filter) {
  settings.filterBy = filter;

  // rebuild list
  buildList();
}

// filterlist of house and gender
function filterList(filteredList) {
  if (settings.filterBy === "ravenclaw") {
    filteredList = allStudents.filter(isRaven);
  } else if (settings.filterBy === "hufflepuff") {
    filteredList = allStudents.filter(isHuffle);
  } else if (settings.filterBy === "slytherin") {
    filteredList = allStudents.filter(isSlyth);
  } else if (settings.filterBy === "gryffindor") {
    filteredList = allStudents.filter(isGryffin);
  } else if (settings.filterBy === "girls") {
    filteredList = allStudents.filter(isGirl);
  } else if (settings.filterBy === "boys") {
    filteredList = allStudents.filter(isBoy);
  }

  return filteredList;
}
// functions setting each house to a filter
function isSlyth(student) {
  return student.house === "Slytherin";
}

function isRaven(student) {
  return student.house === "Ravenclaw";
}

function isGryffin(student) {
  return student.house === "Gryffindor";
}

function isHuffle(student) {
  return student.house === "Hufflepuff";
}

function isGirl(student) {
  return student.gender === "girl";
}

function isBoy(student) {
  return student.gender === "boy";
}

// selects the sorting direction and what's sorted by
function selectSort(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  // find old sortyBy element
  const oldElement = document.querySelector(`[data-sort='${settings.sortBy}']`);
  oldElement.classList.remove("sortby");
  // indicate active sort direction

  event.target.classList.add("sortby");
  // toggle the direction

  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }
  console.log(`user selected ${sortBy} - ${sortDir}`);
  setSort(sortBy, sortDir);
}

// sets sort by sort list and direction
function sortList(sortedList) {
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    direction = 1;
  }
  sortedList = sortedList.sort(sortByProperty);
  // sort by property in global settings
  function sortByProperty(studentA, studentB) {
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }
  return sortedList;
}

// sets the sort and builds list
function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}

// function to capitalize string and trim it
function capitalization(str) {
  const trimmed = str.trim();
  const capHigh = trimmed.substring(0, 1).toUpperCase();
  const capLow = trimmed.substring(1).toLowerCase();
  const newName = capHigh + capLow;
  return newName;
}

// hackinb function
function hackTheSystem() {
  console.log("SYSTEM HACKED");
  injectSelf();
  hasBeenHacked = true;

  document.querySelector("#typekey1").pause();
  document.querySelector("#typekey2").play();
}

// put self in list, with special abilities
function injectSelf() {
  const mySelf = Object.create(Student);
  mySelf.firstName = "Daniel";
  mySelf.lastName = "Dalby";
  mySelf.image = `images/myself.png`;
  mySelf.gender = "boy";
  mySelf.prefect = true;
  mySelf.inquisitorial = true;
  mySelf.expelled = false;
  mySelf.house = "All of them";
  mySelf.rank = "Hacker";
  allStudents.push(mySelf);

  // shuffles the bloodstatus to be wrong
  shuffleBlood();

  // rebuild list
  buildList();
}

// make site non hackable after first time
function cantHack() {
  console.log("wah wah");
}

// shuffle blood to be wrong
function shuffleBlood() {
  allStudents.forEach((student) => {
    if (families.half.includes(student.lastName)) {
      student.bloodstatus = "muggle";
    } else if (families.pure.includes(student.lastName) && !families.half.includes(student.lastName)) {
      student.bloodstatus = "half";
    } else {
      student.bloodstatus = "pure";
    }
  });
  // rebuild list
  buildList();
}
