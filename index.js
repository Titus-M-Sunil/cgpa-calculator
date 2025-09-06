let sum = 0;
let index = 1;
let titleIndex = 1;
let gradeValue = 0
let creditValue = 0
let numerator = 0
let denominator = 0
const container = document.getElementById("new-input-container")

window.onload = function () {
  createNewInputFields()
  createNewInputFields()
}

const subjectBtn = document.getElementById("subject-btn")
subjectBtn.addEventListener("click", createNewInputFields.bind())

function createNewInputFields() {
  // New subject title
  const newSubject = document.createElement("p");
  newSubject.id = "subject-el-" + index
  newSubject.className = "subjects"
  newSubject.innerText = "Subject " + titleIndex
  container.appendChild(newSubject)

  // Select-element for grades
  let newLabel = document.createElement("label")
  newLabel.textContent = "Grade: "

  const newSelect = document.createElement("select")
  newSelect.id = "grade-el-" + index
  newSelect.className = "grades"
  newLabel.htmlFor = "grade-el-" + index
  container.appendChild(newLabel)
  container.appendChild(newSelect)

  // Options-for-Select-element of grades from O to C (10 to 5)
  let gradeArray = ["O", "A+", "A", "B+", "B", "C"]
  let gradeValues = [10, 9, 8, 7, 6, 5]
  let gradesLength = gradeArray.length
  for (let i=0; i<gradesLength; i++) {
    newOption = document.createElement("option")
    newOption.value = gradeValues[i]
    newOption.text = gradeArray[i]
    newSelect.appendChild(newOption)
  }

  // Input box for credits from 1-10
  newLabel = document.createElement("label")
  newLabel.textContent = "Course Credits: "

  const newInput = document.createElement("input")
  newInput.id = "credit-el-" + index
  newInput.className = "credits"
  newLabel.htmlFor = "credit-el-" + index
  newInput.setAttribute("type", "number")
  newInput.setAttribute("min", "0")
  newInput.setAttribute("max", "10")
  newInput.setAttribute("step", "0.5")
  container.appendChild(newLabel)
  container.appendChild(newInput)

  const lineBreak = document.createElement("br");
  container.appendChild(lineBreak)

  titleIndex++
  index++
}

// Add new semester
let semIndex = 2
const semesterBtn = document.getElementById("semester-btn")
semesterBtn.addEventListener("click", function () {
  calculateSGPA()
  const newSem = document.createElement("h2")
  newSem.id = "semester-el-" + semIndex
  newSem.className = "semesters"
  newSem.textContent = "Semester " + semIndex
  container.appendChild(newSem)

  semIndex++
  titleIndex = 1
  
  createNewInputFields()
  createNewInputFields()
})

const cgpaEl = document.getElementById("cgpa-el")
const cgpaBtn = document.getElementById("cgpa-btn")
const sgpaEl = document.getElementById("sgpa-el")
const buttonContainer = document.getElementById("button-container")

// Arrays for storing previous sem total credit points(numeratorList) and total course credits(denominatorList)
let sgpaList = []
let numeratorList = []
let denominatorList = []
let initial = 1

const sgpaBtn = document.getElementById("sgpa-btn")
sgpaBtn.addEventListener("click", calculateSGPA.bind())

function calculateSGPA () {
  for(i=initial; i<index; i++) {
    creditValue = parseFloat(document.getElementById("credit-el-" + i).value)
    gradeValue = parseInt(document.getElementById("grade-el-" + i).value)
    numerator += gradeValue * creditValue;
    denominator += creditValue;
  }
  let calculatedSGPA = numerator / denominator
  numeratorList.push(numerator)
  denominatorList.push(denominator)
  sgpaList.push(calculatedSGPA)

  const newParaSGPA = document.createElement("p")
  newParaSGPA.textContent = "SGPA: " + calculatedSGPA.toFixed(2)
  container.appendChild(newParaSGPA)

  initial = index
  numerator = denominator = 0
}

let cgpaSum = 0
cgpaBtn.addEventListener("click", function () {
  calculateSGPA ()
  for(let i=0; i<sgpaList.length; i++) {
    numerator += numeratorList[i]
    denominator += denominatorList[i]
  }
  const totalCGPA = numerator / denominator

  const newParaCGPA = document.createElement("p")
  newParaCGPA.textContent = "CGPA: " + totalCGPA.toFixed(2)
  container.appendChild(newParaCGPA)

  numerator = denominator = 0
})
