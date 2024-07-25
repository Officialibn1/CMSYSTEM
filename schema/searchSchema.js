const { GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLString } = require("graphql");
const { AuthenticationError } = require("../config/errors/authenticationError.js");
const Client = require("../config/models/Client");
const Project = require("../config/models/Project");


const SearchQueryType = new GraphQLObjectType({
    name: 'Search',
    fields: () => {
        const { ClientType } = require('./clientSchema.js')
        const { ProjectType } = require('./projectsSchema.js')

        return {
            clients: { type: new GraphQLList(ClientType) },
            projects: { type: new GraphQLList(ProjectType) }
        }
    }
})

const SearchQuery = {
    search: {
        type: SearchQueryType,
        args: {
            term: { type: new GraphQLNonNull(GraphQLString) }
        },
        async resolve(parent, { term }, context) {
            if (!context.user) {
                throw new AuthenticationError()
            }

            const userUID = await context.user?.uid

            const searchRegEx = new RegExp(term, 'i')

            const clients = await Client.find({
                userUID,
                $or: [
                    { name: searchRegEx },
                    { email: searchRegEx },
                    { phone: searchRegEx }
                ]
            })

            const projects = await Project.find({
                userUID,
                $or: [
                    { name: searchRegEx },
                    { client: searchRegEx },
                    { description: searchRegEx }
                ]
            })

            return { clients, projects }
        }
    }
}

module.exports = {
    SearchQuery,
    SearchQueryType
}