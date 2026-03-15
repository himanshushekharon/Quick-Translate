const TranslationHistory = require('../models/TranslationHistory');
const Translation = require('../models/Translation');
const axios = require('axios');

// Switched to Lingva (Google Translate Mirror) for better stability
const LINGVA_API_URL = 'https://lingva.ml/api/v1';

const getLanguages = async (req, res) => {
    // Fallback languages
    const fallbackLanguages = [
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
    ];

    try {
        const response = await axios.get(`${LINGVA_API_URL}/languages`);
        // Lingva returns { languages: [...] }
        if (response.data && Array.isArray(response.data.languages)) {
            res.json(response.data.languages);
        } else {
            res.json(fallbackLanguages);
        }
    } catch (error) {
        console.error('Error fetching languages from Lingva:', error.message);
        res.json(fallbackLanguages);
    }
};

const translateText = async (req, res) => {
    const { text, source, target } = req.body;

    if (!text || !source || !target) {
        return res.status(400).json({ error: 'Please provide text, source, and target language' });
    }

    try {
        // Lingva API Format: /api/v1/:source/:target/:text
        const encodedText = encodeURIComponent(text);
        const response = await axios.get(`${LINGVA_API_URL}/${source}/${target}/${encodedText}`);

        if (response.data && response.data.translation) {
            const translatedText = response.data.translation;

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
        }
 else {
            throw new Error('Invalid response from Lingva API');
        }

    } catch (error) {
        console.error('Error translating text with Lingva:', error.message);
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
