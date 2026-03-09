import prisma from '../prisma/client.js';
import { AppError } from '../utils/appError.js';

export const addHealthRecord = async (req, res) => {
  const { petId, vaccine, notes, vetName, date } = req.body;

  const pet = await prisma.pet.findUnique({ where: { id: petId }, select: { ownerId: true } });
  if (!pet) throw new AppError('Pet not found', 404);
  if (pet.ownerId !== req.user.id && req.user.role !== 'admin') throw new AppError('Forbidden', 403);

  const record = await prisma.healthRecord.create({
    data: { petId, vaccine, notes, vetName, date: date ? new Date(date) : undefined },
  });

  res.status(201).json(record);
};

export const getHealthByPet = async (req, res) => {
  const pet = await prisma.pet.findUnique({ where: { id: req.params.petId }, select: { ownerId: true } });
  if (!pet) throw new AppError('Pet not found', 404);
  if (pet.ownerId !== req.user.id && req.user.role !== 'admin') throw new AppError('Forbidden', 403);

  const records = await prisma.healthRecord.findMany({ where: { petId: req.params.petId }, orderBy: { date: 'desc' } });
  res.json(records);
};

export const deleteHealth = async (req, res) => {
  const record = await prisma.healthRecord.findUnique({
    where: { id: req.params.id },
    include: { pet: { select: { ownerId: true } } },
  });

  if (!record) throw new AppError('Health record not found', 404);
  if (record.pet.ownerId !== req.user.id && req.user.role !== 'admin') throw new AppError('Forbidden', 403);

  await prisma.healthRecord.delete({ where: { id: req.params.id } });
  res.json({ message: 'Deleted' });
};
