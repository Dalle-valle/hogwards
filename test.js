"use strict";
window.addEventListener("DOMContentLoaded", start);

let allStudents = [];
const url = "https://petlatkea.dk/2020/hogwarts/students.json";
const Students = {
  firstName: "",
  middleName: "",
  lastName: "",
  nickName: "",
  photo: "",
  house: "",
};

function start() {
  console.log("we are ready");
  getData();
}

async function getData() {
  const response = await fetch(url);
  allStudents = await response.json();
  showData();
}

function showData() {
  const container = document.querySelector("#student_container");
  container.innerHTML = "";
  const studentTemplate = document.querySelector("template");
  allStudents.forEach((student) => {
    const cleanedData = Object.create(Students);
    const [firstName, lastName, middleName, nickName, photo, house] = student.fullname.split(" ");
    cleanedData.firstName = firstName;
    cleanedData.middleName = middleName;
    cleanedData.lastName = lastName;
    cleanedData.nickName = nickName;
    cleanedData.photo = photo;
    cleanedData.house = house;

    // Trim name and set first character to uppercase
    const trimNameUpper = firstName.trim();
    const capHigh = trimNameUpper.substring(0, 1).toUpperCase();
    const capLow = trimNameUpper.substring(1).toLowerCase();
    const firstSpace = trimNameUpper.indexOf(" ");
    const wholeFirst = trimNameUpper.substring(0, firstSpace);
    cleanedData.firstName = wholeFirst + capHigh + capLow;

    // find middle name
    const findMiddle = student.fullname.substring(cleanedData.firstName.length + 1, student.fullname.lastIndexOf(" "));
    const middleCapHigh = findMiddle.substring(0, 1).toUpperCase();
    const middleCapLow = findMiddle.substring(1).toLowerCase();

    cleanedData.middleName = middleCapHigh + middleCapLow;

    // Find last name - Seems problematic

    const findLast = student.fullname.substring(student.fullname.lastIndexOf(" ") + 1);

    const lastHigh = findLast.substring(0, 1).toUpperCase();
    const lastLow = findLast.substring(1).toLowerCase();
    cleanedData.lastName = lastHigh + lastLow;

    // find house
    const trimHouse = student.house.trim();
    const houseHigh = trimHouse.substring(0, 1).toUpperCase();
    const houseLow = trimHouse.substring(1).toLowerCase();
    cleanedData.house = houseHigh + houseLow;

    // find image - Will get back to it if i don't drop out before

    allStudents.push(cleanedData);
    console.table(cleanedData);

    let clone = studentTemplate.cloneNode(true).content;
    clone.querySelector(".name").textContent = cleanedData.firstName;
    // clone.querySelector(".middlename").textContent = cleanedData.middleName;
    // clone.querySelector(".lastname").textContent = cleanedData.lastName;

    container.appendChild(clone);
  });
}

//
