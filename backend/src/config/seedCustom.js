const { Product, ProductImage, Category, CartItem, Order, OrderItem } = require('../models');
const sequelize = require('./database');

const seedCustom = async () => {
  try {
    await sequelize.authenticate();
    
    // Clear existing data
    await OrderItem.destroy({ where: {} });
    await Order.destroy({ where: {} });
    await CartItem.destroy({ where: {} });
    await ProductImage.destroy({ where: {} });
    await Product.destroy({ where: {} });
    // Keep Categories, we just fetch them
    const categories = await Category.findAll();
    if(categories.length === 0) {
      console.log('No categories found. Run standard seedDb first.');
      process.exit(1);
    }

    const cId = categories[0].id; // Fallback category
    
    // Helper to get full Cloudinary URL
    const getUrl = (id) => `https://res.cloudinary.com/dpofwhvku/image/upload/${id.trim()}`;

    const rawData = [
      {
        name: 'Trà dâu kem cheese',
        images: ['lf2xrcyscqk6gk3elywu', 'ulft3ffi3armelfe29fi', 'yiseifcmp9cexoh6eyid']
      },
      {
        name: 'Trà sữa trân châu đường đen',
        images: ['ofhsy89nfxtxgsjbepfp', 'umctriflkcqcb5mlrgkm', 'gongpd3dfd4m9dn8msii'] // Removed 'png,'
      },
      {
        name: 'Hồng trà sữa',
        images: ['tr10shdi8ktmewytriyk', 'xhdcatx70h5x60xevbd3', 'x2yjs0uabk2cmjx8dfig']
      },
      {
        name: 'Trà sữa ô long nướng',
        images: ['obibrgzlkjlgrg5o082j', 'mutbr8m14ouyvckubis6', 'xzet0vg5xft9rdnvqxhy']
      },
      {
        name: 'Trà xoài kem cheese',
        images: ['lauocanylgrytvuqdagx', 'i9swqy69vs1pkxrdlbc1', 'x9kzrfaaa3bair9paslf']
      },
      {
        name: 'Trà chanh leo',
        images: ['bhqhk8uelx0tetgnoxsh', 'ecrnhbimthzgnvbzyp1p']
      },
      {
        name: 'Trà sữa đậu đỏ',
        images: ['dhy4jmf9blpilzyamnwm', 'ikjgrvtiueaatk4jawvm', 'hoz6ersxpq7uufmly6pi']
      },
      {
        name: 'Trà hạt lựu',
        images: ['pj1leqnsfgaf9cxyysyl', 'xwynpjyffojtbgfn4np0', 'sadxz0dsw7ydm7arbgot']
      },
      {
        name: 'Trà sữa khoai môn',
        images: ['p64wdlwjuakrbhpozrbs', 'b4qfxgveyyet3qt5cnjd', 'wa5pvept70jeutkbs1nc']
      },
      {
        name: 'Trà sữa matcha đậu xanh',
        images: ['xnqc94fmoih78fvudxsp', 'tqbpoqwgeqmncpggt3oh', 'vrfyvfrhpegjjkslkrib']
      },
      {
        name: 'Trà sữa việt quất',
        images: ['fztmsqw5nmennoixjwlt', 'c4sobsidwmuqe1erhvdj', 'ngsucswm4lujdfemsqam']
      }
    ];

    let basePrice = 30000;
    for (let item of rawData) {
      const p = await Product.create({
        name: item.name,
        description: `Thức uống thơm ngon: ${item.name}`,
        price: basePrice,
        discount_price: basePrice > 40000 ? basePrice - 5000 : null,
        stock: 100,
        sold: Math.floor(Math.random() * 50),
        thumbnail: getUrl(item.images[0]),
        is_new: Math.random() > 0.5,
        is_promotion: basePrice > 40000,
        category_id: cId
      });
      basePrice += 2000;

      // Add other images
      if (item.images.length > 1) {
        for (let i = 1; i < item.images.length; i++) {
          await ProductImage.create({
            product_id: p.id,
            image_url: getUrl(item.images[i])
          });
        }
      }
    }

    console.log('Successfully seeded 11 user products!');
    process.exit(0);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedCustom();
