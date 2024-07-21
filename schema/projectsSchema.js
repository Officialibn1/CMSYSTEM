

const Client = require('../config/models/Client.js')
const Project = require('../config/models/Project.js')
const User = require('../config/models/User.js')

const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLEnumType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLInt
} = require('graphql')
const { AuthenticationError } = require('../config/errors/authenticationError.js')


const ProjectType = new GraphQLObjectType({
    name: 'Project',
    fields: () => {
        const { ClientType } = require('./clientSchema.js')
        const { UserType } = require('./userSchema.js')

        return {
            id: { type: GraphQLID },
            name: { type: GraphQLString },
            description: { type: GraphQLString },
            status: { type: GraphQLString },
            budget: { type: GraphQLInt },
            client: {
                type: ClientType,
                async resolve(parent, args, context) {
                    if (!context.user) {
                        throw new AuthenticationError();
                    }

                    return await Client.findById(parent.clientId)
                }
            },
            user: {
                type: UserType,
                async resolve(parent, args, context) {
                    if (!context.user) {
                        throw new AuthenticationError();
                    }

                    return await User.findById(parent.clientId)
                }
            },
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

            const userUID = await context.user?.uid

            return await Project.findOne({ _id: args.id, userUID })
        }
    },
    projects: {
        type: new GraphQLList(ProjectType),
        async resolve(parent, args, context) {

            if (!context.user) {
                throw new AuthenticationError()
            }

            const userUID = await context.user?.uid


            return await Project.find({ userUID })
        }
    }
}

const ProjectMutation = {
    addProject: {
        type: ProjectType,
        args: {
            name: { type: new GraphQLNonNull(GraphQLString) },
            description: { type: new GraphQLNonNull(GraphQLString) },
            budget: { type: new GraphQLNonNull(GraphQLInt) },
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

            try {
                if (!context.user) {
                    throw new AuthenticationError()
                }

                const userUID = await context?.user.uid


                const project = new Project({
                    name: args.name,
                    description: args.description,
                    status: args.status,
                    clientId: args.clientId,
                    budget: args.budget,
                    userUID
                })

                const savedProject = await project.save()

                if (savedProject) {
                    await Client.findByIdAndUpdate(args.clientId, {
                        $push: { projectsID: savedProject._id }
                    },
                        {
                            new: true, useFindAndModify: false
                        })
                }

                return savedProject

            } catch (error) {
                console.error(`Error creating project: ${JSON.stringify(error, null, 2)}`);

                throw new Error(error)
            }
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

            try {
                const userUID = await context?.user.uid

                const deleteProject = await Project.findOneAndDelete({ _id: args.id, userUID })

                if (!deleteProject) {
                    throw new Error(`Project with ID: ${args.id} not found`)
                }

                return deleteProject

            } catch (error) {
                console.error(`Error Deleting Project: ${JSON.stringify(error, null, 2)}`)

                throw new Error(error)
            }
        }
    },
    updateProject: {
        type: ProjectType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) },
            name: { type: GraphQLString },
            budget: { type: new GraphQLNonNull(GraphQLInt) },
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

            try {
                const userUID = await context?.user.uid

                const previousProject = await Project.findOne({ _id: args.id, userUID })

                if (!previousProject) {
                    throw new Error(`Project with ID: ${args.id} not found`)
                }

                const updateProject = await Project.findOneAndUpdate({
                    _id: args.id,
                    userUID
                },
                    {
                        $set: {
                            name: args.name || previousProject.name,
                            description: args.description || previousProject.description,
                            status: args.status || previousProject.status,
                            clientId: args.clientId || previousProject.clientId,
                            budget: args.budget || previousProject.budget,
                            userUID
                        },

                    },
                    { new: true, runValidators: true }
                )

                if (!updateProject) {
                    throw new Error(`Failed to update Project with ID: ${args.id}`)
                }

                return updateProject

            } catch (error) {
                console.error(`Error updating Project: ${JSON.stringify(error, null, 2)}`);

                throw new Error(error)
            }
        }
    }
}

module.exports = {
    ProjectType,
    ProjectQuery,
    ProjectMutation
}

