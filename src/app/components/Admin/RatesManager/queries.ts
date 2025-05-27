import { gql } from "@apollo/client";

export const GET_ALL_SIMPLE_TEAMS = gql`
  query GetAllSimpleTeams_RatesManager {
    getAllSimpleTeams {
      id
      name
      __typename
    }
  }
`;

export const CREATE_RATE = gql`
  mutation CreateRate_RatesManager(
    $name: String!
    $rate: Int!
    $teamId: String!
  ) {
    createRate(rateInputCreate: { name: $name, rate: $rate, teamId: $teamId }) {
      id
      name
      rate
      teamId
      __typename
    }
  }
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
      id
      name
      rate
      __typename
    }
  }
`;
