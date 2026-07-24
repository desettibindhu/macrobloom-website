// Wait for DOM to be fully loaded before running any code
window.addEventListener('DOMContentLoaded', () => {
  // Hamburger menu
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

  // FAQ accordions
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length > 0) {
    faqItems.forEach((item) => {
      const faqQuestion = item.querySelector('.faq-question');
      if (faqQuestion) {
        faqQuestion.addEventListener('click', () => {
          const isActive = item.classList.contains('active');

          faqItems.forEach((faq) => {
            faq.classList.remove('active');
            const faqQ = faq.querySelector('.faq-question');
            if (faqQ) faqQ.setAttribute('aria-expanded', 'false');
          });

          if (!isActive) {
            item.classList.add('active');
            faqQuestion.setAttribute('aria-expanded', 'true');
          }
        });
      }
    });
  }

  // Reveal animations
  const revealItems = document.querySelectorAll('.reveal');
  if (revealItems.length > 0) {
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
  }

  // Year in footer
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Initialize calculator if on calculator page
  try {
    if (typeof hydrateSavedResults === 'function') {
      hydrateSavedResults();
    }
    if (typeof bindCalculatorEvents === 'function') {
      bindCalculatorEvents();
    }
  } catch (error) {
    console.error('Error initializing calculator:', error);
  }
});

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatNumber(value) {
  return Number(value).toLocaleString('en-IN');
}

const mealPlans = {
  lean: { name: 'Lean Plan', calories: 550, protein: 45, complexCarbs: 45, healthyFats: 18, fiber: 10 },
  balance: { name: 'Balance Plan', calories: 750, protein: 65, complexCarbs: 65, healthyFats: 20, fiber: 12 },
  bulk: { name: 'Bulk Plan', calories: 950, protein: 75, complexCarbs: 100, healthyFats: 20, fiber: 15 },
};

// New calculation: Protein multipliers based on goal
function getProteinMultiplier(goal) {
  const multipliers = {
    lose: 2.0,      // Weight Loss: 2.0g per kg body weight
    maintain: 1.6,  // Maintenance: 1.6g per kg body weight
    gain: 2.2,      // Weight Gain: 2.2g per kg body weight
  };
  return multipliers[goal] || multipliers.maintain;
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

  // Use the already calculated percentages for the summary text
  setCoverageLabelText('coverage-summary-text', 
    `Your Macro Bloom ${selectedPlan.name} provides ${selectedPlan.calories} calories, ${selectedPlan.protein}g protein, ${selectedPlan.carbs}g carbs, and ${selectedPlan.fat}g fat. ` +
    `This meal covers ${caloriesPercent}% of your daily calorie target and ${proteinPercent}% of your daily protein goal.`
  );
}

function updateMealRecommendation(goal, calories, proteinGrams, fiberGrams, healthyFatsGrams, complexCarbsGrams) {
  // Determine recommended meal plan based on goal
  const recommendedPlanKey = goal === 'lose' ? 'lean' : goal === 'gain' ? 'bulk' : 'balance';
  const recommendedPlan = mealPlans[recommendedPlanKey];
  
  // Show the meal recommendation section
  const mealRecSection = document.getElementById('meal-recommendation');
  if (mealRecSection) {
    mealRecSection.style.display = 'block';
  }
  
  // Update goal text
  const goalText = goal === 'lose' ? 'fat loss goal' : goal === 'gain' ? 'muscle gain goal' : 'maintenance goal';
  setCoverageLabelText('meal-rec-goal', goalText);
  
  // Update plan name and badge
  setCoverageLabelText('meal-rec-badge', recommendedPlan.name);
  setCoverageLabelText('meal-rec-plan-name', recommendedPlan.name);
  
  // Update meal description with new macros
  const mealDesc = `${recommendedPlan.calories} calories · ${recommendedPlan.protein}g protein · ${recommendedPlan.fiber}g fiber · ${recommendedPlan.healthyFats}g healthy fats · ${recommendedPlan.complexCarbs}g complex carbs`;
  setCoverageLabelText('meal-rec-description', mealDesc);
}

