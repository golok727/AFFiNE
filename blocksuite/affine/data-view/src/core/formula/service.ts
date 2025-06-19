import { createIdentifier } from '@blocksuite/global/di';

import type { Instance, Value } from '../../formula';

export type EvaluationOptions = {
  propertyId: string;
};

export interface FormulaService {
  getInstance: (propertyId: string) => Instance | null;
}

export interface EvaluationResult {
  value: Value;
  error?: Error;
}

export const FormulaServiceIdentifier = createIdentifier<FormulaService>(
  'affine-data-view-formula-service'
);
