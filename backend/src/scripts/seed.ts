/**
 * Creates (or resets) one account per role with known credentials so every
 * module can be tested immediately. Safe to run repeatedly.
 *
 *   npm run seed
 */
import { connectDatabase, disconnectDatabase } from "../config/db";
import { ROLES, type Role } from "../constants/roles";
import { User } from "../models/User";

interface SeedAccount {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export const SEED_ACCOUNTS: SeedAccount[] = [
  { name: "Aarav Admin", email: "admin@lms.dev", password: "Admin@123", role: ROLES.ADMIN },
  { name: "Sneha Sales", email: "sales@lms.dev", password: "Sales@123", role: ROLES.SALES },
  { name: "Rohan Sanction", email: "sanction@lms.dev", password: "Sanction@123", role: ROLES.SANCTION },
  { name: "Divya Disbursement", email: "disbursement@lms.dev", password: "Disburse@123", role: ROLES.DISBURSEMENT },
  { name: "Kabir Collection", email: "collection@lms.dev", password: "Collect@123", role: ROLES.COLLECTION },
  { name: "Priya Borrower", email: "borrower@lms.dev", password: "Borrower@123", role: ROLES.BORROWER },
];

async function seed() {
  await connectDatabase();
  await User.init(); // make sure unique indexes exist before inserting

  for (const account of SEED_ACCOUNTS) {
    const user = (await User.findOne({ email: account.email })) ?? new User({ email: account.email });
    user.set({ name: account.name, role: account.role, password: account.password });
    await user.save(); // pre-save hook hashes the password
  }

  console.table(SEED_ACCOUNTS.map(({ role, email, password }) => ({ role, email, password })));
}

seed()
  .then(() => console.log("Seed completed."))
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => disconnectDatabase());
