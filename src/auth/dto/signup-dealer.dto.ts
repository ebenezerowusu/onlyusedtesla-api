import { z } from 'zod';

export const SignupDealerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(3),
  address: z.string().min(3),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  whoAreYouRepresenting: z.enum(['Single Dealer','Group Dealer','Fleet Operator', 'Financial Company','Rental Company', 'Other']),
  dealerGroupName: z.string().min(1).optional(), // required only for Group Dealer
  businessType: z.enum(['Single Dealer', 'Dealer group', 'Group-affiliated dealership', 'Franchise dealership', 'OEM', 'Fleet', 'Vendor', 'Other']),
  companyName: z.string().min(1),
  syndicationSystem: z.enum(['vAuto', 'Authenticom', 'Dealertrack', 'HomeNet', 'CDK Global', 'AutoManager', 'Chrome Inventory', 'ReyRey', 'CDKDrive', 'Dealer eProcess', 'DealerSocket', 'Dominion', 'Elead', 'Frazer', 'VinSolutions', 'Xtime', 'Other']).or(z.string().min(1)),
  owner: z.object({
    isOwner: z.boolean(),
    name: z.string().min(1),
    email: z.string().email(),
  }).optional(),
  businessSites: z.array(z.string()).optional(), // will map to site1/site2/site3
  subscriptionIds: z.array(z.string()).min(1),   // Stripe price IDs
  acceptTos: z.boolean(),
}).superRefine((d, ctx) => {
  if (d.password !== d.confirmPassword) ctx.addIssue({ code:'custom', path:['confirmPassword'], message:'Passwords must match' });
  if (!d.acceptTos) ctx.addIssue({ code:'custom', path:['acceptTos'], message:'Terms must be accepted' });
  if (d.whoAreYouRepresenting === 'Group Dealer' && !d.dealerGroupName) {
    ctx.addIssue({ code:'custom', path:['dealerGroupName'], message:'Dealer Group Name required' });
  }
});

export type SignupDealerDto = z.infer<typeof SignupDealerSchema>;
