/**
 * MacroBloom Nutrition Calculator
 * Calculates daily calorie and macro targets based on user data
 */

/**
 * Calculate BMR using Mifflin-St Jeor Equation
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - 'male' or 'female'
 * @returns {number} BMR in calories
 */
function calculateBMR(weight, height, age, gender) {
  const baseCalories = (10 * weight) + (6.25 * height) - (5 * age);
  
  if (gender === 'male') {
    return baseCalories + 5;
  } else {
    return baseCalories - 161;
  }
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - Activity level
 * @returns {number} TDEE in calories
 */
function calculateTDEE(bmr, activityLevel) {
  const activityMultipliers = {
    'sedentary': 1.2,
    'lightly active': 1.375,
    'moderately active': 1.55,
    'very active': 1.725,
    'athlete': 1.9
  };

  const multiplier = activityMultipliers[activityLevel.toLowerCase()] || 1.2;
  return bmr * multiplier;
}

/**
 * Calculate target calories based on goal
 * @param {number} tdee - Total Daily Energy Expenditure
 * @param {string} goal - 'weight loss', 'maintenance', or 'muscle gain'
 * @param {string} rate - 'mild', 'moderate', or 'aggressive' (optional for maintenance)
 * @returns {number} Target calories
 */
function calculateTargetCalories(tdee, goal, rate = 'moderate') {
  const normalizedGoal = goal.toLowerCase();
  
  if (normalizedGoal.includes('loss')) {
    // Weight loss - calorie deficit
    const deficits = {
      'mild': 250,      // ~0.25 kg/week
      'moderate': 500,  // ~0.5 kg/week
      'aggressive': 750 // ~0.75 kg/week
    };
    return tdee - (deficits[rate] || deficits.moderate);
  } else if (normalizedGoal.includes('gain')) {
    // Muscle gain - calorie surplus
    const surpluses = {
      'mild': 250,      // ~0.25 kg/week
      'moderate': 500,  // ~0.5 kg/week
      'aggressive': 750 // ~0.75 kg/week
    };
    return tdee + (surpluses[rate] || surpluses.moderate);
  } else {
    // Maintenance
    return tdee;
  }
}

/**
 * Calculate protein requirements
 * @param {number} weight - Weight in kg
 * @param {string} goal - User's fitness goal
 * @returns {number} Protein in grams
 */
function calculateProtein(weight, goal) {
  const normalizedGoal = goal.toLowerCase();
  
  if (normalizedGoal.includes('loss')) {
    return weight * 2.0; // 2.0g per kg for weight loss
  } else if (normalizedGoal.includes('gain')) {
    return weight * 2.2; // 2.2g per kg for muscle gain
  } else {
    return weight * 1.6; // 1.6g per kg for maintenance
  }
}

/**
 * Calculate fiber requirements
 * @param {number} calories - Total daily calories
 * @param {string} gender - 'male' or 'female'
 * @returns {number} Fiber in grams
 */
function calculateFiber(calories, gender) {
  // 14g per 1000 calories
  const fiberFromCalories = (calories / 1000) * 14;
  
  // Minimum requirements
  const minimum = gender.toLowerCase() === 'male' ? 30 : 25;
  
  return Math.max(Math.round(fiberFromCalories), minimum);
}

/**
 * Calculate healthy fats requirements
 * @param {number} calories - Total daily calories
 * @returns {number} Healthy fats in grams
 */
function calculateHealthyFats(calories) {
  // 28% of total calories from fats
  const fatCalories = calories * 0.28;
  // 9 calories per gram of fat
  return fatCalories / 9;
}

/**
 * Calculate complex carbs requirements
 * @param {number} calories - Total daily calories
 * @param {number} protein - Protein in grams
 * @param {number} healthyFats - Healthy fats in grams
 * @returns {number} Complex carbs in grams
 */
function calculateComplexCarbs(calories, protein, healthyFats) {
  // Protein: 4 cal/g, Fats: 9 cal/g, Carbs: 4 cal/g
  const proteinCalories = protein * 4;
  const fatCalories = healthyFats * 9;
  const remainingCalories = calories - proteinCalories - fatCalories;
  
  return remainingCalories / 4;
}

/**
 * Calculate complete nutrition targets
 * @param {Object} userData - User data object
 * @param {number} userData.age - Age in years
 * @param {string} userData.gender - 'male' or 'female'
 * @param {number} userData.height - Height in cm
 * @param {number} userData.weight - Weight in kg
 * @param {string} userData.activityLevel - Activity level
 * @param {string} userData.goal - Fitness goal
 * @param {string} userData.rate - Rate of change (optional)
 * @returns {Object} Complete nutrition targets
 */
export function calculateNutritionTargets(userData) {
  const { age, gender, height, weight, activityLevel, goal, rate = 'moderate' } = userData;

  // Step 1: Calculate BMR
  const bmr = calculateBMR(weight, height, age, gender);

  // Step 2: Calculate TDEE
  const tdee = calculateTDEE(bmr, activityLevel);

  // Step 3: Calculate target calories
  const targetCalories = calculateTargetCalories(tdee, goal, rate);

  // Step 4: Calculate macros
  const protein = calculateProtein(weight, goal);
  const fiber = calculateFiber(targetCalories, gender);
  const healthyFats = calculateHealthyFats(targetCalories);
  const complexCarbs = calculateComplexCarbs(targetCalories, protein, healthyFats);

  // Round all values
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calories: Math.round(targetCalories),
    macros: {
      protein: Math.round(protein),
      fiber: Math.round(fiber),
      healthyFats: Math.round(healthyFats),
      complexCarbs: Math.round(complexCarbs)
    },
    userData: {
      age,
      gender,
      height,
      weight,
      activityLevel,
      goal,
      rate
    }
  };
}

