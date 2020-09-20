"use strict";

window.addEventListener("DOMContentLoaded", start);

let allStudents = [];
const url = "https://petlatkea.dk/2020/hogwarts/students.json";

// The prototype for all students:
const Student = {
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "",
  image: "",
  house: "",
  prefect: false,
  inquisitorial: "",
  expelled: "",
};

const settings = {
  filter: "all",
  sortBy: "name",
  sortDir: "asc",
};
function start() {
  console.log("ready");
  //   registerButtons();
  loadJSON();

  // TODO: Add event-listeners to filter and sort buttons
}

// add eventlisteners to buttons

// function registerButtons() {
//   document.querySelectorAll("[data-action='filter']").forEach((button) => button.addEventListener("click", selectFilter));
//   document.querySelectorAll("[data-action='sort']").forEach((field) => field.addEventListener("click", selectSort));
// }

async function loadJSON() {
  const response = await fetch(url);
  const jsonData = await response.json();

  // when loaded, prepare data objects
  prepareObjects(jsonData);
}

function prepareObjects(jsonData) {
  allStudents = jsonData.map(prepareObject);

  buildList();
}

function prepareObject(jsonObject) {
  const student = Object.create(Student);

  const texts = jsonObject.fullname.split(" ");
  student.firstName = texts[0];
  student.middleName = texts[2];
  student.lastName = texts[3];

  return student;
}

function buildList() {
  const currentList = filterList(allStudents); // TODO: Add filter and sort on this list, before displaying
  const sortedList = sortList(currentList);
  displayList(sortedList);
}

function displayList(students) {
  // clear the list
  document.querySelector("#list").innerHTML = "";

  // build a new list
  students.forEach(displayStudent);
}

function displayStudent(student) {
  // create clone
  let studentContainer = document.querySelector("#list");
  let studentTemplate = document.querySelector("#student");
  const clone = studentTemplate.content.cloneNode(true);

  // set clone data

  // TODO: Display winner

  // TODO: Display star

  clone.querySelector("[data-field=name]").textContent = student.name;
  //   clone.querySelector("[data-field=desc]").textContent = animal.desc;
  //   clone.querySelector("[data-field=type]").textContent = animal.type;
  //   clone.querySelector("[data-field=age]").textContent = animal.age;

  // TODO: Add event listeners for star and winner

  //   if (animal.star === true) {
  //     clone.querySelector("[data-field=star]").textContent = "⭐";
  //   } else {
  //     clone.querySelector("[data-field=star]").textContent = "✩";
  //   }

  //   clone.querySelector("[data-field=star]").addEventListener("click", clickStar);

  //   function clickStar() {
  //     if (animal.star === true) {
  //       animal.star = false;
  //     } else {
  //       animal.star = true;
  //     }
  //     buildList();
  //   }
  // append clone to list
  studentContainer.appendChild(clone);
}
function selectFilter(event) {
  const filter = event.target.dataset.filter;
  console.log(`user selected ${filter}`);
  setFilter(filter);
}
function setFilter(filter) {
  settings.filterBy = filter;
  buildList();
}

function filterList(filteredList) {
  if (settings.filterBy === "ravenclaw") {
    // filter by cats
    filteredList = allStudents.filter(isRaven);
  } else if (settings.filterBy === "huffle") {
    // filter by dogs
    filteredList = allstudents.filter(isHuffle);
  } else if (settings.filterBy === "slytherin") {
    filteredList = allstudents.filter(isSlyth);
  } else if (settings.filterBy === "gryffindor") {
    filteredList = allstudents.filter(isGryffin);
  }

  return filteredList;
}

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
function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}
function sortList(sortedList) {
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    direction = 1;
  }
  sortedList = sortedList.sort(sortByProperty);

  function sortByProperty(studentA, studentB) {
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }
  return sortedList;
}
