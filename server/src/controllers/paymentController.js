import prisma from '../prisma/client.js';
import { uploadToCloudinary } from '../services/cloudinary.js';
import { AppError } from '../utils/appError.js';

export const uploadPayment = async (req, res) => {
  let screenshot = null;
  if (req.file) {
    const uploaded = await uploadToCloudinary(req.file.buffer, 'petmat/payments');
    screenshot = uploaded.secure_url;
  }

  const { amount, method } = req.body;
  const payment = await prisma.payment.create({
    data: {
      userId: req.user.id,
      amount: Number(amount),
      method,
      status: 'pending',
      screenshot,
    },
  });

  res.status(201).json(payment);
};

export const activateSubscription = async (req, res) => {
  const { planId } = req.body;
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) return res.status(404).json({ message: 'Plan not found' });

  await prisma.userSubscription.updateMany({
    where: { userId: req.user.id, status: 'active' },
    data: { status: 'expired' },
  });

  if (plan.duration <= 0) {
    throw new AppError('Invalid subscription plan duration', 400);
  }

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + plan.duration);

  const subscription = await prisma.userSubscription.create({
    data: {
      userId: req.user.id,
      planId,
      startDate,
      endDate,
      status: 'active',
    },
  });

  res.status(201).json(subscription);
};
