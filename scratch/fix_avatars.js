const fs = require('fs');
const files = [
  'frontend/src/components/navigation/AppSidebar.tsx', 
  'frontend/src/pages/RoomChatPage.tsx', 
  'frontend/src/pages/DashboardPage.tsx',
  'frontend/src/pages/RoomsPage.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  let newContent = content.replace(/className=(["`])([^"`]*rounded-full[^"`]*)\1/g, (match, quote, classes) => {
    // Only modify elements that look like avatar containers (w-something h-something)
    // to avoid modifying tiny dots (w-2 h-2, etc) unnecessarily, though it's harmless.
    // Specifically looking for w-8, w-10, w-7, etc.
    if (classes.match(/w-[789]|w-1[0-9]|w-20|w-16/)) {
        if (!classes.includes('shrink-0')) classes += ' shrink-0';
        if (!classes.includes('aspect-square')) classes += ' aspect-square';
        return `className=${quote}${classes}${quote}`;
    }
    return match;
  });
  
  if (content !== newContent) {
    fs.writeFileSync(f, newContent);
    console.log('Fixed', f);
  }
});
