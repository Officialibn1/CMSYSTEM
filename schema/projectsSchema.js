const { ClientType } = require('./clientSchema.js')

const Client = require('../config/models/Client.js')
const Project = require('../config/models/Project.js')

const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLEnumType,
    GraphQLList,
    GraphQLNonNull
} = require('graphql')


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

const ProjectMutation = {
    addProject: {
        type: ProjectType,
        args: {
            name: { type: new GraphQLNonNull(GraphQLString) },
            description: { type: new GraphQLNonNull(GraphQLString) },
            status: {
                type: new GraphQLEnumType({
                    name: 'ProjectStatus',
                    values: {
                        'new': { value: 'Not Started' },
                        'progress': { value: 'In Progress' },
                        'completed': { value: 'Completed' },
                    }

                }),
                defaultValue: 'Not Started',
            },
            clientId: { type: new GraphQLNonNull(GraphQLID) }
        },
        resolve(parent, args) {
            const project = new Project({
                name: args.name,
                description: args.description,
                status: args.status,
                clientId: args.clientId,
            })

            return project.save().catch(error => {
                console.error(`Error creating project: ${error}`);
                throw error
            })
        }
    },
    deleteProject: {
        type: ProjectType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) }
        },
        resolve(parent, args) {
            return Project.findByIdAndDelete(args.id)
                .then(deleteProject => {
                    if (!deleteProject) {
                        throw new Error(`Project with ID: ${args.id} not found`)
                    }

                    return deleteProject
                })
                .catch(error => {
                    console.error(`Error Deleting Project: ${error}`)
                    throw error
                })
        }
    },
    updateProject: {
        type: ProjectType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) },
            name: { type: GraphQLString },
            description: { type: GraphQLString },
            status: {
                type: new GraphQLEnumType({
                    name: 'ProjectStatusUpdate',
                    values: {
                        'new': { value: 'Not Started' },
                        'progress': { value: 'In Progress' },
                        'completed': { value: 'Completed' },
                    }
                })
            },
            clientId: { type: GraphQLID },
        },
        resolve(parent, args) {
            return Project.findByIdAndUpdate(
                args.id,
                {
                    $set: {
                        name: args.name,
                        description: args.description,
                        status: args.status,
                        clientId: args.clientId
                    },

                },
                { new: false }
            ).then(updateProject => {
                if (!updateProject) {
                    throw new Error(`Project with ID: ${args.id} not found`)
                }

                return updateProject
            }).catch(error => {
                console.error(`Failed to update Project with ID: ${args.id} & Error: ${error}`);
            })
        }
    }
}

module.exports = {
    ProjectType,
    ProjectQuery,
    ProjectMutation
}