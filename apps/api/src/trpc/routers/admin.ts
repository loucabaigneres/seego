import { createTRPCRouter } from '../init.js';
import { adminsRouter } from './admin/admins.js';
import { waitlistAdminRouter } from './admin/waitlist.js';

/** Back-office procedures (`admin.*`), one sub-router per section in `./admin/`. */
export const adminRouter = createTRPCRouter({
  admins: adminsRouter,
  waitlist: waitlistAdminRouter,
});
