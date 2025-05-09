import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface Product {
  _id: string;
  name: string;
  price: number;
  [key: string]: any;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

const updateLocalStorage = (items: CartItem[]) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(items));
  }
};

const getInitialCartState = (): CartItem[] => {
  try {
    if (typeof localStorage !== "undefined") {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    }
  } catch (e) {
  }
  return [];
};


const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: getInitialCartState(),
  } as CartState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{
        product: Product;
        quantity: number;
      }>
    ) => {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find(
        (item) => item.product._id === product._id
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }
      updateLocalStorage(state.items);
    },
    removeFromCart: (
      state,
      action: PayloadAction<{ product: Product }>
    ) => {
      const  product  = action.payload;
      
      
      // state.items = state.items.filter(
      //   (item) => item.product._id !== product._id
      // );
      
      updateLocalStorage(state.items);
    },
    
    incrementQuantity: (
      state,
      action: PayloadAction<{ product: Product }>
    ) => {
      const { product } = action.payload;
      const existingItem = state.items.find(
        (item) => item.product._id === product._id
      );
      if (existingItem) {
        existingItem.quantity += 1;
      }
      updateLocalStorage(state.items);
    },
    decrementQuantity: (
      state,
      action: PayloadAction<{ product: Product }>
    ) => {
      const { product } = action.payload;
      const existingItem = state.items.find(
        (item) => item.product._id === product._id
      );
      if (existingItem) {
        existingItem.quantity -= 1;
        if (existingItem.quantity === 0) {
          state.items = state.items.filter(
            (item) => item.product._id !== product._id
          );
        }
      }
      updateLocalStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("cart");
      }
    },
  },
});

export const {
  clearCart,
  addToCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
} = cartSlice.actions;

export default cartSlice.reducer;
