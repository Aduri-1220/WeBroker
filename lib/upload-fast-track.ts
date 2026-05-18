import { CLAUSE_TEMPLATES } from "./clauses";
import { UPLOAD_FLOW_PROPERTY_ADDRESS } from "./constants";
import type {
  ClausesData,
  OwnerData,
  PropertyData,
  TenantData,
  TermsData,
  WitnessesData,
} from "./schemas";

export interface UploadFastTrackInput {
  city: string;
  state: string;
  uploadOverridesRequested: boolean;
  securityDeposit: number;
  stampValue: number;
  /** UI: "yes" = rent quoted excludes maintenance charges → maintenanceIncluded false */
  rentExcludingMaintenance: "yes" | "no";
  startDate: string;
  landlordFullName: string;
  landlordEmail: string;
  landlordPhone: string;
  tenantFullName: string;
  tenantEmail: string;
  tenantPhone: string;
}

function partyFromMinimal(
  fullName: string,
  email: string,
  phone: string,
  city: string,
  state: string,
): OwnerData {
  return {
    fullName: fullName.trim(),
    fatherName: "",
    age: 21,
    gender: "Other",
    occupation: "",
    aadhaarLast4: "0000",
    pan: "",
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
    addressLine1: UPLOAD_FLOW_PROPERTY_ADDRESS,
    city: city.trim(),
    state,
    pincode: "560001",
  };
}

function asTenant(o: OwnerData): TenantData {
  return { ...o, employer: "", familyMembers: [] };
}

export function buildUploadFastTrackPayload(input: UploadFastTrackInput): {
  propertyJson: string;
  ownerJson: string;
  tenantJson: string;
  termsJson: string;
  clausesJson: string;
  witnessesJson: string;
} {
  const city = input.city.trim();
  const state = input.state;

  const property: PropertyData = {
    type: "Apartment/Flat",
    bhk: "2 BHK",
    bathrooms: 2,
    furnishing: "Semi-Furnished",
    flatNumber: "",
    floorNumber: "",
    buildingName: "",
    addressLine1: UPLOAD_FLOW_PROPERTY_ADDRESS,
    addressLine2: "",
    locality: city,
    city,
    state,
    pincode: "560001",
    carpetArea: 500,
    amenities: [],
    customAmenities: [],
    furnitureSchedule: [],
  };

  const owner = partyFromMinimal(
    input.landlordFullName,
    input.landlordEmail,
    input.landlordPhone,
    city,
    state,
  );
  const tenant = asTenant(
    partyFromMinimal(
      input.tenantFullName,
      input.tenantEmail,
      input.tenantPhone,
      city,
      state,
    ),
  );

  const maintenanceIncluded = input.rentExcludingMaintenance === "no";

  const terms: TermsData = {
    monthlyRent: 1,
    maintenanceIncluded,
    securityDeposit: input.securityDeposit,
    durationMonths: 11,
    lockInMonths: 0,
    noticePeriodMonths: 1,
    startDate: input.startDate,
    incrementPercent: 0,
    rentDueDay: 1,
    paymentMode: "Bank transfer",
    uploadOverridesRequested: input.uploadOverridesRequested,
  };

  const clauses: ClausesData = {
    clauses: CLAUSE_TEMPLATES.map((c) => ({
      id: c.id,
      label: c.label,
      enabled: c.defaultEnabled,
      text: c.defaultText,
      custom: false,
    })),
  };

  const witnesses: WitnessesData = { witnesses: [] };

  return {
    propertyJson: JSON.stringify(property),
    ownerJson: JSON.stringify(owner),
    tenantJson: JSON.stringify(tenant),
    termsJson: JSON.stringify(terms),
    clausesJson: JSON.stringify(clauses),
    witnessesJson: JSON.stringify(witnesses),
  };
}
