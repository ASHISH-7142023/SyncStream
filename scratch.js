const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    content = content.replace(/className="h-9 w-40 object-contain"/g, 'className="h-9 w-40 object-contain shrink-0"');
    content = content.replace(/className="h-7 w-32 object-contain"/g, 'className="h-7 w-32 object-contain shrink-0"');
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

const files = [
    'd:/ASHISH GITHUB/SyncStream/frontend/src/pages/LoginPage.tsx',
    'd:/ASHISH GITHUB/SyncStream/frontend/src/pages/ProfilePage.tsx',
    'd:/ASHISH GITHUB/SyncStream/frontend/src/pages/RoomChatPage.tsx',
    'd:/ASHISH GITHUB/SyncStream/frontend/src/pages/RoomsPage.tsx',
    'd:/ASHISH GITHUB/SyncStream/frontend/src/pages/RegisterPage.tsx',
    'd:/ASHISH GITHUB/SyncStream/frontend/src/pages/LandingPage.tsx',
    'd:/ASHISH GITHUB/SyncStream/frontend/src/pages/FriendsPage.tsx',
    'd:/ASHISH GITHUB/SyncStream/frontend/src/pages/DashboardPage.tsx',
    'd:/ASHISH GITHUB/SyncStream/frontend/src/components/navigation/AppSidebar.tsx'
];

files.forEach(replaceInFile);
console.log('Finished updating logos.');
