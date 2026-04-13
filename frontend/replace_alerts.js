const fs = require('fs');
const path = require('path');

const files = [
    'src/pages/WhiteCollarDashboard.js',
    'src/pages/BlueCollarDashboard.js',
    'src/pages/EmployerDashboard.js',
    'src/pages/Profile.js',
    'src/pages/Register.js',
    'src/pages/Login.js'
];

files.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (!fs.existsSync(fullPath)) {
        console.log(`File not found: ${fullPath}`);
        return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    if (content.includes('alert(')) {
        if (!content.includes("import toast from 'react-hot-toast';")) {
            content = "import toast from 'react-hot-toast';\n" + content;
        }
        
        // This regex looks for alert(...) and checks what type of toast it should be.
        let newContent = content.replace(/alert\((.*?)\)/g, (match, p1) => {
            const p1Lower = p1.toLowerCase();
            if (p1Lower.includes('fail') || p1Lower.includes('error')) {
                return `toast.error(${p1})`;
            } else if (p1Lower.includes('success') || p1Lower.includes('updated') || p1Lower.includes('applied') || p1Lower.includes('saved') || p1Lower.includes('posted')) {
                return `toast.success(${p1})`;
            }
            return `toast(${p1})`;
        });
        
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Replaced alerts in ${file}`);
    }
});
