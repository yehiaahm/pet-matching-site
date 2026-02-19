import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/index.js';
import { catchAsync } from '../middleware/errorHandler.js';
import { sendSuccess, sendError } from '../utils/response.js';
import logger from '../config/logger.js';

// Resolve legal.json relative to this file to avoid depending on process.cwd()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const legalPath = path.join(__dirname, '..', 'data', 'legal.json');

export const getTerms = catchAsync(async (req, res, next) => {
  logger.info({ message: 'legal.getTerms called', url: req.originalUrl, method: req.method, requestId: req.id });
  const langQuery = (req.query.lang || req.headers['accept-language'] || 'en').toString();
  const lang = langQuery.startsWith('ar') ? 'ar' : 'en';

  let json;
  try {
    const raw = await fs.readFile(legalPath, 'utf-8');
    json = JSON.parse(raw);
  } catch (err) {
    logger.error({ message: 'Failed to load legal content', err, legalPath });
    return sendError(res, 500, 'Failed to load legal content');
  }

  const terms = json.terms?.[lang] || json.terms?.en;

  return sendSuccess(res, 200, 'Terms retrieved', { lang, title: terms.title, content: terms.content });
});

export const getPrivacy = catchAsync(async (req, res, next) => {
  logger.info({ message: 'legal.getPrivacy called', url: req.originalUrl, method: req.method, requestId: req.id });
  const langQuery = (req.query.lang || req.headers['accept-language'] || 'en').toString();
  const lang = langQuery.startsWith('ar') ? 'ar' : 'en';

  let json;
  try {
    const raw = await fs.readFile(legalPath, 'utf-8');
    json = JSON.parse(raw);
  } catch (err) {
    logger.error({ message: 'Failed to load legal content', err, legalPath });
    return sendError(res, 500, 'Failed to load legal content');
  }

  const privacy = json.privacy?.[lang] || json.privacy?.en;

  return sendSuccess(res, 200, 'Privacy retrieved', { lang, title: privacy.title, content: privacy.content });
});

export default { getTerms, getPrivacy };
