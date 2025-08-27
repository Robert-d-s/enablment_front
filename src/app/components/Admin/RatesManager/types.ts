// Re-export types from generated GraphQL
import type { Rate, RateInputCreate, SimpleTeamDto } from "@/generated/graphql";

export type Team = SimpleTeamDto;

export interface GetRatesQueryData {
  rates: Rate[];
}

export interface GetAllTeamsQueryData {
  getAllSimpleTeams: Team[];
}

export { Rate, RateInputCreate };

export interface RateFormData {
  name: string;
  value: number | string;
}

export interface RatesManagerState {
  selectedTeamId: string;
  rateName: string;
  rateValue: number | string;
  formError: string | null;
  processingDeleteId: number | null;
}
