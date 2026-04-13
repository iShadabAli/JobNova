const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = content.replace(/localStorage\.(getItem|setItem|removeItem)\('token'/g, "sessionStorage.$1('token'");
            if (content !== updated) {
                fs.writeFileSync(fullPath, updated, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

replaceInDir('d:/FYP/JobNova/frontend/src');
