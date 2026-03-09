import prisma from '../prisma/client.js';
import { AppError } from '../utils/appError.js';

export const sendMatchRequest = async (req, res) => {
  const { senderPetId, targetPetId, message } = req.body;

  if (senderPetId === targetPetId) {
    throw new AppError('Cannot send a match request to the same pet', 400);
  }

  const [senderPet, targetPet] = await Promise.all([
    prisma.pet.findUnique({ where: { id: senderPetId }, select: { id: true, ownerId: true } }),
    prisma.pet.findUnique({ where: { id: targetPetId }, select: { id: true, ownerId: true } }),
  ]);

  if (!senderPet || !targetPet) {
    throw new AppError('Pet not found', 404);
  }

  if (senderPet.ownerId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403);
  }

  const duplicatePending = await prisma.matchRequest.findFirst({
    where: {
      senderPetId,
      targetPetId,
      status: 'pending',
    },
    select: { id: true },
  });

  if (duplicatePending) {
    throw new AppError('A pending request already exists', 409);
  }

  const match = await prisma.matchRequest.create({
    data: { senderPetId, targetPetId, message },
  });

  res.status(201).json(match);
};

export const acceptMatchRequest = async (req, res) => {
  const id = req.params.id;

  const existingRequest = await prisma.matchRequest.findUnique({
    where: { id },
    include: {
      targetPet: { select: { ownerId: true } },
    },
  });

  if (!existingRequest) {
    throw new AppError('Match request not found', 404);
  }

  if (existingRequest.targetPet.ownerId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403);
  }

  if (existingRequest.status !== 'pending') {
    throw new AppError('Only pending requests can be accepted', 400);
  }

  const request = await prisma.matchRequest.update({ where: { id }, data: { status: 'accepted' } });
  res.json(request);
};

export const rejectMatchRequest = async (req, res) => {
  const id = req.params.id;

  const existingRequest = await prisma.matchRequest.findUnique({
    where: { id },
    include: {
      targetPet: { select: { ownerId: true } },
    },
  });

  if (!existingRequest) {
    throw new AppError('Match request not found', 404);
  }

  if (existingRequest.targetPet.ownerId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403);
  }

  if (existingRequest.status !== 'pending') {
    throw new AppError('Only pending requests can be rejected', 400);
  }

  const request = await prisma.matchRequest.update({ where: { id }, data: { status: 'rejected' } });
  res.json(request);
};
