export const typeDefs = `
  type Mutation {
    setProject(id: ID!): Boolean
    resetProject(): Boolean
    setWebsite(id: ID!): Boolean
    resetWebsite(): Boolean
    setLanguage(id: ID!): Boolean
    resetLanguage(): Boolean
    setPage(id: ID!): Boolean
    resetPage(): Boolean
  }

  type Query {
    project: ID!
    website: ID!
    language: ID!
    page: ID!
  }
`;
