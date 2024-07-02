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
        resolve(parent, args) {
            return {
                clients: Client.find(),
                projects: Project.find()
            }
        }
    }
}

module.exports = {
    DashboardQuery
}