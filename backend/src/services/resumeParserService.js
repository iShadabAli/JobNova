const pdfParse = require('pdf-parse');

const resumeParserService = {
    /**
     * Parses a PDF buffer and extracts likely skills and experience.
     * @param {Buffer} fileBuffer - The buffer of the uploaded PDF file.
     * @returns {Object} - An object containing extracted { skills, experience, education }
     */
    parseResume: async (fileBuffer) => {
        try {
            const data = await pdfParse(fileBuffer);
            const text = data.text.toLowerCase();

            return {
                skills: resumeParserService.extractSkills(text),
                experience: resumeParserService.extractExperience(text),
                education: resumeParserService.extractEducation(text)
            };
        } catch (error) {
            console.error('Error parsing PDF:', error);
            // Return empty graceful fallback if parsing fails
            return { skills: '', experience: '', education: '' };
        }
    },

    extractSkills: (text) => {
        // A predefined hardcoded list of common professional skills to look for.
        const commonSkills = [
            'react', 'node.js', 'javascript', 'python', 'java', 'c++', 'html', 'css',
            'express', 'mongodb', 'sql', 'mysql', 'postgresql', 'docker', 'kubernetes',
            'aws', 'azure', 'gcp', 'git', 'github', 'agile', 'scrum', 'leadership',
            'management', 'marketing', 'sales', 'seo', 'data analysis', 'excel',
            'communication', 'design', 'figma', 'photoshop', 'illustrator', 'ui/ux',
            'machine learning', 'artificial intelligence', 'data science', 'cybersecurity'
        ];

        const foundSkills = [];
        commonSkills.forEach(skill => {
            // Use regex to look for standalone words/phrases to prevent partial matches
            const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (regex.test(text)) {
                // Capitalize the first letter of each word to look nice
                const formattedSkill = skill.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                foundSkills.push(formattedSkill);
            }
        });

        // Convert Node.js back if it got mangled or format specific tricky ones
        const finalSkills = foundSkills.map(s => {
            if (s.toLowerCase() === 'node.js') return 'Node.js';
            if (s.toLowerCase() === 'ui/ux') return 'UI/UX';
            return s;
        });

        return finalSkills.join(', ');
    },

    extractExperience: (text) => {
        // Extremely simple heuristic: look for sentences containing "years" and a number
        const experienceRegex = /(\d+|one|two|three|four|five|six|seven|eight|nine|ten)[\s-]*years?(?:\s+of)?\s+experience/i;
        const match = text.match(experienceRegex);

        if (match) {
            let numStr = match[1].toLowerCase();
            const wordToNum = { one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: '10' };
            const num = wordToNum[numStr] || numStr;
            return `${num} Years`;
        }

        return '';
    },

    extractEducation: (text) => {
        // Another heuristic: look for degree keywords
        const degrees = ['bachelor', 'bsc', 'b.s.', 'b.a.', 'ba', 'master', 'msc', 'm.s.', 'm.a.', 'ma', 'phd', 'associate', 'ph.d'];
        let highestDegree = '';

        for (const degree of degrees) {
            const regex = new RegExp(`\\b${degree.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (regex.test(text)) {
                if (degree.includes('phd') || degree.includes('ph.d')) {
                    highestDegree = 'Ph.D'; break; // Highest degree found
                }
                if (degree.includes('master') || degree.includes('msc') || degree.includes('m.')) {
                    highestDegree = "Master's Degree";
                }
                if (!highestDegree && (degree.includes('bachelor') || degree.includes('bsc') || degree.includes('b.'))) {
                    highestDegree = "Bachelor's Degree";
                }
                if (!highestDegree && degree.includes('associate')) {
                    highestDegree = "Associate Degree";
                }
            }
        }

        return highestDegree;
    }
};

module.exports = resumeParserService;
