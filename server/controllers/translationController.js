const TranslationHistory = require('../models/TranslationHistory');
const Translation = require('../models/Translation');
const axios = require('axios');

// Use Google Translate unofficial API for better stability
const GOOGLE_TRANSLATE_URL = 'https://translate.googleapis.com/translate_a/single?client=gtx&dt=t';

const getLanguages = async (req, res) => {
    // Standard language list since Google Translate doesn't have a simple keyless languages endpoint
    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ru', name: 'Russian' },
        { code: 'zh', name: 'Chinese' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ko', name: 'Korean' },
        { code: 'ar', name: 'Arabic' },
        { code: 'hi', name: 'Hindi' },
        { code: 'bn', name: 'Bengali' },
        { code: 'pa', name: 'Punjabi' },
        { code: 'ta', name: 'Tamil' },
        { code: 'te', name: 'Telugu' },
        { code: 'gu', name: 'Gujarati' },
        { code: 'kn', name: 'Kannada' },
        { code: 'ml', name: 'Malayalam' }
    ];
    res.json(languages);
};

const translateText = async (req, res) => {
    const { text, source, target } = req.body;

    if (!text || !source || !target) {
        return res.status(400).json({ error: 'Please provide text, source, and target language' });
    }

    try {
        const encodedText = encodeURIComponent(text);
        const url = `${GOOGLE_TRANSLATE_URL}&sl=${source}&tl=${target}&q=${encodedText}`;
        const response = await axios.get(url);

        if (response.data && response.data[0]) {
            let translatedText = '';
            response.data[0].forEach((sentence) => {
                if (sentence[0]) {
                    translatedText += sentence[0];
                }
            });

            // Save to Translation (Persistent)
            const permanentTranslation = new Translation({
                originalText: text,
                translatedText: translatedText,
                sourceLanguage: source,
                targetLanguage: target
            });
            await permanentTranslation.save();

            // Save to TranslationHistory (Temporary - 5m TTL)
            const historyItem = new TranslationHistory({
                sourceText: text,
                translatedText: translatedText,
                sourceLanguage: source,
                targetLanguage: target
            });
            await historyItem.save();

            res.json({ translatedText });
        } else {
            throw new Error('Invalid response from Google Translate API');
        }

    } catch (error) {
        console.error('Error translating text:', error.message);
        res.status(500).json({ error: 'Translation failed', message: error.message });
    }
};

const getHistory = async (req, res) => {
    try {
        // Limit to latest 5 as requested in previous task
        const history = await TranslationHistory.find().sort({ createdAt: -1 }).limit(5);
        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};

module.exports = {
    getLanguages,
    translateText,
    getHistory
};
