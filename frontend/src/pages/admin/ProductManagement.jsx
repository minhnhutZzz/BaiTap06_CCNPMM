import React, { useEffect, useState } from 'react';
import productService from '../../../services/product.service';
import adminService from '../../../services/admin.service';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    stock: '',
    category_id: '',
    thumbnail: '',
    is_new: false,
    is_promotion: false
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Lấy 100 sản phẩm (chấp nhận load hết để quản lý dễ dàng trong bài tập)
      const resProducts = await productService.getProducts({ page: 1, limit: 100 });
      const resCategories = await productService.getCategories();
      
      if (resProducts.success) setProducts(resProducts.data.products);
      if (resCategories.success) setCategories(resCategories.data);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        discount_price: product.discount_price || '',
        stock: product.stock,
        category_id: product.category_id,
        thumbnail: product.thumbnail,
        is_new: product.is_new,
        is_promotion: product.is_promotion
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '', description: '', price: '', discount_price: '', stock: 100, 
        category_id: categories[0]?.id || '', thumbnail: '', is_new: true, is_promotion: false
      });
    }
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await adminService.uploadImage(file);
      if (res.success) {
        setFormData(prev => ({ ...prev, thumbnail: res.data.url }));
      }
    } catch (error) {
      alert('Lỗi upload ảnh!');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Chuẩn hóa dữ liệu
      const submitData = {
        ...formData,
        price: parseInt(formData.price),
        discount_price: formData.discount_price ? parseInt(formData.discount_price) : null,
        stock: parseInt(formData.stock)
      };

      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, submitData);
        alert('Cập nhật sản phẩm thành công!');
      } else {
        await adminService.createProduct(submitData);
        alert('Thêm sản phẩm thành công!');
      }
      setShowModal(false);
      fetchData(); // Tải lại danh sách
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này? Thao tác này không thể hoàn tác!')) return;
    try {
      await adminService.deleteProduct(id);
      alert('Xóa thành công!');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể xóa sản phẩm do đã có người đặt mua!');
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
        <button onClick={() => openModal()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-md">
          + Thêm sản phẩm mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">Hình ảnh</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Tên sản phẩm</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Danh mục</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Giá bán</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Kho</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-3">
                  <img src={p.thumbnail} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                </td>
                <td className="px-6 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-6 py-3 text-gray-600">{p.Category?.name}</td>
                <td className="px-6 py-3">
                  <span className="font-bold text-indigo-600">{Number(p.price).toLocaleString('vi-VN')}đ</span>
                  {p.discount_price && <span className="text-xs text-gray-400 line-through ml-2">{Number(p.discount_price).toLocaleString('vi-VN')}đ</span>}
                </td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${p.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => openModal(p)} className="text-indigo-600 hover:text-indigo-900 font-medium text-sm mr-4">Sửa</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900 font-medium text-sm">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM / SỬA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">{editingProduct ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên món nước</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="VD: Trà Sữa Oolong" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc (VNĐ)</label>
                  <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá khuyến mãi (Để trống nếu không có)</label>
                  <input type="number" min="0" value={formData.discount_price} onChange={e => setFormData({...formData, discount_price: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng trong kho</label>
                  <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                  <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh đại diện (Cloudinary)</label>
                  <div className="flex gap-4 items-center">
                    {formData.thumbnail && <img src={formData.thumbnail} alt="preview" className="w-20 h-20 rounded-lg object-cover border" />}
                    <div className="flex-1">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                      {uploading && <p className="text-sm text-indigo-600 mt-2 animate-pulse">Đang tải ảnh lên Cloudinary...</p>}
                      <input type="text" value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} className="mt-2 w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg" placeholder="Hoặc nhập Link URL ảnh trực tiếp" />
                    </div>
                  </div>
                </div>

                <div className="col-span-2 flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_new} onChange={e => setFormData({...formData, is_new: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" />
                    <span className="text-sm font-medium text-gray-700">Đánh dấu là món mới (Mới)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_promotion} onChange={e => setFormData({...formData, is_promotion: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" />
                    <span className="text-sm font-medium text-gray-700">Đang được khuyến mãi (Hot)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                  Hủy bỏ
                </button>
                <button type="submit" disabled={uploading} className="px-5 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg font-medium transition-colors">
                  {editingProduct ? 'Lưu Thay Đổi' : 'Tạo Sản Phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
