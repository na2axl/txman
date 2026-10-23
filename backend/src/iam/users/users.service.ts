import { Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { eq } from 'drizzle-orm';
import { users } from '../../db/index.js';
import type { Database } from '../../db/types.js';

export type User = typeof users.$inferSelect;

/**
 * The service for managing users.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
@Injectable()
export class UsersService {
  constructor(@InjectDrizzle() private readonly db: Database) {}

  /**
   * Finds a user by its username.
   * @param username The username of the user to find.
   * @returns The user if found, null otherwise.
   */
  async findByUsername(username: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return user ?? null;
  }

  /**
   * Finds a user by its ID.
   * @param id The ID of the user to find.
   * @returns The user if found, null otherwise.
   */
  async findById(id: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user ?? null;
  }
}