/**
 * Format nutrition results as WhatsApp message
 * @param {Object} results - Nutrition calculation results
 * @returns {string} Formatted message
 */
export function formatNutritionResults(results) {
  const { calories, macros } = results;

  return `🌱 *Your MacroBloom Daily Targets*

🟢 *Protein:* ${macros.protein}g
Protein supports muscle maintenance and recovery.

🌲 *Fiber:* ${macros.fiber}g
Fiber supports digestion and gut health.

🟠 *Healthy Fats:* ${macros.healthyFats}g
Healthy fats support hormones, brain and heart health.

🟡 *Complex Carbs:* ${macros.complexCarbs}g
Complex carbs provide sustained energy.

📊 *Total Calories:* ${calories} kcal/day

---
💡 These targets are personalized for your ${results.userData.goal.toLowerCase()} goal.

Want to reach your goals faster? MacroBloom delivers perfectly portioned meals that match your macros!

🌐 Visit: macrobloom.in
📱 Order: +91-XXXXXXXXXX`;
}

/**
 * Validate user input for each step
 * @param {string} step - Current conversation step
 * @param {string} input - User input
 * @returns {Object} Validation result {isValid, value, error}
 */
export function validateInput(step, input) {
  const trimmedInput = input.trim();

  switch (step) {
    case 'age':
      const age = parseInt(trimmedInput);
      if (isNaN(age) || age < 14 || age > 100) {
        return { isValid: false, error: 'Please enter a valid age between 14 and 100.' };
      }
      return { isValid: true, value: age };

    case 'gender':
      const gender = trimmedInput.toLowerCase();
      if (gender === 'male' || gender === 'm' || gender === '1') {
        return { isValid: true, value: 'male' };
      } else if (gender === 'female' || gender === 'f' || gender === '2') {
        return { isValid: true, value: 'female' };
      }
      return { isValid: false, error: 'Please enter "male" or "female" (or 1/2).' };

    case 'height':
      const height = parseFloat(trimmedInput);
      if (isNaN(height) || height < 100 || height > 250) {
        return { isValid: false, error: 'Please enter a valid height between 100 and 250 cm.' };
      }
      return { isValid: true, value: height };

    case 'weight':
      const weight = parseFloat(trimmedInput);
      if (isNaN(weight) || weight < 35 || weight > 200) {
        return { isValid: false, error: 'Please enter a valid weight between 35 and 200 kg.' };
      }
      return { isValid: true, value: weight };

    case 'activity':
      const activityMap = {
        '1': 'sedentary',
        '2': 'lightly active',
        '3': 'moderately active',
        '4': 'very active',
        'sedentary': 'sedentary',
        'lightly active': 'lightly active',
        'moderately active': 'moderately active',
        'very active': 'very active'
      };
      const activity = activityMap[trimmedInput.toLowerCase()];
      if (!activity) {
        return { isValid: false, error: 'Please choose 1, 2, 3, or 4.' };
      }
      return { isValid: true, value: activity };

    case 'goal':
      const goalMap = {
        '1': 'weight loss',
        '2': 'maintenance',
        '3': 'muscle gain',
        'weight loss': 'weight loss',
        'loss': 'weight loss',
        'lose': 'weight loss',
        'maintenance': 'maintenance',
        'maintain': 'maintenance',
        'muscle gain': 'muscle gain',
        'gain': 'muscle gain',
        'bulk': 'muscle gain'
      };
      const goal = goalMap[trimmedInput.toLowerCase()];
      if (!goal) {
        return { isValid: false, error: 'Please choose 1, 2, or 3.' };
      }
      return { isValid: true, value: goal };

    default:
      return { isValid: true, value: trimmedInput };
  }
}
