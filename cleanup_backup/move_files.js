const fs = require('fs');
const path = require('path');

const sourceDir = 'd:/PetMat_Project/Pet Breeding Matchmaking Website (3)/src/app';
const targetDir = 'd:/PetMat_Project/Pet Breeding Matchmaking Website (3)/src';

const folders = ['components', 'pages', 'services', 'hooks', 'utils', 'types', 'context', 'data'];

folders.forEach(folder => {
  const sourcePath = path.join(sourceDir, folder);
  const targetPath = path.join(targetDir, folder);
  
  if (fs.existsSync(sourcePath)) {
    const files = fs.readdirSync(sourcePath);
    
    files.forEach(file => {
      const sourceFilePath = path.join(sourcePath, file);
      const targetFilePath = path.join(targetPath, file);
      
      try {
        fs.renameSync(sourceFilePath, targetFilePath);
        console.log(`Moved ${file} to ${folder}`);
      } catch (error) {
        console.error(`Error moving ${file}:`, error.message);
      }
    });
  }
});

console.log('File move operation completed');
