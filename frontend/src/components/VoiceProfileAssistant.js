import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import '../index.css';

const VoiceProfileAssistant = ({ profile, onUpdateProfile, onComplete }) => {
    const [isActive, setIsActive] = useState(false);
    const [, setCurrentStep] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [assistantText, setAssistantText] = useState('Click start to begin voice setup.');

    const recognitionRef = useRef(null);
    const synthesisRef = useRef(window.speechSynthesis);
    
    // Use refs so async callbacks always have the latest state
    const isActiveRef = useRef(false);
    const currentStepRef = useRef(0);
    const selectedLangRef = useRef('en');

    const getSteps = (lang) => {
        if (lang === 'ur') {
            return [
                { key: 'full_name', question: "Aap ka poora naam kya hai?", parse: (txt) => txt },
                {
                    key: 'trade', 
                    question: "Aap ka pesha kya hai? Maslan plumber ya electrician?",
                    parse: (txt) => {
                        const lowerTxt = txt.toLowerCase();
                        if (lowerTxt.includes('electrician') || lowerTxt.includes('الیکٹریشن')) return 'Electrician';
                        if (lowerTxt.includes('plumber') || lowerTxt.includes('پلمبر')) return 'Plumber';
                        if (lowerTxt.includes('carpenter') || lowerTxt.includes('بڑھئی') || lowerTxt.includes('کارپینٹر')) return 'Carpenter';
                        if (lowerTxt.includes('painter') || lowerTxt.includes('پینٹر')) return 'Painter';
                        if (lowerTxt.includes('mason') || lowerTxt.includes('مستری') || lowerTxt.includes('mistri')) return 'Mason';
                        if (lowerTxt.includes('driver') || lowerTxt.includes('ڈرائیور')) return 'Driver';
                        return 'Other';
                    }
                },
                { 
                    key: 'hourly_rate', 
                    question: "Aap ka fi ghanta rate kitne rupay hai?", 
                    parse: (txt) => {
                        const num = txt.replace(/[^\d\u06F0-\u06F9]/g, '');
                        return num ? parseInt(num, 10) : '';
                    }
                },
                { key: 'availability', question: "Aap kaam ke liye kis waqt dastyab hote hain?", parse: (txt) => txt },
                { 
                    key: 'radius', 
                    question: "Aap apne ilaqay se kitne kilometer tak kaam karne ja sakte hain?", 
                    parse: (txt) => {
                        const num = txt.replace(/[^\d\u06F0-\u06F9]/g, '');
                        return num ? parseInt(num, 10) : 10;
                    }
                },
                { key: 'location', question: "Aap kis sheher ya ilaqay mein rehte hain?", parse: (txt) => txt },
                { key: 'bio', question: "Apne baaray mein aik mukhtasir jumla bataein.", parse: (txt) => txt }
            ];
        }

        return [
            { key: 'full_name', question: "What is your full name?", parse: (txt) => txt },
            {
                key: 'trade', 
                question: "What is your primary trade? For example: Electrician, Plumber, Carpenter, Painter, Mason, Driver, or Other.",
                parse: (txt) => {
                    const lowerTxt = txt.toLowerCase();
                    const validTrades = ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Mason', 'Driver', 'Other'];
                    const match = validTrades.find(t => lowerTxt.includes(t.toLowerCase()));
                    return match || 'Other';
                }
            },
            { 
                key: 'hourly_rate', 
                question: "What is your hourly rate in rupees?", 
                parse: (txt) => {
                    const num = txt.replace(/[^\d]/g, '');
                    return num ? parseInt(num, 10) : '';
                }
            },
            { key: 'availability', question: "When are you available for work? For example, Monday to Friday mornings.", parse: (txt) => txt },
            { 
                key: 'radius', 
                question: "What is your preferred work radius in kilometers?", 
                parse: (txt) => {
                    const num = txt.replace(/[^\d]/g, '');
                    return num ? parseInt(num, 10) : 10;
                }
            },
            { key: 'location', question: "What city or location are you based in?", parse: (txt) => txt },
            { key: 'bio', question: "Finally, tell us a short sentence about yourself for your bio.", parse: (txt) => txt }
        ];
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Your browser does not support the Web Speech API. Please use Google Chrome or Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const currentTranscript = event.results[event.results.length - 1][0].transcript.trim();
            setTranscript(currentTranscript);
            handleUserResponse(currentTranscript);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error("Speech Recognition Error", event.error);
            setIsListening(false);
            if (event.error !== 'no-speech' && event.error !== 'network') {
                stopAssistant();
            }
        };

        recognitionRef.current = recognition;
        const currentSynthesis = synthesisRef.current;

        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.abort(); } catch(e) {}
            }
            if (currentSynthesis) {
                currentSynthesis.cancel();
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const speak = (text, callback) => {
        if (!synthesisRef.current) return;
        
        synthesisRef.current.cancel(); 
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        
        const voices = synthesisRef.current.getVoices();
        if (voices.length > 0) {
            if (currentStepRef.current !== -1 && selectedLangRef.current === 'en') {
                // English track uses David (Male voice)
                let targetVoice = voices.find(v => v.name.includes('David')) || 
                                  voices.find(v => v.name.toLowerCase().includes('male') || v.name.includes('Google UK English Male'));
                if (targetVoice) {
                    utterance.voice = targetVoice;
                }
                utterance.lang = 'en-US';
            } else {
                // Urdu Track (-1 or 'ur') uses Native Fluent Female Voice
                utterance.lang = 'ur-PK';
                let targetVoice = voices.find(v => v.lang.includes('ur') || v.lang.includes('hi'));
                if (targetVoice) {
                    utterance.voice = targetVoice;
                }
            }
        }

        utterance.onend = () => {
            if (callback) callback();
        };

        setAssistantText(text);
        synthesisRef.current.speak(utterance);
    };

    const handleUserResponse = (txt) => {
        if (!isActiveRef.current) return;

        const stepIndex = currentStepRef.current;

        // Language selection step
        if (stepIndex === -1) {
            const txtLower = txt.toLowerCase();
            if (txtLower.includes('urdu') || txtLower.includes('اردو') || txtLower.includes('or do') || txtLower.includes('urdo') || txtLower.includes('hudo')) {
                selectedLangRef.current = 'ur';
                if (recognitionRef.current) recognitionRef.current.lang = 'ur-PK';
            } else {
                selectedLangRef.current = 'en';
                if (recognitionRef.current) recognitionRef.current.lang = 'en-US';
            }
            
            setCurrentStep(0);
            currentStepRef.current = 0;
            startStep(0);
            return;
        }

        const currentSteps = getSteps(selectedLangRef.current);
        const currentField = currentSteps[stepIndex];
        
        if (currentField) {
            const parsedValue = currentField.parse(txt);
            
            // Update profile
            onUpdateProfile({ [currentField.key]: parsedValue });

            const nextStep = stepIndex + 1;
            setCurrentStep(nextStep);
            currentStepRef.current = nextStep;

            if (nextStep < currentSteps.length) {
                startStep(nextStep);
            } else {
                const completionMsg = selectedLangRef.current === 'ur'
                    ? "زبردست! آپ کی پروفائل مکمل ہو گئی ہے۔ سکرین پر چیک کر کے سیو چینجز پر کلک کریں۔"
                    : "Excellent! Your profile information is collected. Please review it on the screen and click Save Changes when you are ready.";
                
                speak(completionMsg, () => {
                    stopAssistant();
                    if (onComplete) onComplete();
                });
            }
        }
    };

    const startStep = (stepIndex) => {
        const currentSteps = getSteps(selectedLangRef.current);
        if (stepIndex >= currentSteps.length) return;
        
        speak(currentSteps[stepIndex].question, () => {
            resumeListening();
        });
    };

    const resumeListening = () => {
        if (recognitionRef.current && isActiveRef.current) {
            try {
                setTranscript('Listening...');
                setIsListening(true);
                recognitionRef.current.start();
            } catch(e) {}
        }
    };

    const startAssistant = () => {
        setIsActive(true);
        isActiveRef.current = true;
        setCurrentStep(-1);
        currentStepRef.current = -1;
        setTranscript('');
        
        // Fetch voices preemptively
        if (window.speechSynthesis) window.speechSynthesis.getVoices();
        
        speak("Welcome. To continue in English, please say 'English'. Urdu mein baat karne ke liye, 'Urdu' bolein.", () => {
            if (recognitionRef.current && isActiveRef.current) {
                try {
                    recognitionRef.current.lang = 'en-US'; // Set to English for picking
                    setTranscript('Listening for language...');
                    setIsListening(true);
                    recognitionRef.current.start();
                } catch(e) {}
            }
        });
    };

    const stopAssistant = () => {
        setIsActive(false);
        isActiveRef.current = false;
        setIsListening(false);
        setTranscript('');
        setCurrentStep(-1);
        currentStepRef.current = -1;
        
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch(e) {}
        }
        if (synthesisRef.current) {
            synthesisRef.current.cancel();
        }
        setAssistantText('Click Start setup to begin.');
    };

    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) return null;

    return (
        <div className="voice-assistant-card">
            <div className="voice-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <h3 style={{ margin: 0 }}>🎙️ AI Voice Profile Setup</h3>
                <div>
                    {!isActive ? (
                        <button className="btn btn-primary" onClick={startAssistant} type="button">
                            Start Setup
                        </button>
                    ) : (
                        <button className="btn btn-secondary" onClick={stopAssistant} type="button">
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {isActive && (
                <div className="voice-interaction-area" style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <p className="assistant-text" style={{ fontSize: '1.1rem', color: '#1e293b', fontWeight: '500', marginBottom: '10px' }}>
                        🤖 <strong>Assistant:</strong> {assistantText}
                    </p>
                    
                    <div className="user-text-area" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div 
                            className={`mic-indicator ${isListening ? 'pulsing' : ''}`} 
                            onClick={!isListening ? resumeListening : null}
                            style={{ 
                                width: '28px', 
                                height: '28px', 
                                borderRadius: '50%', 
                                backgroundColor: isListening ? '#ef4444' : '#cbd5e1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '14px',
                                cursor: !isListening ? 'pointer' : 'default',
                                boxShadow: !isListening ? '0 0 5px rgba(0,0,0,0.2)' : 'none'
                            }}
                            title={!isListening ? "Click to resume listening" : ""}
                        >
                            {isListening ? '🎤' : '▶️'}
                        </div>
                        <p style={{ margin: 0, color: isListening ? '#3b82f6' : '#ef4444', fontStyle: 'italic' }}>
                            {isListening ? 'Listening... Speak now.' : 'Mic paused (silence detected). Click the ▶️ icon to speak again.'} <br/>
                            {transcript && transcript !== 'Listening...' && <span style={{color: '#0f172a', fontStyle: 'normal'}}><br/>🗣️ "{transcript}"</span>}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceProfileAssistant;
