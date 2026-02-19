import { PrismaClient } from '@prisma/client';
import logger from '../config/logger.js';

const prisma = new PrismaClient();

/**
 * صور حقيقية للحيوانات الأليفة من Unsplash
 */
const petImages = {
  dogs: [
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80', // Golden Retriever
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80', // Labrador
    'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=800&q=80', // German Shepherd
    'https://images.unsplash.com/photo-1568572933382-74d440642117?w=800&q=80', // Husky
    'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=800&q=80', // Pomeranian
    'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800&q=80', // Poodle
    'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=800&q=80', // Beagle
    'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80', // Corgi
    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=80', // Pug
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80', // Bulldog
    'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800&q=80', // Border Collie
    'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&q=80', // Shih Tzu
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80', // Rottweiler
    'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&q=80', // Boxer
    'https://images.unsplash.com/photo-1559429041-215ef5aa4e14?w=800&q=80', // Dachshund
  ],
  cats: [
    'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80', // Persian Cat
    'https://images.unsplash.com/photo-1573865526739-10c1d3a1e83e?w=800&q=80', // British Shorthair
    'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=800&q=80', // Siamese Cat
    'https://images.unsplash.com/photo-1478098711619-5ab0b478d6e6?w=800&q=80', // Maine Coon
    'https://images.unsplash.com/photo-1494256997604-768d1f608cac?w=800&q=80', // Ragdoll
    'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80', // Scottish Fold
    'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=800&q=80', // Orange Tabby
    'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=800&q=80', // Bengal Cat
    'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=800&q=80', // Russian Blue
    'https://images.unsplash.com/photo-1583795128727-6ec3642408f8?w=800&q=80', // Sphynx Cat
    'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800&q=80', // Abyssinian
    'https://images.unsplash.com/photo-1472491235688-bdc81a63246e?w=800&q=80', // Black Cat
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80', // White Cat
    'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&q=80', // Calico Cat
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&q=80', // Mixed Breed
  ],
  birds: [
    'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&q=80', // Parrot
    'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800&q=80', // Cockatiel
    'https://images.unsplash.com/photo-1559008901-e0b0a3464b8e?w=800&q=80', // Budgie
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80', // Lovebird
    'https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=800&q=80', // Cockatoo
    'https://images.unsplash.com/photo-1444464722803-f49de5e79ed7?w=800&q=80', // African Grey
    'https://images.unsplash.com/photo-1555169062-013468b47731?w=800&q=80', // Macaw
    'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&q=80', // Parakeet
    'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&q=80', // Canary
    'https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=800&q=80', // Finch
  ],
};

/**
 * إضافة صور للحيوانات الموجودة
 */
async function addImagesToExistingPets() {
  try {
    logger.info('🎨 بدء إضافة الصور للحيوانات الموجودة...');

    // جلب جميع الحيوانات
    const pets = await prisma.pet.findMany({
      select: {
        id: true,
        species: true,
        name: true,
        images: true,
      },
    });

    if (pets.length === 0) {
      logger.warn('⚠️ لا توجد حيوانات في قاعدة البيانات');
      return;
    }

    let updatedCount = 0;

    for (const pet of pets) {
      // تحديد نوع الحيوان
      const speciesLower = pet.species.toLowerCase();
      let imageArray = [];

      if (speciesLower === 'dog') {
        imageArray = petImages.dogs;
      } else if (speciesLower === 'cat') {
        imageArray = petImages.cats;
      } else if (speciesLower === 'bird') {
        imageArray = petImages.birds;
      } else {
        // استخدام صور الكلاب كاحتياطي
        imageArray = petImages.dogs;
      }

      // اختيار صورة عشوائية
      const randomImage = imageArray[Math.floor(Math.random() * imageArray.length)];

      // إضافة صور متعددة (1-3 صور)
      const numberOfImages = Math.floor(Math.random() * 3) + 1;
      const selectedImages = [];

      for (let i = 0; i < numberOfImages; i++) {
        const randomIndex = Math.floor(Math.random() * imageArray.length);
        selectedImages.push(imageArray[randomIndex]);
      }

      // تحديث الحيوان بالصور
      await prisma.pet.update({
        where: { id: pet.id },
        data: {
          images: selectedImages,
        },
      });

      updatedCount++;
      logger.info(`✅ تم تحديث ${pet.name} (${pet.species}) - ${selectedImages.length} صورة`);
    }

    logger.info(`\n🎉 تم! تحديث ${updatedCount} حيوان بصور جديدة`);
  } catch (error) {
    logger.error('❌ خطأ في إضافة الصور:', error);
    throw error;
  }
}

/**
 * إنشاء حيوانات جديدة مع صور
 */
