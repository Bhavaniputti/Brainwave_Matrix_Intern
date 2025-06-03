
  // Shared learning paths data (used on both pages)
  const learningPaths = {
    "1": {
      yearText: "1st Year - Programming Fundamentals",
      semesters: [
        {
          name: "Semester 1",
          topics: ["Python Basics", "Java Basics", "Basic Data Structures"],
        },
        {
          name: "Semester 2",
          topics: ["Advanced Java", "Object-Oriented Programming", "Problem Solving"],
        },
      ],
    },
    "2": {
      yearText: "2nd Year - Web Development & Databases",
      semesters: [
        {
          name: "Semester 1",
          topics: ["HTML & CSS", "JavaScript Basics", "Relational Databases"],
        },
        {
          name: "Semester 2",
          topics: ["Advanced JavaScript", "NoSQL Databases", "Web Frameworks"],
        },
      ],
    },
    "3": {
      yearText: "3rd Year - Specialization",
      semesters: [
        {
          name: "Semester 1",
          topics: ["Machine Learning Intro", "Full Stack Development", "Data Science"],
        },
        {
          name: "Semester 2",
          topics: ["Advanced Topics", "Internship Preparation"],
        },
      ],
    },
    "4": {
      yearText: "4th Year - Projects & Job Preparation",
      semesters: [
        {
          name: "Semester 1",
          topics: ["Capstone Project", "Interview Skills"],
        },
        {
          name: "Semester 2",
          topics: ["Internship/Job Hunt", "Advanced Projects"],
        },
      ],
    },
  };

  // Registration function
  async function register() {
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }

      const data = await response.json();
      alert(data.message);

      // Redirect to career_path.html after successful registration
      window.location.href = "career_path.html";
    } catch (error) {
      alert("Error: " + error.message);
    }
  }

  // Login function
  async function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();
      console.log("Login Success:", data);

      alert(data.message);
      localStorage.setItem("userEmail", email);

      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      // Redirect to career_path.html after successful login
      window.location.href = "career_path.html";
    } catch (error) {
      alert("Error: " + error.message);
    }
  }

  // Logout function
  function logout() {
    alert("Logging out...");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("authToken");
    window.location.href = "index.html";
  }

  document.addEventListener("DOMContentLoaded", () => {
    const yearForm = document.getElementById("yearForm");
    const learningContent = document.getElementById("learningContent");
    const careerContainer = document.getElementById("careerContainer");

    // Dashboard form logic (if exists)
    if (yearForm) {
      yearForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const year = document.getElementById("year").value;

        if (learningPaths[year]) {
          window.location.href = `learningcontent.html?year=${year}`;
        } else {
          alert("Please select a valid year.");
        }
      });
    }

    // Learning content page logic: show only selected semester topics
    if (learningContent) {
      const params = new URLSearchParams(window.location.search);
      const year = params.get("year");
      const sem = params.get("sem");  // get semester param

      if (year && learningPaths[year]) {
        const path = learningPaths[year];
        let html = `<h2>${path.yearText}</h2>`;

        if (sem) {
          // If semester param exists, show only that semester
          const semIndex = parseInt(sem) - 1;
          if (semIndex >= 0 && semIndex < path.semesters.length) {
            const semester = path.semesters[semIndex];
            html += `<h3>${semester.name}</h3><ul>`;
            semester.topics.forEach(topic => {
              html += `<li>✅ ${topic}</li>`;
            });
            html += `</ul>`;
          } else {
            html += `<p class="text-danger">Invalid semester selected.</p>`;
          }
        } else {
          // If no semester specified, show all semesters
          path.semesters.forEach((semester) => {
            html += `<div><h3>${semester.name}</h3><ul>`;
            semester.topics.forEach(topic => {
              html += `<li>✅ ${topic}</li>`;
            });
            html += `</ul></div>`;
          });
        }

        learningContent.innerHTML = html;
        learningContent.style.display = "block";
      } else {
        learningContent.innerHTML = `<p class="text-danger">Invalid year selected.</p>`;
      }
    }

    // Career Path dynamic rendering
    if (careerContainer) {
      // Clear container first if needed
      careerContainer.innerHTML = "";

      for (let year = 1; year <= 4; year++) {
        const yearCard = document.createElement("div");
        yearCard.className = "year-card";
        yearCard.innerHTML = `<h3>Year ${year}</h3>`;

        for (let sem = 1; sem <= 2; sem++) {
          const semesterCard = document.createElement("div");
          semesterCard.className = "module-card";
          semesterCard.innerHTML = `
            <div><i class="bi bi-book module-icon"></i> Semester ${sem}</div>
            <a href="learningcontent.html?year=${year}&sem=${sem}" class="btn-continue">Continue</a>
          `;
          yearCard.appendChild(semesterCard);
        }

        careerContainer.appendChild(yearCard);
      }
    }

    // Logout button handler
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        logout();
      });
    }

    // Back button handler (if you have a button with id backBtn)
    const backBtn = document.getElementById("backBtn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        window.location.href = "career_path.html";
      });
    }
  });
