const TranslationHistory = require('../models/TranslationHistory');
const axios = require('axios');

const LIBRE_API_URL = 'https://libretranslate.de';

const getLanguages = async (req, res) => {
    try {
        const response = await axios.get(`${LIBRE_API_URL}/languages`);
        // LibreTranslate returns [{code: 'en', name: 'English'}, ...]
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching languages from LibreTranslate:', error.message);
        // Fallback languages in case API is down
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
        res.json(fallbackLanguages);
    }
};

const translateText = async (req, res) => {
    const { text, source, target } = req.body;

    if (!text || !source || !target) {
        return res.status(400).json({ error: 'Please provide text, source, and target language' });
    }

    try {
        // LibreTranslate API
        const response = await axios.post(`${LIBRE_API_URL}/translate`, {
            q: text,
            source: source,
            target: target,
            format: 'text'
        });

        if (response.data && response.data.translatedText) {
            const translatedText = response.data.translatedText;

            const newTranslation = new TranslationHistory({
                sourceText: text,
                translatedText: translatedText,
                sourceLanguage: source,
                targetLanguage: target
            });

            await newTranslation.save();

            res.json({ translatedText });
        } else {
            throw new Error('Invalid response from LibreTranslate API');
        }

    } catch (error) {
        console.error('Error translating text with LibreTranslate:', error.message);
        // If the main instance is rate limited (common for libretranslate.de), we could log that
        if (error.response && error.response.status === 429) {
            return res.status(429).json({ error: 'LibreTranslate Rate Limited. Please try again later.' });
        }
        res.status(500).json({ error: 'Translation failed' });
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
