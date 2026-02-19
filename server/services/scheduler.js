import cron from 'node-cron';
import logger from '../config/logger.js';

// Example function: calculate optimal breeding window for dogs
// Dogs: estrus every ~6 months; fertile window ~day 9-14 of heat
function calculateDogBreedingWindow(lastHeatDate) {
  const cycleDays = 180; // 6 months
  const fertileStartOffset = 9; // days after heat start
  const fertileEndOffset = 14;
  const nextHeat = new Date(lastHeatDate);
  nextHeat.setDate(nextHeat.getDate() + cycleDays);
  const fertileStart = new Date(nextHeat);
  fertileStart.setDate(fertileStart.getDate() + fertileStartOffset);
  const fertileEnd = new Date(nextHeat);
  fertileEnd.setDate(fertileEnd.getDate() + fertileEndOffset);
  return { nextHeat, fertileStart, fertileEnd };
}

// Cats: seasonally polyestrous; assume ~21-day cycles, fertile ~day 2-5
function calculateCatBreedingWindow(lastHeatDate) {
  const cycleDays = 21;
  const fertileStartOffset = 2;
  const fertileEndOffset = 5;
  const nextHeat = new Date(lastHeatDate);
  nextHeat.setDate(nextHeat.getDate() + cycleDays);
  const fertileStart = new Date(nextHeat);
  fertileStart.setDate(fertileStart.getDate() + fertileStartOffset);
  const fertileEnd = new Date(nextHeat);
  fertileEnd.setDate(fertileEnd.getDate() + fertileEndOffset);
  return { nextHeat, fertileStart, fertileEnd };
}

// Schedule reminders daily at 08:00
export function startSchedulers({ prisma, notify }) {
  // notify: async (userId, title, message, data)
  cron.schedule('0 8 * * *', async () => {
    try {
      logger.info('⏰ Running daily breeding schedule reminder job');
      // Fetch pets with lastHeatDate
      const pets = await prisma.pet.findMany({
        where: { status: 'AVAILABLE' },
        select: { id: true, ownerId: true, type: true, updatedAt: true },
      });
      for (const p of pets) {
        // Placeholder: use updatedAt as lastHeatDate
        const lastHeatDate = p.updatedAt;
        const calc = p.type === 'DOG' ? calculateDogBreedingWindow(lastHeatDate) : calculateCatBreedingWindow(lastHeatDate);
        const now = new Date();
        if (now >= calc.fertileStart && now <= calc.fertileEnd) {
          await notify(p.ownerId, 'Optimal Breeding Window', 'Your pet is in optimal breeding days', {
            petId: p.id,
            fertileStart: calc.fertileStart,
            fertileEnd: calc.fertileEnd,
          });
        }
      }
      logger.info('✅ Breeding reminders job completed');
    } catch (err) {
      logger.error('Breeding reminder job failed', err);
    }
  }, { timezone: 'UTC' });
}

export { calculateDogBreedingWindow, calculateCatBreedingWindow };
