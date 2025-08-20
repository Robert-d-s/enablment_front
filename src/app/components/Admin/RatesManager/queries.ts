import { gql } from "@apollo/client";
import {
  GET_ALL_SIMPLE_TEAMS,
  RATE_WITH_TEAM_FRAGMENT,
  RATE_FRAGMENT,
} from "../../../graphql/fragments";

// Re-export shared query instead of duplicating
export { GET_ALL_SIMPLE_TEAMS };

export const CREATE_RATE = gql`
  mutation CreateRate_RatesManager(
    $name: String!
    $rate: Float!
    $teamId: String!
  ) {
    createRate(rateInputCreate: { name: $name, rate: $rate, teamId: $teamId }) {
      ...RateWithTeam
    }
  }
  ${RATE_WITH_TEAM_FRAGMENT}
`;

export const DELETE_RATE = gql`
  mutation DeleteRate_RatesManager($input: DeleteRateInput!) {
    deleteRate(input: $input) {
      id
    }
  }
`;

export const GET_RATES = gql`
  query GetRates_RatesManager($teamId: String!) {
    rates(teamId: $teamId) {
      ...Rate
    }
  }
  ${RATE_FRAGMENT}
`;
