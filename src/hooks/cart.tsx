import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // await AsyncStorage.removeItem('@desafio8/products');
      const productsFromAsyncStorage = await AsyncStorage.getItem(
        '@desafio8/products',
      );
      productsFromAsyncStorage &&
        setProducts(JSON.parse(productsFromAsyncStorage));
    }

    loadProducts();
  }, []);

  /* useEffect(() => {
    async function saveProductsToStorage(): Promise<void> {
      await AsyncStorage.setItem(
        '@desafio8/products',
        JSON.stringify(products),
      );
    }

    saveProductsToStorage();
  }, [products]); */

  const addToCart = useCallback(
    async ({ id, title, image_url, price }: Product) => {
      // TODO ADD A NEW ITEM TO THE CART
      const productToAddToCart: Product = {
        id,
        title,
        image_url,
        price,
        quantity: 1,
      };

      const productIndexToChange = products.findIndex(product => {
        return product.id === id;
      });

      if (productIndexToChange > -1) {
        const newQuantity = products[productIndexToChange].quantity + 1;
        products[productIndexToChange].quantity = newQuantity;

        setProducts([...products]);
      } else {
        setProducts([...products, productToAddToCart]);
      }

      await AsyncStorage.setItem(
        '@desafio8/products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndexToChange = products.findIndex(product => {
        return product.id === id;
      });

      const newQuantity = products[productIndexToChange].quantity + 1;
      products[productIndexToChange].quantity = newQuantity;

      setProducts([...products]);

      await AsyncStorage.setItem(
        '@desafio8/products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const newProducts = [...products];

      const productIndexToChange = products.findIndex(product => {
        return product.id === id;
      });

      const newQuantity = newProducts[productIndexToChange].quantity - 1;
      newQuantity === 0
        ? newProducts.splice(productIndexToChange, 1)
        : (newProducts[productIndexToChange].quantity = newQuantity);

      setProducts([...newProducts]);

      await AsyncStorage.setItem(
        '@desafio8/products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
