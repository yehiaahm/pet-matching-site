/**
 * بيانات وهمية للحيوانات الأليفة
 * Mock Data for Pets
 */

export interface MockPet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed: string;
  age: number;
  gender: 'male' | 'female';
  location: string;
  latitude: number;
  longitude: number;
  price?: number;
  description: string;
  image: string;
  images?: string[];
  owner: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerImage: string;
  verified: boolean;
  rating: number;
  reviews: number;
  badges: string[];
  healthCertificate?: boolean;
  vaccines?: string[];
  createdAt: Date;
  available: boolean;
  pedigree?: string;
}

export const mockPets: MockPet[] = [
  {
    id: 'dog-1',
    name: 'ماكس',
    type: 'dog',
    breed: 'جولدن ريتريفر',
    age: 3,
    gender: 'male',
    location: 'الرياض، حي النخيل',
    latitude: 24.7136,
    longitude: 46.6753,
    price: 2500,
    description: 'كلب جولدن ريتريفر أصيل جداً، صحي وودود جداً مع الأطفال',
    image: 'https://images.unsplash.com/photo-1633722715463-d30628519c73?w=500',
    owner: 'محمد علي',
    ownerPhone: '+966501234567',
    ownerEmail: 'm.ali@example.com',
    ownerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    verified: true,
    rating: 4.9,
    reviews: 23,
    badges: ['موثق', 'مميز', 'سريع التسليم'],
    healthCertificate: true,
    vaccines: ['داء الكلب', 'الطاعون', 'البارفو'],
    createdAt: new Date('2025-01-10'),
    available: true,
    pedigree: 'FCI'
  },
  {
    id: 'cat-1',
    name: 'لولا',
    type: 'cat',
    breed: 'الفارس الفارسي',
    age: 2,
    gender: 'female',
    location: 'جدة، حي الروضة',
    latitude: 21.5433,
    longitude: 39.1728,
    price: 1500,
    description: 'قطة فارسية جميلة جداً، هادئة وحنونة، تحب الألعاب',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500',
    owner: 'فاطمة أحمد',
    ownerPhone: '+966502345678',
    ownerEmail: 'f.ahmed@example.com',
    ownerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    verified: true,
    rating: 4.8,
    reviews: 18,
    badges: ['موثق', 'جديد'],
    healthCertificate: true,
    vaccines: ['التطعيم الثلاثي'],
    createdAt: new Date('2025-01-15'),
    available: true
  },
  {
    id: 'dog-2',
    name: 'روكي',
    type: 'dog',
    breed: 'جيرمان شيبرد',
    age: 4,
    gender: 'male',
    location: 'الدمام، حي الخليج',
    latitude: 26.4124,
    longitude: 50.1971,
    price: 3200,
    description: 'جيرمان شيبرد قوي وذكي جداً، مدرب على الحماية والطاعة',
    image: 'https://images.unsplash.com/photo-1568596694728-75060Cdf5b9b?w=500',
    owner: 'سارة خالد',
    ownerPhone: '+966503456789',
    ownerEmail: 's.khaled@example.com',
    ownerImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    verified: true,
    rating: 5.0,
    reviews: 31,
    badges: ['موثق', 'مميز', 'خبير'],
    healthCertificate: true,
    vaccines: ['كامل التطعيمات'],
    createdAt: new Date('2025-01-05'),
    available: true,
    pedigree: 'FCI معتمد'
  },
  {
    id: 'rabbit-1',
    name: 'بيتر',
    type: 'rabbit',
    breed: 'هولندي',
    age: 1,
    gender: 'male',
    location: 'القاهرة، مصر الجديدة',
    latitude: 30.0444,
    longitude: 31.3536,
    price: 400,
    description: 'أرنب هولندي جميل جداً، صغير ونظيف وهادئ',
    image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4d4b3f4?w=500',
    owner: 'علي محمود',
    ownerPhone: '+201001234567',
    ownerEmail: 'a.mahmoud@example.com',
    ownerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    verified: true,
    rating: 4.7,
    reviews: 12,
    badges: ['موثق'],
    healthCertificate: false,
    createdAt: new Date('2025-01-12'),
    available: true
  },
  {
    id: 'bird-1',
    name: 'أمازون',
    type: 'bird',
    breed: 'ببغاء أمازون',
    age: 5,
    gender: 'female',
    location: 'الكويت، الشرق',
    latitude: 29.3759,
    longitude: 47.9774,
    price: 800,
    description: 'ببغاء أمازون جميل، يتحدث عدة كلمات، صحي جداً',
    image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=500',
    owner: 'نور علي',
    ownerPhone: '+96596234567',
    ownerEmail: 'n.ali@example.com',
    ownerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    verified: true,
    rating: 4.6,
    reviews: 9,
    badges: ['موثق'],
    healthCertificate: true,
    createdAt: new Date('2025-01-08'),
    available: true
  },
  {
    id: 'dog-3',
    name: 'بيلا',
    type: 'dog',
    breed: 'لابرادور ريتريفر',
    age: 2,
    gender: 'female',
    location: 'أبوظبي، بني ياس',
    latitude: 24.4539,
    longitude: 54.3773,
    price: 2800,
    description: 'كلبة لابرادور سوداء جميلة، ودية وحنونة، تحب السباحة',
    image: 'https://images.unsplash.com/photo-1633722715463-d30628519c73?w=500',
    owner: 'مريم حسن',
    ownerPhone: '+971501234567',
    ownerEmail: 'm.hassan@example.com',
    ownerImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    verified: true,
    rating: 4.9,
    reviews: 20,
    badges: ['موثق', 'مميز'],
    healthCertificate: true,
    vaccines: ['كامل التطعيمات'],
    createdAt: new Date('2025-01-14'),
    available: true
  },
  {
    id: 'cat-2',
    name: 'سيمبا',
    type: 'cat',
    breed: 'بنغال',
    age: 1,
    gender: 'male',
    location: 'الدوحة، الدفنة',
    latitude: 25.2854,
    longitude: 51.5310,
    price: 2200,
    description: 'قطة بنغال جميلة جداً، نشيطة وذكية، حب الألعاب والقفز',
    image: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=500',
    owner: 'خديجة محمد',
    ownerPhone: '+97433456789',
    ownerEmail: 'k.mohammed@example.com',
    ownerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    verified: true,
    rating: 4.8,
    reviews: 15,
    badges: ['موثق', 'جديد'],
    healthCertificate: true,
    createdAt: new Date('2025-01-16'),
    available: true
  },
  {
    id: 'dog-4',
    name: 'شارلي',
    type: 'dog',
    breed: 'بولدوغ انجليزي',
    age: 3,
    gender: 'male',
    location: 'الرياض، العليا',
    latitude: 24.7553,
    longitude: 46.7160,
    price: 2000,
    description: 'بولدوغ انجليزي أصيل، هادئ وودود، صحي تماماً',
    image: 'https://images.unsplash.com/photo-1583511655857-d19db992cb74?w=500',
    owner: 'يوسف إبراهيم',
    ownerPhone: '+966504567890',
    ownerEmail: 'y.ibrahim@example.com',
    ownerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    verified: true,
    rating: 4.7,
    reviews: 16,
    badges: ['موثق'],
    healthCertificate: true,
    createdAt: new Date('2025-01-11'),
    available: true
  },
  {
    id: 'rabbit-2',
    name: 'ماريا',
    type: 'rabbit',
    breed: 'أنجورا',
    age: 2,
    gender: 'female',
    location: 'جدة، النسيم',
    latitude: 21.5480,
    longitude: 39.1724,
    price: 600,
    description: 'أرنب أنجورا ناعم الفرو جداً، رقيق وحنون',
    image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4d4b3f4?w=500',
    owner: 'ليلى عمر',
    ownerPhone: '+966505678901',
    ownerEmail: 'l.omar@example.com',
    ownerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    verified: true,
    rating: 4.8,
    reviews: 11,
    badges: ['موثق'],
    healthCertificate: true,
    createdAt: new Date('2025-01-13'),
    available: true
  },
  {
    id: 'dog-5',
    name: 'دافن',
    type: 'dog',
    breed: 'دوبيرمان',
    age: 4,
    gender: 'male',
    location: 'الكويت، المنطقة العاشرة',
    latitude: 29.3517,
    longitude: 47.8745,
    price: 3500,
    description: 'دوبيرمان قوي وجميل، مدرب على أعلى مستويات، صاحب بطولات',
    image: 'https://images.unsplash.com/photo-1577889265628-d5d82c9e6ae0?w=500',
    owner: 'فهد الشمري',
    ownerPhone: '+96598765432',
    ownerEmail: 'f.al-shammari@example.com',
    ownerImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    verified: true,
    rating: 5.0,
    reviews: 35,
    badges: ['موثق', 'مميز', 'خبير بطل'],
    healthCertificate: true,
    vaccines: ['كامل التطعيمات والفحوصات'],
    createdAt: new Date('2025-01-09'),
    available: false,
    pedigree: 'بطولات عالمية'
  }
];

