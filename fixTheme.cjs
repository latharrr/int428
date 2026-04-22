const fs = require('fs');
const path = require('path');

const walk = dir => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) results.push(file);
    }
  });
  return results;
};

const files = walk('g:/saas/src');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Colors
  content = content.replace(/#00d4ff/g, 'var(--color-primary)');
  content = content.replace(/#7c3aed/g, '#b59224'); 
  
  // Dashboard FraudGuard AI logo
  content = content.replace(/Fraud<span style=\{\{ color: 'var\(--color-primary\)' \}\}>Guard<\/span> AI/g, 'FRAUD<span style={{ color: \'var(--color-primary)\' }}>GUARD</span>');
  content = content.replace(/Fraud<span style=\{\{ color: '#00d4ff' \}\}>Guard<\/span> AI/g, 'FRAUD<span style={{ color: \'var(--color-primary)\' }}>GUARD</span>');

  // Also replace rgba variants of 0,212,255 with 212,175,55
  content = content.replace(/rgba\(0,\s*212,\s*255/g, 'rgba(212, 175, 55');
  content = content.replace(/rgba\(0,212,255/g, 'rgba(212,175,55');

  // Replace old gradient strings entirely
  content = content.replace(/linear-gradient\(135deg,\s*var\(--color-primary\),\s*#b59224\)/g, 'var(--color-primary)');
  content = content.replace(/linear-gradient\(135deg,var\(--color-primary\),#b59224\)/g, 'var(--color-primary)');
  content = content.replace(/linear-gradient\(135deg,#00d4ff,#7c3aed\)/g, 'var(--color-primary)');

  // Remove random emojis from ChatBot and Dashboard
  content = content.replace(/'🤖 Analyze Transaction'/g, "'Analyze Transaction'");
  content = content.replace(/🛡️ /g, '');
  content = content.replace(/>🛡️</g, '><');
  content = content.replace(/💬 /g, '');
  content = content.replace(/💳 /g, '');
  content = content.replace(/📈 /g, '');
  content = content.replace(/⚙️ /g, '');
  content = content.replace(/📊 /g, '');
  content = content.replace(/🚀 /g, '');
  content = content.replace(/▶ /g, '');
  content = content.replace(/✨ /g, '');
  content = content.replace(/🚨 /g, '');
  content = content.replace(/🔒 /g, '');
  content = content.replace(/📞 /g, '');
  content = content.replace(/🔑 /g, '');
  content = content.replace(/🧾 /g, '');
  content = content.replace(/🆘 /g, '');
  content = content.replace(/📋 /g, '');
  content = content.replace(/📧 /g, '');
  content = content.replace(/🏦 /g, '');
  content = content.replace(/⏱️ /g, '');
  content = content.replace(/👋 /g, '');

  if (content !== original) {
    fs.writeFileSync(f, content);
    console.log('Updated ' + f);
  }
});
