const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

class ImageOptimizer {
  constructor() {
    this.inputDir = path.join(__dirname, '../public/images/products');
    this.outputDir = path.join(__dirname, '../public/images/products');
  }

  async optimizeImage(inputPath, outputPath, options) {
    try {
      await sharp(inputPath)
        .resize(options.width, options.height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({
          quality: options.quality || 85,
          progressive: true,
          mozjpeg: true
        })
        .toFile(outputPath);

      console.log(`✅ Optimized: ${path.basename(inputPath)}`);
    } catch (error) {
      console.error(`❌ Error optimizing ${inputPath}:`, error.message);
    }
  }

  async createWebP(inputPath, outputPath, options) {
    try {
      await sharp(inputPath)
        .resize(options.width, options.height, {
          fit: 'cover',
          position: 'center'
        })
        .webp({
          quality: options.quality || 85,
          effort: 6
        })
        .toFile(outputPath);

      console.log(`✅ WebP created: ${path.basename(outputPath)}`);
    } catch (error) {
      console.error(`❌ Error creating WebP for ${inputPath}:`, error.message);
    }
  }

  async processProductImages(productSlug) {
    const productDir = path.join(this.inputDir, productSlug);
    const files = await fs.readdir(productDir);

    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png)$/i.test(file)
    );

    for (const file of imageFiles) {
      const inputPath = path.join(productDir, file);
      const fileName = path.parse(file).name;
      const extension = path.parse(file).ext;

      // Asosiy rasm optimizatsiyasi
      if (fileName.includes('main')) {
        await this.optimizeImage(inputPath, 
          path.join(productDir, `${fileName}.jpg`), {
          width: 800,
          height: 600,
          quality: 85
        });

        await this.createWebP(inputPath,
          path.join(productDir, `${fileName}.webp`), {
          width: 800,
          height: 600,
          quality: 85
        });
      }

      // Kichik rasm optimizatsiyasi
      if (fileName.includes('thumbnail')) {
        await this.optimizeImage(inputPath,
          path.join(productDir, `${fileName}.jpg`), {
          width: 300,
          height: 200,
          quality: 80
        });

        await this.createWebP(inputPath,
          path.join(productDir, `${fileName}.webp`), {
          width: 300,
          height: 200,
          quality: 80
        });
      }

      // Galereya rasmlari optimizatsiyasi
      if (fileName.includes('gallery')) {
        await this.optimizeImage(inputPath,
          path.join(productDir, `${fileName}.jpg`), {
          width: 1200,
          height: 800,
          quality: 90
        });

        await this.createWebP(inputPath,
          path.join(productDir, `${fileName}.webp`), {
          width: 1200,
          height: 800,
          quality: 90
        });
      }
    }
  }

  async optimizeAllProducts() {
    try {
      const products = await fs.readdir(this.inputDir);
      
      for (const product of products) {
        const productPath = path.join(this.inputDir, product);
        const stats = await fs.stat(productPath);
        
        if (stats.isDirectory()) {
          console.log(`\n🔄 Processing: ${product}`);
          await this.processProductImages(product);
        }
      }
      
      console.log('\n🎉 All images optimized successfully!');
    } catch (error) {
      console.error('❌ Error processing images:', error.message);
    }
  }

  async generateImageManifest() {
    try {
      const manifest = {};
      const products = await fs.readdir(this.inputDir);

      for (const product of products) {
        const productPath = path.join(this.inputDir, product);
        const stats = await fs.stat(productPath);
        
        if (stats.isDirectory()) {
          const files = await fs.readdir(productPath);
          const images = files.filter(file => 
            /\.(jpg|jpeg|png|webp)$/i.test(file)
          );

          manifest[product] = {
            main: images.find(img => img.includes('main')),
            thumbnail: images.find(img => img.includes('thumbnail')),
            gallery: images.filter(img => img.includes('gallery')).sort()
          };
        }
      }

      await fs.writeFile(
        path.join(this.inputDir, 'image-manifest.json'),
        JSON.stringify(manifest, null, 2)
      );

      console.log('✅ Image manifest generated!');
    } catch (error) {
      console.error('❌ Error generating manifest:', error.message);
    }
  }
}

// CLI usage
if (require.main === module) {
  const optimizer = new ImageOptimizer();
  const command = process.argv[2];

  switch (command) {
    case 'optimize':
      optimizer.optimizeAllProducts();
      break;
    case 'manifest':
      optimizer.generateImageManifest();
      break;
    case 'product':
      const productSlug = process.argv[3];
      if (productSlug) {
        optimizer.processProductImages(productSlug);
      } else {
        console.log('❌ Please provide product slug');
      }
      break;
    default:
      console.log(`
Usage: node optimize-images.js <command>

Commands:
  optimize    - Optimize all product images
  manifest    - Generate image manifest
  product <slug> - Optimize specific product images

Example:
  node optimize-images.js optimize
  node optimize-images.js product lego-classic
  node optimize-images.js manifest
      `);
  }
}

module.exports = ImageOptimizer;
