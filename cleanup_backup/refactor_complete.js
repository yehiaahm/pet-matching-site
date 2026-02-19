const fs = require('fs');
const path = require('path');

const projectRoot = 'd:/PetMat_Project/Pet Breeding Matchmaking Website (3)/src';
const folders = ['components', 'pages', 'services', 'hooks', 'utils', 'types', 'context', 'data'];

// Function to copy file content
function copyFile(sourcePath, targetPath) {
  try {
    const content = fs.readFileSync(sourcePath, 'utf8');
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log(`✅ Copied: ${path.basename(sourcePath)}`);
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
    let copiedCount = 0;
    
    files.forEach(file => {
      const sourceFile = path.join(sourceDir, file);
      const targetFile = path.join(targetDir, file);
      
      if (fs.statSync(sourceFile).isFile()) {
        if (copyFile(sourceFile, targetFile)) {
          copiedCount++;
        }
      } else if (fs.statSync(sourceFile).isDirectory()) {
        copyDirectory(sourceFile, targetFile);
      }
    });
    
    return copiedCount;
  } catch (error) {
    console.error(`Error copying directory ${sourceDir}:`, error.message);
    return 0;
  }
}

// Main refactoring function
function refactorProject() {
  console.log('🚀 Starting project refactoring...\n');
  
  let totalCopied = 0;
  
  folders.forEach(folder => {
    const sourceDir = path.join(projectRoot, 'app', folder);
    const targetDir = path.join(projectRoot, folder);
    
    console.log(`📁 Processing ${folder}...`);
    
    if (fs.existsSync(sourceDir)) {
      const copied = copyDirectory(sourceDir, targetDir);
      totalCopied += copied;
      console.log(`   Copied ${copied} files\n`);
    } else {
      console.log(`   ⚠️  Source directory does not exist\n`);
    }
  });
  
  console.log(`🎉 Project refactoring completed! Total files copied: ${totalCopied}`);
  console.log('\n📋 Next steps:');
  console.log('1. Update import paths in all files');
  console.log('2. Test the application');
  console.log('3. Remove old folders if everything works');
}

// Execute the refactoring
refactorProject();
