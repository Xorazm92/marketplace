const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

class PlaceholderImageGenerator {
  constructor() {
    this.productsDir = path.join(__dirname, '../public/images/products');
  }

  async createPlaceholderImage(width, height, text, outputPath, color = '#FF6B6B') {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" 
              fill="white" text-anchor="middle" dy=".3em">${text}</text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .jpeg({ quality: 85 })
      .toFile(outputPath);
  }

  async generateProductImages() {
    const products = [
      {
        slug: 'lego-classic',
        name: 'Lego Classic',
        color: '#FF6B6B'
      },
      {
        slug: 'fisher-price-baby',
        name: 'Fisher-Price Baby',
        color: '#4ECDC4'
      },
      {
        slug: 'nike-kids',
        name: 'Nike Kids',
        color: '#45B7D1'
      },
      {
        slug: 'uzbek-books',
        name: 'Uzbek Books',
        color: '#96CEB4'
      },
      {
        slug: 'hot-wheels',
        name: 'Hot Wheels',
        color: '#FFD93D'
      },
      {
        slug: 'barbie-kitchen',
        name: 'Barbie Kitchen',
        color: '#FF8B94'
      },
      {
        slug: 'samsung-kids-tablet',
        name: 'Samsung Tablet',
        color: '#6C5CE7'
      },
      {
        slug: 'adidas-kids-sport',
        name: 'Adidas Sport',
        color: '#A8E6CF'
      },
      {
        slug: 'uzbek-math-book',
        name: 'Uzbek Math',
        color: '#FFB6C1'
      },
      {
        slug: 'play-doh',
        name: 'Play-Doh',
        color: '#98FB98'
      }
    ];

    for (const product of products) {
      const productDir = path.join(this.productsDir, product.slug);
      
      // Asosiy rasm
      await this.createPlaceholderImage(
        800, 600,
        `${product.name}\nMain Image`,
        path.join(productDir, 'main.jpg'),
        product.color
      );

      // Kichik rasm
      await this.createPlaceholderImage(
        300, 200,
        `${product.name}\nThumbnail`,
        path.join(productDir, 'thumbnail.jpg'),
        product.color
      );

      // Galereya rasmlari (1-3 ta)
      for (let i = 1; i <= 3; i++) {
        await this.createPlaceholderImage(
          1200, 800,
          `${product.name}\nGallery ${i}`,
          path.join(productDir, `gallery-${i}.jpg`),
          product.color
        );
      }

      console.log(`✅ Generated images for: ${product.name}`);
    }
  }

  async generateWebPVersions() {
    const products = await fs.readdir(this.productsDir);
    
    for (const product of products) {
      const productPath = path.join(this.productsDir, product);
      const stats = await fs.stat(productPath);
      
      if (stats.isDirectory()) {
        const files = await fs.readdir(productPath);
        const jpgFiles = files.filter(file => file.endsWith('.jpg'));
        
        for (const jpgFile of jpgFiles) {
          const jpgPath = path.join(productPath, jpgFile);
          const webpPath = path.join(productPath, jpgFile.replace('.jpg', '.webp'));
          
          await sharp(jpgPath)
            .webp({ quality: 85 })
            .toFile(webpPath);
        }
        
        console.log(`✅ Generated WebP for: ${product}`);
      }
    }
  }
}

// CLI usage
if (require.main === module) {
  const generator = new PlaceholderImageGenerator();
  const command = process.argv[2];

  switch (command) {
    case 'generate':
      generator.generateProductImages();
      break;
    case 'webp':
      generator.generateWebPVersions();
      break;
    case 'all':
      generator.generateProductImages()
        .then(() => generator.generateWebPVersions())
        .then(() => console.log('🎉 All placeholder images generated!'));
      break;
    default:
      console.log(`
Usage: node generate-placeholder-images.js <command>

Commands:
  generate    - Generate placeholder images
  webp        - Generate WebP versions
  all         - Generate all images and WebP versions

Example:
  node generate-placeholder-images.js all
      `);
  }
}

module.exports = PlaceholderImageGenerator;
