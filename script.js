const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach((item) => {
  item.querySelector('.faq-question').addEventListener('click', () => {
    const isActive = item.classList.contains('active');

    faqItems.forEach((faq) => {
      faq.classList.remove('active');
      faq.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });

    if (!isActive) {
      item.classList.add('active');
      item.querySelector('.faq-question').setAttribute('aria-expanded', 'true');
    }
  });
});

const revealItems = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  },
  { threshold: 0.15 }
);

revealItems.forEach((item) => {
  observer.observe(item);
  item.classList.add('is-visible');
});

document.getElementById('year').textContent = new Date().getFullYear();

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatNumber(value) {
  return Number(value).toLocaleString('en-IN');
}

const mealPlans = {
  lean: { name: 'Lean Plan', calories: 550, protein: 45, carbs: 45, fat: 18 },
  balance: { name: 'Balance Plan', calories: 750, protein: 65, carbs: 65, fat: 20 },
  bulk: { name: 'Bulk Plan', calories: 950, protein: 75, carbs: 100, fat: 20 },
};

function updateMacros(currentGoal) {
  const macros = {
    lose: { protein: 0.4, carbs: 0.3, fat: 0.3 },
    maintain: { protein: 0.3, carbs: 0.4, fat: 0.3 },
    gain: { protein: 0.3, carbs: 0.5, fat: 0.2 },
  };
  return macros[currentGoal] || macros.maintain;
}

function parseValue(text) {
  return Number(String(text).replace(/[^0-9.]/g, '')) || 0;
}

