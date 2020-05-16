import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { Product } from 'src/pages/Dashboard/styles';

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
      const productsFromAsyncStorage = (await AsyncStorage.getItem(
        '@desafio8/products',
      )) as string;
      setProducts(JSON.parse(productsFromAsyncStorage));
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function saveProductsToStorage(): Promise<void> {
      await AsyncStorage.setItem(
        '@desafio8/products',
        JSON.stringify(products),
      );
    }

    saveProductsToStorage();
  }, [products]);

  const addToCart = useCallback(
    (product: Product) => {
      // TODO ADD A NEW ITEM TO THE CART
      setProducts([...products, product]);
    },
    [products],
  );

  const increment = useCallback(
    id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndexToChange = products.findIndex(product => {
        return product.id === id;
      });

      const productToChange = products[productIndexToChange];

      if (productIndexToChange) {
        products[productIndexToChange] = {
          ...productToChange,
          quantity: productToChange.quantity + 1,
        };
      }
    },
    [products],
  );

  const decrement = useCallback(
    id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndexToChange = products.findIndex(product => {
        return product.id === id;
      });

      const productToChange = products[productIndexToChange];

      if (productIndexToChange && productToChange.quantity >= 0) {
        products[productIndexToChange] = {
          ...productToChange,
          quantity: productToChange.quantity - 1,
        };
      }
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
