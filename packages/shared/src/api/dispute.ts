import type { DisputeStatus } from '../constants/dispute';

export interface DisputeDTO {
  id: string;
  orderId: string;
  openedByUserId: string;
  reason: string;
  status: DisputeStatus;
  handledByUserId: string | null;
  resolution: string | null;
  evidenceKeys: string[];
  createdAt: string;
  updatedAt: string;
}

export type { OpenDisputeInput, ResolveDisputeInput } from '../schemas/dispute';
