export type QuickInputFieldType = "select" | "number" | "checkbox" | "textarea";

export interface QuickInputOption {
  value: string;
  label: string;
}

export interface QuickInputField {
  name: string;
  label: string;
  type: QuickInputFieldType;
  required: boolean;
  helpText?: string;
  placeholder?: string;
  options?: QuickInputOption[];
  min?: number;
}

export interface QuickInputSection {
  id: string;
  title: string;
  description: string;
  fields: QuickInputField[];
  advanced?: boolean;
}
