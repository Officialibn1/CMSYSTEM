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
        async resolve(parent, args, context) {
            if (!context.user) {
                throw new AuthenticationError();
            }

            const userUID = await context?.user.uid

            return {
                clients: await Client.find({ userUID }),
                projects: await Project.find({ userUID })
            }
        }
    }
}

module.exports = {
    DashboardQuery
}