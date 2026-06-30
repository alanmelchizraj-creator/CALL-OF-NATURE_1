import fs from 'fs';

fs.mkdirSync('public', { recursive: true });
fs.mkdirSync('dist', { recursive: true });

if (fs.existsSync('dist/index.html')) {
  let html = fs.readFileSync('dist/index.html', 'utf8');
  
  // Convert module script tags to standard deferred scripts so Chrome allows local file:// execution without CORS restrictions
  html = html.replace(/<script\s+type="module"[^>]*>/gi, '<script defer>');
  
  const files = [
    'dist/index.html',
    'Double_Click_To_Play_Offline.html',
    'Call_of_Nature_Chrome_Game.html',
    'public/Double_Click_To_Play_Offline.html',
    'public/Call_of_Nature_Chrome_Game.html',
    'dist/Double_Click_To_Play_Offline.html',
    'dist/Call_of_Nature_Chrome_Game.html'
  ];
  
  files.forEach(f => {
    fs.writeFileSync(f, html);
  });
  if (fs.existsSync('Vanilla_Call_of_Nature.html')) {
    const vanilla = fs.readFileSync('Vanilla_Call_of_Nature.html', 'utf8');
    fs.writeFileSync('public/Vanilla_Call_of_Nature.html', vanilla);
    fs.writeFileSync('dist/Vanilla_Call_of_Nature.html', vanilla);
  }
  console.log('✅ Successfully generated standalone Chrome web game packages in root, public, and dist!');
} else {
  console.error('❌ dist/index.html not found.');
  process.exit(1);
}
