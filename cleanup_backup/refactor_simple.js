const fs = require('fs');
const path = require('path');

const projectRoot = 'd:/PetMat_Project/Pet Breeding Matchmaking Website (3)/src';
const folders = ['components', 'pages', 'services', 'hooks', 'utils', 'types', 'context', 'data'];

// Function to copy file content
function copyFile(sourcePath, targetPath) {
  try {
    const content = fs.readFileSync(sourcePath, 'utf8');
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log(`✅ Copied: ${sourcePath} -> ${targetPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error copying ${sourcePath}:`, error.message);
    return false;
  }
}

// Function to ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Function to copy directory recursively
function copyDirectory(sourceDir, targetDir) {
  ensureDir(targetDir);
  
  try {
    const files = fs.readdirSync(sourceDir);
    
    files.forEach(file => {
      const sourceFile = path.join(sourceDir, file);
      const targetFile = path.join(targetDir, file);
      
      if (fs.statSync(sourceFile).isFile()) {
        copyFile(sourceFile, targetFile);
      } else if (fs.statSync(sourceFile).isDirectory()) {
        copyDirectory(sourceFile, targetFile);
      }
    });
  } catch (error) {
    console.error(`Error copying directory ${sourceDir}:`, error.message);
  }
}

// Main refactoring function
function refactorProject() {
  console.log('🚀 Starting project refactoring...');
  
  folders.forEach(folder => {
    const sourceDir = path.join(projectRoot, 'app', folder);
    const targetDir = path.join(projectRoot, folder);
    
    console.log(`\n📁 Processing ${folder}...`);
    
    if (fs.existsSync(sourceDir)) {
      copyDirectory(sourceDir, targetDir);
    } else {
      console.log(`⚠️  Source directory ${sourceDir} does not exist`);
    }
  });
  
  console.log('\n🎉 Project refactoring completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Update import paths in all files');
  console.log('2. Test the application');
  console.log('3. Remove old folders if everything works');
}

// Execute the refactoring
refactorProject();