async function createPetsWithImages() {
  try {
    logger.info('🐾 إنشاء حيوانات جديدة مع صور...');

    // البحث عن مستخدمين
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['USER', 'BREEDER'],
        },
      },
      select: {
        id: true,
        firstName: true,
      },
      take: 10,
    });

    if (users.length === 0) {
      logger.warn('⚠️ لا يوجد مستخدمون في قاعدة البيانات');
      return;
    }

    const dogBreeds = [
      'Golden Retriever', 'Labrador', 'German Shepherd', 'Bulldog', 'Poodle',
      'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Boxer', 'Husky',
    ];

    const catBreeds = [
      'Persian', 'Maine Coon', 'Siamese', 'British Shorthair', 'Ragdoll',
      'Bengal', 'Scottish Fold', 'Sphynx', 'Russian Blue', 'Abyssinian',
    ];

    const birdBreeds = [
      'African Grey Parrot', 'Cockatiel', 'Budgerigar', 'Lovebird', 'Cockatoo',
      'Macaw', 'Canary', 'Finch', 'Parakeet', 'Conure',
    ];

    const newPets = [];

    // إنشاء 30 حيوان جديد
    for (let i = 0; i < 30; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const petTypes = ['Dog', 'Cat', 'Bird'];
      const species = petTypes[Math.floor(Math.random() * petTypes.length)];
      const speciesLower = species.toLowerCase();

      let breed, imageArray;
      if (speciesLower === 'dog') {
        breed = dogBreeds[Math.floor(Math.random() * dogBreeds.length)];
        imageArray = petImages.dogs;
      } else if (speciesLower === 'cat') {
        breed = catBreeds[Math.floor(Math.random() * catBreeds.length)];
        imageArray = petImages.cats;
      } else {
        breed = birdBreeds[Math.floor(Math.random() * birdBreeds.length)];
        imageArray = petImages.birds;
      }

      // اختيار 1-4 صور عشوائية
      const numberOfImages = Math.floor(Math.random() * 4) + 1;
      const selectedImages = [];
      for (let j = 0; j < numberOfImages; j++) {
        const randomIndex = Math.floor(Math.random() * imageArray.length);
        selectedImages.push(imageArray[randomIndex]);
      }

      const genders = ['MALE', 'FEMALE'];
      const gender = genders[Math.floor(Math.random() * genders.length)];

      const petNames = [
        'Max', 'Bella', 'Charlie', 'Luna', 'Rocky', 'Daisy',
        'Cooper', 'Molly', 'Buddy', 'Sadie', 'Duke', 'Lucy',
        'Milo', 'Chloe', 'Zeus', 'Lola', 'Oliver', 'Zoe',
      ];

      const name = petNames[Math.floor(Math.random() * petNames.length)];
      const age = Math.floor(Math.random() * 10) + 1;
      const weight = Math.random() * 30 + 5;

      try {
        const pet = await prisma.pet.create({
          data: {
            ownerId: randomUser.id,
            name: `${name}-${i + 1}`,
            species: species,
            breed: breed,
            gender: gender,
            dateOfBirth: new Date(Date.now() - age * 365 * 24 * 60 * 60 * 1000),
            weight: parseFloat(weight.toFixed(1)),
            color: ['Brown', 'Black', 'White', 'Golden', 'Mixed'][Math.floor(Math.random() * 5)],
            images: selectedImages,
            description: `Beautiful ${breed} looking for breeding partner. Well-trained and healthy.`,
            isVaccinated: Math.random() > 0.3,
            isNeutered: false,
            breedingStatus: 'AVAILABLE',
            breedingPrice: Math.floor(Math.random() * 1000) + 500,
            hasPedigree: Math.random() > 0.5,
            isPublished: true,
            isActive: true,
          },
        });

        newPets.push(pet);
        logger.info(`✅ تم إنشاء ${pet.name} (${pet.species} - ${pet.breed}) - ${selectedImages.length} صورة`);
      } catch (error) {
        logger.warn(`⚠️ فشل إنشاء حيوان ${i + 1}: ${error.message}`);
      }
    }

    logger.info(`\n🎉 تم إنشاء ${newPets.length} حيوان جديد بصور!`);
  } catch (error) {
    logger.error('❌ خطأ في إنشاء الحيوانات:', error);
    throw error;
  }
}

/**
 * الدالة الرئيسية
 */
async function main() {
  try {
    console.log('\n🐾 ======================================');
    console.log('   إضافة صور للحيوانات');
    console.log('======================================\n');

    // إضافة صور للحيوانات الموجودة
    await addImagesToExistingPets();

    console.log('\n');

    // إنشاء حيوانات جديدة بصور
    await createPetsWithImages();

    console.log('\n✨ اكتمل بنجاح!\n');
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
main();
