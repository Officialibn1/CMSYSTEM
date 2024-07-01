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
            return Client.findBtId(args.id)
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
    }

}

module.exports = { ClientType, ClientQuery, ClientMutation }