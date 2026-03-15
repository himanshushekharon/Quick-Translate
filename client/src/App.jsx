import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ArrowLeftRight, Copy, Moon, Sun, Loader2, ChevronDown, Search, Check } from 'lucide-react';
import './App.css';
import PixelSnow from './PixelSnow';
import Squares from './Squares';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [theme, setTheme] = useState('light');
  const [languages, setLanguages] = useState([]);
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    fetchLanguages();
    fetchHistory();

    // Auto-refresh history every 30 seconds
    const interval = setInterval(() => {
      fetchHistory();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchLanguages = async () => {
    try {
      const res = await axios.get(`${API_URL}/languages`);
      setLanguages(res.data);
    } catch (err) {
      console.error('Error fetching languages', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history`);
      setHistory(res.data);
    } catch (err) {
      console.error('Error fetching history', err);
      // for testing, ignore history error if backend goes offline
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await axios.post(`${API_URL}/translate`, {
        text: sourceText,
        source: sourceLang,
        target: targetLang,
      });
      setTranslatedText(res.data.translatedText);
      fetchHistory(); // Refresh history
    } catch (err) {
      console.error(err);
      setError('Failed to translate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleCopy = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const SearchableLanguageSelect = ({ label, value, onChange, languages, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    const filteredLanguages = languages.filter(lang => 
      lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedLang = languages.find(l => l.code === value);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="custom-select-container" ref={dropdownRef}>
        <button 
          className="search-trigger" 
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <span>{selectedLang ? selectedLang.name : label}</span>
          <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="dropdown-menu">
            <div className="search-input-wrapper">
              <div className="relative">
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input
                  type="text"
                  className="lang-search-field"
                  placeholder={placeholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>
            </div>
            <div className="languages-list">
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map((l) => (
                  <div 
                    key={l.code} 
                    className={`lang-option ${l.code === value ? 'selected' : ''}`}
                    onClick={() => {
                      onChange(l.code);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                  >
                    <span>{l.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="lang-code">{l.code}</span>
                      {l.code === value && <Check size={14} />}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', opacity: 0.5, fontSize: '0.9rem' }}>
                  No languages found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app-container">
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
        <div style={{ width: '100%', height: '100%', opacity: theme === 'dark' ? 0.3 : 0.6 }}>
          <Squares 
            speed={0.5} 
            squareSize={50}
            direction='diagonal'
            borderColor={theme === 'dark' ? '#333' : '#e5e5e5'}
            hoverFillColor='#ce8946'
          />
        </div>
      </div>

      <header className="header">
        <h1>Quick Translate</h1>
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
        </button>
      </header>

      <main className="main-content">
        <div className="translator-card">
          {error && <div className="error-message">{error}</div>}

          <div className="selectors-container">
            <SearchableLanguageSelect 
              label="Source Language"
              value={sourceLang}
              onChange={setSourceLang}
              languages={languages}
              placeholder="Search source language..."
            />

            <button className="swap-btn" onClick={handleSwap} title="Swap Languages">
              <ArrowLeftRight size={24} />
            </button>

            <SearchableLanguageSelect 
              label="Target Language"
              value={targetLang}
              onChange={setTargetLang}
              languages={languages}
              placeholder="Search target language..."
            />
          </div>

          <div className="text-areas-container">
            <div className="text-box">
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter text here..."
                className="text-input"
              />
              <div className="char-count">{sourceText.length} characters</div>
            </div>

            <div className="text-box translated-box">
              {isLoading ? (
                <div className="loading-container">
                  <Loader2 className="spinner" size={32} />
                  <span>Translating...</span>
                </div>
              ) : (
                <>
                  <textarea
                    value={translatedText}
                    readOnly
                    placeholder="Translation will appear here"
                    className="text-output"
                  />
                  {translatedText && (
                    <button className="copy-btn" onClick={handleCopy} title="Copy to clipboard">
                      <Copy size={20} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <button
            className="translate-btn"
            onClick={handleTranslate}
            disabled={isLoading || !sourceText.trim()}
          >
            {isLoading ? 'Translating...' : 'Translate'}
          </button>
        </div>

        <div className="history-section">
          <div className="history-header">
            <h2>Recent Translations</h2>
            <span className="history-note">Expires after 5m</span>
          </div>
          {history.length === 0 ? (
            <p className="no-history">No recent translations.</p>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <div key={item._id} className="history-item">
                  <div className="history-meta">
                    <span className="history-langs">
                      {item.sourceLanguage} → {item.targetLanguage}
                    </span>
                    <span className="history-time">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="history-texts">
                    <div className="history-original">{item.sourceText}</div>
                    <div className="history-translated">{item.translatedText}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
