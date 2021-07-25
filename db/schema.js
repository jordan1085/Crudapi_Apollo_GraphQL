const { gql } = require('apollo-server');

// Schema - define la forma de los datos
// Es lo que describe tus tipos de objetos, queries y datos de tu aplicacion

const typeDefs = gql`

  ### Objetos ###

  type Token {
    token: String
  }

  type Usuario {
    id: ID
    nombre: String
    apellido: String
    email: String
    creado: String
  }

  type Producto {
    id: ID
    nombre: String
    existencia: Int
    precio: Float
    creado: String
  }

  type Cliente {
    id: ID
    nombre: String
    apellido: String
    empresa: String
    email: String
    telefono: String
    vendedor: ID
    creado: String
  }

  type Pedido {
    id: ID
    pedido: [PedidoGrupo]
    total: Float
    cliente: ID
    vendedor: ID
    fecha: String
    estado: EstadoPedido
  }

  type PedidoGrupo {
    id: ID
    cantidad: Int
  }

  type TopCliente {
    total: Float
    cliente: [Cliente]
  }

  type TopVendedores {
    total: Float
    vendedor: [Usuario]
  }

  ### Inputs ###

  input AutenticarInput {
    email: String!
    password: String!
  }

  input UsuarioInput {
    nombre: String!
    apellido: String!
    email: String!
    password: String! 
  }

  input ProductoInput {
    nombre: String!
    existencia: Int!
    precio: Float!
  }

  input ClienteInput {
    nombre: String!
    apellido: String!
    empresa: String!
    email: String!
    telefono: String
  }

  input PedidoProductoInput {
    id: ID
    cantidad: Int
  }

  input PedidoInput {
    pedido: [PedidoProductoInput]
    total: Float!
    cliente: ID!
    estado: EstadoPedido
  }
  
  enum EstadoPedido {
    PENDIENTE
    COMPLETADO
    CANCELADO
  }

  ### querys ###

  type Query {
    obtenerUsuario(token: String!) : Usuario 

    obtenerProductos: [Producto]
    obtenerProducto(id: ID! ): Producto

    obtenerClientes: [Cliente]
    obtenerClientesVendedor: [Cliente]
    obtenerCliente(id: ID!): Cliente

    obtenerPedidos: [Pedido]
    obtenerPedidosUsuario: [Pedido]
    obtenerPedido(id: ID!): Pedido
    obtenerPedidosEstado(estado: String!): [Pedido]

    mejoresClientes: [TopCliente]
    mejoresVendedores: [TopVendedores]

    busquedaProductos(texto: String!): [Producto]
  }


  ### Mutation ###

  type Mutation {
    nuevoUsuario(input: UsuarioInput): Usuario
    atenticarUsuario(input: AutenticarInput): Token

    nuevoProducto(input: ProductoInput): Producto
    actualizarProducto(id: ID!, input: ProductoInput): Producto
    eliminarProducto(id: ID!) : Producto

    nuevoCliente(input: ClienteInput): Cliente
    actualizarCliente(id: ID!, input: ClienteInput): Cliente
    eliminarCliente(id: ID!) : Cliente

    nuevoPedido(input: PedidoInput): Pedido
    actualizarPedido(id: ID!, input: PedidoInput): Pedido
    eliminarPedido(id: ID!): Pedido
  }
`;

module.exports = {
  typeDefs
}