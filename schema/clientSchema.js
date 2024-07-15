const Client = require('../config/models/Client')
const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLList, GraphQLNonNull } = require('graphql')
const Project = require('../config/models/Project')
const { AuthenticationError } = require('../config/errors/authenticationError')

const ClientType = new GraphQLObjectType({
    name: 'Client',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString },
    })
})

const ClientQuery = {
    client: {
        type: ClientType,
        args: { id: { type: new GraphQLNonNull(GraphQLID) } },
        async resolve(parent, args, context) {



            if (!context.user) {
                throw new AuthenticationError();

            }

            return await Client.findById(args.id)
        }
    },
    clients: {
        type: new GraphQLList(ClientType),
        async resolve(parent, args, context) {


            if (!context.user) {
                throw new AuthenticationError();
            }

            // console.log('Get CLients: ', context.user.user_id);

            return await Client.find().exec()
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
        resolve(parent, args) {
            const client = new Client({
                name: args.name,
                email: args.email,
                phone: args.phone,
            })

            return client.save().catch(error => {
                console.error(`Error Creating Client: ${error}`)
                throw error
            })
        }
    },
    deleteClient: {
        type: ClientType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) }
        },
        async resolve(parent, args) {
            try {
                // First, delete all projects associated with this client
                await Project.deleteMany({ clientId: args.id });

                // Then, delete the client
                const deletedClient = await Client.findByIdAndDelete(args.id);

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
        resolve(parent, args) {
            return Client.findById(args.id).then(prev => {
                if (!prev) {
                    throw new Error(`Client with ID: ${args.id} not found!`)
                }

                return Client.findByIdAndUpdate(
                    args.id,
                    {
                        $set: {
                            name: args.name || prev.name,
                            email: args.email || prev.email,
                            phone: args.phone || prev.phone,
                        }
                    },
                    { new: true, runValidators: true }
                )
            }).then(updateProject => {
                if (!updateProject) {
                    throw new Error(`Failed to update project with ID: ${args.id}`);
                }

                return updateProject
            }).catch(error => {
                console.error(`Error updating project: ${error}`);

                throw error
            })
        }
    }

}

module.exports = { ClientType, ClientQuery, ClientMutation }