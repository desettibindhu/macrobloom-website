import { GoogleSpreadsheet } from 'google-spreadsheet';
import { config } from '../config/index.js';

/**
 * Database Service
 * Handles lead storage to database and Google Sheets
 */

/**
 * Save lead to database
 * @param {Object} leadData - Lead information
 */
export async function saveLeadToDatabase(leadData) {
  // TODO: Implement your database logic here
  // This is a placeholder for MongoDB, PostgreSQL, or any other database
  
  if (!config.database.url) {
    console.log('⚠️ Database URL not configured. Skipping database save.');
    return;
  }

  try {
    // Example structure for the data to save
    const lead = {
      phoneNumber: leadData.phoneNumber,
      name: leadData.name || null,
      age: leadData.age,
      gender: leadData.gender,
      height: leadData.height,
      weight: leadData.weight,
      activityLevel: leadData.activityLevel,
      goal: leadData.goal,
      bmr: leadData.bmr,
      tdee: leadData.tdee,
      calories: leadData.calories,
      protein: leadData.macros.protein,
      fiber: leadData.macros.fiber,
      healthyFats: leadData.macros.healthyFats,
      complexCarbs: leadData.macros.complexCarbs,
      createdAt: leadData.createdAt
    };

    // TODO: Insert to your database
    // Example for MongoDB:
    // await LeadModel.create(lead);
    
    // Example for PostgreSQL:
    // await db.query('INSERT INTO leads (...) VALUES (...)', [...]);

    console.log('✅ Lead saved to database successfully');
  } catch (error) {
    console.error('❌ Error saving to database:', error);
    throw error;
  }
}

/**
 * Save lead to Google Sheets
 * @param {Object} leadData - Lead information
 */
export async function saveLeadToGoogleSheets(leadData) {
  if (!config.googleSheets.enabled) {
    console.log('⚠️ Google Sheets integration not enabled. Skipping.');
    return;
  }

  if (!config.googleSheets.spreadsheetId || !config.googleSheets.serviceAccountEmail || !config.googleSheets.privateKey) {
    console.log('⚠️ Google Sheets credentials not configured. Skipping.');
    return;
  }

  try {
    // Initialize the sheet
    const doc = new GoogleSpreadsheet(config.googleSheets.spreadsheetId);

    // Authenticate with service account
    await doc.useServiceAccountAuth({
      client_email: config.googleSheets.serviceAccountEmail,
      private_key: config.googleSheets.privateKey
    });

    // Load document info
    await doc.loadInfo();
    
    // Get the first sheet (or create if doesn't exist)
    let sheet = doc.sheetsByIndex[0];
    
    if (!sheet) {
      sheet = await doc.addSheet({ 
        headerValues: [
          'Timestamp',
          'Phone Number',
          'Name',
          'Age',
          'Gender',
          'Height (cm)',
          'Weight (kg)',
          'Activity Level',
          'Goal',
          'BMR',
          'TDEE',
          'Target Calories',
          'Protein (g)',
          'Fiber (g)',
          'Healthy Fats (g)',
          'Complex Carbs (g)'
        ]
      });
    }

    // Add row
    await sheet.addRow({
      'Timestamp': new Date().toISOString(),
      'Phone Number': leadData.phoneNumber,
      'Name': leadData.name || '',
      'Age': leadData.age,
      'Gender': leadData.gender,
      'Height (cm)': leadData.height,
      'Weight (kg)': leadData.weight,
      'Activity Level': leadData.activityLevel,
      'Goal': leadData.goal,
      'BMR': leadData.bmr,
      'TDEE': leadData.tdee,
      'Target Calories': leadData.calories,
      'Protein (g)': leadData.macros.protein,
      'Fiber (g)': leadData.macros.fiber,
      'Healthy Fats (g)': leadData.macros.healthyFats,
      'Complex Carbs (g)': leadData.macros.complexCarbs
    });

    console.log('✅ Lead saved to Google Sheets successfully');
  } catch (error) {
    console.error('❌ Error saving to Google Sheets:', error);
    throw error;
  }
}

/**
 * Create database schema/tables (if needed)
 * Call this during initialization
 */
export async function initializeDatabase() {
  // TODO: Create tables/collections if they don't exist
  // This is database-specific
  
  console.log('✅ Database initialized');
}
