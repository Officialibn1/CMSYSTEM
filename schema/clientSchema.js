const Client = require('../config/models/Client')
const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLList, GraphQLNonNull } = require('graphql')

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
        resolve(parent, args) {
            return Client.findById(args.id)
        }
    },
    clients: {
        type: new GraphQLList(ClientType),
        resolve(parent, args) {
            return Client.find()
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
        resolve(parent, args) {
            return Client.findByIdAndDelete(args.id)
                .then(deleteClient => {
                    if (!deleteClient) {
                        throw new Error(`Client with ID: ${args.id} not found`)
                    }

                    return deleteClient
                })
                .catch(error => {
                    console.error(`Error Deleting Client: ${error}`)
                    throw error
                })
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