function clampCoverage(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function setDefaultMealPlan(goal) {
  if (document.querySelector('input[name="meal-plan"]:checked')) {
    return;
  }

  const defaultPlan = goal === 'lose' ? 'lean' : goal === 'gain' ? 'bulk' : 'balance';
  const planInput = document.querySelector(`input[name="meal-plan"][value="${defaultPlan}"]`);
  if (planInput) {
    planInput.checked = true;
  }
}

function getSelectedMealPlanKey() {
  const selected = document.querySelector('input[name="meal-plan"]:checked');
  return selected ? selected.value : 'lean';
}

function setCoverageLabelText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function updateCoverageCircle(id, percent) {
  const element = document.getElementById(id);
  if (element) {
    element.style.setProperty('--coverage', `${clampCoverage(percent)}%`);
  }
}

function updateMealCoverage() {
  const calories = parseValue(document.getElementById('target-calories').textContent);
  const proteinGrams = parseValue(document.getElementById('protein-grams').textContent);
  const carbsGrams = parseValue(document.getElementById('carbs-grams').textContent);
  const fatGrams = parseValue(document.getElementById('fat-grams').textContent);
  const selectedPlan = mealPlans[getSelectedMealPlanKey()] || mealPlans.lean;

  setCoverageLabelText('coverage-target-calories', calories ? formatNumber(calories) : '--');
  setCoverageLabelText('coverage-target-protein', proteinGrams ? `${formatNumber(proteinGrams)} g` : '-- g');
  setCoverageLabelText('coverage-target-carbs', carbsGrams ? `${formatNumber(carbsGrams)} g` : '-- g');
  setCoverageLabelText('coverage-target-fat', fatGrams ? `${formatNumber(fatGrams)} g` : '-- g');

  setCoverageLabelText('coverage-meal-name', selectedPlan.name);
  setCoverageLabelText('coverage-meal-calories', formatNumber(selectedPlan.calories));
  setCoverageLabelText('coverage-meal-protein', `${formatNumber(selectedPlan.protein)} g`);
  setCoverageLabelText('coverage-meal-carbs', `${formatNumber(selectedPlan.carbs)} g`);
  setCoverageLabelText('coverage-meal-fat', `${formatNumber(selectedPlan.fat)} g`);

  const caloriesCoverage = calories ? (selectedPlan.calories / calories) * 100 : 0;
  const proteinCoverage = proteinGrams ? (selectedPlan.protein / proteinGrams) * 100 : 0;
  const carbsCoverage = carbsGrams ? (selectedPlan.carbs / carbsGrams) * 100 : 0;
  const fatCoverage = fatGrams ? (selectedPlan.fat / fatGrams) * 100 : 0;

  const caloriesPercent = clampCoverage(caloriesCoverage);
  const proteinPercent = clampCoverage(proteinCoverage);
  const carbsPercent = clampCoverage(carbsCoverage);
  const fatPercent = clampCoverage(fatCoverage);

  setCoverageLabelText('coverage-calories-percent', `${caloriesPercent}%`);
  setCoverageLabelText('coverage-protein-percent', `${proteinPercent}%`);
  setCoverageLabelText('coverage-carbs-percent', `${carbsPercent}%`);
  setCoverageLabelText('coverage-fat-percent', `${fatPercent}%`);

  setCoverageLabelText('coverage-calories-text', `${caloriesPercent}%`);
  setCoverageLabelText('coverage-protein-text', `${proteinPercent}%`);
  setCoverageLabelText('coverage-carbs-text', `${carbsPercent}%`);
  setCoverageLabelText('coverage-fat-text', `${fatPercent}%`);

  updateCoverageCircle('coverage-calories-circle', caloriesPercent);
  updateCoverageCircle('coverage-protein-circle', proteinPercent);
  updateCoverageCircle('coverage-carbs-circle', carbsPercent);
  updateCoverageCircle('coverage-fat-circle', fatPercent);

  const remainingCalories = calories ? Math.max(0, calories - selectedPlan.calories) : 0;
  const remainingProtein = proteinGrams ? Math.max(0, proteinGrams - selectedPlan.protein) : 0;
  const remainingCarbs = carbsGrams ? Math.max(0, carbsGrams - selectedPlan.carbs) : 0;
  const remainingFat = fatGrams ? Math.max(0, fatGrams - selectedPlan.fat) : 0;

  setCoverageLabelText('remaining-calories', calories ? `${formatNumber(remainingCalories)} kcal` : '-- kcal');
  setCoverageLabelText('remaining-protein', proteinGrams ? `${formatNumber(remainingProtein)} g` : '-- g');
  setCoverageLabelText('remaining-carbs', carbsGrams ? `${formatNumber(remainingCarbs)} g` : '-- g');
  setCoverageLabelText('remaining-fat', fatGrams ? `${formatNumber(remainingFat)} g` : '-- g');

  setCoverageLabelText('comparison-calories-label', calories ? `${formatNumber(selectedPlan.calories)} / ${formatNumber(calories)} kcal` : '-- / -- kcal');
  setCoverageLabelText('comparison-protein-label', proteinGrams ? `${formatNumber(selectedPlan.protein)} / ${formatNumber(proteinGrams)} g` : '-- / -- g');
  setCoverageLabelText('comparison-carbs-label', carbsGrams ? `${formatNumber(selectedPlan.carbs)} / ${formatNumber(carbsGrams)} g` : '-- / -- g');
  setCoverageLabelText('comparison-fat-label', fatGrams ? `${formatNumber(selectedPlan.fat)} / ${formatNumber(fatGrams)} g` : '-- / -- g');

  const mealCalorieWidth = calories ? Math.min(100, (selectedPlan.calories / calories) * 100) : 0;
  const mealProteinWidth = proteinGrams ? Math.min(100, (selectedPlan.protein / proteinGrams) * 100) : 0;
  const mealCarbsWidth = carbsGrams ? Math.min(100, (selectedPlan.carbs / carbsGrams) * 100) : 0;
  const mealFatWidth = fatGrams ? Math.min(100, (selectedPlan.fat / fatGrams) * 100) : 0;

  const updateBarFills = (mealSelector, remainingSelector, mealWidth) => {
    const mealFill = document.getElementById(mealSelector);
    const remainingFill = document.getElementById(remainingSelector);
    if (mealFill) mealFill.style.width = `${mealWidth}%`;
    if (remainingFill) remainingFill.style.width = `${Math.max(0, 100 - mealWidth)}%`;
  };

  updateBarFills('comparison-calories-meal', 'comparison-calories-remaining', mealCalorieWidth);
  updateBarFills('comparison-protein-meal', 'comparison-protein-remaining', mealProteinWidth);
  updateBarFills('comparison-carbs-meal', 'comparison-carbs-remaining', mealCarbsWidth);
  updateBarFills('comparison-fat-meal', 'comparison-fat-remaining', mealFatWidth);

  const caloriesCoverage = calories ? clampCoverage((selectedPlan.calories / calories) * 100) : 0;
  const proteinCoverage = proteinGrams ? clampCoverage((selectedPlan.protein / proteinGrams) * 100) : 0;
  const carbsCoverage = carbsGrams ? clampCoverage((selectedPlan.carbs / carbsGrams) * 100) : 0;
  const fatCoverage = fatGrams ? clampCoverage((selectedPlan.fat / fatGrams) * 100) : 0;

  setCoverageLabelText('coverage-summary-text', 
    `Your Macro Bloom ${selectedPlan.name} provides ${selectedPlan.calories} calories, ${selectedPlan.protein}g protein, ${selectedPlan.carbs}g carbs, and ${selectedPlan.fat}g fat. ` +
    `This meal covers ${caloriesCoverage}% of your daily calorie target and ${proteinCoverage}% of your daily protein goal.`
  );
}

function updateDonut(percentProtein, percentCarbs, percentFat) {
  const circumference = 2 * Math.PI * 46;
  const proteinStroke = (percentProtein / 100) * circumference;
  const carbsStroke = (percentCarbs / 100) * circumference;
  const fatStroke = (percentFat / 100) * circumference;

  const proteinCircle = document.querySelector('.donut-protein');
  const carbsCircle = document.querySelector('.donut-carb');
  const fatCircle = document.querySelector('.donut-fat');

  proteinCircle.style.strokeDasharray = `${proteinStroke} ${circumference - proteinStroke}`;
  carbsCircle.style.strokeDasharray = `${carbsStroke} ${circumference - carbsStroke}`;
  fatCircle.style.strokeDasharray = `${fatStroke} ${circumference - fatStroke}`;
}

function updateProgressBar(selector, percent) {
  const element = document.querySelector(selector);
  if (element) element.style.width = `${percent}%`;
}

function calculateCalories() {
  const ageInput = document.getElementById('age');
  const gender = document.querySelector('input[name="gender"]:checked').value;
  const activity = parseFloat(document.getElementById('activity').value);
  const goal = document.getElementById('goal').value;
  const rate = document.getElementById('rate').value;

  const unitMode = document.querySelector('.unit-btn.active').dataset.unit;
  const age = clamp(Number(ageInput.value), 14, 100);

  let weightKg = 0;
  let heightCm = 0;

  if (unitMode === 'metric') {
    weightKg = Number(document.getElementById('weight-kg').value);
    heightCm = Number(document.getElementById('height-cm').value);
  } else {
    const weightLbs = Number(document.getElementById('weight-lbs').value);
    const heightFt = Number(document.getElementById('height-ft').value);
    const heightIn = Number(document.getElementById('height-in').value);
    weightKg = weightLbs / 2.20462;
    heightCm = heightFt * 30.48 + heightIn * 2.54;
  }

  const errorMessage = document.getElementById('calorie-error');
  errorMessage.textContent = '';

  if (!weightKg || !heightCm || !age) {
    errorMessage.textContent = 'Please complete age, height, and weight to calculate your target calories.';
    return;
  }

  const bmr = Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) + (gender === 'male' ? 5 : -161));
  const tdee = Math.round(bmr * activity);

  const goalOffsets = {
    lose: { mild: -250, moderate: -500, aggressive: -750 },
    gain: { mild: 250, moderate: 500, aggressive: 750 },
    maintain: { mild: 0, moderate: 0, aggressive: 0 },
  };

  const calories = Math.round(tdee + (goalOffsets[goal][rate] || 0));
  const macroRatios = updateMacros(goal);

  const proteinCalories = Math.round(calories * macroRatios.protein);
  const carbsCalories = Math.round(calories * macroRatios.carbs);
  const fatCalories = Math.round(calories * macroRatios.fat);

  const proteinGrams = Math.round(proteinCalories / 4);
  const carbsGrams = Math.round(carbsCalories / 4);
  const fatGrams = Math.round(fatCalories / 9);

  document.getElementById('bmr-value').textContent = formatNumber(bmr);
  document.getElementById('tdee-value').textContent = formatNumber(tdee);
  document.getElementById('target-calories').textContent = formatNumber(calories);
  document.getElementById('protein-grams').textContent = `${formatNumber(proteinGrams)} g`;
  document.getElementById('carbs-grams').textContent = `${formatNumber(carbsGrams)} g`;
  document.getElementById('fat-grams').textContent = `${formatNumber(fatGrams)} g`;
  document.getElementById('donut-calories').textContent = formatNumber(calories);

  const proteinPercent = Math.round(macroRatios.protein * 100);
  const carbsPercent = Math.round(macroRatios.carbs * 100);
  const fatPercent = Math.round(macroRatios.fat * 100);
  document.getElementById('protein-percent').textContent = `${proteinPercent}%`;
  document.getElementById('carbs-percent').textContent = `${carbsPercent}%`;
  document.getElementById('fat-percent').textContent = `${fatPercent}%`;

  updateProgressBar('.protein-fill', proteinPercent);
  updateProgressBar('.carbs-fill', carbsPercent);
  updateProgressBar('.fat-fill', fatPercent);
  updateDonut(proteinPercent, carbsPercent, fatPercent);

  const goalBadge = document.getElementById('goal-badge');
  goalBadge.textContent = goal === 'lose' ? 'Fat Loss' : goal === 'gain' ? 'Muscle Gain' : 'Maintenance';

  setDefaultMealPlan(goal);
  updateMealCoverage();

  localStorage.setItem('macroCalcResults', JSON.stringify({
    bmr,
    tdee,
    calories,
    proteinGrams,
    carbsGrams,
    fatGrams,
    goal,
    rate,
    activity,
    gender,
    age,
    weightKg,
    heightCm,
    unitMode,
  }));
}

