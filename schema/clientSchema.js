const Client = require('../config/models/Client')
const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLList, GraphQLNonNull } = require('graphql')
const Project = require('../config/models/Project')
const { AuthenticationError } = require('../config/errors/authenticationError')
const User = require('../config/models/User')

const ClientType = new GraphQLObjectType({
    name: 'Client',
    fields: () => {
        const { UserType } = require('./userSchema.js')
        const { ProjectType } = require('./projectsSchema.js')

        return {
            id: { type: GraphQLID },
            name: { type: GraphQLString },
            email: { type: GraphQLString },
            phone: { type: GraphQLString },
            user: {
                type: UserType,
                async resolve(parent, args, context) {
                    if (!context.user) {
                        throw new AuthenticationError();
                    }

                    return await User.findOne(parent.userUID)
                }
            },
            projects: {
                type: new GraphQLList(ProjectType),
                async resolve(parent, args, context) {
                    if (!context.user) {
                        throw new AuthenticationError();
                    }

                    const userUID = await context?.user.uid

                    return await Project.find({ _id: { $in: parent.projectsID }, userUID })
                }
            }
        }
    }
})

const ClientQuery = {
    client: {
        type: ClientType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) },
        },
        async resolve(parent, args, context) {

            if (!context.user) {
                throw new AuthenticationError();
            }

            const userUID = await context?.user.uid

            return await Client.findOne({ _id: args.id, userUID })
        }
    },
    clients: {
        type: new GraphQLList(ClientType),
        async resolve(parent, args, context) {

            if (!context.user) {
                throw new AuthenticationError();
            }

            const userUID = await context?.user.uid

            return await Client.find({ userUID })
        }
    }
}

const ClientMutation = {
    addClient: {
        type: ClientType,
        args: {
            name: { type: new GraphQLNonNull(GraphQLString) },
            email: { type: new GraphQLNonNull(GraphQLString) },
            phone: { type: new GraphQLNonNull(GraphQLString) },
        },
        async resolve(parent, args, context) {

            if (!context.user) {
                throw new AuthenticationError();
            }

            const userUID = await context?.user.uid

            try {
                const client = new Client({
                    name: args.name,
                    email: args.email,
                    phone: args.phone,
                    userUID
                })

                return await client.save()
            } catch (error) {
                console.error(`Error Creating Client: ${error}`)

                throw new Error(error)
            }
        }
    },
    deleteClient: {
        type: ClientType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) }
        },
        async resolve(parent, args, context) {
            if (!context.user) {
                throw new AuthenticationError();
            }

            const userUID = await context?.user.uid


            try {
                // First, delete all projects associated with this client
                await Project.deleteMany({ clientId: args.id, userUID });

                const deletedClient = await Client.findOneAndDelete({ _id: args.id, userUID });

                if (!deletedClient) {
                    throw new Error(`Client with ID: ${args.id} not found`);
                }

                return deletedClient;
            } catch (error) {
                console.error(`Error Deleting Client: ${error}`);
                throw error;
            }
        }
    },
    updateClient: {
        type: ClientType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) },
            name: { type: GraphQLString },
            email: { type: GraphQLString },
            phone: { type: GraphQLString }
        },
        async resolve(parent, args, context) {

            try {

                const userUID = await context?.user.uid


                const client = await Client.findOne({ _id: args.id, userUID })

                if (!client) {
                    throw new Error(`Client with ID: ${args.id} not found!`)
                }

                const updatedClient = await Client.findOneAndUpdate({
                    _id: args.id,
                    userUID
                },
                    {
                        $set: {
                            name: args.name || client.name,
                            email: args.email || client.email,
                            phone: args.phone || client.phone,
                            userUID: userUID || client.userUID
                        }
                    },
                    { new: true, runValidators: true }
                )

                if (!updatedClient) {
                    throw new Error(`Failed to update project with ID: ${args.id}`);
                }


                return updatedClient

            } catch (error) {
                console.error(`Error updating project: ${JSON.stringify(error, null, 2)}`);

                throw new Error(error)
            }
        }
    }

}

module.exports = { ClientType, ClientQuery, ClientMutation }