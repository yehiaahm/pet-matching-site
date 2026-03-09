import prisma from '../prisma/client.js';
import { AppError } from '../utils/appError.js';

const GROUP_DEFINITIONS = [
  {
    key: 'cats',
    title: 'Cats Community',
    titleAr: 'مجتمع القطط',
    petTypes: ['cat'],
  },
  {
    key: 'dogs',
    title: 'Dogs Community',
    titleAr: 'مجتمع الكلاب',
    petTypes: ['dog'],
  },
  {
    key: 'birds',
    title: 'Birds Community',
    titleAr: 'مجتمع الطيور',
    petTypes: ['bird'],
  },
  {
    key: 'others',
    title: 'Other Pets Community',
    titleAr: 'مجتمع الحيوانات الأخرى',
    petTypes: ['rabbit', 'other'],
  },
];

const normalizePetType = (value) => String(value || '').trim().toLowerCase();

const groupByKey = new Map(GROUP_DEFINITIONS.map((group) => [group.key, group]));

const petTypeToGroupKey = (petType) => {
  const normalized = normalizePetType(petType);
  const found = GROUP_DEFINITIONS.find((group) => group.petTypes.includes(normalized));
  return found?.key || null;
};

const mapOwnerSummary = (owner) => ({
  id: owner.id,
  firstName: owner.firstName || '',
  lastName: owner.lastName || '',
  email: owner.email || '',
  avatar: owner.avatar || null,
  isVerified: Boolean(owner.isVerified),
  role: owner.role || 'USER',
});

export const listAutoGroups = async (_req, res) => {
  const pets = await prisma.pet.findMany({
    select: {
      type: true,
      ownerId: true,
    },
  });

  const ownersPerGroup = new Map(GROUP_DEFINITIONS.map((group) => [group.key, new Set()]));

  for (const pet of pets) {
    const groupKey = petTypeToGroupKey(pet.type);
    if (!groupKey) continue;
    ownersPerGroup.get(groupKey)?.add(pet.ownerId);
  }

  const groups = GROUP_DEFINITIONS.map((group) => ({
    key: group.key,
    title: group.title,
    titleAr: group.titleAr,
    petTypes: group.petTypes,
    membershipMode: 'AUTO',
    membersCount: ownersPerGroup.get(group.key)?.size || 0,
  }));

  res.json({
    success: true,
    data: groups,
  });
};

export const myAutoGroups = async (req, res) => {
  const pets = await prisma.pet.findMany({
    where: { ownerId: req.user.id },
    select: { type: true },
  });

  const keys = new Set();
  pets.forEach((pet) => {
    const key = petTypeToGroupKey(pet.type);
    if (key) keys.add(key);
  });

  const groups = GROUP_DEFINITIONS.filter((group) => keys.has(group.key)).map((group) => ({
    key: group.key,
    title: group.title,
    titleAr: group.titleAr,
    petTypes: group.petTypes,
    membershipMode: 'AUTO',
    isMember: true,
  }));

  res.json({
    success: true,
    data: groups,
  });
};

export const groupMembers = async (req, res) => {
  const groupKey = String(req.params.groupKey || '').toLowerCase();
  const group = groupByKey.get(groupKey);

  if (!group) {
    throw new AppError('Group not found', 404);
  }

  const pets = await prisma.pet.findMany({
    where: {
      type: {
        in: group.petTypes,
        mode: 'insensitive',
      },
    },
    select: {
      ownerId: true,
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          isVerified: true,
          role: true,
        },
      },
    },
  });

  const uniqueOwners = new Map();
  for (const pet of pets) {
    if (uniqueOwners.has(pet.ownerId)) continue;
    uniqueOwners.set(pet.ownerId, mapOwnerSummary(pet.owner));
  }

  res.json({
    success: true,
    data: {
      group: {
        key: group.key,
        title: group.title,
        titleAr: group.titleAr,
        petTypes: group.petTypes,
        membershipMode: 'AUTO',
      },
      members: Array.from(uniqueOwners.values()),
      total: uniqueOwners.size,
    },
  });
};
