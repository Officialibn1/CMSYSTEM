const { clients } = require('../sampledb.js').default

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
            return clients.find(client => client.id === args.id)
        }
    },
    clients: {
        type: new GraphQLList(ClientType),
        resolve(parent, args) {
            return clients
        }
    }


}

module.exports = { ClientType, ClientQuery }