export const mockUsers = [
  {
    id: 'user-1',
    name: 'محمد علي',
    email: 'm.ali@example.com',
    phone: '+966501234567',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    verified: true,
    rating: 4.9,
    reviews: 23,
    pets: 1,
    joinDate: new Date('2024-06-15')
  },
  {
    id: 'user-2',
    name: 'فاطمة أحمد',
    email: 'f.ahmed@example.com',
    phone: '+966502345678',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    verified: true,
    rating: 4.8,
    reviews: 18,
    pets: 1,
    joinDate: new Date('2024-07-20')
  },
  {
    id: 'user-3',
    name: 'سارة خالد',
    email: 's.khaled@example.com',
    phone: '+966503456789',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    verified: true,
    rating: 5.0,
    reviews: 31,
    pets: 1,
    joinDate: new Date('2024-05-10')
  }
];

export const petTypes = ['dog', 'cat', 'bird', 'rabbit', 'other'];
export const petBreeds = {
  dog: [
    'جولدن ريتريفر',
    'جيرمان شيبرد',
    'لابرادور ريتريفر',
    'بولدوغ انجليزي',
    'دوبيرمان',
    'بودل',
    'شيواوا',
    'بيتبول'
  ],
  cat: [
    'الفارس الفارسي',
    'بنغال',
    'سيامي',
    'مين كون',
    'بريطاني قصير الشعر'
  ],
  bird: [
    'ببغاء أمازون',
    'كوكاتيل',
    'ببغاء رمادي أفريقي',
    'حمام'
  ],
  rabbit: [
    'هولندي',
    'أنجورا',
    'نيوزيلندي',
    'فلمندر'
  ],
  other: ['غيره']
};

// دالة لاختيار صورة عشوائية
export const getRandomPetImage = (type: string): string => {
  const images = {
    dog: [
      'https://images.unsplash.com/photo-1633722715463-d30628519c73?w=500',
      'https://images.unsplash.com/photo-1568596694728-75060Cdf5b9b?w=500',
      'https://images.unsplash.com/photo-1577889265628-d5d82c9e6ae0?w=500',
      'https://images.unsplash.com/photo-1583511655857-d19db992cb74?w=500'
    ],
    cat: [
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500',
      'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=500'
    ],
    bird: [
      'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=500'
    ],
    rabbit: [
      'https://images.unsplash.com/photo-1585110396000-c9ffd4d4b3f4?w=500'
    ]
  };

  const typeImages = images[type as keyof typeof images] || images.dog;
  return typeImages[Math.floor(Math.random() * typeImages.length)];
};

export default mockPets;
