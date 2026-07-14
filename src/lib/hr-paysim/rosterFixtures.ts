import type { NormalizedRosterRow } from "./domain.ts";

export const sampleRosterRows: NormalizedRosterRow[] = [
  { rowId: "row_001", roleGroup: "Product Engineer", title: "Product Engineer", levelLabel: "none", baseSalaryKRW: 68000000, startDate: "2021-03-01", tenureMonths: 64, exceptionFlag: false, counterOfferFlag: false, managerLabel: "manager_a", teamLabel: "team_a" },
  { rowId: "row_002", roleGroup: "Product Engineer", title: "Product Engineer", levelLabel: "none", baseSalaryKRW: 72000000, startDate: "2021-11-15", tenureMonths: 56, exceptionFlag: false, counterOfferFlag: false, managerLabel: "manager_a", teamLabel: "team_a" },
  { rowId: "row_003", roleGroup: "Product Engineer", title: "Product Engineer", levelLabel: "none", baseSalaryKRW: 76000000, startDate: "2022-07-01", tenureMonths: 48, exceptionFlag: false, counterOfferFlag: false, managerLabel: "manager_a", teamLabel: "team_a" },
  { rowId: "row_004", roleGroup: "Product Engineer", title: "Product Engineer", levelLabel: "none", baseSalaryKRW: 95000000, startDate: "2025-05-01", tenureMonths: 14, exceptionFlag: true, counterOfferFlag: false, managerLabel: "manager_a", teamLabel: "team_a" },
  { rowId: "row_005", roleGroup: "Product Engineer", title: "Product Engineer", levelLabel: "none", baseSalaryKRW: 90000000, startDate: "2025-01-10", tenureMonths: 18, exceptionFlag: false, counterOfferFlag: true, managerLabel: "manager_a", teamLabel: "team_a" },
  { rowId: "row_006", roleGroup: "Product Engineer", title: "Product Engineer", levelLabel: "none", baseSalaryKRW: 88000000, startDate: "2024-09-01", tenureMonths: 22, exceptionFlag: false, counterOfferFlag: false, managerLabel: "manager_a", teamLabel: "team_a" },
  { rowId: "row_007", roleGroup: "Platform Engineer", title: "Platform Engineer", levelLabel: "none", baseSalaryKRW: 86000000, startDate: "2020-10-01", tenureMonths: 69, exceptionFlag: false, counterOfferFlag: false, managerLabel: "manager_b", teamLabel: "team_b" },
  { rowId: "row_008", roleGroup: "Platform Engineer", title: "Platform Engineer", levelLabel: "none", baseSalaryKRW: 84000000, startDate: "2021-07-15", tenureMonths: 60, exceptionFlag: false, counterOfferFlag: false, managerLabel: "manager_b", teamLabel: "team_b" },
  { rowId: "row_009", roleGroup: "Platform Engineer", title: "Platform Engineer", levelLabel: "none", baseSalaryKRW: 102000000, startDate: "2025-02-01", tenureMonths: 17, exceptionFlag: true, counterOfferFlag: true, managerLabel: "manager_b", teamLabel: "team_b" },
  { rowId: "row_010", roleGroup: "Platform Engineer", title: "Platform Engineer", levelLabel: "none", baseSalaryKRW: 98000000, startDate: "2024-12-01", tenureMonths: 19, exceptionFlag: false, counterOfferFlag: false, managerLabel: "manager_b", teamLabel: "team_b" },
  { rowId: "row_011", roleGroup: "GTM", title: "Account Executive", levelLabel: "AE1", levelRank: 1, baseSalaryKRW: 61000000, startDate: "2023-06-01", tenureMonths: 37, exceptionFlag: false, counterOfferFlag: false, managerLabel: "manager_c", teamLabel: "team_c" },
  { rowId: "row_012", roleGroup: "GTM", title: "Account Executive", levelLabel: "AE2", levelRank: 2, baseSalaryKRW: 66000000, startDate: "2022-04-01", tenureMonths: 51, exceptionFlag: false, counterOfferFlag: false, managerLabel: "manager_c", teamLabel: "team_c" },
  { rowId: "row_013", roleGroup: "GTM", title: "Account Executive", levelLabel: "AE1", levelRank: 1, baseSalaryKRW: 70000000, startDate: "2025-03-01", tenureMonths: 16, exceptionFlag: true, counterOfferFlag: false, managerLabel: "manager_c", teamLabel: "team_c" },
  { rowId: "row_014", roleGroup: "GTM", title: "Account Executive", levelLabel: "AE2", levelRank: 2, baseSalaryKRW: 69000000, startDate: "2024-01-15", tenureMonths: 30, exceptionFlag: false, counterOfferFlag: false, managerLabel: "manager_c", teamLabel: "team_c" },
  { rowId: "row_015", roleGroup: "Designer", title: "Product Designer", levelLabel: "none", baseSalaryKRW: 63000000, startDate: "2022-08-01", tenureMonths: 47, exceptionFlag: false, counterOfferFlag: false, managerLabel: "manager_d", teamLabel: "team_d" },
  { rowId: "row_016", roleGroup: "Designer", title: "Product Designer", levelLabel: "none", baseSalaryKRW: 67000000, startDate: "2024-04-01", tenureMonths: 27, exceptionFlag: false, counterOfferFlag: false, managerLabel: "manager_d", teamLabel: "team_d" },
];

const sampleRosterPasteHeaders: Array<keyof NormalizedRosterRow> = [
  "rowId",
  "roleGroup",
  "title",
  "levelLabel",
  "levelRank",
  "baseSalaryKRW",
  "startDate",
  "tenureMonths",
  "exceptionFlag",
  "counterOfferFlag",
  "managerLabel",
  "teamLabel",
];

export const sampleRosterPaste = [
  sampleRosterPasteHeaders.join("\t"),
  ...sampleRosterRows.map((row) => sampleRosterPasteHeaders.map((header) => row[header] ?? "").join("\t")),
].join("\n");