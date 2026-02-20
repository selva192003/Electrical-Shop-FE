import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setFilters, setPage } from '../../redux/slices/productSlice.js';
import './ProductSearch.css';

const ProductSearch = ({ placeholder = 'Search products…' }) => {
  const dispatch = useDispatch();
  const [value, setValue] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dispatch(setFilters({ keyword: value.trim() }));
      dispatch(setPage(1));
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [value, dispatch]);

  const handleClear = () => {
    setValue('');
    dispatch(setFilters({ keyword: '' }));
    dispatch(setPage(1));
  };

  return (
    <div className="product-search">
      <span className="product-search__icon">🔍</span>
      <input
        type="text"
        className="product-search__input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {value && (
        <button className="product-search__clear" onClick={handleClear} aria-label="Clear search">
          ✕
        </button>
      )}
    </div>
  );
};

export default ProductSearch;