function updateDonut(percentProtein, percentFiber, percentHealthyFats, percentComplexCarbs) {
  const circumference = 2 * Math.PI * 46;
  const proteinStroke = (percentProtein / 100) * circumference;
  const fiberStroke = (percentFiber / 100) * circumference;
  const healthyFatsStroke = (percentHealthyFats / 100) * circumference;
  const complexCarbsStroke = (percentComplexCarbs / 100) * circumference;

  const proteinCircle = document.querySelector('.donut-protein');
  const fiberCircle = document.querySelector('.donut-fiber');
  const healthyFatsCircle = document.querySelector('.donut-healthy-fats');
  const complexCarbsCircle = document.querySelector('.donut-complex-carbs');

  // Calculate rotation angles (SVG starts at -90° for top position)
  const proteinAngle = -90;
  const fiberAngle = -90 + (percentProtein / 100) * 360;
  const healthyFatsAngle = -90 + ((percentProtein + percentFiber) / 100) * 360;
  const complexCarbsAngle = -90 + ((percentProtein + percentFiber + percentHealthyFats) / 100) * 360;

  if (proteinCircle) {
    proteinCircle.style.strokeDasharray = `${proteinStroke} ${circumference - proteinStroke}`;
    proteinCircle.style.transform = `rotate(${proteinAngle}deg)`;
    proteinCircle.style.transformOrigin = 'center';
  }
  if (fiberCircle) {
    fiberCircle.style.strokeDasharray = `${fiberStroke} ${circumference - fiberStroke}`;
    fiberCircle.style.transform = `rotate(${fiberAngle}deg)`;
    fiberCircle.style.transformOrigin = 'center';
  }
  if (healthyFatsCircle) {
    healthyFatsCircle.style.strokeDasharray = `${healthyFatsStroke} ${circumference - healthyFatsStroke}`;
    healthyFatsCircle.style.transform = `rotate(${healthyFatsAngle}deg)`;
    healthyFatsCircle.style.transformOrigin = 'center';
  }
  if (complexCarbsCircle) {
    complexCarbsCircle.style.strokeDasharray = `${complexCarbsStroke} ${circumference - complexCarbsStroke}`;
    complexCarbsCircle.style.transform = `rotate(${complexCarbsAngle}deg)`;
    complexCarbsCircle.style.transformOrigin = 'center';
  }
}

function updateProgressBar(selector, percent) {
  const element = document.querySelector(selector);
  if (element) element.style.width = `${percent}%`;
}

