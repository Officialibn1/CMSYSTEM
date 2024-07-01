const { ProjectQuery } = require("./projectsSchema")

const { ClientQuery } = require("./clientSchema");
const { GraphQLObjectType, GraphQLSchema } = require("graphql");

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        client: ClientQuery.client,
        clients: ClientQuery.clients,
        project: ProjectQuery.project,
        projects: ProjectQuery.projects
    }
})

const schema = new GraphQLSchema({
    query: RootQuery
})

module.exports = schema