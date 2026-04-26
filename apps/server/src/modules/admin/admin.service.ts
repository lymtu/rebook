import {
  ERROR_CODES,
  type AdminSetUserStatusInput,
  type PromoteUserInput,
  type ReviewBookInput,
  type UserDTO,
} from '@rebook/shared';
import { AppError } from '../../lib/errors';
import type { AuthContext } from '../../lib/auth';
import { bookService } from '../book/book.service';
import { userRepo } from '../user/user.repo';
import { toUserDTO } from '../user/user.mapper';

export const adminService = {
  async listUsers(limit: number): Promise<{ items: UserDTO[] }> {
    const rows = await userRepo.listRecentForAdmin(limit);
    return { items: rows.map((r) => toUserDTO(r)) };
  },

  reviewBook(actor: AuthContext, bookId: string, input: ReviewBookInput) {
    if (actor.role !== 'admin' && actor.role !== 'super_admin') {
      throw new AppError(ERROR_CODES.FORBIDDEN, 403);
    }
    return bookService.review(actor.id, bookId, input);
  },

  async setUserStatus(actor: AuthContext, targetId: string, input: AdminSetUserStatusInput) {
    if (actor.role !== 'admin' && actor.role !== 'super_admin') {
      throw new AppError(ERROR_CODES.FORBIDDEN, 403);
    }
    const target = await userRepo.findById(targetId);
    if (!target) throw new AppError(ERROR_CODES.USER_NOT_FOUND, 404);
    if (actor.role === 'admin' && (target.role === 'admin' || target.role === 'super_admin')) {
      throw new AppError(ERROR_CODES.FORBIDDEN, 403);
    }
    const row = await userRepo.update(targetId, { status: input.status });
    return toUserDTO(row!);
  },

  async promote(actor: AuthContext, input: PromoteUserInput) {
    if (actor.role !== 'super_admin') throw new AppError(ERROR_CODES.FORBIDDEN, 403);
    const target = await userRepo.findById(input.userId);
    if (!target) throw new AppError(ERROR_CODES.USER_NOT_FOUND, 404);
    const row = await userRepo.update(input.userId, { role: input.role });
    return toUserDTO(row!);
  },
};