function calculateCalories() {
  try {
    const ageInput = document.getElementById('age');
    const genderInput = document.querySelector('input[name="gender"]:checked');
    const activityInput = document.getElementById('activity');
    const goalInput = document.getElementById('goal');
    const rateInput = document.getElementById('rate');
    
    if (!ageInput || !genderInput || !activityInput || !goalInput || !rateInput) {
      console.error('Required form elements not found');
      return;
    }
    
    const gender = genderInput.value;
    const activity = parseFloat(activityInput.value);
    const goal = goalInput.value;
    const rate = rateInput.value;

    const unitModeBtn = document.querySelector('.unit-btn.active');
    const unitMode = unitModeBtn ? unitModeBtn.dataset.unit : 'metric';
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
    if (errorMessage) {
      errorMessage.textContent = '';
    }

    if (!weightKg || !heightCm || !age) {
      if (errorMessage) {
        errorMessage.textContent = 'Please complete age, height, and weight to calculate your target calories.';
      }
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

    // NEW MACRO CALCULATIONS
    
    // 1. PROTEIN: Based on body weight (g/kg)
    const proteinMultiplier = getProteinMultiplier(goal);
    const proteinGrams = Math.round(weightKg * proteinMultiplier);
    const proteinCalories = proteinGrams * 4;

    // 2. HEALTHY FATS: 28% of daily calories
    const healthyFatCalories = Math.round(calories * 0.28);
    const healthyFatsGrams = Math.round(healthyFatCalories / 9);

    // 3. FIBER: 14g per 1000 calories, with gender-based minimum
    const calculatedFiber = Math.round((calories / 1000) * 14);
    const minimumFiber = gender === 'male' ? 30 : 25;
    const fiberGrams = Math.max(calculatedFiber, minimumFiber);

    // 4. COMPLEX CARBS: Remaining calories after Protein and Healthy Fats
    const remainingCalories = calories - proteinCalories - healthyFatCalories;
    const complexCarbsGrams = Math.round(remainingCalories / 4);

    const bmrValue = document.getElementById('bmr-value');
    const tdeeValue = document.getElementById('tdee-value');
    const targetCalories = document.getElementById('target-calories');
    const proteinGramsEl = document.getElementById('protein-grams');
    const fiberGramsEl = document.getElementById('fiber-grams');
    const healthyFatsGramsEl = document.getElementById('healthy-fats-grams');
    const complexCarbsGramsEl = document.getElementById('complex-carbs-grams');
    const donutCalories = document.getElementById('donut-calories');

    if (bmrValue) bmrValue.textContent = formatNumber(bmr);
    if (tdeeValue) tdeeValue.textContent = formatNumber(tdee);
    if (targetCalories) targetCalories.textContent = formatNumber(calories);
    if (proteinGramsEl) proteinGramsEl.textContent = `${formatNumber(proteinGrams)} g`;
    if (fiberGramsEl) fiberGramsEl.textContent = `${formatNumber(fiberGrams)} g`;
    if (healthyFatsGramsEl) healthyFatsGramsEl.textContent = `${formatNumber(healthyFatsGrams)} g`;
    if (complexCarbsGramsEl) complexCarbsGramsEl.textContent = `${formatNumber(complexCarbsGrams)} g`;
    if (donutCalories) donutCalories.textContent = formatNumber(calories);

    // Calculate percentages for visualization (based on calories)
    const proteinPercent = Math.round((proteinCalories / calories) * 100);
    const healthyFatsPercent = Math.round((healthyFatCalories / calories) * 100);
    const complexCarbsCalories = complexCarbsGrams * 4;
    const complexCarbsPercent = Math.round((complexCarbsCalories / calories) * 100);
    // Fiber contributes approximately 2 calories per gram for visualization
    const fiberCalories = fiberGrams * 2;
    const fiberPercent = Math.round((fiberCalories / calories) * 100);
    
    const proteinPercentEl = document.getElementById('protein-percent');
    const fiberPercentEl = document.getElementById('fiber-percent');
    const healthyFatsPercentEl = document.getElementById('healthy-fats-percent');
    const complexCarbsPercentEl = document.getElementById('complex-carbs-percent');
    
    if (proteinPercentEl) proteinPercentEl.textContent = `${proteinPercent}%`;
    if (fiberPercentEl) fiberPercentEl.textContent = `${fiberPercent}%`;
    if (healthyFatsPercentEl) healthyFatsPercentEl.textContent = `${healthyFatsPercent}%`;
    if (complexCarbsPercentEl) complexCarbsPercentEl.textContent = `${complexCarbsPercent}%`;

    updateProgressBar('.protein-fill', proteinPercent);
    updateProgressBar('.fiber-fill', fiberPercent);
    updateProgressBar('.healthy-fats-fill', healthyFatsPercent);
    updateProgressBar('.complex-carbs-fill', complexCarbsPercent);
    updateDonut(proteinPercent, fiberPercent, healthyFatsPercent, complexCarbsPercent);

    const goalBadge = document.getElementById('goal-badge');
    if (goalBadge) {
      goalBadge.textContent = goal === 'lose' ? 'Fat Loss' : goal === 'gain' ? 'Muscle Gain' : 'Maintenance';
    }

    // Update meal recommendation
    updateMealRecommendation(goal, calories, proteinGrams, fiberGrams, healthyFatsGrams, complexCarbsGrams);

    // Only update meal coverage if the meal plan elements exist
    if (document.querySelector('input[name="meal-plan"]')) {
      setDefaultMealPlan(goal);
      updateMealCoverage();
    }

    localStorage.setItem('macroCalcResults', JSON.stringify({
      bmr,
      tdee,
      calories,
      proteinGrams,
      fiberGrams,
      healthyFatsGrams,
      complexCarbsGrams,
      goal,
      rate,
      activity,
      gender,
      age,
      weightKg,
      heightCm,
      unitMode,
    }));
  } catch (error) {
    console.error('Error in calculateCalories:', error);
    const errorMessage = document.getElementById('calorie-error');
    if (errorMessage) {
      errorMessage.textContent = 'An error occurred while calculating. Please try again.';
    }
  }
}

// Make calculateCalories globally accessible
window.calculateCalories = calculateCalories;

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
  try {
    const saved = localStorage.getItem('macroCalcResults');
    if (!saved) return;

    const data = JSON.parse(saved);
    if (!data) return;

    const unitMode = data.unitMode || 'metric';
    setUnitMode(unitMode);
    
    const unitBtn = document.querySelector(`.unit-btn[data-unit="${unitMode}"]`);
    if (unitBtn) unitBtn.classList.add('active');
    
    if (unitMode === 'imperial') {
      const heightFt = document.getElementById('height-ft');
      const heightIn = document.getElementById('height-in');
      const weightLbs = document.getElementById('weight-lbs');
      
      if (heightFt) heightFt.value = Math.floor(data.heightCm / 30.48);
      if (heightIn) heightIn.value = Math.round((data.heightCm / 2.54) % 12);
      if (weightLbs) weightLbs.value = Math.round(data.weightKg * 2.20462);
    } else {
      const heightCm = document.getElementById('height-cm');
      const weightKg = document.getElementById('weight-kg');
      
      if (heightCm) heightCm.value = Math.round(data.heightCm);
      if (weightKg) weightKg.value = Math.round(data.weightKg);
    }

    const genderInput = document.querySelector(`input[name="gender"][value="${data.gender}"]`);
    const ageInput = document.getElementById('age');
    const activityInput = document.getElementById('activity');
    const goalInput = document.getElementById('goal');
    const rateInput = document.getElementById('rate');
    
    if (genderInput) genderInput.checked = true;
    if (ageInput) ageInput.value = data.age;
    if (activityInput) activityInput.value = data.activity;
    if (goalInput) goalInput.value = data.goal;
    if (rateInput) rateInput.value = data.rate;
    
    calculateCalories();
  } catch (error) {
    console.error('Error loading saved results:', error);
  }
}

