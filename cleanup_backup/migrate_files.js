const fs = require('fs');
const path = require('path');

const sourceBase = 'd:/PetMat_Project/Pet Breeding Matchmaking Website (3)/src/app';
const targetBase = 'd:/PetMat_Project/Pet Breeding Matchmaking Website (3)/src';

// Define the folders to move
const folders = [
  'components',
  'pages', 
  'services',
  'hooks',
  'utils',
  'types',
  'context',
  'data'
];

// Function to copy a single file
function copyFile(sourcePath, targetPath) {
  try {
    // Ensure target directory exists
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Copy the file
    const content = fs.readFileSync(sourcePath, 'utf8');
    fs.writeFileSync(targetPath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error copying ${sourcePath}:`, error.message);
    return false;
  }
}

// Function to recursively copy directory
function copyDirectory(sourceDir, targetDir) {
  let copiedCount = 0;
  
  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Read source directory
  const items = fs.readdirSync(sourceDir);
  
  for (const item of items) {
    const sourcePath = path.join(sourceDir, item);
    const targetPath = path.join(targetDir, item);
    
    const stat = fs.statSync(sourcePath);
    
    if (stat.isFile()) {
      if (copyFile(sourcePath, targetPath)) {
        copiedCount++;
        process.stdout.write('.');
      }
    } else if (stat.isDirectory()) {
      copiedCount += copyDirectory(sourcePath, targetPath);
    }
  }
  
  return copiedCount;
}

// Main execution
console.log('🚀 Starting file migration...\n');

let totalCopied = 0;

for (const folder of folders) {
  const sourceDir = path.join(sourceBase, folder);
  const targetDir = path.join(targetBase, folder);
  
  console.log(`📁 Processing ${folder}...`);
  
  if (fs.existsSync(sourceDir)) {
    const copied = copyDirectory(sourceDir, targetDir);
    totalCopied += copied;
    console.log(` ✅ Copied ${copied} files`);
  } else {
    console.log(` ⚠️  Source directory not found: ${sourceDir}`);
  }
}

console.log(`\n🎉 Migration completed! Total files copied: ${totalCopied}`);
console.log('\n📋 Next steps:');
console.log('1. Test the application build');
console.log('2. Fix any remaining import issues');
console.log('3. Remove old app folder if everything works');
