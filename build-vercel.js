const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('📂 Installing client dependencies...');
  execSync('npm install', { cwd: 'client', stdio: 'inherit' });

  console.log('⚡ Building client (Vite)...');
  execSync('npm run build', { cwd: 'client', stdio: 'inherit' });

  console.log('📁 Copying client build outputs to root /dist...');
  const srcDir = path.join(__dirname, 'client', 'dist');
  const destDir = path.join(__dirname, 'dist');

  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  
  fs.mkdirSync(destDir, { recursive: true });
  
  // Custom recursive copy helper in case fs.cpSync has version flags
  copyRecursiveSync(srcDir, destDir);

  console.log('🌿 Vercel build completed successfully!');
} catch (error) {
  console.error('❌ Vercel build failed:', error);
  process.exit(1);
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}
