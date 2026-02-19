const fs = require('fs');
const path = require('path');

const utilsPath = path.join(__dirname, 'src', 'utils');

const filesToDelete = [
  'lazyLoading.ts',
  'lazyLoading.tsx',
  'lazyLoading_new.tsx'
];

filesToDelete.forEach(file => {
  const filePath = path.join(utilsPath, file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted: ${filePath}`);
    } catch (error) {
      console.error(`Failed to delete ${filePath}:`, error);
    }
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('File deletion completed.');
