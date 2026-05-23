import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginThunk } from '../redux/authSlice';
import Alert from '../components/Alert';
import Button from '../components/Button';

const Login = () => {
  const [email, setEmail] = useState(localStorage.getItem('rememberedEmail') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('rememberedEmail'));
  const [successMsg, setSuccessMsg] = useState('');
  const [redirectTarget, setRedirectTarget] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!successMsg || !redirectTarget) return;
    const timer = setTimeout(() => navigate(redirectTarget), 1500);
    return () => clearTimeout(timer);
  }, [successMsg, redirectTarget, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    const result = await dispatch(loginThunk({ email, password }));
    if (loginThunk.fulfilled.match(result)) {
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      const target = result.payload?.redirectUrl || '/user/home';
      setRedirectTarget(target);
      setSuccessMsg('Đăng nhập thành công! Đang chuyển hướng...');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 w-full absolute top-0 left-0">
      <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-full max-w-md transform transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Chào mừng trở lại
          </h2>
          <p className="text-gray-500 mt-2">Đăng nhập vào tài khoản của bạn</p>
        </div>
        <Alert type="error" message={error} />
        <Alert type="success" message={successMsg} />
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
              placeholder="example@gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors p-1"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-500 cursor-pointer hover:text-gray-700 transition-colors font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              Ghi nhớ tôi
            </label>
            <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-800 transition-colors font-semibold">
              Quên mật khẩu?
            </Link>
          </div>
          <Button
            type="submit"
            disabled={loading || !!successMsg}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md transform transition hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </Button>
        </form>
        <p className="mt-6 text-center text-gray-500 text-sm font-medium">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors">
            Đăng ký ngay
          </Link>
        </p>

        {/* DEMO CREDENTIALS - Chỉ dùng để test */}
        <div className="mt-6 border-t border-gray-100 pt-5">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tài khoản demo</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setEmail('admin@example.com'); setPassword('Admin@123456'); }}
              className="flex flex-col items-center p-3 rounded-xl border border-purple-100 bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
            >
              <span className="text-lg">👑</span>
              <span className="text-xs font-bold text-purple-700 mt-1">Admin</span>
              <span className="text-[10px] text-purple-500 mt-0.5">admin@example.com</span>
              <span className="text-[10px] text-purple-400">Admin@123456</span>
            </button>
            <button
              type="button"
              onClick={() => { setEmail('user@example.com'); setPassword('User@123456'); }}
              className="flex flex-col items-center p-3 rounded-xl border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <span className="text-lg">👤</span>
              <span className="text-xs font-bold text-indigo-700 mt-1">Khách hàng</span>
              <span className="text-[10px] text-indigo-500 mt-0.5">user@example.com</span>
              <span className="text-[10px] text-indigo-400">User@123456</span>
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-300 mt-2">✨ Nhấn để tự điền vào ô</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
