import NodeCache from 'node-cache';

/**
 * Conversation State Manager
 * Stores user conversation states in memory
 * For production, replace with Redis or database
 */
class ConversationState {
  constructor() {
    // Cache with 30 minute TTL
    this.cache = new NodeCache({ stdTTL: 1800, checkperiod: 120 });
  }

  /**
   * Get user conversation state
   * @param {string} phoneNumber - User's WhatsApp number
   * @returns {Object|null} User state
   */
  getState(phoneNumber) {
    return this.cache.get(phoneNumber) || null;
  }

  /**
   * Set user conversation state
   * @param {string} phoneNumber - User's WhatsApp number
   * @param {Object} state - State object
   */
  setState(phoneNumber, state) {
    this.cache.set(phoneNumber, state);
  }

  /**
   * Update specific fields in user state
   * @param {string} phoneNumber - User's WhatsApp number
   * @param {Object} updates - Fields to update
   */
  updateState(phoneNumber, updates) {
    const currentState = this.getState(phoneNumber) || {};
    const newState = { ...currentState, ...updates };
    this.setState(phoneNumber, newState);
  }

  /**
   * Clear user conversation state
   * @param {string} phoneNumber - User's WhatsApp number
   */
  clearState(phoneNumber) {
    this.cache.del(phoneNumber);
  }

  /**
   * Initialize new conversation
   * @param {string} phoneNumber - User's WhatsApp number
   */
  initializeConversation(phoneNumber) {
    this.setState(phoneNumber, {
      step: 'greeting',
      data: {},
      startedAt: new Date().toISOString()
    });
  }

  /**
   * Check if user has an active conversation
   * @param {string} phoneNumber - User's WhatsApp number
   * @returns {boolean}
   */
  hasActiveConversation(phoneNumber) {
    return this.cache.has(phoneNumber);
  }

  /**
   * Get current conversation step
   * @param {string} phoneNumber - User's WhatsApp number
   * @returns {string|null} Current step
   */
  getCurrentStep(phoneNumber) {
    const state = this.getState(phoneNumber);
    return state ? state.step : null;
  }

  /**
   * Move to next step in conversation
   * @param {string} phoneNumber - User's WhatsApp number
   * @param {string} nextStep - Next step identifier
   */
  moveToStep(phoneNumber, nextStep) {
    this.updateState(phoneNumber, { step: nextStep });
  }

  /**
   * Save user data
   * @param {string} phoneNumber - User's WhatsApp number
   * @param {string} key - Data key
   * @param {*} value - Data value
   */
  saveData(phoneNumber, key, value) {
    const state = this.getState(phoneNumber);
    if (state) {
      state.data[key] = value;
      this.setState(phoneNumber, state);
    }
  }

  /**
   * Get user data
   * @param {string} phoneNumber - User's WhatsApp number
   * @returns {Object} User data
   */
  getUserData(phoneNumber) {
    const state = this.getState(phoneNumber);
    return state ? state.data : {};
  }

  /**
   * Get all active conversations (for monitoring)
   * @returns {Array} Array of phone numbers with active conversations
   */
  getActiveConversations() {
    return this.cache.keys();
  }

  /**
   * Get conversation statistics
   * @returns {Object} Stats object
   */
  getStats() {
    return {
      activeConversations: this.cache.keys().length,
      cacheStats: this.cache.getStats()
    };
  }
}

export default new ConversationState();
