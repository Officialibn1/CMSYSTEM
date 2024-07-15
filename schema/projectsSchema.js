

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
const { AuthenticationError } = require('../config/errors/authenticationError.js')


const ProjectType = new GraphQLObjectType({
    name: 'Project',
    fields: () => {
        const { ClientType } = require('./clientSchema.js')

        return {
            id: { type: GraphQLID },
            name: { type: GraphQLString },
            description: { type: GraphQLString },
            status: { type: GraphQLString },
            client: {
                type: ClientType,
                async resolve(parent, args) {
                    return await Client.findById(parent.clientId)
                }
            }
        }
    }
})

const ProjectQuery = {
    project: {
        type: ProjectType,
        args: { id: { type: GraphQLID } },
        async resolve(parent, args, context) {

            if (!context.user) {
                throw new AuthenticationError()
            }

            return await Project.findById(args.id)
        }
    },
    projects: {
        type: new GraphQLList(ProjectType),
        async resolve(parent, args, context) {

            if (!context.user) {
                throw new AuthenticationError()
            }

            return await Project.find()
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
        async resolve(parent, args, context) {

            if (!context.user) {
                throw new AuthenticationError()
            }

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
        async resolve(parent, args, context) {
            if (!context.user) {
                throw new AuthenticationError()
            }

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
        async resolve(parent, args, context) {
            if (!context.user) {
                throw new AuthenticationError()
            }

            return Project.findById(args.id)
                .then(previousProject => {
                    if (!previousProject) {
                        throw new Error(`Project with ID: ${args.id} not found`)
                    }

                    return Project.findByIdAndUpdate(
                        args.id,
                        {
                            $set: {
                                name: args.name || previousProject.name,
                                description: args.description || previousProject.description,
                                status: args.status || previousProject.status,
                                clientId: args.clientId || previousProject.clientId
                            },

                        },
                        { new: true, runValidators: true }
                    )
                })
                .then(updateProject => {
                    if (!updateProject) {
                        throw new Error(`Failed to update Project with ID: ${args.id}`)
                    }

                    return updateProject
                }).catch(error => {
                    console.error(`Error updating Project: ${error}`);

                    throw error
                })
        }
    }
}

module.exports = {
    ProjectType,
    ProjectQuery,
    ProjectMutation
}

