import prisma from '../prisma/client.js';

const scoreBreed = (a, b) => (a?.toLowerCase() === b?.toLowerCase() ? 35 : 10);
const scoreAge = (a, b) => {
  const diff = Math.abs((a || 0) - (b || 0));
  if (diff <= 1) return 25;
  if (diff <= 3) return 15;
  return 5;
};
const scoreLocation = (petA, petB) => {
  if (petA.lat == null || petA.lng == null || petB.lat == null || petB.lng == null) return 10;
  const d = Math.hypot(petA.lat - petB.lat, petA.lng - petB.lng);
  if (d < 0.2) return 20;
  if (d < 1) return 12;
  return 5;
};
const scoreHealth = (healthA, healthB) => {
  const c = Math.min(healthA.length, healthB.length);
  if (c >= 3) return 20;
  if (c >= 1) return 12;
  return 5;
};

export const getBestMatches = async (petId) => {
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    include: { healthRecords: true },
  });

  if (!pet) return [];

  const candidates = await prisma.pet.findMany({
    where: { id: { not: petId } },
    include: { healthRecords: true },
    take: 20,
  });

  const scored = candidates.map((candidate) => {
    const breed = scoreBreed(pet.breed, candidate.breed);
    const age = scoreAge(pet.age, candidate.age);
    const location = scoreLocation(pet, candidate);
    const health = scoreHealth(pet.healthRecords, candidate.healthRecords);

    const score = breed + age + location + health;

    return {
      pet: candidate,
      score,
      notes: `breed:${breed}, age:${age}, location:${location}, health:${health}`,
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, 5);
};
