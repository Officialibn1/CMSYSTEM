const { ProjectQuery } = require("./projectsSchema")

const { ClientQuery, ClientMutation } = require("./clientSchema");
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

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addClient: ClientMutation.addClient,
        deleteClient: ClientMutation.deleteClient
    }
})


const schema = new GraphQLSchema({
    query: RootQuery,
    mutation
})

module.exports = schema