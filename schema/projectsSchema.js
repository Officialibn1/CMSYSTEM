const { projects, clients } = require('../sampledb.js')
const { ClientType } = require('./clientSchema.js')

const Client = require('../config/models/Client.js')
const Project = require('../config/models/Project.js')

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
                return Client.findById(parent.clientId)
            }
        }
    })
})

const ProjectQuery = {
    project: {
        type: ProjectType,
        args: { id: { type: GraphQLID } },
        resolve(parent, args) {
            return Project.findById(args.id)
        }
    },
    projects: {
        type: new GraphQLList(ProjectType),
        resolve(parent, args) {
            return Project.find()
        }
    }
}

module.exports = { ProjectType, ProjectQuery }