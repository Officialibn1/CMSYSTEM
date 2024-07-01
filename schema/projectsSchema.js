const { projects, clients } = require('../sampledb.js')
const { ClientType } = require('./clientSchema.js')

const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLEnumType, GraphQLList } = require('graphql')


const ProjectType = new GraphQLObjectType({
    name: 'Project',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        status: { type: GraphQLString },
        // status: { type: GraphQLEnumType },
        client: {
            type: ClientType,
            resolve(parent, args) {
                return clients.find(client => client.id === parent.id)
            }
        }
    })
})

const ProjectQuery = {
    project: {
        type: ProjectType,
        args: { id: { type: GraphQLID } },
        resolve(parent, args) {
            return projects.find(project => project.id === args.id)
        }
    },
    projects: {
        type: new GraphQLList(ProjectType),
        resolve(parent, args) {
            return projects
        }
    }
}

module.exports = { ProjectType, ProjectQuery }