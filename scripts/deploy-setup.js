const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  projectDir: '/home/ubuntu/rapid-sentiment-analysis',
  envFile: '.env',
  serverPort: 3000,
  clientPort: 3001
};

// Create .env file with default configuration
const createEnvFile = () => {
  console.log('Creating .env file with default configuration...');
  
  const envContent = `
NODE_ENV=development
PORT=${config.serverPort}
MONGODB_URI=mongodb://localhost:27017/rapid-sentiment-analysis
JWT_SECRET=jade-kite-secret-key-for-development-only
JWT_EXPIRY=7d

# External API Keys (Replace with actual keys in production)
VOICEFORM_API_KEY=demo_key
HUME_AI_API_KEY=demo_key
GEMINI_API_KEY=demo_key
AIRTABLE_API_KEY=demo_key
INSIGHT7_API_KEY=demo_key

# External API Endpoints
VOICEFORM_API_URL=https://api.voiceform.com/v1
HUME_AI_API_URL=https://api.hume.ai/v1
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1
AIRTABLE_API_URL=https://api.airtable.com/v0
INSIGHT7_API_URL=https://api.insight7.io/v1
`.trim();

  fs.writeFileSync(path.join(config.projectDir, config.envFile), envContent);
  console.log('✅ .env file created successfully');
};

// Update package.json with scripts
const updatePackageJson = () => {
  console.log('Updating package.json with scripts...');
  
  const packageJsonPath = path.join(config.projectDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  packageJson.scripts = {
    ...packageJson.scripts,
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest --detectOpenHandles",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "client": "cd client && npm start",
    "client:build": "cd client && npm run build",
    "dev:full": "concurrently \"npm run dev\" \"npm run client\"",
    "deploy": "node scripts/deploy.js"
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json updated successfully');
};

// Create deployment script
const createDeploymentScript = () => {
  console.log('Creating deployment script...');
  
  const deployDir = path.join(config.projectDir, 'scripts');
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir);
  }
  
  const deployScriptContent = `
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  projectDir: path.resolve(__dirname, '..'),
  clientDir: path.resolve(__dirname, '../client'),
  buildDir: path.resolve(__dirname, '../client/build'),
  serverPort: process.env.PORT || 3000
};

// Build client
const buildClient = () => {
  console.log('Building client application...');
  execSync('npm run build', { cwd: config.clientDir, stdio: 'inherit' });
  console.log('✅ Client built successfully');
};

// Start server
const startServer = () => {
  console.log(\`Starting server on port \${config.serverPort}...\`);
  execSync('npm start', { cwd: config.projectDir, stdio: 'inherit' });
};

// Main deployment function
const deploy = async () => {
  try {
    console.log('Starting deployment process...');
    
    // Build client
    buildClient();
    
    // Start server
    startServer();
    
    console.log('✅ Deployment completed successfully');
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
};

// Run deployment
deploy();
`.trim();

  fs.writeFileSync(path.join(deployDir, 'deploy.js'), deployScriptContent);
  console.log('✅ Deployment script created successfully');
};

// Create README.md
const createReadme = () => {
  console.log('Creating README.md...');
  
  const readmeContent = `
# Rapid Consumer Sentiment Analysis

A sophisticated service that combines AI-moderated mini-qual interviews with Voice Emotion Recognition technology to deliver fast, affordable insights for CPG brands.

## Features

- Voice Emotion Recognition using Hume AI
- Natural Language Processing with Gemini API
- Mixed emotion-language analysis for deeper insights
- Data storage with Airtable
- Visualization with Insight7
- Admin Dashboard, Client Portal, and Respondent Interface

## Getting Started

### Prerequisites

- Node.js 16+
- MongoDB
- API keys for external services (Voiceform, Hume AI, Gemini, Airtable, Insight7)

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`
   npm install
   cd client
   npm install
   \`\`\`
3. Configure environment variables in \`.env\` file
4. Start the development server:
   \`\`\`
   npm run dev:full
   \`\`\`

### Testing

Run tests with:
\`\`\`
npm test
\`\`\`

## Deployment

To deploy the application:
\`\`\`
npm run deploy
\`\`\`

## License

This project is proprietary software owned by Jade Kite.

## Contact

For more information, contact Jade Kite.
`.trim();

  fs.writeFileSync(path.join(config.projectDir, 'README.md'), readmeContent);
  console.log('✅ README.md created successfully');
};

// Main deployment function
const deploy = async () => {
  try {
    console.log('Starting deployment process...');
    
    // Create .env file
    createEnvFile();
    
    // Update package.json
    updatePackageJson();
    
    // Create deployment script
    createDeploymentScript();
    
    // Create README.md
    createReadme();
    
    // Install concurrently for running multiple commands
    console.log('Installing additional dependencies...');
    execSync('npm install --save-dev concurrently', { cwd: config.projectDir, stdio: 'inherit' });
    
    // Build client
    console.log('Building client application...');
    execSync('cd client && npm run build', { cwd: config.projectDir, stdio: 'inherit' });
    
    console.log('✅ Deployment setup completed successfully');
    console.log(`\nTo start the application:`);
    console.log(`1. Start MongoDB`);
    console.log(`2. Run 'npm run dev:full' to start both server and client`);
    console.log(`3. Access the application at http://localhost:${config.clientPort}`);
    
  } catch (error) {
    console.error('❌ Deployment setup failed:', error.message);
    process.exit(1);
  }
};

// Run deployment
deploy();
