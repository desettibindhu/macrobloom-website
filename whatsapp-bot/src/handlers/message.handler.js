import whatsappService from '../services/whatsapp.service.js';
import conversationState from '../services/conversation.service.js';
import { calculateNutritionTargets, formatNutritionResults, validateInput } from '../utils/calculator.js';
import { saveLeadToDatabase, saveLeadToGoogleSheets } from '../services/database.service.js';

/**
 * Message Handler
 * Processes incoming WhatsApp messages and manages conversation flow
 */
class MessageHandler {
  
  /**
   * Handle incoming WhatsApp message
   * @param {Object} message - WhatsApp message object
   */
  async handleIncomingMessage(message) {
    try {
      const from = message.from;
      const messageId = message.id;
      const messageType = message.type;

      // Mark message as read
      await whatsappService.markAsRead(messageId);

      // Only process text messages
      if (messageType !== 'text') {
        await whatsappService.sendMessage(from, 'Sorry, I can only process text messages at the moment. Please send a text message.');
        return;
      }

      const userMessage = message.text.body.trim();
      console.log(`📥 Received from ${from}: ${userMessage}`);

      // Check if this is a greeting
      if (this.isGreeting(userMessage) && !conversationState.hasActiveConversation(from)) {
        await this.sendWelcomeMessage(from);
        return;
      }

      // Get current conversation state
      const currentStep = conversationState.getCurrentStep(from);

      if (!currentStep) {
        // No active conversation, start new one
        await this.sendWelcomeMessage(from);
        return;
      }

      // Process based on current step
      await this.processStep(from, currentStep, userMessage);

    } catch (error) {
      console.error('❌ Error handling message:', error);
      await whatsappService.sendMessage(message.from, 'Sorry, something went wrong. Please try again.');
    }
  }

  /**
   * Check if message is a greeting
   * @param {string} message - User message
   * @returns {boolean}
   */
  isGreeting(message) {
    const greetings = ['hi', 'hello', 'hey', 'start', 'begin'];
    const normalized = message.toLowerCase().trim();
    return greetings.some(greeting => normalized === greeting || normalized.startsWith(greeting));
  }

  /**
   * Send welcome message and initialize conversation
   * @param {string} phoneNumber - User's WhatsApp number
   */
  async sendWelcomeMessage(phoneNumber) {
    const welcomeMessage = `Welcome to MacroBloom 👋

I can help you calculate your personalized nutrition targets.

Please choose your goal:

1️⃣ Weight Loss
2️⃣ Weight Maintenance
3️⃣ Muscle Gain

Reply with the number of your goal.`;

    await whatsappService.sendMessage(phoneNumber, welcomeMessage);
    conversationState.setState(phoneNumber, {
      step: 'goal',
      data: {},
      startedAt: new Date().toISOString()
    });
  }

  /**
   * Process conversation step
   * @param {string} phoneNumber - User's WhatsApp number
   * @param {string} step - Current conversation step
   * @param {string} input - User input
   */
  async processStep(phoneNumber, step, input) {
    // Validate input
    const validation = validateInput(step, input);

    if (!validation.isValid) {
      await whatsappService.sendMessage(phoneNumber, `❌ ${validation.error}`);
      return;
    }

    // Save validated data
    conversationState.saveData(phoneNumber, step, validation.value);

    // Move to next step
    const nextStep = this.getNextStep(step);
    
    if (nextStep === 'complete') {
      // Calculate and send results
      await this.completeCalculation(phoneNumber);
    } else {
      conversationState.moveToStep(phoneNumber, nextStep);
      await this.sendNextPrompt(phoneNumber, nextStep);
    }
  }

  /**
   * Get next step in conversation flow
   * @param {string} currentStep - Current step
   * @returns {string} Next step
   */
  getNextStep(currentStep) {
    const flow = {
      'goal': 'age',
      'age': 'gender',
      'gender': 'height',
      'height': 'weight',
      'weight': 'activity',
      'activity': 'complete'
    };
    return flow[currentStep] || 'complete';
  }

  /**
   * Send prompt for next step
   * @param {string} phoneNumber - User's WhatsApp number
   * @param {string} step - Next step
   */
  async sendNextPrompt(phoneNumber, step) {
    const prompts = {
      'age': '📅 Great! Now, please tell me your age (in years):',
      
      'gender': '👤 What is your gender?\n\n1️⃣ Male\n2️⃣ Female\n\nReply with 1 or 2.',
      
      'height': '📏 What is your height in centimeters (cm)?\n\nExample: 170',
      
      'weight': '⚖️ What is your weight in kilograms (kg)?\n\nExample: 70',
      
      'activity': `🏃 What is your activity level?

1️⃣ Sedentary (little or no exercise)
2️⃣ Lightly Active (exercise 1-3 days/week)
3️⃣ Moderately Active (exercise 3-5 days/week)
4️⃣ Very Active (exercise 6-7 days/week)

Reply with the number.`
    };

    const prompt = prompts[step] || 'Please provide the requested information.';
    await whatsappService.sendMessage(phoneNumber, prompt);
  }

  /**
   * Complete calculation and send results
   * @param {string} phoneNumber - User's WhatsApp number
   */
  async completeCalculation(phoneNumber) {
    try {
      const userData = conversationState.getUserData(phoneNumber);
      
      // Calculate nutrition targets
      const results = calculateNutritionTargets(userData);
      
      // Format results message
      const resultsMessage = formatNutritionResults(results);
      
      // Send results
      await whatsappService.sendMessage(phoneNumber, resultsMessage);

      // Save lead to database
      try {
        await saveLeadToDatabase({
          phoneNumber,
          ...userData,
          ...results,
          createdAt: new Date().toISOString()
        });
        console.log(`💾 Lead saved to database: ${phoneNumber}`);
      } catch (dbError) {
        console.error('❌ Error saving to database:', dbError);
      }

      // Save to Google Sheets if enabled
      try {
        await saveLeadToGoogleSheets({
          phoneNumber,
          ...userData,
          ...results,
          createdAt: new Date().toISOString()
        });
        console.log(`📊 Lead saved to Google Sheets: ${phoneNumber}`);
      } catch (sheetsError) {
        console.error('❌ Error saving to Google Sheets:', sheetsError);
      }

      // Clear conversation state
      conversationState.clearState(phoneNumber);

      // Send follow-up message
      setTimeout(async () => {
        const followUpMessage = `💬 Need to recalculate or have questions? Just send "hi" to start again!

📱 Ready to start your nutrition journey? Visit macrobloom.in to order your personalized meal plan.`;
        await whatsappService.sendMessage(phoneNumber, followUpMessage);
      }, 3000);

    } catch (error) {
      console.error('❌ Error completing calculation:', error);
      await whatsappService.sendMessage(phoneNumber, 'Sorry, there was an error calculating your targets. Please try again by sending "hi".');
      conversationState.clearState(phoneNumber);
    }
  }

  /**
   * Handle button reply (interactive messages)
   * @param {Object} buttonReply - Button reply object
   * @param {string} from - Sender phone number
   */
  async handleButtonReply(buttonReply, from) {
    const buttonId = buttonReply.id;
    await this.handleIncomingMessage({
      from,
      id: `button_${Date.now()}`,
      type: 'text',
      text: { body: buttonId }
    });
  }
}

export default new MessageHandler();
