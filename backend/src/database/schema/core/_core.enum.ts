import { pgEnum } from 'drizzle-orm/pg-core';




// tenant enums
export const tenantStatusEnum = pgEnum('tenant_status', [
   'trial',
   'pending',
   'active',
   'inactive',
   'suspended',
]);

// branch enums
export const officeTypeEnum = pgEnum("office_type", [
   "HEAD_OFFICE",
   "CORPORATE_OFFICE",
   "REGISTERED_OFFICE",
   "BRANCH",
   "REGIONAL_OFFICE",
   "AREA_OFFICE",
   "ZONAL_OFFICE",
   "SATELLITE_OFFICE",
   "REPRESENTATIVE_OFFICE",
   "SALES_OFFICE",
   "SERVICE_CENTER",
   "CUSTOMER_SUPPORT_CENTER",
   "CALL_CENTER",
   "WAREHOUSE",
   "DISTRIBUTION_CENTER",
   "FULFILLMENT_CENTER",
   "FACTORY",
   "MANUFACTURING_PLANT",
   "ASSEMBLY_PLANT",
   "RESEARCH_CENTER",
   "R_AND_D_CENTER",
   "TRAINING_CENTER",
   "DATA_CENTER",
   "RETAIL_STORE",
   "SHOWROOM",
   "OUTLET",
   "FRANCHISE",
   "DEPOT",
   "HUB",
   "LABORATORY",
   "CLINIC",
   "HOSPITAL",
   "CAMPUS",
   "PROJECT_SITE",
   "TEMPORARY_SITE",
   "REMOTE_OFFICE",
   "HOME_OFFICE",
   "OTHER",
]);