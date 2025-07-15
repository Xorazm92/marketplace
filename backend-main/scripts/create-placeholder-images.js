const fs = require('fs');
const path = require('path');

// Create placeholder images using SVG
const createPlaceholderSVG = (width, height, text, bgColor = '#f0f0f0', textColor = '#666') => {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${bgColor}"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="${textColor}" text-anchor="middle" dy=".3em">${text}</text>
  </svg>`;
};

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create placeholder images
const placeholders = [
  { name: 'product1.jpg', text: 'Bolalar Ko\'ylagi', color: '#e3f2fd' },
  { name: 'product1_2.jpg', text: 'Ko\'ylak Orqa', color: '#e8f5e8' },
  { name: 'toy1.jpg', text: 'O\'yinchoq Mashina', color: '#fff3e0' },
  { name: 'toy1_2.jpg', text: 'Mashina Yon', color: '#fce4ec' },
  { name: 'book1.jpg', text: 'Hikoyalar Kitobi', color: '#f3e5f5' },
  { name: 'ball1.jpg', text: 'Futbol To\'pi', color: '#e0f2f1' },
  { name: 'bag1.jpg', text: 'Maktab Sumkasi', color: '#e1f5fe' },
  { name: 'bag1_2.jpg', text: 'Sumka Ichki', color: '#f9fbe7' },
  { name: 'hero1.jpg', text: 'INBOLA Hero 1', color: '#e8eaf6' },
  { name: 'hero2.jpg', text: 'INBOLA Hero 2', color: '#e0f7fa' },
  { name: 'hero3.jpg', text: 'INBOLA Hero 3', color: '#f1f8e9' },
];

placeholders.forEach(placeholder => {
  const svgContent = createPlaceholderSVG(400, 300, placeholder.text, placeholder.color);
  const filePath = path.join(uploadsDir, placeholder.name);
  
  // Convert SVG to a simple text file for now (in real app, you'd use proper image generation)
  fs.writeFileSync(filePath.replace('.jpg', '.svg'), svgContent);
  
  console.log(`Created placeholder: ${placeholder.name}`);
});

console.log('✅ Placeholder images created successfully!');
console.log('📁 Location:', uploadsDir);
console.log('📝 Note: In production, replace these with real images.');
