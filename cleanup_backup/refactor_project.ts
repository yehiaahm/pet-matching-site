import React from 'react';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const projectRoot = 'd:/PetMat_Project/Pet Breeding Matchmaking Website (3)/src';
const folders = ['components', 'pages', 'services', 'hooks', 'utils', 'types', 'context', 'data'];

// Function to copy file content
function copyFile(sourcePath: string, targetPath: string) {
  try {
    const content = readFileSync(sourcePath, 'utf8');
    writeFileSync(targetPath, content, 'utf8');
    console.log(`✅ Copied: ${sourcePath} -> ${targetPath}`);
  } catch (error) {
    console.error(`❌ Error copying ${sourcePath}:`, error);
  }
}

// Function to ensure directory exists
function ensureDir(dirPath: string) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

// Main refactoring function
function refactorProject() {
  folders.forEach(folder => {
    const sourceDir = join(projectRoot, 'app', folder);
    const targetDir = join(projectRoot, folder);
    
    // Ensure target directory exists
    ensureDir(targetDir);
    
    // Copy all files from source to target
    try {
      const fs = require('fs');
      if (existsSync(sourceDir)) {
        const files = fs.readdirSync(sourceDir);
        
        files.forEach(file => {
          const sourceFile = join(sourceDir, file);
          const targetFile = join(targetDir, file);
          
          if (fs.statSync(sourceFile).isFile()) {
            copyFile(sourceFile, targetFile);
          } else if (fs.statSync(sourceFile).isDirectory()) {
            // Recursively copy subdirectories
            ensureDir(targetFile);
            const subFiles = fs.readdirSync(sourceFile);
            subFiles.forEach(subFile => {
              const sourceSubFile = join(sourceFile, subFile);
              const targetSubFile = join(targetFile, subFile);
              if (fs.statSync(sourceSubFile).isFile()) {
                copyFile(sourceSubFile, targetSubFile);
              }
            });
          }
        });
      }
    } catch (error) {
      console.error(`Error processing ${folder}:`, error);
    }
  });
  
  console.log('🎉 Project refactoring completed!');
}

// Execute the refactoring
refactorProject();
