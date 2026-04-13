/**
 * Voice Command Parser for Module 10
 * Parses Urdu/English voice transcripts to extract job search filters
 */

// Urdu skill names mapped to English equivalents
const SKILL_MAP = {
    // Urdu -> English
    'پلمبر': 'plumber',
    'پلمبنگ': 'plumber',
    'الیکٹریشن': 'electrician',
    'بجلی': 'electrician',
    'ڈرائیور': 'driver',
    'ڈرائیونگ': 'driver',
    'مستری': 'mason',
    'راج مستری': 'mason',
    'پینٹر': 'painter',
    'رنگ': 'painter',
    'ویلڈر': 'welder',
    'ویلڈنگ': 'welder',
    'کارپینٹر': 'carpenter',
    'بڑھئی': 'carpenter',
    'لکڑی': 'carpenter',
    'مکینک': 'mechanic',
    'گارڈ': 'guard',
    'چوکیدار': 'guard',
    'سیکیورٹی': 'security',
    'صفائی': 'cleaner',
    'صفائی والا': 'cleaner',
    'باورچی': 'cook',
    'کھانا': 'cook',
    'مالی': 'gardener',
    'باغبان': 'gardener',
    'ٹیلر': 'tailor',
    'درزی': 'tailor',
    'سلائی': 'tailor',
    'لوڈر': 'loader',
    'مزدور': 'labor',
    'لیبر': 'labor',
    'اے سی': 'ac technician',
    'ٹیکنیشن': 'technician',
    'دھوبی': 'laundry',
    // English (for when user speaks in English with ur-PK mode or en-US mode)
    'plumber': 'plumber',
    'electrician': 'electrician',
    'driver': 'driver',
    'mason': 'mason',
    'painter': 'painter',
    'welder': 'welder',
    'carpenter': 'carpenter',
    'mechanic': 'mechanic',
    'guard': 'guard',
    'security': 'security',
    'cleaner': 'cleaner',
    'cook': 'cook',
    'gardener': 'gardener',
    'tailor': 'tailor',
    'loader': 'loader',
    'labor': 'labor',
    'technician': 'technician',
};

// Common Pakistani city names in Urdu and English
const LOCATION_MAP = {
    'لاہور': 'Lahore',
    'کراچی': 'Karachi',
    'اسلام آباد': 'Islamabad',
    'راولپنڈی': 'Rawalpindi',
    'فیصل آباد': 'Faisalabad',
    'ملتان': 'Multan',
    'پشاور': 'Peshawar',
    'کوئٹہ': 'Quetta',
    'سیالکوٹ': 'Sialkot',
    'گوجرانوالہ': 'Gujranwala',
    'حیدرآباد': 'Hyderabad',
    'بہاولپور': 'Bahawalpur',
    'سرگودھا': 'Sargodha',
    'جھنگ': 'Jhang',
    'شیخوپورہ': 'Sheikhupura',
    // English variants
    'lahore': 'Lahore',
    'karachi': 'Karachi',
    'islamabad': 'Islamabad',
    'rawalpindi': 'Rawalpindi',
    'faisalabad': 'Faisalabad',
    'multan': 'Multan',
    'peshawar': 'Peshawar',
    'quetta': 'Quetta',
    'sialkot': 'Sialkot',
    'gujranwala': 'Gujranwala',
    'hyderabad': 'Hyderabad',
    'bahawalpur': 'Bahawalpur',
};

// Duration keywords
const DURATION_MAP = {
    'گھنٹے': 'Hours',
    'گھنٹہ': 'Hours',
    'hour': 'Hours',
    'hours': 'Hours',
    'دن': 'Days',
    'day': 'Days',
    'days': 'Days',
    'مہینے': 'Months',
    'مہینہ': 'Months',
    'month': 'Months',
    'months': 'Months',
    'ہفتہ': 'Days',
    'ہفتے': 'Days',
    'week': 'Days',
    'weeks': 'Days',
};

/**
 * Parse a voice transcript into structured job search filters
 * @param {string} transcript - Raw text from speech recognition
 * @returns {{ searchText: string, skillFilter: string|null, locationFilter: string|null, durationFilter: string|null }}
 */
export const parseVoiceCommand = (transcript) => {
    if (!transcript || !transcript.trim()) {
        return { searchText: '', skillFilter: null, locationFilter: null, durationFilter: null };
    }

    const text = transcript.trim();
    let skillFilter = null;
    let locationFilter = null;
    let durationFilter = null;

    // Check for skill matches (check multi-word phrases first, then single words)
    const skillKeys = Object.keys(SKILL_MAP).sort((a, b) => b.length - a.length);
    for (const key of skillKeys) {
        if (text.includes(key)) {
            skillFilter = SKILL_MAP[key];
            break;
        }
    }

    // Also check case-insensitive for English words
    if (!skillFilter) {
        const lowerText = text.toLowerCase();
        for (const key of skillKeys) {
            if (lowerText.includes(key.toLowerCase())) {
                skillFilter = SKILL_MAP[key];
                break;
            }
        }
    }

    // Check for location matches
    const locationKeys = Object.keys(LOCATION_MAP).sort((a, b) => b.length - a.length);
    for (const key of locationKeys) {
        if (text.includes(key)) {
            locationFilter = LOCATION_MAP[key];
            break;
        }
    }
    if (!locationFilter) {
        const lowerText = text.toLowerCase();
        for (const key of locationKeys) {
            if (lowerText.includes(key.toLowerCase())) {
                locationFilter = LOCATION_MAP[key];
                break;
            }
        }
    }

    // Check for duration matches
    const durationKeys = Object.keys(DURATION_MAP).sort((a, b) => b.length - a.length);
    for (const key of durationKeys) {
        if (text.includes(key)) {
            durationFilter = DURATION_MAP[key];
            break;
        }
    }
    if (!durationFilter) {
        const lowerText = text.toLowerCase();
        for (const key of durationKeys) {
            if (lowerText.includes(key.toLowerCase())) {
                durationFilter = DURATION_MAP[key];
                break;
            }
        }
    }

    // Build a search text — use the skill English name if found, otherwise the raw transcript
    // This helps the fuzzy search engine match against English job titles
    let searchText = transcript.trim();
    if (skillFilter) {
        // Append skill English name so fuzzy search can pick it up
        searchText = `${skillFilter} ${searchText}`;
    }
    if (locationFilter) {
        searchText = `${searchText} ${locationFilter}`;
    }

    return {
        searchText,
        skillFilter,
        locationFilter,
        durationFilter,
    };
};

export default parseVoiceCommand;
