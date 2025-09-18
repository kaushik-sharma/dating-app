import mongoose, { ClientSession } from "mongoose";

/**
 * Run a function inside a mongoose transaction and return its result.
 *
 * - The callback `work` receives a `ClientSession` and should attach `{ session }`
 *   to all mongoose operations inside the transaction.
 * - Uses session.withTransaction(...) so transient transaction errors are retried
 *   according to the MongoDB driver's built-in behavior.
 *
 * @example
 * await withTransaction(async (session) => {
 *   const user = new UserModel({ name: 'A' });
 *   await user.save({ session });
 *   await SessionModel.create([{ userId: user._id }], { session });
 *   return user;
 * });
 *
 * @param work - async fn that performs DB operations using the provided session
 * @param txOptions - optional TransactionOptions (read/writeConcern, readConcern, etc)
 * @returns value returned by work()
 */
export async function withTransaction<T>(work: (session: ClientSession) => Promise<T>): Promise<T> {
  const session = await mongoose.startSession();

  try {
    let result: T;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result!;
  } finally {
    await session.endSession();
  }
}
