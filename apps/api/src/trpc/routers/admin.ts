import { createTRPCRouter } from '../init.js';
import { adminsRouter } from './admin/admins.js';
import { emailAdminRouter } from './admin/email.js';
import { waitlistAdminRouter } from './admin/waitlist.js';

/** Back-office procedures (`admin.*`), one sub-router per section in `./admin/`. */
export const adminRouter = createTRPCRouter({
  admins: adminsRouter,
  email: emailAdminRouter,
  waitlist: waitlistAdminRouter,
});
