import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// أسماء عربية وأجنبية متنوعة
const firstNames = [
  'أحمد', 'محمد', 'علي', 'فاطمة', 'عائشة', 'خديجة', 'يوسف', 'إبراهيم', 'مريم', 'زينب',
  'John', 'Emma', 'Michael', 'Sophia', 'William', 'Olivia', 'James', 'Ava', 'Robert', 'Isabella',
  'David', 'Mia', 'Richard', 'Charlotte', 'Joseph', 'Amelia', 'Thomas', 'Harper', 'Christopher', 'Evelyn',
  'سارة', 'عمر', 'نور', 'ليلى', 'حسن', 'هدى', 'خالد', 'ريم', 'طارق', 'دينا',
  'Daniel', 'Abigail', 'Matthew', 'Emily', 'Anthony', 'Elizabeth', 'Mark', 'Sofia', 'Donald', 'Avery'
];

const lastNames = [
  'أحمد', 'محمود', 'حسن', 'علي', 'إبراهيم', 'يوسف', 'عبدالله', 'عثمان', 'صالح', 'خليل',
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'عباس', 'رشيد', 'سعيد', 'فاروق', 'منصور', 'طاهر', 'نصر', 'بدر', 'فهد', 'سالم',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
];

const cities = [
  'Cairo', 'Alexandria', 'Giza', 'Sharm El Sheikh', 'Luxor', 'Aswan', 'Hurghada', 'Port Said',
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego',
  'Dubai', 'Abu Dhabi', 'Riyadh', 'Jeddah', 'Doha', 'Kuwait City', 'Muscat', 'Manama'
];

// بيانات الكلاب - 20 سلالة مختلفة
const dogBreeds = [
  'Golden Retriever', 'Labrador Retriever', 'German Shepherd', 'French Bulldog', 'Bulldog',
  'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Boxer',
  'Dachshund', 'Siberian Husky', 'Doberman Pinscher', 'Shih Tzu', 'Boston Terrier',
  'Pomeranian', 'Havanese', 'Cocker Spaniel', 'Maltese', 'Chihuahua'
];

// بيانات القطط - 20 سلالة مختلفة
const catBreeds = [
  'Persian', 'Maine Coon', 'Siamese', 'Ragdoll', 'British Shorthair',
  'Sphynx', 'Abyssinian', 'Scottish Fold', 'Bengal', 'Russian Blue',
  'American Shorthair', 'Birman', 'Oriental Shorthair', 'Devon Rex', 'Himalayan',
  'Turkish Angora', 'Burmese', 'Exotic Shorthair', 'Manx', 'Norwegian Forest Cat'
];

// بيانات الطيور - 10 أنواع مختلفة
const birdBreeds = [
  'Budgerigar', 'Cockatiel', 'African Grey Parrot', 'Macaw', 'Canary',
  'Lovebird', 'Finch', 'Parakeet', 'Conure', 'Cockatoo'
];

// أسماء الحيوانات
const petNames = [
  'Max', 'Bella', 'Charlie', 'Luna', 'Cooper', 'Daisy', 'Rocky', 'Lucy', 'Buddy', 'Molly',
  'Bailey', 'Sadie', 'Duke', 'Maggie', 'Bear', 'Sophie', 'Jack', 'Chloe', 'Tucker', 'Lola',
  'Oliver', 'Lily', 'Toby', 'Zoe', 'Bentley', 'Penny', 'Zeus', 'Stella', 'Leo', 'Gracie',
  'Milo', 'Nala', 'Finn', 'Ruby', 'Oscar', 'Rosie', 'Teddy', 'Ellie', 'Winston', 'Coco',
  'Simba', 'Ginger', 'Apollo', 'Princess', 'Jasper', 'Angel', 'Rex', 'Willow', 'Bruno', 'Pepper'
];

// صور حقيقية من Unsplash
const dogImages = [
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb', // Golden Retriever
  'https://images.unsplash.com/photo-1552053831-71594a27632d', // Labrador
  'https://images.unsplash.com/photo-1568572933382-74d440642117', // German Shepherd
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e', // French Bulldog
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1', // Bulldog
  'https://images.unsplash.com/photo-1506755855567-92ff770e8d00', // Poodle
  'https://images.unsplash.com/photo-1505628346881-b72b27e84530', // Beagle
  'https://images.unsplash.com/photo-1567752881298-894bb81f9379', // Rottweiler
  'https://images.unsplash.com/photo-1529472119196-cb724127a98e', // Yorkshire Terrier
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1', // Boxer
  'https://images.unsplash.com/photo-1612536860318-45af32e4c979', // Dachshund
  'https://images.unsplash.com/photo-1560807707-8cc77767d783', // Siberian Husky
  'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8', // Doberman
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b', // Shih Tzu
  'https://images.unsplash.com/photo-1504595403659-9088ce801e29', // Boston Terrier
  'https://images.unsplash.com/photo-1553882809-a4f57e59501d', // Pomeranian
  'https://images.unsplash.com/photo-1558788353-f76d92427f16', // Havanese
  'https://images.unsplash.com/photo-1544568100-847a948585b9', // Cocker Spaniel
  'https://images.unsplash.com/photo-1534361960057-19889db9621e', // Maltese
  'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc'  // Chihuahua
];