function setUnitMode(unit) {
  document.querySelectorAll('.unit-btn').forEach((btn) => {
    const isActive = btn.dataset.unit === unit;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });

  document.querySelectorAll('.metric-fields').forEach((el) => {
    el.classList.toggle('hidden', unit !== 'metric');
  });

  document.querySelectorAll('.imperial-fields').forEach((el) => {
    el.classList.toggle('hidden', unit !== 'imperial');
  });
}

function hydrateSavedResults() {
  const saved = localStorage.getItem('macroCalcResults');
  if (!saved) return;

  const data = JSON.parse(saved);
  if (!data) return;

  const unitMode = data.unitMode || 'metric';
  setUnitMode(unitMode);
  document.querySelector(`.unit-btn[data-unit="${unitMode}"]`).classList.add('active');
  document.querySelector(`#${unitMode === 'metric' ? 'height-cm' : 'height-ft'}`).value = unitMode === 'metric' ? Math.round(data.heightCm) : Math.floor(data.heightCm / 30.48);
  if (unitMode === 'imperial') {
    document.getElementById('height-in').value = Math.round((data.heightCm / 2.54) % 12);
    document.getElementById('weight-lbs').value = Math.round(data.weightKg * 2.20462);
  } else {
    document.getElementById('height-cm').value = Math.round(data.heightCm);
    document.getElementById('weight-kg').value = Math.round(data.weightKg);
  }

  document.querySelector(`input[name="gender"][value="${data.gender}"]`).checked = true;
  document.getElementById('age').value = data.age;
  document.getElementById('activity').value = data.activity;
  document.getElementById('goal').value = data.goal;
  document.getElementById('rate').value = data.rate;
  calculateCalories();
}

