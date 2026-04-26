import type { DisputeDTO } from '@rebook/shared';
import type { DisputeRow } from '../../db/schema/disputes';

export function toDisputeDTO(row: DisputeRow): DisputeDTO {
  return {
    id: row.id,
    orderId: row.orderId,
    openedByUserId: row.openedByUserId,
    reason: row.reason,
    status: row.status,
    handledByUserId: row.handledByUserId,
    resolution: row.resolution,
    evidenceKeys: row.evidenceKeys ?? [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
