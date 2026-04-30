import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en'); // default is english

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'ur' : 'en');
    };

    const translations = {
        en: {
            // Hero
            heroTitle: "Empowering Your Career Journey",
            heroSubtitle: "Connect with the right opportunities. Whether you're building a professional career or offering skilled services, JobNova brings the jobs to you.",
            findJobs: "Find Jobs",
            hireWorkers: "Hire Workers",
            goToDashboard: "Go to Dashboard",
            login: "Login",
            register: "Register",
            
            // Categories
            categoriesTitle: "Explore Opportunities",
            blueCollar: "Blue-Collar Jobs",
            whiteCollar: "White-Collar Jobs",
            international: "International Jobs",
            scholarships: "Scholarships",
            hunarmand: "ہُنَر مَند", // explicitly requested
            timeExchange: "Time Exchange",

            // Testimonials
            testimonialsTitle: "What Our Users Say",
            testimonial1: "JobNova helped me find reliable work in my city instantly!",
            testimonial2: "A fantastic platform for hiring skilled professionals.",

            // Footer
            aboutUs: "About Us",
            contactUs: "Contact Us",
            rightsReserved: "© 2026 JobNova. All rights reserved.",

            // Role specific
            forWhiteCollar: "For Professionals",
            forBlueCollar: "For Skilled Labor"
        },
        ur: {
            // Hero
            heroTitle: "آپ کے کیریئر کے سفر کو بااختیار بنانا",
            heroSubtitle: "صحیح مواقع سے جڑیں۔ چاہے آپ پیشہ ورانہ کیریئر بنا رہے ہوں یا ہنر مند خدمات پیش کر رہے ہوں، جاب نووا نوکریاں آپ تک لاتا ہے۔",
            findJobs: "نوکریاں تلاش کریں",
            hireWorkers: "ورکرز کی خدمات حاصل کریں",
            goToDashboard: "ڈیش بورڈ پر جائیں",
            login: "لاگ ان",
            register: "رجسٹر",

            // Categories
            categoriesTitle: "مواقع دریافت کریں",
            blueCollar: "بلو کالر نوکریاں",
            whiteCollar: "وائٹ کالر نوکریاں",
            international: "بین الاقوامی نوکریاں",
            scholarships: "وظائف",
            hunarmand: "ہُنَر مَند",
            timeExchange: "وقت کا تبادلہ (Time Exchange)",

            // Testimonials
            testimonialsTitle: "ہمارے صارفین کیا کہتے ہیں",
            testimonial1: "جاب نووا نے مجھے اپنے شہر میں فوری طور پر قابل اعتماد کام تلاش کرنے میں مدد کی!",
            testimonial2: "ہنر مند پیشہ ور افراد کی خدمات حاصل کرنے کے لئے ایک شاندار پلیٹ فارم۔",

            // Footer
            aboutUs: "ہمارے بارے میں",
            contactUs: "ہم سے رابطہ کریں",
            rightsReserved: "© 2026 جاب نووا۔ جملہ حقوق محفوظ ہیں۔",

            // Role specific
            forWhiteCollar: "پیشہ ور افراد کے لیے",
            forBlueCollar: "ہنر مند مزدوروں کے لیے"
        }
    };

    const t = (key, defaultValue) => {
        return translations[language][key] || defaultValue || key;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
