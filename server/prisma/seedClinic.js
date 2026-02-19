import prisma from '../config/prisma.js';

export async function seedClinic() {
  console.log('Seeding clinic and services...');

  try {
    // Create the single official clinic
    const clinic = await prisma.clinic.upsert({
      where: { id: 'petmat-clinic-001' },
      update: {},
      create: {
        id: 'petmat-clinic-001',
        name: 'PetMat Official Veterinary Clinic',
        address: '123 Pet Care Avenue, Animal District, City 12345',
        phone: '+1-555-PET-CARE',
        email: 'clinic@petmat.com',
        description: 'Official PetMat veterinary clinic providing comprehensive health services for your breeding pets. Expert care for genetic testing, health certifications, and breeding preparation.',
        operatingHours: {
          monday: { open: true, start: '09:00', end: '18:00' },
          tuesday: { open: true, start: '09:00', end: '18:00' },
          wednesday: { open: true, start: '09:00', end: '18:00' },
          thursday: { open: true, start: '09:00', end: '18:00' },
          friday: { open: true, start: '09:00', end: '18:00' },
          saturday: { open: true, start: '10:00', end: '16:00' },
          sunday: { open: false, start: null, end: null },
        },
      },
    });

    console.log('✅ Clinic created:', clinic.name);

    // Create services
    const services = [
      {
        clinicId: clinic.id,
        type: 'HEALTH_CHECKUP',
        name: 'General Health Checkup',
        description: 'Comprehensive health examination including vital signs, physical condition assessment, and overall wellness check.',
        durationMinutes: 30,
        price: 49.99,
        isActive: true,
      },
      {
        clinicId: clinic.id,
        type: 'VACCINATION',
        name: 'Vaccination Service',
        description: 'Core and non-core vaccinations for breeding pets. Includes vaccination certificate.',
        durationMinutes: 20,
        price: 35.00,
        isActive: true,
      },
      {
        clinicId: clinic.id,
        type: 'GENETIC_TEST',
        name: 'Genetic Testing & DNA Analysis',
        description: 'Comprehensive genetic testing to identify hereditary conditions and breed purity. Results in 7-10 business days.',
        durationMinutes: 45,
        price: 199.99,
        isActive: true,
      },
      {
        clinicId: clinic.id,
        type: 'MICROCHIP',
        name: 'Microchip Implantation',
        description: 'Permanent identification through microchip implantation. Includes registration.',
        durationMinutes: 15,
        price: 45.00,
        isActive: true,
      },
      {
        clinicId: clinic.id,
        type: 'CERTIFICATION',
        name: 'Breeding Certification',
        description: 'Official breeding fitness certification including health status, genetic clearances, and breeding readiness assessment.',
        durationMinutes: 60,
        price: 149.99,
        isActive: true,
      },
      {
        clinicId: clinic.id,
        type: 'EMERGENCY',
        name: 'Emergency Consultation',
        description: 'Urgent health issues requiring immediate attention. Available during operating hours.',
        durationMinutes: 30,
        price: 99.99,
        isActive: true,
      },
    ];

    for (const serviceData of services) {
      const service = await prisma.clinicService.upsert({
        where: {
          clinicId_type: {
            clinicId: serviceData.clinicId,
            type: serviceData.type,
          },
        },
        update: serviceData,
        create: serviceData,
      });
      console.log(`✅ Service created: ${service.name}`);
    }

    console.log('✨ Clinic seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding clinic:', error);
    throw error;
  }
}
