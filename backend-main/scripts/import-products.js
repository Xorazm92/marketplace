const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

class ProductImporter {
  constructor() {
    this.dataPath = path.join(__dirname, '../data/products.json');
  }

  async loadData() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Error loading data:', error.message);
      throw error;
    }
  }

  async importAgeGroups(ageGroups) {
    console.log('🔄 Importing age groups...');
    
    for (const ageGroup of ageGroups) {
      await prisma.ageGroup.upsert({
        where: { id: ageGroup.id },
        update: {
          name: ageGroup.name,
          min_age: ageGroup.minAge,
          max_age: ageGroup.maxAge,
          description: ageGroup.description,
          icon: ageGroup.icon,
          color: ageGroup.color,
          is_active: true,
          sort_order: ageGroup.id,
          updatedAt: new Date()
        },
        create: {
          id: ageGroup.id,
          name: ageGroup.name,
          min_age: ageGroup.minAge,
          max_age: ageGroup.maxAge,
          description: ageGroup.description,
          icon: ageGroup.icon,
          color: ageGroup.color,
          is_active: true,
          sort_order: ageGroup.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
    
    console.log(`✅ Imported ${ageGroups.length} age groups`);
  }

  async importEducationalCategories(categories) {
    console.log('🔄 Importing educational categories...');
    
    for (const category of categories) {
      await prisma.educationalCategory.upsert({
        where: { id: category.id },
        update: {
          name: category.name,
          description: category.description,
          icon: category.icon,
          color: category.color,
          is_active: true,
          sort_order: category.id,
          updatedAt: new Date()
        },
        create: {
          id: category.id,
          name: category.name,
          description: category.description,
          icon: category.icon,
          color: category.color,
          is_active: true,
          sort_order: category.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
    
    console.log(`✅ Imported ${categories.length} educational categories`);
  }

  async importEventTypes(eventTypes) {
    console.log('🔄 Importing event types...');
    
    for (const eventType of eventTypes) {
      await prisma.eventType.upsert({
        where: { id: eventType.id },
        update: {
          name: eventType.name,
          description: eventType.description,
          icon: eventType.icon,
          color: eventType.color,
          is_active: true,
          sort_order: eventType.id,
          updatedAt: new Date()
        },
        create: {
          id: eventType.id,
          name: eventType.name,
          description: eventType.description,
          icon: eventType.icon,
          color: eventType.color,
          is_active: true,
          sort_order: eventType.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
    
    console.log(`✅ Imported ${eventTypes.length} event types`);
  }

  async importProducts(products) {
    console.log('🔄 Importing products...');
    
    for (const product of products) {
      try {
        await prisma.product.upsert({
          where: { id: product.id },
          update: {
            title: product.name,
            description: product.description,
            price: product.price,
            original_price: product.originalPrice,
            discount_percentage: product.discount,
            brand_id: 1, // Default brand ID
            currency_id: 1, // Default currency ID
            phone_number: "+998901234567", // Default phone
            age_group_id: product.ageGroupId,
            educational_category_id: product.educationalCategoryId,
            event_type_id: product.eventTypeId,
            difficulty_level: product.difficultyLevel,
            play_time: product.playTime,
            player_count: product.playerCount,
            learning_objectives: product.learningObjectives,
            developmental_skills: product.developmentalSkills,
            parental_guidance: product.parentalGuidance,
            multilingual_support: product.multilingualSupport,
            recommended_age_min: product.recommendedAgeMin,
            recommended_age_max: product.recommendedAgeMax,
            gender_specific: product.genderSpecific,
            safety_info: JSON.stringify(product.safetyInfo),
            tags: JSON.stringify(product.tags),
            is_active: product.isActive,
            is_featured: product.isFeatured,
            updatedAt: new Date()
          },
          create: {
            id: product.id,
            title: product.name,
            description: product.description,
            price: product.price,
            original_price: product.originalPrice,
            discount_percentage: product.discount,
            brand_id: 1, // Default brand ID
            currency_id: 1, // Default currency ID
            phone_number: "+998901234567", // Default phone
            age_group_id: product.ageGroupId,
            educational_category_id: product.educationalCategoryId,
            event_type_id: product.eventTypeId,
            difficulty_level: product.difficultyLevel,
            play_time: product.playTime,
            player_count: product.playerCount,
            learning_objectives: product.learningObjectives,
            developmental_skills: product.developmentalSkills,
            parental_guidance: product.parentalGuidance,
            multilingual_support: product.multilingualSupport,
            recommended_age_min: product.recommendedAgeMin,
            recommended_age_max: product.recommendedAgeMax,
            gender_specific: product.genderSpecific,
            safety_info: JSON.stringify(product.safetyInfo),
            tags: JSON.stringify(product.tags),
            is_active: product.isActive,
            is_featured: product.isFeatured,
            createdAt: new Date(product.createdAt),
            updatedAt: new Date(product.updatedAt)
          }
        });
        
        console.log(`✅ Imported product: ${product.name}`);
      } catch (error) {
        console.error(`❌ Error importing product ${product.name}:`, error.message);
      }
    }
    
    console.log(`✅ Imported ${products.length} products`);
  }

  async importAll() {
    try {
      console.log('🚀 Starting product import...');
      
      const data = await this.loadData();
      
      // Import age groups
      await this.importAgeGroups(data.ageGroups);
      
      // Import educational categories
      await this.importEducationalCategories(data.educationalCategories);
      
      // Import event types
      await this.importEventTypes(data.eventTypes);
      
      // Import products
      await this.importProducts(data.products);
      
      console.log('🎉 All data imported successfully!');
    } catch (error) {
      console.error('❌ Import failed:', error.message);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  async clearData() {
    try {
      console.log('🗑️ Clearing existing data...');
      
      // Delete related data first
      await prisma.productImage.deleteMany();
      await prisma.product.deleteMany();
      await prisma.ageGroup.deleteMany();
      await prisma.educationalCategory.deleteMany();
      await prisma.eventType.deleteMany();
      
      console.log('✅ Data cleared successfully!');
    } catch (error) {
      console.error('❌ Error clearing data:', error.message);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }
}

// CLI usage
if (require.main === module) {
  const importer = new ProductImporter();
  const command = process.argv[2];

  switch (command) {
    case 'import':
      importer.importAll();
      break;
    case 'clear':
      importer.clearData();
      break;
    case 'reset':
      importer.clearData()
        .then(() => importer.importAll())
        .then(() => console.log('🔄 Data reset and imported successfully!'));
      break;
    default:
      console.log(`
Usage: node import-products.js <command>

Commands:
  import    - Import all products and related data
  clear     - Clear all existing data
  reset     - Clear and re-import all data

Example:
  node import-products.js import
  node import-products.js reset
      `);
  }
}

module.exports = ProductImporter;
