import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { groupMembers, listAutoGroups, myAutoGroups } from '../controllers/communityController.js';

const router = Router();

router.use(protect);

router.get('/groups', asyncHandler(listAutoGroups));
router.get('/groups/my', asyncHandler(myAutoGroups));
router.get('/groups/:groupKey/members', asyncHandler(groupMembers));

export default router;
