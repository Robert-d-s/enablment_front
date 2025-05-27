export interface Team {
  id: string;
  name: string;
  __typename?: "SimpleTeamDTO";
}

export interface Rate {
  id: number;
  name: string;
  rate: number;
  teamId?: string;
  __typename?: "Rate";
}

export interface GetRatesQueryData {
  rates: Rate[];
}

export interface GetAllTeamsQueryData {
  getAllSimpleTeams: Team[];
}

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
