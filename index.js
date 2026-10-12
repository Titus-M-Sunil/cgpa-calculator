(() => {
  'use strict';

  // Grade labels and their corresponding grade points
  const GRADE_OPTIONS = [
    { label: 'O · 10', value: 10 },
    { label: 'A+ · 9', value: 9 },
    { label: 'A · 8', value: 8 },
    { label: 'B+ · 7', value: 7 },
    { label: 'B · 6', value: 6 },
    { label: 'C · 5', value: 5 },
    { label: 'D · 4', value: 4 },
    { label: 'F · 0', value: 0 }
  ];

  // Short helper for selecting HTML elements
  const $ = (selector) => document.querySelector(selector);

  const semestersContainer = $('#semesters-container');
  const toast = $('#toast');

  let nextSemesterId = 2;
  let nextSubjectId = 3;
  let toastTimer;

  // Initial semester with two subjects
  let semesters = [
    {
      id: 1,
      subjects: [
        { id: 1, name: '', grade: 10, credits: '' },
        { id: 2, name: '', grade: 9, credits: '' }
      ]
    }
  ];

  // Format numbers to two decimal places
  const formatNumber = (value) =>
    Number.isFinite(value) ? value.toFixed(2) : '0.00';

  // Calculate statistics for a semester
  const getSemesterStats = (semester) => {
    let creditPoints = 0;
    let credits = 0;
    let validSubjects = 0;

    semester.subjects.forEach((subject) => {
      const courseCredits = Number(subject.credits);

      // Count only valid, entered credits
      if (
        subject.credits !== '' &&
        Number.isFinite(courseCredits) &&
        courseCredits > 0 &&
        courseCredits <= 10
      ) {
        creditPoints += Number(subject.grade) * courseCredits;
        credits += courseCredits;
        validSubjects++;
      }
    });

    return {
      creditPoints,
      credits,
      validSubjects,
      sgpa: credits ? creditPoints / credits : null
    };
  };

  // Calculate total credit points, credits and subjects
  const getOverallStats = () =>
    semesters.reduce(
      (all, semester) => {
        const stats = getSemesterStats(semester);

        all.creditPoints += stats.creditPoints;
        all.credits += stats.credits;
        all.subjects += stats.validSubjects;

        return all;
      },
      {
        creditPoints: 0,
        credits: 0,
        subjects: 0
      }
    );

  // Display temporary notification messages
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  // Create an individual subject input row
  function createSubjectRow(semester, subject, subjectIndex) {
    const row = document.createElement('div');

    row.className = 'subject-row';
    row.dataset.subjectId = subject.id;

    // Subject name field
    const nameField = document.createElement('div');
    nameField.className = 'field subject-name-field';

    const nameLabel = document.createElement('label');
    nameLabel.htmlFor = `subject-name-${subject.id}`;
    nameLabel.textContent =
      subjectIndex === 0 ? 'SUBJECT NAME' : 'SUBJECT';

    const nameInput = document.createElement('input');

    nameInput.id = `subject-name-${subject.id}`;
    nameInput.type = 'text';
    nameInput.maxLength = 60;
    nameInput.placeholder = `Subject ${subjectIndex + 1}`;
    nameInput.value = subject.name;
    nameInput.dataset.field = 'name';

    nameInput.setAttribute(
      'aria-label',
      `Semester ${semester.id}, subject ${subjectIndex + 1} name`
    );

    nameField.append(nameLabel, nameInput);

    // Grade selection field
    const gradeField = document.createElement('div');
    gradeField.className = 'field';

    const gradeLabel = document.createElement('label');
    gradeLabel.htmlFor = `grade-${subject.id}`;
    gradeLabel.textContent = 'GRADE';

    const gradeSelect = document.createElement('select');

    gradeSelect.id = `grade-${subject.id}`;
    gradeSelect.dataset.field = 'grade';

    gradeSelect.setAttribute(
      'aria-label',
      `Grade for ${subject.name || `subject ${subjectIndex + 1}`}`
    );

    GRADE_OPTIONS.forEach((grade) => {
      const option = document.createElement('option');

      option.value = String(grade.value);
      option.textContent = grade.label;
      option.selected = Number(subject.grade) === grade.value;

      gradeSelect.append(option);
    });

    gradeField.append(gradeLabel, gradeSelect);

    // Course credits field
    const creditsField = document.createElement('div');
    creditsField.className = 'field';

    const creditsLabel = document.createElement('label');
    creditsLabel.htmlFor = `credits-${subject.id}`;
    creditsLabel.textContent = 'CREDITS';

    const creditsInput = document.createElement('input');

    creditsInput.id = `credits-${subject.id}`;
    creditsInput.type = 'number';
    creditsInput.min = '0.5';
    creditsInput.max = '10';
    creditsInput.step = '0.5';
    creditsInput.placeholder = 'e.g. 4';
    creditsInput.value = subject.credits;
    creditsInput.dataset.field = 'credits';
    creditsInput.inputMode = 'decimal';

    creditsInput.setAttribute(
      'aria-label',
      `Credits for ${subject.name || `subject ${subjectIndex + 1}`}`
    );

    creditsField.append(creditsLabel, creditsInput);

    // Remove subject button
    const removeButton = document.createElement('button');

    removeButton.className = 'remove-subject';
    removeButton.type = 'button';
    removeButton.textContent = '×';
    removeButton.title = 'Remove subject';

    removeButton.setAttribute(
      'aria-label',
      `Remove subject ${subjectIndex + 1}`
    );

    removeButton.addEventListener('click', () => {
      if (semester.subjects.length === 1) {
        showToast('Each semester needs at least one subject.');
        return;
      }

      semester.subjects = semester.subjects.filter(
        (item) => item.id !== subject.id
      );

      render();
    });

    // Update the subject data whenever an input changes
    [nameInput, gradeSelect, creditsInput].forEach((control) => {
      control.addEventListener('input', () => {
        const current = semester.subjects.find(
          (item) => item.id === subject.id
        );

        if (!current) return;

        if (control.dataset.field === 'name') {
          current.name = control.value;
        }

        if (control.dataset.field === 'grade') {
          current.grade = Number(control.value);
        }

        if (control.dataset.field === 'credits') {
          current.credits = control.value;

          const value = Number(control.value);

          control.setCustomValidity(
            control.value !== '' &&
              (!Number.isFinite(value) ||
                value < 0.5 ||
                value > 10)
              ? 'Enter credits from 0.5 to 10.'
              : ''
          );
        }

        updateResults();
      });
    });

    row.append(
      nameField,
      gradeField,
      creditsField,
      removeButton
    );

    return row;
  }

  // Create a semester card containing its subjects
  function createSemesterCard(semester, semesterIndex) {
    const stats = getSemesterStats(semester);

    const card = document.createElement('article');
    card.className = 'semester-card';
    card.dataset.semesterId = semester.id;

    // Semester header
    const header = document.createElement('div');
    header.className = 'semester-head';

    const titleWrap = document.createElement('div');
    titleWrap.className = 'semester-title-wrap';

    const number = document.createElement('span');
    number.className = 'semester-number';
    number.textContent = String(semesterIndex + 1).padStart(2, '0');

    const titleGroup = document.createElement('div');

    const title = document.createElement('h3');
    title.className = 'semester-title';
    title.textContent = `Semester ${semesterIndex + 1}`;

    const meta = document.createElement('div');
    meta.className = 'semester-meta';

    meta.textContent =
      `${semester.subjects.length} subject` +
      `${semester.subjects.length === 1 ? '' : 's'} · ` +
      `${formatNumber(stats.credits)} credits`;

    titleGroup.append(title, meta);
    titleWrap.append(number, titleGroup);

    const sgpa = document.createElement('span');
    sgpa.className = 'semester-sgpa';

    sgpa.textContent =
      stats.sgpa === null ? '—' : formatNumber(stats.sgpa);

    sgpa.title = 'Current semester SGPA';

    header.append(titleWrap, sgpa);

    // Subject input rows
    const subjectList = document.createElement('div');
    subjectList.className = 'subject-list';

    semester.subjects.forEach((subject, index) => {
      subjectList.append(
        createSubjectRow(semester, subject, index)
      );
    });

    // Semester footer buttons
    const footer = document.createElement('div');
    footer.className = 'semester-footer';

    const addSubject = document.createElement('button');
    addSubject.className = 'add-subject';
    addSubject.type = 'button';
    addSubject.textContent = '+ Add subject';

    addSubject.addEventListener('click', () => {
      semester.subjects.push({
        id: nextSubjectId++,
        name: '',
        grade: 10,
        credits: ''
      });

      render();

      const cardEl = semestersContainer.querySelector(
        `[data-semester-id="${semester.id}"]`
      );

      const lastInput = cardEl?.querySelector(
        '.subject-row:last-child input'
      );

      lastInput?.focus();
    });

    const removeSemester = document.createElement('button');

    removeSemester.className = 'remove-semester';
    removeSemester.type = 'button';
    removeSemester.textContent = 'Remove semester';

    removeSemester.disabled = semesters.length === 1;

    removeSemester.addEventListener('click', () => {
      if (semesters.length === 1) return;

      semesters = semesters.filter(
        (item) => item.id !== semester.id
      );

      render();
      showToast('Semester removed.');
    });

    footer.append(addSubject, removeSemester);

    card.append(header, subjectList, footer);

    return card;
  }

  // Update CGPA, statistics, progress ring and semester results
  function updateResults() {
    const overall = getOverallStats();

    const cgpa = overall.credits
      ? overall.creditPoints / overall.credits
      : 0;

    $('#cgpa-value').textContent = formatNumber(cgpa);

    $('#total-credits').textContent = formatNumber(
      overall.credits
    ).replace(/\.00$/, '');

    $('#total-subjects').textContent = String(
      overall.subjects
    );

    $('#semester-count').textContent =
      `${semesters.length} semester` +
      `${semesters.length === 1 ? '' : 's'}`;

    // Update the circular CGPA progress indicator
    $('#score-ring').style.setProperty(
      '--progress',
      `${Math.max(0, Math.min(10, cgpa)) * 36}deg`
    );

    // Display a message based on CGPA
    const message = $('#score-message');
    const subtitle = $('#score-subtitle');

    if (!overall.credits) {
      message.textContent = 'A fresh start.';
      subtitle.textContent = 'Add credits to see your progress.';
    } else if (cgpa >= 9) {
      message.textContent = 'Outstanding work!';
      subtitle.textContent =
        'You are building a brilliant academic record.';
    } else if (cgpa >= 8) {
      message.textContent = 'You’re doing great.';
      subtitle.textContent = 'Keep your momentum going.';
    } else if (cgpa >= 6) {
      message.textContent = 'Progress in motion.';
      subtitle.textContent =
        'Every semester is a new opportunity.';
    } else {
      message.textContent = 'Keep moving forward.';
      subtitle.textContent =
        'Use this snapshot to plan your next step.';
    }

    // Refresh the semester-by-semester results list
    const resultList = $('#sem-results');
    resultList.replaceChildren();

    let anyResults = false;

    semesters.forEach((semester, index) => {
      const stats = getSemesterStats(semester);

      if (stats.sgpa === null) return;

      anyResults = true;

      const item = document.createElement('div');
      item.className = 'semester-result';

      const details = document.createElement('div');

      const title = document.createElement('strong');
      title.textContent = `Semester ${index + 1}`;

      const meta = document.createElement('small');
      meta.textContent =
        `${formatNumber(stats.credits)} credits counted`;

      details.append(title, meta);

      const value = document.createElement('span');
      value.className = 'result-value';
      value.textContent = formatNumber(stats.sgpa);

      item.append(details, value);
      resultList.append(item);
    });

    // Display a message if no semester has valid credits
    if (!anyResults) {
      const empty = document.createElement('div');

      empty.className = 'empty-state';
      empty.textContent =
        'Enter credits to see semester results.';

      resultList.append(empty);
    }
  }

  // Render all semester cards and update the dashboard
  function render() {
    semestersContainer.replaceChildren();

    semesters.forEach((semester, index) => {
      semestersContainer.append(
        createSemesterCard(semester, index)
      );
    });

    updateResults();
  }

  // Add a new semester
  $('#add-semester-btn').addEventListener('click', () => {
    semesters.push({
      id: nextSemesterId++,
      subjects: [
        {
          id: nextSubjectId++,
          name: '',
          grade: 10,
          credits: ''
        },
        {
          id: nextSubjectId++,
          name: '',
          grade: 9,
          credits: ''
        }
      ]
    });

    render();

    semestersContainer.lastElementChild?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });

    showToast('New semester added.');
  });

  // Toggle between light and dark themes
  $('#theme-btn').addEventListener('click', () => {
    document.body.classList.toggle('light-theme');

    const isLight =
      document.body.classList.contains('light-theme');

    $('#theme-btn').textContent = isLight ? '☾' : '☼';

    $('#theme-btn').setAttribute(
      'aria-label',
      isLight
        ? 'Switch to dark theme'
        : 'Switch to light theme'
    );
  });

  // Ask for confirmation before resetting
  const resetDialog = $('#reset-dialog');

  $('#reset-btn').addEventListener('click', () => {
    if (typeof resetDialog.showModal === 'function') {
      resetDialog.showModal();
    } else if (
      window.confirm('Reset all semesters and grades?')
    ) {
      resetAll();
    }
  });

  $('#confirm-reset-btn').addEventListener('click', (event) => {
    event.preventDefault();

    resetDialog.close();
    resetAll();
  });

  // Restore the calculator to its initial state
  function resetAll() {
    nextSemesterId = 2;
    nextSubjectId = 3;

    semesters = [
      {
        id: 1,
        subjects: [
          { id: 1, name: '', grade: 10, credits: '' },
          { id: 2, name: '', grade: 9, credits: '' }
        ]
      }
    ];

    render();

    showToast('Calculator reset. Ready for a fresh start.');
  }

  // Initialize the application
  render();
})();