require('dotenv').config();
const db = require('../src/models');

const initializeData = async () => {
    try {
        console.log('Iniciando proceso de inicialización de datos...\n');
        
        await db.sequelize.authenticate();
        console.log('Conexión a base de datos establecida\n');
        
        console.log('Creando roles...');
        const roles = await db.Rol.bulkCreate([
            { nombre_rol: 'ADMIN', descripcion: 'Administrador del sistema', estado: true },
            { nombre_rol: 'VENDEDOR', descripcion: 'Personal de ventas', estado: true },
            { nombre_rol: 'CAJERO', descripcion: 'Encargado de caja', estado: true },
            { nombre_rol: 'GERENTE', descripcion: 'Gerente de tienda', estado: true }
        ], { ignoreDuplicates: true });
        console.log('   [OK] ' + roles.length + ' roles creados\n');
        
        console.log('Creando usuario administrador...');
        const adminRole = await db.Rol.findOne({ where: { nombre_rol: 'ADMIN' } });
        
        const adminExists = await db.Usuario.findOne({ where: { email: 'admin@kissu.com' } });
        
        if (!adminExists) {
            await db.Usuario.create({
                nombre: 'Admin',
                apellido: 'Sistema',
                email: 'pablo@kissu.com',
                password: 'admin321',
                telefono: '5555-5555',
                id_rol: adminRole.id_rol,
                estado: true
            });
            console.log('   [OK] Usuario admin creado: admin@kissu.com / admin123\n');
        } else {
            console.log('   [ADVERTENCIA] Usuario admin ya existe\n');
        }
        
        console.log('Creando categorías...');
        const categorias = await db.Categoria.bulkCreate([
            { nombre_categoria: 'Postres Coreanos', descripcion: 'Postres tradicionales y modernos de Corea', estado: true },
            { nombre_categoria: 'Sodas Italianas', descripcion: 'Bebidas carbonatadas italianas artesanales', estado: true },
            { nombre_categoria: 'Bebidas', descripcion: 'Bebidas complementarias', estado: true },
            { nombre_categoria: 'Snacks', descripcion: 'Bocadillos y complementos', estado: true }
        ], { ignoreDuplicates: true });
        console.log('   [OK] ' + categorias.length + ' categorías creadas\n');
        
        console.log('Creando productos de ejemplo...');
        const categoria1 = await db.Categoria.findOne({ where: { nombre_categoria: 'Postres Coreanos' } });
        const categoria2 = await db.Categoria.findOne({ where: { nombre_categoria: 'Sodas Italianas' } });
        
        const productos = await db.Producto.bulkCreate([
            {
                codigo_producto: 'PC001',
                nombre: 'Bingsu de Fresa',
                descripcion: 'Postre coreano con hielo raspado y fresa fresca',
                id_categoria: categoria1.id_categoria,
                precio_unitario: 45.00,
                stock_minimo: 10,
                estado: true
            },
            {
                codigo_producto: 'PC002',
                nombre: 'Hotteok',
                descripcion: 'Panqueque dulce relleno de nueces y azúcar',
                id_categoria: categoria1.id_categoria,
                precio_unitario: 25.00,
                stock_minimo: 15,
                estado: true
            },
            {
                codigo_producto: 'PC003',
                nombre: 'Tteokbokki Dulce',
                descripcion: 'Pastel de arroz con salsa dulce',
                id_categoria: categoria1.id_categoria,
                precio_unitario: 35.00,
                stock_minimo: 10,
                estado: true
            },
            {
                codigo_producto: 'SI001',
                nombre: 'Soda Italiana Fresa',
                descripcion: 'Soda artesanal sabor fresa',
                id_categoria: categoria2.id_categoria,
                precio_unitario: 20.00,
                stock_minimo: 20,
                estado: true
            },
            {
                codigo_producto: 'SI002',
                nombre: 'Soda Italiana Limón',
                descripcion: 'Soda artesanal sabor limón',
                id_categoria: categoria2.id_categoria,
                precio_unitario: 20.00,
                stock_minimo: 20,
                estado: true
            }
        ], { ignoreDuplicates: true });
        console.log('   [OK] ' + productos.length + ' productos creados\n');
        
        console.log('Creando proveedores...');
        const proveedores = await db.Proveedor.bulkCreate([
            {
                nombre_empresa: 'Distribuidora Korea Food',
                nombre_contacto: 'Juan Pérez',
                telefono: '2222-3333',
                email: 'contacto@koreafood.com',
                direccion: 'Zona 10, Ciudad de Guatemala',
                nit: '1234567-8',
                estado: true
            },
            {
                nombre_empresa: 'Sodas Italia GT',
                nombre_contacto: 'María García',
                telefono: '2222-4444',
                email: 'ventas@sodasitalia.com',
                direccion: 'Zona 4, Ciudad de Guatemala',
                nit: '9876543-2',
                estado: true
            }
        ], { ignoreDuplicates: true });
        console.log('   [OK] ' + proveedores.length + ' proveedores creados\n');
        
        console.log('Creando clientes de ejemplo...');
        const clientes = await db.Cliente.bulkCreate([
            {
                nombre: 'Carlos',
                apellido: 'López',
                email: 'carlos.lopez@email.com',
                telefono: '5555-1111',
                nit: 'CF',
                direccion: 'Zona 1, Guatemala',
                estado: true
            },
            {
                nombre: 'Ana',
                apellido: 'Martínez',
                email: 'ana.martinez@email.com',
                telefono: '5555-2222',
                nit: '12345678',
                direccion: 'Zona 11, Guatemala',
                estado: true
            }
        ], { ignoreDuplicates: true });
        console.log('   [OK] ' + clientes.length + ' clientes creados\n');
        
        console.log('Proceso de inicialización completado exitosamente!\n');
        console.log('Credenciales de acceso:');
        console.log('   Email: admin@kissu.com');
        console.log('   Password: admin123\n');
        
        process.exit(0);
        
    } catch (error) {
        console.error('[ERROR] Error durante la inicialización:', error);
        process.exit(1);
    }
};

initializeData();