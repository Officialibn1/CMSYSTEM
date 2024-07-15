const { GraphQLObjectType, GraphQLList } = require("graphql");
const Client = require("../config/models/Client");
const Project = require("../config/models/Project");
const { ClientType } = require("./clientSchema");
const { ProjectType } = require("./projectsSchema");


const DashboardType = new GraphQLObjectType({
    name: 'Dashboard',
    fields: () => ({
        clients: { type: new GraphQLList(ClientType) },
        projects: { type: new GraphQLList(ProjectType) }
    })
})

const DashboardQuery = {
    dashboardData: {
        type: DashboardType,
        async resolve(parent, args) {
            return {
                clients: await Client.find(),
                projects: await Project.find()
            }
        }
    }
}

module.exports = {
    DashboardQuery
}