const catImages = [
  'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13', // Persian
  'https://images.unsplash.com/photo-1573865526739-10c1de0fa8d8', // Maine Coon
  'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8', // Siamese
  'https://images.unsplash.com/photo-1529778873920-4da4926a72c2', // Ragdoll
  'https://images.unsplash.com/photo-1543852786-1cf6624b9987', // British Shorthair
  'https://images.unsplash.com/photo-1572479623118-2b4c7c5e4e9f', // Sphynx
  'https://images.unsplash.com/photo-1574158622682-e40e69881006', // Abyssinian
  'https://images.unsplash.com/photo-1518791841217-8f162f1e1131', // Scottish Fold
  'https://images.unsplash.com/photo-1568152950566-c1bf43f4ab28', // Bengal
  'https://images.unsplash.com/photo-1518288774672-b94e808873ff', // Russian Blue
  'https://images.unsplash.com/photo-1519052537078-e6302a4968d4', // American Shorthair
  'https://images.unsplash.com/photo-1533738363-b7f9aef128ce', // Birman
  'https://images.unsplash.com/photo-1577023311546-cdc07a8454d9', // Oriental
  'https://images.unsplash.com/photo-1543852786-1cf6624b9987', // Devon Rex
  'https://images.unsplash.com/photo-1529778873920-4da4926a72c2', // Himalayan
  'https://images.unsplash.com/photo-1517423568366-8b83523034fd', // Turkish Angora
  'https://images.unsplash.com/photo-1524749292158-7540c2494485', // Burmese
  'https://images.unsplash.com/photo-1506755855567-92ff770e8d00', // Exotic Shorthair
  'https://images.unsplash.com/photo-1574158622682-e40e69881006', // Manx
  'https://images.unsplash.com/photo-1536500152107-01ab1422f932'  // Norwegian Forest
];

const birdImages = [
  'https://images.unsplash.com/photo-1552728089-57bdde30beb3', // Budgie
  'https://images.unsplash.com/photo-1444464666168-49d633b86797', // Cockatiel
  'https://images.unsplash.com/photo-1552728089-57bdde30beb3', // African Grey
  'https://images.unsplash.com/photo-1542284823-4e2c3a6be4f9', // Macaw
  'https://images.unsplash.com/photo-1535083783855-76ae62b2914e', // Canary
  'https://images.unsplash.com/photo-1571752428971-c2530f1da994', // Lovebird
  'https://images.unsplash.com/photo-1444464666168-49d633b86797', // Finch
  'https://images.unsplash.com/photo-1552728089-57bdde30beb3', // Parakeet
  'https://images.unsplash.com/photo-1542284823-4e2c3a6be4f9', // Conure
  'https://images.unsplash.com/photo-1571752428971-c2530f1da994'  // Cockatoo
];

function generateEmail(firstName, lastName, index) {
  const cleanFirst = firstName.replace(/[^a-zA-Z]/g, '').toLowerCase();
  const cleanLast = lastName.replace(/[^a-zA-Z]/g, '').toLowerCase();
  if (!cleanFirst || !cleanLast) {
    return `user${index}@petmat.com`;
  }
  return `${cleanFirst}.${cleanLast}${index}@petmat.com`;
}

