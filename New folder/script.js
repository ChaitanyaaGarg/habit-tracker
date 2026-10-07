const STORAGE_KEY = "habitTrackerData";

let habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const habitForm = document.getElementById("habitForm");
const habitInput = document.getElementById("habitInput");
const habitList = document.getElementById("habitList");
const emptyState = document.getElementById("emptyState");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const completedText = document.getElementById("completedText");
const bestStreakText = document.getElementById("bestStreakText");
const habitCount = document.getElementById("habitCount");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const today = document.getElementById("today");

const todayKey = getDateKey(new Date());

today.textContent = new Date().toLocaleDateString("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function saveHabits() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function getStreak(habit) {
  let streak = 0;
  const date = new Date();

  while (true) {
    const key = getDateKey(date);

    if (!habit.completedDates || !habit.completedDates.includes(key)) {
      break;
    }

    streak++;
    date.setDate(date.getDate() - 1);
  }

  return streak;
}

function getBestStreak(habit) {
  if (!habit.completedDates || habit.completedDates.length === 0) {
    return 0;
  }

  const dates = [...new Set(habit.completedDates)].sort();
  let best = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const previous = new Date(`${dates[i - 1]}T00:00:00`);
    const currentDate = new Date(`${dates[i]}T00:00:00`);
    const difference = Math.round(
      (currentDate - previous) / (1000 * 60 * 60 * 24)
    );

    if (difference === 1) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
}

function toggleHabit(id) {
  const habit = habits.find((item) => item.id === id);
  if (!habit) return;

  if (!habit.completedDates) {
    habit.completedDates = [];
  }

  if (habit.completedDates.includes(todayKey)) {
    habit.completedDates = habit.completedDates.filter(
      (date) => date !== todayKey
    );
  } else {
    habit.completedDates.push(todayKey);
  }

  saveHabits();
  renderHabits();
}

function deleteHabit(id) {
  habits = habits.filter((habit) => habit.id !== id);
  saveHabits();
  renderHabits();
}

function addHabit(name) {
  habits.push({
    id: Date.now(),
    name,
    completedDates: []
  });

  saveHabits();
  renderHabits();
}

function updateStats() {
  const total = habits.length;
  const completed = habits.filter((habit) =>
    habit.completedDates?.includes(todayKey)
  ).length;

  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
  const bestStreak = habits.reduce(
    (best, habit) => Math.max(best, getBestStreak(habit)),
    0
  );

  progressText.textContent = `${progress}%`;
  progressFill.style.width = `${progress}%`;
  completedText.textContent = `${completed} / ${total}`;
  bestStreakText.textContent = `${bestStreak} day${bestStreak === 1 ? "" : "s"}`;
  habitCount.textContent = `${total} habit${total === 1 ? "" : "s"}`;
}

function renderHabits() {
  habitList.innerHTML = "";

  emptyState.style.display = habits.length === 0 ? "block" : "none";

  habits.forEach((habit) => {
    const isCompleted = habit.completedDates?.includes(todayKey);
    const streak = getStreak(habit);

    const item = document.createElement("div");
    item.className = `habit-item ${isCompleted ? "completed" : ""}`;

    item.innerHTML = `
      <button class="check-btn" aria-label="Toggle ${escapeHtml(habit.name)}">
        <span class="check-mark">✓</span>
      </button>
      <span class="habit-name">${escapeHtml(habit.name)}</span>
      <span class="streak">🔥 ${streak} day${streak === 1 ? "" : "s"}</span>
      <button class="delete-btn" aria-label="Delete ${escapeHtml(habit.name)}">✕</button>
    `;

    item.querySelector(".check-btn").addEventListener("click", () => {
      toggleHabit(habit.id);
    });

    item.querySelector(".delete-btn").addEventListener("click", () => {
      deleteHabit(habit.id);
    });

    habitList.appendChild(item);
  });

  updateStats();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

habitForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = habitInput.value.trim();

  if (name === "") return;

  addHabit(name);
  habitInput.value = "";
  habitInput.focus();
});

clearCompletedBtn.addEventListener("click", () => {
  habits = habits.filter(
    (habit) => !habit.completedDates?.includes(todayKey)
  );

  saveHabits();
  renderHabits();
});

renderHabits();
