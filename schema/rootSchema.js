const { ProjectQuery, ProjectMutation } = require("./projectsSchema")

const { ClientQuery, ClientMutation } = require("./clientSchema");

const { GraphQLObjectType, GraphQLSchema } = require("graphql");
const { DashboardQuery } = require("./dashboardSchema");
const { UserQuery, UserMutation } = require("./userSchema");
const { SearchQuery } = require("./searchSchema");

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        client: ClientQuery.client,
        clients: ClientQuery.clients,
        project: ProjectQuery.project,
        projects: ProjectQuery.projects,
        user: UserQuery.user,
        dashboard: DashboardQuery.dashboardData,
        search: SearchQuery.search
    }
})

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addClient: ClientMutation.addClient,
        deleteClient: ClientMutation.deleteClient,
        updateClient: ClientMutation.updateClient,
        addProject: ProjectMutation.addProject,
        updateProject: ProjectMutation.updateProject,
        deleteProject: ProjectMutation.deleteProject,
        signUp: UserMutation.signUp,
        signIn: UserMutation.signIn,

    }
})


const schema = new GraphQLSchema({
    query: RootQuery,
    mutation
})

module.exports = schema