function copyResults() {
  const text = `Macro Bloom Calculator Results:\nBMR: ${document.getElementById('bmr-value').textContent}\nTDEE: ${document.getElementById('tdee-value').textContent}\nCalories: ${document.getElementById('target-calories').textContent}\nProtein: ${document.getElementById('protein-grams').textContent}\nCarbs: ${document.getElementById('carbs-grams').textContent}\nFat: ${document.getElementById('fat-grams').textContent}`;
  navigator.clipboard.writeText(text);
}

function shareResults() {
  const calories = document.getElementById('target-calories').textContent;
  const bmr = document.getElementById('bmr-value').textContent;
  const tdee = document.getElementById('tdee-value').textContent;
  const protein = document.getElementById('protein-grams').textContent;
  const fiber = document.getElementById('fiber-grams').textContent;
  const healthyFats = document.getElementById('healthy-fats-grams').textContent;
  const complexCarbs = document.getElementById('complex-carbs-grams').textContent;
  const goal = document.getElementById('goal-badge').textContent;
  
  // Check if meal recommendation is shown
  const mealRecSection = document.getElementById('meal-recommendation');
  let mealInfo = '';
  if (mealRecSection && mealRecSection.style.display !== 'none') {
    const planName = document.getElementById('meal-rec-plan-name').textContent;
    const mealDesc = document.getElementById('meal-rec-description').textContent;
    const mealCalPercent = document.getElementById('meal-calories-percent').textContent;
    const mealProtPercent = document.getElementById('meal-protein-percent').textContent;
    
    mealInfo = `\n\n🍽️ *Recommended Meal Plan*\nMacro Bloom ${planName}\n${mealDesc}\n\nMeal Coverage:\n• Calories: ${mealCalPercent}\n• Protein: ${mealProtPercent}`;
  }
  
  const shareText = `🎯 *My Macro Bloom Calculator Results*\n\n💪 Goal: ${goal}\n\n📊 *Daily Targets*\n• Calories: ${calories}\n• Protein: ${protein}\n• Fiber: ${fiber}\n• Healthy Fats: ${healthyFats}\n• Complex Carbs: ${complexCarbs}\n\n📈 *Metabolic Rates*\n• BMR: ${bmr}\n• TDEE: ${tdee}${mealInfo}\n\nCalculated with Macro Bloom Calculator\n🌐 Visit: macrobloom.com`;

  // Check if it's a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // For mobile devices, try Web Share API
  if (isMobile && navigator.share) {
    navigator.share({
      title: 'My Macro Bloom Calculator Results',
      text: shareText,
    }).catch(err => {
      // If share is cancelled or fails, open WhatsApp directly
      const whatsappText = encodeURIComponent(shareText);
      const whatsappUrl = `https://wa.me/?text=${whatsappText}`;
      window.open(whatsappUrl, '_blank');
    });
  } else {
    // For desktop (including MacBook), directly open WhatsApp Web
    const whatsappText = encodeURIComponent(shareText);
    const whatsappUrl = `https://web.whatsapp.com/send?text=${whatsappText}`;
    window.open(whatsappUrl, '_blank');
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
      const ageInput = document.getElementById('age');
      const weightKg = document.getElementById('weight-kg');
      const heightCm = document.getElementById('height-cm');
      const weightLbs = document.getElementById('weight-lbs');
      const heightFt = document.getElementById('height-ft');
      
      if ((ageInput && ageInput.value) && 
          ((weightKg && weightKg.value) || (weightLbs && weightLbs.value)) && 
          ((heightCm && heightCm.value) || (heightFt && heightFt.value))) {
        calculateCalories();
      }
    });
  });

  const copyBtn = document.getElementById('copy-results');
  const shareBtn = document.getElementById('share-results');
  if (copyBtn) copyBtn.addEventListener('click', copyResults);
  if (shareBtn) shareBtn.addEventListener('click', shareResults);
}
