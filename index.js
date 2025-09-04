let sum = 0;
let index = 1;
let cgpaEl = document.getElementById("cgpa-el")
let gradeValue = 0
let creditValue = 0
let numerator = 0
let denominator = 0
const container = document.getElementById("new-input-container")

window.onload = function () {
  createNewInputFields()
  createNewInputFields()
}

function createNewInputFields() {
  // New subject title
  const newSubject = document.createElement("p");
  newSubject.id = "subject-el-" + index
  newSubject.className = "subjects"
  newSubject.innerText = "Subject " + index
  container.appendChild(newSubject)

  // Select-element for grades
  let newLabel = document.createElement("label")
  newLabel.textContent = "Grade: "

  const newSelect = document.createElement("select")
  newSelect.id = "grade-el-" + index
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
  newLabel.textContent = "Credit: "

  const newInput = document.createElement("input")
  newInput.id = "credit-el-" + index
  newLabel.htmlFor = "credit-el-" + index
  newInput.setAttribute("type", "number")
  newInput.setAttribute("min", "0")
  newInput.setAttribute("max", "10")
  newInput.setAttribute("step", "0.5")
  container.appendChild(newLabel)
  container.appendChild(newInput)

  const lineBreak = document.createElement("br");
  container.appendChild(lineBreak)

  index++
}

// Add new semester
let semIndex = 2
const semesterBtn = document.getElementById("semester-btn")
semesterBtn.addEventListener("click", function () {
  const newSem = document.createElement("h2")
  newSem.id = "semester-el-" + semIndex
  newSem.className = "semesters"
  newSem.textContent = "Semester " + semIndex
  container.appendChild(newSem)
  semIndex++
  index = 1
  
  createNewInputFields()
  createNewInputFields()
})

function calculateCGPA() {
  for(let i=1; i<index; i++) {
    creditValue = parseFloat(document.getElementById("credit-el-" + i).value)
    gradeValue = parseInt(document.getElementById("grade-el-" + i).value)
    console.log(creditValue)
    console.log(gradeValue)
    numerator += gradeValue * creditValue;
    console.log(numerator)
    denominator += creditValue;
    console.log(denominator)
  }
  let calculatedCGPA = numerator / denominator
  console.log(calculatedCGPA)
  cgpaEl.textContent = "CGPA: " + calculatedCGPA
}