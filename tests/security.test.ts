import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateTestEnquiry, validateIncidentReport } from '../src/lib/validation.ts';

// Simulated Security Model mirroring RLS and RBAC policies defined in migrations 001 and 002
interface User {
  id: string;
  email: string;
  role: 'consumer' | 'business_member' | 'lab_provider' | 'admin';
}

interface Organization {
  id: string;
  name: string;
  ownerId: string;
}

interface OrgMember {
  organizationId: string;
  userId: string;
  role: 'owner' | 'manager' | 'staff' | 'auditor';
}

interface LabProfile {
  id: string;
  name: string;
  ownerId: string | null;
}

interface IncidentReport {
  id: string;
  reporterId: string | null;
  foodProduct: string;
  moderationStatus: 'under_review' | 'investigating' | 'verified' | 'dismissed';
}

interface TestEnquiry {
  id: string;
  senderId: string | null;
  laboratoryId: string;
  status: string;
}

// Security evaluation functions mirroring RLS policies
function canAccessAdmin(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'admin';
}

function canUpdateUserRole(actor: User, targetUserId: string, newRole: string): boolean {
  if (actor.role !== 'admin') {
    // Normal users cannot elevate or modify their own role or anyone else's role
    return false;
  }
  return true;
}

function canViewOrganizationData(user: User | null, orgId: string, members: OrgMember[]): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return members.some(m => m.organizationId === orgId && m.userId === user.id);
}

function canManageLaboratory(user: User | null, lab: LabProfile): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'lab_provider' && lab.ownerId === user.id) return true;
  return false;
}

function canViewIncidentReport(user: User | null, report: IncidentReport): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (report.reporterId && report.reporterId === user.id) return true;
  return false;
}

function canViewTestEnquiry(user: User | null, enquiry: TestEnquiry, lab: LabProfile): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (enquiry.senderId && enquiry.senderId === user.id) return true;
  if (lab.ownerId && lab.ownerId === user.id) return true;
  return false;
}