async function main() {
  console.log('🌱 بدء إضافة 50 حساب و 50 حيوان أليف...\n');

  const password = await bcrypt.hash('Demo@12345', 12);
  const createdUsers = [];

  // إنشاء 50 مستخدم
  console.log('👥 إنشاء 50 مستخدم...');
  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const email = generateEmail(firstName, lastName, i + 1);
    const city = cities[i % cities.length];
    const isBreeder = i % 3 === 0;

    try {
      const user = await prisma.user.create({
        data: {
          email: email,
          password: password,
          firstName: firstName,
          lastName: lastName,
          phone: `+1${String(Math.floor(Math.random() * 9000000000) + 1000000000)}`,
          role: isBreeder ? 'BREEDER' : 'USER',
          isVerified: true,
          bio: `محب للحيوانات الأليفة من ${city}`,
          address: `${city}, Egypt`,
          city: city,
          country: 'Egypt',
          rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
          totalReviews: Math.floor(Math.random() * 20),
        },
      });
      createdUsers.push(user);
      console.log(`✓ ${i + 1}/50: ${user.email}`);
    } catch (error) {
      console.error(`✗ ${i + 1}:`, error.message);
    }
  }

  console.log(`\n✅ تم إنشاء ${createdUsers.length} مستخدم!\n`);

  // إنشاء 50 حيوان أليف
  console.log('🐾 إنشاء 50 حيوان أليف...');
  
  const createdPets = [];
  let petIndex = 0;

  // 20 كلب
  for (let i = 0; i < 20 && i < dogBreeds.length; i++) {
    const breed = dogBreeds[i];
    const owner = createdUsers[petIndex % createdUsers.length];
    if (!owner) continue;

    const petName = petNames[petIndex % petNames.length];
    const age = 1 + Math.random() * 8;
    const gender = petIndex % 2 === 0 ? 'MALE' : 'FEMALE';
    const imageUrl = `${dogImages[i]}?w=600&h=600&fit=crop`;

    try {
      const pet = await prisma.pet.create({
        data: {
          name: petName,
          species: 'Dog',
          breed: breed,
          gender: gender,
          dateOfBirth: new Date(Date.now() - age * 365 * 24 * 60 * 60 * 1000),
          weight: 15 + Math.random() * 35,
          height: 40 + Math.random() * 40,
          color: ['Golden', 'Brown', 'Black', 'White', 'Cream'][i % 5],
          description: `${petName} كلب جميل من نوع ${breed}. صحته ممتازة وشخصيته رائعة ومحبة للعب.`,
          isVaccinated: true,
          isNeutered: Math.random() > 0.5,
          lastHealthCheckDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
          nextVaccinationDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000),
          breedingStatus: Math.random() > 0.3 ? 'AVAILABLE' : 'NOT_AVAILABLE',
          breedingPrice: 500 + Math.random() * 1500,
          hasPedigree: Math.random() > 0.4,
          pedigreeNumber: Math.random() > 0.4 ? `PED-DOG-${String(10000 + petIndex).padStart(5, '0')}` : null,
          registrationNumber: `REG-DOG-${String(20000 + petIndex).padStart(5, '0')}`,
          microchipNumber: `MC-DOG-${String(30000 + petIndex).padStart(5, '0')}`,
          images: [imageUrl],
          videos: [],
          ownerId: owner.id,
          isPublished: true,
          isActive: true,
        },
      });

      // إضافة سجل صحي
      await prisma.healthRecord.create({
        data: {
          petId: pet.id,
          recordType: 'CHECKUP',
          recordDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
          veterinarianName: `Dr. ${lastNames[petIndex % lastNames.length]}`,
          clinicName: `${cities[petIndex % cities.length]} Pet Clinic`,
          details: 'فحص صحي شامل - حالة ممتازة',
        },
      });

      createdPets.push(pet);
      console.log(`✓ ${petIndex + 1}/50: ${pet.name} (${breed})`);
      petIndex++;
    } catch (error) {
      console.error(`✗ ${petIndex + 1}:`, error.message);
      petIndex++;
    }
  }

  // 20 قط
  for (let i = 0; i < 20 && i < catBreeds.length; i++) {
    const breed = catBreeds[i];
    const owner = createdUsers[petIndex % createdUsers.length];
    if (!owner) continue;

    const petName = petNames[petIndex % petNames.length];
    const age = 1 + Math.random() * 8;
    const gender = petIndex % 2 === 0 ? 'MALE' : 'FEMALE';
    const imageUrl = `${catImages[i]}?w=600&h=600&fit=crop`;

    try {
      const pet = await prisma.pet.create({
        data: {
          name: petName,
          species: 'Cat',
          breed: breed,
          gender: gender,
          dateOfBirth: new Date(Date.now() - age * 365 * 24 * 60 * 60 * 1000),
          weight: 3 + Math.random() * 7,
          height: 20 + Math.random() * 15,
          color: ['Orange', 'Gray', 'White', 'Black', 'Tabby'][i % 5],
          description: `${petName} قط جميل من نوع ${breed}. هادئ ومحبوب ويحب اللعب.`,
          isVaccinated: true,
          isNeutered: Math.random() > 0.5,
          lastHealthCheckDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
          nextVaccinationDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000),
          breedingStatus: Math.random() > 0.3 ? 'AVAILABLE' : 'NOT_AVAILABLE',
          breedingPrice: 300 + Math.random() * 700,
          hasPedigree: Math.random() > 0.4,
          pedigreeNumber: Math.random() > 0.4 ? `PED-CAT-${String(10000 + petIndex).padStart(5, '0')}` : null,
          registrationNumber: `REG-CAT-${String(20000 + petIndex).padStart(5, '0')}`,
          microchipNumber: `MC-CAT-${String(30000 + petIndex).padStart(5, '0')}`,
          images: [imageUrl],
          videos: [],
          ownerId: owner.id,
          isPublished: true,
          isActive: true,
        },
      });

      await prisma.healthRecord.create({
        data: {
          petId: pet.id,
          recordType: 'CHECKUP',
          recordDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
          veterinarianName: `Dr. ${lastNames[petIndex % lastNames.length]}`,
          clinicName: `${cities[petIndex % cities.length]} Veterinary Clinic`,
          details: 'فحص دوري - صحة جيدة',
        },
      });

      createdPets.push(pet);
      console.log(`✓ ${petIndex + 1}/50: ${pet.name} (${breed})`);
      petIndex++;
    } catch (error) {
      console.error(`✗ ${petIndex + 1}:`, error.message);
      petIndex++;
    }
  }

  // 10 طيور
  for (let i = 0; i < 10 && i < birdBreeds.length; i++) {
    const breed = birdBreeds[i];
    const owner = createdUsers[petIndex % createdUsers.length];
    if (!owner) continue;

    const petName = petNames[petIndex % petNames.length];
    const age = 0.5 + Math.random() * 5;
    const gender = petIndex % 2 === 0 ? 'MALE' : 'FEMALE';
    const imageUrl = `${birdImages[i]}?w=600&h=600&fit=crop`;

    try {
      const pet = await prisma.pet.create({
        data: {
          name: petName,
          species: 'Bird',
          breed: breed,
          gender: gender,
          dateOfBirth: new Date(Date.now() - age * 365 * 24 * 60 * 60 * 1000),
          weight: 0.1 + Math.random() * 0.5,
          height: 15 + Math.random() * 10,
          color: ['Yellow', 'Green', 'Blue', 'Red', 'White'][i % 5],
          description: `${petName} طائر جميل من نوع ${breed}. نشيط وصوته رائع.`,
          isVaccinated: true,
          isNeutered: false,
          lastHealthCheckDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
          nextVaccinationDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000),
          breedingStatus: Math.random() > 0.3 ? 'AVAILABLE' : 'NOT_AVAILABLE',
          breedingPrice: 100 + Math.random() * 400,
          hasPedigree: Math.random() > 0.5,
          pedigreeNumber: Math.random() > 0.5 ? `PED-BIRD-${String(10000 + petIndex).padStart(5, '0')}` : null,
          registrationNumber: `REG-BIRD-${String(20000 + petIndex).padStart(5, '0')}`,
          microchipNumber: null,
          images: [imageUrl],
          videos: [],
          ownerId: owner.id,
          isPublished: true,
          isActive: true,
        },
      });

      await prisma.healthRecord.create({
        data: {
          petId: pet.id,
          recordType: 'CHECKUP',
          recordDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
          veterinarianName: `Dr. ${lastNames[petIndex % lastNames.length]}`,
          clinicName: `${cities[petIndex % cities.length]} Avian Clinic`,
          details: 'فحص صحي - الطائر في حالة ممتازة',
        },
      });

      createdPets.push(pet);
      console.log(`✓ ${petIndex + 1}/50: ${pet.name} (${breed})`);
      petIndex++;
    } catch (error) {
      console.error(`✗ ${petIndex + 1}:`, error.message);
      petIndex++;
    }
  }

  const dogCount = createdPets.filter(p => p.species === 'Dog').length;
  const catCount = createdPets.filter(p => p.species === 'Cat').length;
  const birdCount = createdPets.filter(p => p.species === 'Bird').length;

  console.log('\n📊 النتيجة النهائية:');
  console.log(`   👥 المستخدمين: ${createdUsers.length}`);
  console.log(`   🐾 الحيوانات: ${createdPets.length}`);
  console.log(`      🐕 كلاب: ${dogCount}`);
  console.log(`      🐈 قطط: ${catCount}`);
  console.log(`      🦜 طيور: ${birdCount}`);
  console.log('\n✨ تم بنجاح!\n');
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
