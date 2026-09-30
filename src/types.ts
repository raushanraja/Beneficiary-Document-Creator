/** Shared domain types. One discriminated union per renderer switch. */

export type View =
  | "welcome"
  | "beneficiaries"
  | "beneficiary-new"
  | "beneficiary-detail"
  | "attest"
  | "attestation"
  | "idprint"
  | "photogrid"
  | "board";

export type ModalKind =
  | null
  | "crop"
  | "redact"
  | "shortcuts"
  | "settings"
  | "confirm-delete";

export interface Beneficiary {
  id: string;
  name: string;
  proofType: string;
  idNumber: string;
  bankName: string;
  branchCode: string;
  accountNo: string;
  accountType: string;
  images: string[];
  createdAt: number;
  updatedAt: number;
}

export const PROOF_TYPES = [
  "Aadhaar Card",
  "PAN Card",
  "Voter ID Card",
  "Passport",
  "Driving License",
] as const;

export const INDIAN_BANKS = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "IndusInd Bank",
  "Bank of India",
  "Central Bank of India",
  "Indian Bank",
  "Yes Bank",
  "IDBI Bank",
] as const;

/** A staged image inside any print studio module. */
export interface StudioImage {
  id: string;
  src: string;
  label: string;
}

export interface Toast {
  id: string;
  tone: "info" | "success" | "error";
  text: string;
}

export interface CropJob {
  /** dataURL of the source file */
  src: string;
  /** original file name for the thumbnail label */
  name: string;
  /** locked aspect (w/h) or null for free crop */
  aspect: number | null;
  /** which store should receive the result */
  target: "beneficiary" | "attest" | "idprint" | "photogrid" | "board";
  title: string;
}

export interface RedactJob {
  src: string;
  target: "beneficiary" | "attest" | "idprint" | "photogrid" | "board";
  /** index inside the target collection, or image id for id-keyed stores */
  index: number;
  imageId?: string;
}
