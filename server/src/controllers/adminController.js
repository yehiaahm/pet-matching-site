import prisma from '../prisma/client.js';

export const adminUsers = async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(users);
};

export const adminPets = async (_req, res) => {
  const pets = await prisma.pet.findMany({ include: { owner: true }, orderBy: { createdAt: 'desc' } });
  res.json(pets);
};

export const adminPayments = async (_req, res) => {
  const payments = await prisma.payment.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' } });
  res.json(payments);
};

export const adminOrders = async (_req, res) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
          seller: {
            select: {
              id: true,
              storeName: true,
            },
          },
        },
      },
    },
  });

  res.json(orders);
};

export const verifyUser = async (req, res) => {
  const { userId } = req.body;
  const user = await prisma.user.update({ where: { id: userId }, data: { isVerified: true } });
  res.json(user);
};

export const banUser = async (req, res) => {
  const { userId } = req.body;
  const user = await prisma.user.update({ where: { id: userId }, data: { role: 'banned' } });
  res.json(user);
};

export const confirmPayment = async (req, res) => {
  const { paymentId } = req.body;
  const payment = await prisma.payment.update({ where: { id: paymentId }, data: { status: 'confirmed' } });
  res.json(payment);
};
