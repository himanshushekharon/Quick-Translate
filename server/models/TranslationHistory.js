const mongoose = require('mongoose');

const translationHistorySchema = new mongoose.Schema({
    sourceText: {
        type: String,
        required: true
    },
    translatedText: {
        type: String,
        required: true
    },
    sourceLanguage: {
        type: String,
        required: true
    },
    targetLanguage: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: '5m' } // Automatically delete after 5 minutes
    }
});

module.exports = mongoose.model('TranslationHistory', translationHistorySchema);
