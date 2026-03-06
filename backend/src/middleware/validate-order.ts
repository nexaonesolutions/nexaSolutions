import { Request, Response, NextFunction } from 'express';

export const validateOrder = (req: Request, res: Response, next: NextFunction) => {
  // Validate fields that the order controller actually expects
  const { mainPlanName, total } = req.body;

  const errors: string[] = [];

  if (!mainPlanName) {
    errors.push('O campo "mainPlanName" (plano principal) é obrigatório.');
  }

  if (total === undefined || total === null) {
    errors.push('O campo "total" (preço) é obrigatório.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Dados do pedido incompletos ou inválidos.',
      errors
    });
  }

  next();
};