describe('FoodSafe Global Phase 1 Security & Authorization Test Suite', () => {

  // Test Entities
  const anonymousUser = null;
  const consumerUser: User = { id: 'usr-consumer-1', email: 'consumer@foodsafe.test', role: 'consumer' };
  const businessOwnerA: User = { id: 'usr-biz-owner-a', email: 'owner.a@restaurant.test', role: 'business_member' };
  const businessStaffA: User = { id: 'usr-biz-staff-a', email: 'staff.a@restaurant.test', role: 'business_member' };
  const businessOwnerB: User = { id: 'usr-biz-owner-b', email: 'owner.b@bakery.test', role: 'business_member' };
  const labProviderA: User = { id: 'usr-lab-a', email: 'lab.tech@testinglab.test', role: 'lab_provider' };
  const labProviderB: User = { id: 'usr-lab-b', email: 'other.lab@testinglab.test', role: 'lab_provider' };
  const adminUser: User = { id: 'usr-admin-1', email: 'security.admin@foodsafe.test', role: 'admin' };

  const orgA: Organization = { id: 'org-100', name: 'Downtown Kitchen', ownerId: businessOwnerA.id };
  const orgB: Organization = { id: 'org-200', name: 'Valley Bakery', ownerId: businessOwnerB.id };

  const orgMembers: OrgMember[] = [
    { organizationId: orgA.id, userId: businessOwnerA.id, role: 'owner' },
    { organizationId: orgA.id, userId: businessStaffA.id, role: 'staff' },
    { organizationId: orgB.id, userId: businessOwnerB.id, role: 'owner' },
  ];

  const labA: LabProfile = { id: 'lab-1', name: 'Accredited Microbiology Center', ownerId: labProviderA.id };
  const labUnclaimed: LabProfile = { id: 'lab-2', name: 'Public Standards Bureau Lab', ownerId: null };

  const incident1: IncidentReport = {
    id: 'inc-1',
    reporterId: consumerUser.id,
    foodProduct: 'Flour Batch #99',
    moderationStatus: 'under_review'
  };

  const enquiry1: TestEnquiry = {
    id: 'enq-1',
    senderId: businessOwnerA.id,
    laboratoryId: labA.id,
    status: 'pending'
  };

  describe('1. Administrator Access Control (/admin)', () => {
    it('Blocks anonymous users from accessing admin operations', () => {
      assert.strictEqual(canAccessAdmin(anonymousUser), false);
    });

    it('Blocks consumers from accessing admin operations', () => {
      assert.strictEqual(canAccessAdmin(consumerUser), false);
    });

    it('Blocks food business members from accessing admin operations', () => {
      assert.strictEqual(canAccessAdmin(businessOwnerA), false);
    });

    it('Blocks laboratory providers from accessing admin operations', () => {
      assert.strictEqual(canAccessAdmin(labProviderA), false);
    });

    it('Grants verified platform administrators access to admin operations', () => {
      assert.strictEqual(canAccessAdmin(adminUser), true);
    });
  });

  describe('2. Role Escalation Prevention', () => {
    it('Prevents a consumer from elevating themselves to admin', () => {
      assert.strictEqual(canUpdateUserRole(consumerUser, consumerUser.id, 'admin'), false);
    });

    it('Prevents a business owner from promoting another user to admin', () => {
      assert.strictEqual(canUpdateUserRole(businessOwnerA, businessStaffA.id, 'admin'), false);
    });

    it('Allows only verified platform administrators to modify user roles', () => {
      assert.strictEqual(canUpdateUserRole(adminUser, consumerUser.id, 'business_member'), true);
    });
  });

  describe('3. Multi-Tenant Business Isolation (Cross-Organization Access)', () => {
    it('Allows organization members to view their own organization records', () => {
      assert.strictEqual(canViewOrganizationData(businessOwnerA, orgA.id, orgMembers), true);
      assert.strictEqual(canViewOrganizationData(businessStaffA, orgA.id, orgMembers), true);
    });

    it('Strictly denies business member from Organization B reading Organization A records', () => {
      assert.strictEqual(canViewOrganizationData(businessOwnerB, orgA.id, orgMembers), false);
    });

    it('Strictly denies unauthenticated users from reading business organization data', () => {
      assert.strictEqual(canViewOrganizationData(anonymousUser, orgA.id, orgMembers), false);
    });

    it('Allows platform administrator to inspect organization records for auditing', () => {
      assert.strictEqual(canViewOrganizationData(adminUser, orgA.id, orgMembers), true);
    });
  });

  describe('4. Laboratory Provider Management Boundaries', () => {
    it('Allows a lab provider to manage their claimed laboratory profile', () => {
      assert.strictEqual(canManageLaboratory(labProviderA, labA), true);
    });

    it('Prevents a lab provider from modifying a different laboratory profile', () => {
      assert.strictEqual(canManageLaboratory(labProviderB, labA), false);
    });

    it('Prevents normal consumers from managing laboratory profiles', () => {
      assert.strictEqual(canManageLaboratory(consumerUser, labA), false);
    });

    it('Prevents unauthorized providers from claiming or modifying unowned listings', () => {
      assert.strictEqual(canManageLaboratory(labProviderA, labUnclaimed), false);
    });

    it('Allows administrators to update any laboratory profile', () => {
      assert.strictEqual(canManageLaboratory(adminUser, labA), true);
    });
  });

  describe('5. Incident Reports Privacy & Read Authorization', () => {
    it('Allows the original reporter to view their submitted incident report', () => {
      assert.strictEqual(canViewIncidentReport(consumerUser, incident1), true);
    });

    it('Blocks anonymous users from reading private incident report details', () => {
      assert.strictEqual(canViewIncidentReport(anonymousUser, incident1), false);
    });

    it('Blocks unrelated business owners from reading private incident reports', () => {
      assert.strictEqual(canViewIncidentReport(businessOwnerA, incident1), false);
    });

    it('Allows platform administrators to read incident reports for moderation', () => {
      assert.strictEqual(canViewIncidentReport(adminUser, incident1), true);
    });
  });

  describe('6. Laboratory Test Enquiry Privacy', () => {
    it('Allows the sender to view their test enquiry', () => {
      assert.strictEqual(canViewTestEnquiry(businessOwnerA, enquiry1, labA), true);
    });

    it('Allows the recipient laboratory owner to view the incoming enquiry', () => {
      assert.strictEqual(canViewTestEnquiry(labProviderA, enquiry1, labA), true);
    });

    it('Blocks an unrelated laboratory provider from reading competitor enquiries', () => {
      assert.strictEqual(canViewTestEnquiry(labProviderB, enquiry1, labA), false);
    });

    it('Blocks anonymous public users from reading private test quotation enquiries', () => {
      assert.strictEqual(canViewTestEnquiry(anonymousUser, enquiry1, labA), false);
    });
  });

  describe('7. Form Input Validation & Abuse Protection', () => {
    it('Rejects bot submissions when honeypot field is populated (Incident Report)', () => {
      const res = validateIncidentReport({
        productName: 'Suspicious Milk',
        location: 'City Market',
        purchaseDate: '2026-10-10',
        incidentDescription: 'Strong chemical disinfectant odor.',
        honeypot: 'bot_spammer_payload'
      });
      assert.strictEqual(res.isValid, false);
      assert.strictEqual(res.errors.honeypot, 'Automated bot submission detected.');
    });

    it('Rejects bot submissions when honeypot field is populated (Test Enquiry)', () => {
      const res = validateTestEnquiry({
        name: 'Automated Bot',
        email: 'bot@spam.com',
        foodType: 'Grain',
        concern: 'Test concern description',
        honeypot: 'http://malicious-link.com'
      });
      assert.strictEqual(res.isValid, false);
      assert.strictEqual(res.errors.honeypot, 'Automated bot submission detected.');
    });

    it('Validates email format strictly', () => {
      const invalid = validateTestEnquiry({
        name: 'John Doe',
        email: 'invalid-email-no-domain',
        foodType: 'Grain',
        concern: 'Valid concern description here'
      });
      assert.strictEqual(invalid.isValid, false);
      assert.ok(invalid.errors.email);

      const valid = validateTestEnquiry({
        name: 'John Doe',
        email: 'john.doe@business.org',
        foodType: 'Maize Grain',
        concern: 'HPLC Aflatoxin verification needed for 50 bags.'
      });
      assert.strictEqual(valid.isValid, true);
    });

    it('Rejects future dates in incident reporting', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const res = validateIncidentReport({
        productName: 'Expired Canned Beans',
        location: 'Main Street Grocery',
        purchaseDate: futureDate.toISOString().slice(0, 10),
        incidentDescription: 'Bulging and corroded cans.'
      });
      assert.strictEqual(res.isValid, false);
      assert.ok(res.errors.purchaseDate);
    });

    it('Enforces minimum length constraints on incident descriptions', () => {
      const res = validateIncidentReport({
        productName: 'Fish',
        location: 'Harbor',
        purchaseDate: '2026-10-12',
        incidentDescription: 'bad' // Too short
      });
      assert.strictEqual(res.isValid, false);
      assert.ok(res.errors.incidentDescription);
    });
  });
});
