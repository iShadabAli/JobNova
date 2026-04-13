import React, { useState, useEffect, useRef, useCallback } from 'react';

const VoiceSearchOverlay = ({ isOpen, onClose, onResult, language = 'ur', exampleHint }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState('');
    const recognitionRef = useRef(null);
    const hasResultRef = useRef(false);

    const speechSupported = typeof window !== 'undefined' &&
        ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

    const texts = {
        ur: {
            title: 'آواز سے تلاش کریں',
            instruction: 'بولیے...',
            listening: 'سن رہا ہے...',
            processing: 'تلاش کر رہا ہے...',
            cancel: 'منسوخ کریں',
            tapToSpeak: 'مائیکروفون دبائیں',
            notSupported: 'آپ کا براؤزر آواز کی شناخت کی سہولت فراہم نہیں کرتا۔',
            errorGeneric: 'آواز کی شناخت ناکام ہو گئی۔ براہ کرم دوبارہ کوشش کریں۔',
            errorNoSpeech: 'کوئی آواز نہیں سنی گئی۔ براہ کرم دوبارہ کوشش کریں۔',
            errorDenied: 'مائیکروفون کی اجازت نہیں ملی۔ براہ کرم براؤزر سیٹنگز سے اجازت دیں۔',
            tryAgain: 'دوبارہ کوشش کریں',
            exampleHint: 'مثال: "پلمبر کا کام لاہور میں"'
        },
        en: {
            title: 'Search by Voice',
            instruction: 'Speak now...',
            listening: 'Listening...',
            processing: 'Searching...',
            cancel: 'Cancel',
            tapToSpeak: 'Tap microphone',
            notSupported: 'Your browser does not support voice search.',
            errorGeneric: 'Speech recognition failed. Please try again.',
            errorNoSpeech: 'No speech detected. Please try again.',
            errorDenied: 'Microphone permission denied. Please allow access in browser settings.',
            tryAgain: 'Try Again',
            exampleHint: 'Example: "plumber job in Lahore"'
        }
    };

    const t = texts[language] || texts.en;

    const stopRecognition = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.abort();
            } catch (e) {
                // ignore
            }
            recognitionRef.current = null;
        }
        setIsListening(false);
    }, []);

    const startRecognition = useCallback(() => {
        if (!speechSupported) {
            setError(t.notSupported);
            return;
        }

        setError('');
        setTranscript('');
        hasResultRef.current = false;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = language === 'ur' ? 'ur-PK' : 'en-US';
        recognition.interimResults = true;
        recognition.continuous = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setError('');
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            if (finalTranscript) {
                setTranscript(finalTranscript);
                hasResultRef.current = true;
            } else if (interimTranscript) {
                setTranscript(interimTranscript);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);

            if (event.error === 'no-speech') {
                setError(t.errorNoSpeech);
            } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                setError(t.errorDenied);
            } else {
                setError(t.errorGeneric);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            recognitionRef.current = null;

            // If we got a result, send it back
            if (hasResultRef.current) {
                // Small delay so user sees the final transcript before overlay closes
                setTimeout(() => {
                    onResult(transcript || '');
                }, 600);
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [language, speechSupported, t, onResult, transcript]);

    // Auto-start listening when overlay opens
    useEffect(() => {
        if (isOpen) {
            setTranscript('');
            setError('');
            hasResultRef.current = false;
            // Small delay to let animation play before starting
            const timer = setTimeout(() => {
                startRecognition();
            }, 400);
            return () => clearTimeout(timer);
        } else {
            stopRecognition();
        }
    }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    // Send final transcript on recognition end
    useEffect(() => {
        if (!isListening && hasResultRef.current && transcript) {
            const timer = setTimeout(() => {
                onResult(transcript);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [isListening]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleCancel = () => {
        stopRecognition();
        setTranscript('');
        setError('');
        onClose();
    };

    const handleRetry = () => {
        setError('');
        setTranscript('');
        startRecognition();
    };

    if (!isOpen) return null;

    return (
        <div className="voice-overlay" dir={language === 'ur' ? 'rtl' : 'ltr'}>
            <div className="voice-overlay-backdrop" onClick={handleCancel} />
            <div className="voice-overlay-content">
                {/* Title */}
                <h2 className="voice-overlay-title">{t.title}</h2>

                {/* Microphone Area */}
                <div className="voice-mic-area">
                    {isListening && (
                        <>
                            <div className="voice-ring voice-ring-1"></div>
                            <div className="voice-ring voice-ring-2"></div>
                            <div className="voice-ring voice-ring-3"></div>
                        </>
                    )}
                    <button
                        className={`voice-mic-btn ${isListening ? 'active' : ''}`}
                        onClick={isListening ? stopRecognition : startRecognition}
                        aria-label="Microphone"
                    >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                            <line x1="12" y1="19" x2="12" y2="23"></line>
                            <line x1="8" y1="23" x2="16" y2="23"></line>
                        </svg>
                    </button>
                </div>

                {/* Status Text */}
                <p className="voice-status-text">
                    {error ? '' : isListening ? t.listening : (transcript ? t.processing : t.tapToSpeak)}
                </p>

                {/* Transcript Display */}
                {transcript && !error && (
                    <div className="voice-transcript">
                        <span className="voice-transcript-quote">"</span>
                        {transcript}
                        <span className="voice-transcript-quote">"</span>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="voice-error">
                        <p>{error}</p>
                        <button className="btn btn-primary voice-retry-btn" onClick={handleRetry}>
                            {t.tryAgain}
                        </button>
                    </div>
                )}

                {/* Hint */}
                {!transcript && !error && exampleHint && (
                    <p className="voice-hint">{exampleHint}</p>
                )}

                {/* Cancel Button */}
                <button className="voice-cancel-btn" onClick={handleCancel}>
                    {t.cancel}
                </button>
            </div>
        </div>
    );
};

export default VoiceSearchOverlay;
