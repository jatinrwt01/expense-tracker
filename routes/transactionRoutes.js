import express from 'express';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary
} from '../controllers/transactionController.js';
import { validateTransaction } from '../middleware/validateRequest.js';

const router = express.Router();

router.route('/summary').get(getTransactionSummary);

router
  .route('/')
  .get(getTransactions)
  .post(validateTransaction, createTransaction);

router
  .route('/:id')
  .get(getTransactionById)
  .put(validateTransaction, updateTransaction)
  .delete(deleteTransaction);

export default router;