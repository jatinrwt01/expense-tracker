import express from 'express';
import {
  getBudget,
  setBudget,
  getBudgetInsights
} from '../controllers/budgetController.js';
import { validateBudget } from '../middleware/validateRequest.js';

const router = express.Router();

router.route('/insights').get(getBudgetInsights);

router
  .route('/')
  .get(getBudget)
  .post(validateBudget, setBudget);

export default router;
