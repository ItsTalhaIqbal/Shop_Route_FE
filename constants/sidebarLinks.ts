import { Home, Box, ShoppingCart, FileText, BarChart, MapPin, User, ListOrderedIcon } from "lucide-react";

export const SIDEBAR_LINKS = {
  admin: [
    { 
      name: "Dashboard", 
      href: "/admin", 
      icon: Home 
    },
    { 
      name: "Products", 
      href: "/admin/products", 
      icon: Box 
    },
    
    {
      name:'Users',
      href:'/admin/users-managment',
      icon:User
    },
    
  
    
    { 
      name: "City", 
      href: "/admin/city", 
      icon: MapPin 
    },
    { 
      name: "Area", 
      href: "/admin/area", 
      icon: MapPin 
    },
    { 
      name: "Shops", 
      href: "/admin/shops", 
      icon: ShoppingCart 
    },
    { 
      name: "Orders", 
      href: "/admin/orders", 
      icon: ListOrderedIcon 
    },
    
  ],
  salesman: [
    { 
      name: "Dashboard", 
      href: "/salesman", 
      icon: Home 
    },
    // { 
    //   name: "Products", 
    //   href: "/salesman/products", 
    //   icon: Box 
    // },
    { 
      name: "Add City", 
      href: "/salesman/add-city", 
      icon: MapPin 
    }
    ,
    { 
      name: "Add Area", 
      href: "/salesman/add-area", 
      icon: MapPin 
    },
    
    { 
      name: "Shops", 
      href: "/salesman/shops", 
      icon: ShoppingCart 
    },
    { 
      name: "Order History", 
      href: "/salesman/orders-history", 
      icon: FileText 
    },
  ],
};
