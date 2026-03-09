import prisma from '../prisma/client.js';

export const addPet = async (req, res) => {
  const { name, type, breed, gender, age, description, lat, lng, imageUrls } = req.body;

  const normalizedImageUrls = Array.isArray(imageUrls)
    ? imageUrls.map((item) => String(item || '').trim()).filter(Boolean)
    : [];

  const pet = await prisma.pet.create({
    data: {
      ownerId: req.user.id,
      name,
      type,
      breed,
      gender,
      age: Number(age),
      description,
      lat: lat != null ? Number(lat) : null,
      lng: lng != null ? Number(lng) : null,
      ...(normalizedImageUrls.length > 0
        ? {
            images: {
              create: normalizedImageUrls.map((url) => ({ url })),
            },
          }
        : {}),
    },
    include: { images: true },
  });

  res.status(201).json(pet);
};

export const myPets = async (req, res) => {
  const pets = await prisma.pet.findMany({ where: { ownerId: req.user.id }, include: { images: true, healthRecords: true } });
  res.json(pets);
};

export const allPets = async (_req, res) => {
  const pets = await prisma.pet.findMany({ include: { images: true } });
  res.json(pets);
};

export const petById = async (req, res) => {
  const pet = await prisma.pet.findUnique({ where: { id: req.params.id }, include: { images: true, healthRecords: true } });
  if (!pet) return res.status(404).json({ message: 'Pet not found' });
  res.json(pet);
};

export const deletePet = async (req, res) => {
  const pet = await prisma.pet.findUnique({ where: { id: req.params.id } });
  if (!pet) return res.status(404).json({ message: 'Pet not found' });
  if (pet.ownerId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

  await prisma.pet.delete({ where: { id: req.params.id } });
  res.json({ message: 'Deleted' });
};

export const updatePet = async (req, res) => {
  const pet = await prisma.pet.findUnique({ where: { id: req.params.id } });
  if (!pet) return res.status(404).json({ message: 'Pet not found' });
  if (pet.ownerId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

  const { name, type, breed, gender, age, description, lat, lng, imageUrls } = req.body;

  const data = {
    ...(name !== undefined ? { name } : {}),
    ...(type !== undefined ? { type } : {}),
    ...(breed !== undefined ? { breed } : {}),
    ...(gender !== undefined ? { gender } : {}),
    ...(age !== undefined ? { age: Number(age) } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(lat !== undefined ? { lat: Number(lat) } : {}),
    ...(lng !== undefined ? { lng: Number(lng) } : {}),
  };

  if (imageUrls !== undefined) {
    const normalizedImageUrls = Array.isArray(imageUrls)
      ? imageUrls.map((item) => String(item || '').trim()).filter(Boolean)
      : [];

    data.images = {
      deleteMany: {},
      ...(normalizedImageUrls.length > 0
        ? {
            create: normalizedImageUrls.map((url) => ({ url })),
          }
        : {}),
    };
  }

  const updatedPet = await prisma.pet.update({
    where: { id: req.params.id },
    data,
    include: { images: true, healthRecords: true },
  });

  res.json(updatedPet);
};
