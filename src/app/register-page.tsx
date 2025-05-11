import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/layout/layout';
import { useAuth } from '../hooks/useAuth';

export const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    try {
      await register(email, password);
      navigate('/');
    } catch (err) {
      console.error('회원가입 실패:', err);
      setError('회원가입에 실패했습니다. 이미 사용 중인 이메일이거나 서버 오류입니다.');
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">회원가입</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 text-sm font-medium">이메일</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
            {focusedInput === 'email' && (
              <p className="text-xs text-gray-500 mt-1">실제 이메일 검증은 하지 않습니다</p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block mb-2 text-sm font-medium">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              maxLength={10}
              onChange={(e) => setPassword(e.target.value.slice(0, 10))}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
            {focusedInput === 'password' && (
              <p className="text-xs text-gray-500 mt-1">최대 10자 이내의 문자열을 입력합니다.</p>
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              maxLength={10}
              onChange={(e) => setConfirmPassword(e.target.value.slice(0, 10))}
              onFocus={() => setFocusedInput('confirmPassword')}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
            {focusedInput === 'confirmPassword' && (
              <p className="text-xs text-gray-500 mt-1">최대 10자 이내의 문자열을 입력합니다.</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 px-4 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            {loading ? '처리 중...' : '가입하기'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p>이미 계정이 있으신가요? <Link to="/login" className="text-red-600 hover:underline">로그인</Link></p>
        </div>
      </div>
    </Layout>
  );
}; 