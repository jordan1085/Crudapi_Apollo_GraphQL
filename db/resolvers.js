const { Usuario, Producto, Cliente, Pedido } = require('../models');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateJWT } = require('../helpers/crearToken');


// Resolve - se encargan de la comunicacion
// Son funciones que retornan los valores que declaramos en el schema
const resolvers = {
  Query: {
    obtenerUsuario: async (_, { token }) => {
      const usuarioId = await jwt.verify(token, process.env.SECRET_KEY);

      return usuarioId;
    },
    obtenerProductos: async () => {

      try {
        const productos = await Producto.find({});
        return productos

      } catch (error) {
        console.log(error);
      }

    },
    obtenerProducto: async (_, { id }) => {

      try {
        // Veridicar si el producto existe
        const producto = await Producto.findById(id);
        if (!producto) {
          throw new Error('El producto no existe')
        }

        return producto

      } catch (error) {

      }
    },
    obtenerClientes: async () => {
      try {
        const clientes = await Cliente.find({});
        return clientes

      } catch (error) {
        console.log(error);
      }
    },
    obtenerClientesVendedor: async (_, {}, ctx) => {
      try {
        const clientes = await Cliente.find({vendedor: ctx.usuario.id.toString()});
        if(!clientes){
          throw new Error('El cliente no existe')
        }

        return clientes

      } catch (error) {
        console.log(error);
      }
    },
    obtenerCliente: async (_, {id}, ctx) => {
      try {
        const cliente = await Cliente.findById(id);
        if(!cliente){
          throw new Error('El cliente no existe')
        }

        if(cliente.vendedor.toString() !== ctx.usuario.id.toString()){
          throw new Error('Sin autorizacion')
        }

        return cliente
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedidos: async () => {

      try {
        const pedidos = await Pedido.find();

        if(!pedidos){
          throw new Error('No existe pedidos')
        }

        return pedidos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedidosUsuario:  async (_, {}, ctx) => {
      const {usuario} = ctx;

      try {
        const pedidos = Pedido.find({vendedor: usuario.id})

        if(!pedidos){
          throw new Error('No existe pedidos')
        }

        return pedidos;
      } catch (error) {
        console.log(error);
      }

    },
    obtenerPedido: async (_, {id}, ctx) => {
      try {
        const pedido = await Pedido.findById(id);

        if(!pedido){
          throw new Error('El pedido no existe')
        }

        if(pedido.vendedor.toString() !== ctx.usuario.id){
          throw new Error('No tienes autorizacion')
        }

        return pedido;

      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedidosEstado: async (_, {estado}, ctx) => {

      try {
        const pedido = await Pedido.find({vendedor: ctx.usuario.id, estado});

        return pedido;
      } catch (error) {
        console.log(error);
      }
    },
    mejoresClientes: async () => {
      const clientes = await Pedido.aggregate([
        { $match: {estado: "COMPLETADO"}},
        { $group : {
          _id: "$cliente",
          total: {$sum: '$total'}
        }},
        {
          $lookup: {
            from: "clientes",
            localField: "_id",
            foreignField: "_id",
            as: "cliente"
          }
        },
        {
          $limit: 10
        },
        {
          $sort: {total: -1}
        }
      ]);

      return clientes;
    },
    mejoresVendedores: async () => {
      const vendedores = await Pedido.aggregate([
        { $match: {estado: "COMPLETADO"}},
        { $group : {
          _id: "$vendedor",
          total: {$sum: '$total'}
        }},
        {
          $lookup: {
            from: "usuarios",
            localField: "_id",
            foreignField: "_id",
            as: "vendedor"
          }
        },
        {
          $limit: 10
        },
        {
          $sort: {total: -1}
        }
      ]);

      return vendedores;
    },
    busquedaProductos: async (_, {texto}) => {
      try {
        const productos = await Producto.find({$text: {$search: texto}}).limit(10);
         
        return productos;
      } catch (error) {
        console.log(error);
      }

    }
  },
  Mutation: {
    nuevoUsuario: async (_, { input }) => {

      const { email, password } = input;

      // Revisar si el usuario ya esta registrado
      const existeUsuario = await Usuario.findOne({ email });
      if (existeUsuario) {
        throw new Error('El usuario ya esta registrado')
      }

      // Hashear password
      const salt = await bcryptjs.genSalt();
      input.password = await bcryptjs.hash(password, salt);

      // Guardar en la base de datos
      try {

        const usuario = new Usuario(input);
        usuario.save();
        return usuario;

      } catch (error) {
        console.log(error);
      }
    },
    atenticarUsuario: async (_, { input }) => {

      const { email, password } = input;

      // Verificar si el usuario existe
      const usuario = await Usuario.findOne({ email });
      if (!usuario) {
        throw new Error('El usuario no existe')
      }

      // Validar password
      const passwordCorrecto = await bcryptjs.compare(password, usuario.password);
      if (!passwordCorrecto) {
        throw new Error('La contraseña es incorrecta')
      }

      // Crear token
      try {
        return {
          token: generateJWT(usuario.id)
        }
      } catch (error) {
        console.log(error);
      }
    },
    nuevoProducto: async (_, { input }) => {

      // Guardar en la base de datos
      try {

        const producto = new Producto(input);
        producto.save();
        return producto;

      } catch (error) {
        console.log(error);
      }
    },
    actualizarProducto: async (_, { id, input }) => {

      try {
        // Veridicar si el producto existe
        let producto = await Producto.findById(id);
        if (!producto) {
          throw new Error('El producto no existe')
        }

        // Guardar
        producto = await Producto.findByIdAndUpdate({ _id: id }, input, { new: true })

        return producto;

      } catch (error) {
        console.log(error);
      }
    },
    eliminarProducto: async (_, { id }) => {
      // Veridicar si el producto existe
      try {
        const producto = await Producto.findById(id);
        if (!producto) {
          throw new Error('El producto no existe')
        }

        await Producto.findByIdAndDelete({_id : id});

        return producto;

      } catch (error) {
        console.log(error);
      }

    },
    nuevoCliente: async (_, {input}, ctx) => {
      console.log(ctx);
      const { email } = input;
      // Verificar si el cliente existe
      const cliente = await Cliente.findOne({email});
      if(cliente){
        throw new Error('El cliente ya existe')
      }

      const nuevoCliente = new Cliente(input);

      // Asignar el vendedor
      nuevoCliente.vendedor = ctx.usuario.id;

      // Guardar en la base de datos
      try {
        const resultado = await nuevoCliente.save();
  
        return resultado;
      } catch (error) {
        console.log(error);
      }

    },
    actualizarCliente: async (_, {id, input}, ctx) => {
      const cliente = await Cliente.findById(id);
      if(!cliente){
        throw new Error('El cliente no existe')
      }
      if(cliente.vendedor.toString() !== ctx.usuario.id){
        throw new Error('Sin autorizacion para editar cliente')
      }

      try {
        const resultado = await Cliente.findByIdAndUpdate({_id: id}, input, {new: true})

        return resultado;
      } catch (error) {
        console.log(error);
      }

    },
    eliminarCliente: async (_, { id }, ctx) => {
      // Veridicar si el producto existe
      try {
        const cliente = await Cliente.findById(id);
        if (!cliente) {
          throw new Error('El cliente no existe')
        }
        if(cliente.vendedor.toString() !== ctx.usuario.id){
          throw new Error('Sin autorizacion para editar cliente')
        }

        const resultado = await Cliente.findByIdAndDelete({_id : id});

        return resultado;

      } catch (error) {
        console.log(error);
      }

    },
    nuevoPedido: async (_, {input}, ctx) => {
      const {cliente} = input;

      // Verificar si el cliente existe
      const clienteExiste = await Cliente.findById(cliente);
      if(!clienteExiste){
        throw new Error('El cliente no existe')
      }

      // Verificar si el cliente es del vendedor
      if(clienteExiste.vendedor.toString() !== ctx.usuario.id){
        throw new Error('No tiene las credenciales')
      }

      // Verificar el stock
      for await ( const articulo of input.pedido){

        const {id} = articulo;
        const producto = await Producto.findById(id);
        
        if(articulo.cantidad > producto.existencia) {
        throw new Error(`El articulo: ${producto.nombre} excede la cantidad disponible`);
        }else{
          producto.existencia = producto.existencia - articulo.cantidad;

          await producto.save();
        }
      };

      // Crear pedido
      const nuevoPedido = new Pedido(input);

      // Asignarle un vendedor
      nuevoPedido.vendedor = ctx.usuario.id;

      // Guardarlo en la bd
      const resultado = await nuevoPedido.save();

      return resultado;
    },
    actualizarPedido: async (_, {id, input}, ctx) => {

      try {
        const pedido = await Pedido.findById(id);

        if(!pedido){
          throw new Error('El pedido no existe');
        }
  
        if(pedido.vendedor.toString() !== ctx.usuario.id){
          throw new Error('Sin autorizacion')
        }

        const resultado = await Pedido.findByIdAndUpdate({_id: id}, input, {new: true})

        return resultado;
      } catch (error) {
        console.log(error);
      }
    },
    eliminarPedido: async (_, {id}, ctx) => {

      try {
        const pedido = await Pedido.findById(id);

        if(!pedido){
          throw new Error('El pedido no existe');
        }
        if(pedido.vendedor.toString() !== ctx.usuario.id){
          throw new Error('Sn autorizacion')
        }
  
        const resultado = await Pedido.findByIdAndDelete({_id: id});

        return resultado;
      } catch (error) {
        console.log(error);
      }

    }
  }
}

module.exports = {
  resolvers
}
