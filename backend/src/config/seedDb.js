const { Category, Product, ProductImage } = require('../models');

const seedDatabase = async () => {
  try {
    const categoryCount = await Category.count();
    if (categoryCount > 0) {
      console.log('✓ Dữ liệu mẫu (Trà sữa) đã tồn tại, bỏ qua seed.');
      return;
    }

    console.log('Đang tạo dữ liệu mẫu (Trà sữa)...');

    // Tạo danh mục
    const categories = await Category.bulkCreate([
      { name: 'Trà Sữa Truyền Thống', description: 'Các loại trà sữa cơ bản' },
      { name: 'Trà Trái Cây', description: 'Trà kết hợp trái cây tươi mát' },
      { name: 'Macchiato & Kem Cheese', description: 'Đồ uống có lớp kem béo' },
      { name: 'Topping', description: 'Trân châu, thạch, pudding...' }
    ]);

    // Tạo sản phẩm bằng dữ liệu chính chủ
    const productsData = [
      { name: 'Trà dâu kem cheese', description: 'Thức uống thơm ngon: Trà dâu kem cheese', price: 30000, discount_price: null, stock: 100, sold: 10, thumbnail: 'https://res.cloudinary.com/dpofwhvku/image/upload/lf2xrcyscqk6gk3elywu', is_new: true, is_promotion: false, category_id: categories[0].id },
      { name: 'Trà sữa trân châu đường đen', description: 'Thức uống thơm ngon: Trà sữa trân châu đường đen', price: 32000, discount_price: null, stock: 100, sold: 15, thumbnail: 'https://res.cloudinary.com/dpofwhvku/image/upload/ofhsy89nfxtxgsjbepfp', is_new: false, is_promotion: false, category_id: categories[0].id },
      { name: 'Hồng trà sữa', description: 'Thức uống thơm ngon: Hồng trà sữa', price: 34000, discount_price: null, stock: 100, sold: 20, thumbnail: 'https://res.cloudinary.com/dpofwhvku/image/upload/tr10shdi8ktmewytriyk', is_new: true, is_promotion: false, category_id: categories[0].id },
      { name: 'Trà sữa ô long nướng', description: 'Thức uống thơm ngon: Trà sữa ô long nướng', price: 36000, discount_price: null, stock: 100, sold: 5, thumbnail: 'https://res.cloudinary.com/dpofwhvku/image/upload/obibrgzlkjlgrg5o082j', is_new: false, is_promotion: false, category_id: categories[0].id },
      { name: 'Trà xoài kem cheese', description: 'Thức uống thơm ngon: Trà xoài kem cheese', price: 38000, discount_price: null, stock: 100, sold: 25, thumbnail: 'https://res.cloudinary.com/dpofwhvku/image/upload/lauocanylgrytvuqdagx', is_new: true, is_promotion: false, category_id: categories[0].id },
      { name: 'Trà chanh leo', description: 'Thức uống thơm ngon: Trà chanh leo', price: 40000, discount_price: null, stock: 100, sold: 30, thumbnail: 'https://res.cloudinary.com/dpofwhvku/image/upload/bhqhk8uelx0tetgnoxsh', is_new: false, is_promotion: false, category_id: categories[1].id },
      { name: 'Trà sữa đậu đỏ', description: 'Thức uống thơm ngon: Trà sữa đậu đỏ', price: 42000, discount_price: 37000, stock: 100, sold: 12, thumbnail: 'https://res.cloudinary.com/dpofwhvku/image/upload/dhy4jmf9blpilzyamnwm', is_new: true, is_promotion: true, category_id: categories[1].id },
      { name: 'Trà hạt lựu', description: 'Thức uống thơm ngon: Trà hạt lựu', price: 44000, discount_price: 39000, stock: 100, sold: 18, thumbnail: 'https://res.cloudinary.com/dpofwhvku/image/upload/pj1leqnsfgaf9cxyysyl', is_new: false, is_promotion: true, category_id: categories[1].id },
      { name: 'Trà sữa khoai môn', description: 'Thức uống thơm ngon: Trà sữa khoai môn', price: 46000, discount_price: 41000, stock: 100, sold: 22, thumbnail: 'https://res.cloudinary.com/dpofwhvku/image/upload/p64wdlwjuakrbhpozrbs', is_new: true, is_promotion: true, category_id: categories[2].id },
      { name: 'Trà sữa matcha đậu xanh', description: 'Thức uống thơm ngon: Trà sữa matcha đậu xanh', price: 48000, discount_price: 43000, stock: 100, sold: 40, thumbnail: 'https://res.cloudinary.com/dpofwhvku/image/upload/xnqc94fmoih78fvudxsp', is_new: false, is_promotion: true, category_id: categories[2].id },
      { name: 'Trà sữa việt quất', description: 'Thức uống thơm ngon: Trà sữa việt quất', price: 50000, discount_price: 45000, stock: 100, sold: 35, thumbnail: 'https://res.cloudinary.com/dpofwhvku/image/upload/fztmsqw5nmennoixjwlt', is_new: true, is_promotion: true, category_id: categories[3].id }
    ];

    const products = await Product.bulkCreate(productsData);

    // Tạo nhiều ảnh cho các sản phẩm
    const productImagesData = [
      { product_id: products[0].id, image_url: 'https://res.cloudinary.com/dpofwhvku/image/upload/ulft3ffi3armelfe29fi' },
      { product_id: products[0].id, image_url: 'https://res.cloudinary.com/dpofwhvku/image/upload/yiseifcmp9cexoh6eyid' },
      
      { product_id: products[1].id, image_url: 'https://res.cloudinary.com/dpofwhvku/image/upload/umctriflkcqcb5mlrgkm' },
      { product_id: products[1].id, image_url: 'https://res.cloudinary.com/dpofwhvku/image/upload/gongpd3dfd4m9dn8msii' },
      
      { product_id: products[2].id, image_url: 'https://res.cloudinary.com/dpofwhvku/image/upload/xhdcatx70h5x60xevbd3' },
      { product_id: products[2].id, image_url: 'https://res.cloudinary.com/dpofwhvku/image/upload/x2yjs0uabk2cmjx8dfig' },
      
      { product_id: products[3].id, image_url: 'https://res.cloudinary.com/dpofwhvku/image/upload/mutbr8m14ouyvckubis6' },
      { product_id: products[3].id, image_url: 'https://res.cloudinary.com/dpofwhvku/image/upload/xzet0vg5xft9rdnvqxhy' },

      { product_id: products[4].id, image_url: 'https://res.cloudinary.com/dpofwhvku/image/upload/i9swqy69vs1pkxrdlbc1' },
      { product_id: products[4].id, image_url: 'https://res.cloudinary.com/dpofwhvku/image/upload/x9kzrfaaa3bair9paslf' },

      { product_id: products[5].id, image_url: 'https://res.cloudinary.com/dpofwhvku/image/upload/ecrnhbimthzgnvbzyp1p' },

      { product_id: products[6].id, image_url: 'https://res.cloudinary.com/dpofwhvku/image/upload/ikjgrvtiueaatk4jawvm' },
      { product_id: products[6].id, image_url: 'https://res.cloudinary.com/dpofwhvku/image/upload/hoz6ersxpq7uufmly6pi' },

      { product_id: products[7].id, image_url: 'https://res.cloudinary.com/dpofwhvku/image/upload/xwynpjyffojtbgfn4np0' },
      { product_id: products[7].id, image_url: 'https://res.cloudinary.com/dpofwhvku/image/upload/sadxz0dsw7ydm7arbgot' },

      { product_id: products[8].id, image_url: 'https://res.cloudinary.com/dpofwhvku/image/upload/b4qfxgveyyet3qt5cnjd' },
      { product_id: products[8].id, image_url: 'https://res.cloudinary.com/dpofwhvku/image/upload/wa5pvept70jeutkbs1nc' },

      { product_id: products[9].id, image_url: 'https://res.cloudinary.com/dpofwhvku/image/upload/tqbpoqwgeqmncpggt3oh' },
      { product_id: products[9].id, image_url: 'https://res.cloudinary.com/dpofwhvku/image/upload/vrfyvfrhpegjjkslkrib' },

      { product_id: products[10].id, image_url: 'https://res.cloudinary.com/dpofwhvku/image/upload/c4sobsidwmuqe1erhvdj' },
      { product_id: products[10].id, image_url: 'https://res.cloudinary.com/dpofwhvku/image/upload/ngsucswm4lujdfemsqam' }
    ];

    await ProductImage.bulkCreate(productImagesData);

    console.log('✓ Tạo dữ liệu mẫu (Trà sữa) thành công!');
  } catch (error) {
    console.error('✗ Lỗi tạo dữ liệu mẫu:', error);
  }
};

module.exports = seedDatabase;