function copyResults() {
  const text = `Macro Bloom Calculator Results:\nBMR: ${document.getElementById('bmr-value').textContent}\nTDEE: ${document.getElementById('tdee-value').textContent}\nCalories: ${document.getElementById('target-calories').textContent}\nProtein: ${document.getElementById('protein-grams').textContent}\nCarbs: ${document.getElementById('carbs-grams').textContent}\nFat: ${document.getElementById('fat-grams').textContent}`;
  navigator.clipboard.writeText(text);
}

function shareResults() {
  if (navigator.share) {
    navigator.share({
      title: 'Macro Bloom Calculator Results',
      text: `My calorie target is ${document.getElementById('target-calories').textContent} with a ${document.getElementById('goal-badge').textContent} goal.`,
    });
  }
}

function shareCoverageReport() {
  const plan = document.getElementById('coverage-meal-name').textContent;
  const calories = document.getElementById('coverage-target-calories').textContent;
  const protein = document.getElementById('coverage-target-protein').textContent;
  const carbs = document.getElementById('coverage-target-carbs').textContent;
  const fat = document.getElementById('coverage-target-fat').textContent;
  const mealCalories = document.getElementById('coverage-meal-calories').textContent;
  const mealProtein = document.getElementById('coverage-meal-protein').textContent;
  const mealCarbs = document.getElementById('coverage-meal-carbs').textContent;
  const mealFat = document.getElementById('coverage-meal-fat').textContent;
  const caloriesPercent = document.getElementById('coverage-calories-percent').textContent;
  const proteinPercent = document.getElementById('coverage-protein-percent').textContent;
  const carbsPercent = document.getElementById('coverage-carbs-percent').textContent;
  const fatPercent = document.getElementById('coverage-fat-percent').textContent;
  const remainingCalories = document.getElementById('remaining-calories').textContent;
  const remainingProtein = document.getElementById('remaining-protein').textContent;
  const remainingCarbs = document.getElementById('remaining-carbs').textContent;
  const remainingFat = document.getElementById('remaining-fat').textContent;

  const report = `Macro Bloom Meal Coverage Report:\n
Plan: ${plan}\nDaily Target: ${calories}, ${protein}, ${carbs}, ${fat}\nMeal: ${mealCalories}, ${mealProtein}, ${mealCarbs}, ${mealFat}\nCoverage: Calories ${caloriesPercent}, Protein ${proteinPercent}, Carbs ${carbsPercent}, Fat ${fatPercent}\nRemaining: ${remainingCalories}, ${remainingProtein}, ${remainingCarbs}, ${remainingFat}`;

  if (navigator.share) {
    navigator.share({
      title: 'Macro Bloom Meal Coverage Report',
      text: report,
    });
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(report);
    alert('Coverage report copied to clipboard.');
  } else {
    alert('Unable to share coverage report on this device.');
  }
}

function bindCalculatorEvents() {
  document.querySelectorAll('.unit-btn').forEach((button) => {
    button.addEventListener('click', () => {
      setUnitMode(button.dataset.unit);
      calculateCalories();
    });
  });

  const calculateButton = document.getElementById('calculate-results');
  if (calculateButton) {
    calculateButton.addEventListener('click', () => {
      calculateCalories();
      const resultsSection = document.getElementById('results');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  document.querySelectorAll('input[name="meal-plan"]').forEach((input) => {
    input.addEventListener('change', updateMealCoverage);
  });

  const shareCoverageButton = document.getElementById('share-coverage-report');
  if (shareCoverageButton) {
    shareCoverageButton.addEventListener('click', shareCoverageReport);
  }

  document.querySelectorAll('#calorie-form input, #calorie-form select').forEach((element) => {
    element.addEventListener('change', () => {
      calculateCalories();
    });
  });

  document.getElementById('copy-results').addEventListener('click', copyResults);
  document.getElementById('share-results').addEventListener('click', shareResults);
}

window.addEventListener('DOMContentLoaded', () => {
  hydrateSavedResults();
  bindCalculatorEvents();
});
