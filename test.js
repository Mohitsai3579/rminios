const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

async function test() {
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + env.GEMINI_API_KEY);
    const data = await res.json();
    console.log("AVAILABLE MODELS:", data.models.map(m => m.name).join('\n'));
  } catch(e) {
    console.error(e.message);
  }
}
test();
