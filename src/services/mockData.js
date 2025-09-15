// Mock data for development when API is unavailable

export const mockProducts = [
  {
    id: 1,
    name: "Digital Blood Pressure Monitor",
    price: "89.99",
    regular_price: "99.99",
    sale_price: "89.99",
    description: "Accurate digital blood pressure monitor with large LCD display and memory function.",
    short_description: "Professional grade blood pressure monitor",
    stock_status: "instock",
    stock_quantity: 25,
    categories: [
      { id: 1, name: "Medical Devices" },
      { id: 2, name: "Monitoring Equipment" }
    ],
    images: [
      {
        id: 1,
        src: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop",
        alt: "Blood Pressure Monitor"
      },
      {
        id: 2,
        src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop",
        alt: "Blood Pressure Monitor Side View"
      }
    ],
    attributes: [
      { name: "Brand", options: ["MedTech"] },
      { name: "Warranty", options: ["2 Years"] }
    ]
  },
  {
    id: 2,
    name: "Stethoscope Professional",
    price: "149.99",
    regular_price: "179.99",
    sale_price: "149.99",
    description: "High-quality stethoscope with excellent acoustic performance for medical professionals.",
    short_description: "Professional grade stethoscope",
    stock_status: "instock",
    stock_quantity: 15,
    categories: [
      { id: 1, name: "Medical Devices" },
      { id: 3, name: "Diagnostic Tools" }
    ],
    images: [
      {
        id: 3,
        src: "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=400&h=400&fit=crop",
        alt: "Professional Stethoscope"
      }
    ],
    attributes: [
      { name: "Brand", options: ["CardioTech"] },
      { name: "Type", options: ["Dual Head"] }
    ]
  },
  {
    id: 3,
    name: "Digital Thermometer",
    price: "24.99",
    regular_price: "29.99",
    sale_price: "24.99",
    description: "Fast and accurate digital thermometer with fever alarm and memory recall.",
    short_description: "Digital thermometer with fever alarm",
    stock_status: "instock",
    stock_quantity: 50,
    categories: [
      { id: 1, name: "Medical Devices" },
      { id: 2, name: "Monitoring Equipment" }
    ],
    images: [
      {
        id: 4,
        src: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
        alt: "Digital Thermometer"
      }
    ],
    attributes: [
      { name: "Brand", options: ["TempPro"] },
      { name: "Response Time", options: ["10 seconds"] }
    ]
  },
  {
    id: 4,
    name: "Pulse Oximeter",
    price: "59.99",
    regular_price: "69.99",
    sale_price: "59.99",
    description: "Fingertip pulse oximeter for measuring blood oxygen saturation and pulse rate.",
    short_description: "Fingertip pulse oximeter",
    stock_status: "instock",
    stock_quantity: 30,
    categories: [
      { id: 1, name: "Medical Devices" },
      { id: 2, name: "Monitoring Equipment" }
    ],
    images: [
      {
        id: 5,
        src: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=400&fit=crop",
        alt: "Pulse Oximeter"
      }
    ],
    attributes: [
      { name: "Brand", options: ["OxyTech"] },
      { name: "Display", options: ["OLED"] }
    ]
  },
  {
    id: 5,
    name: "Surgical Gloves (Box of 100)",
    price: "19.99",
    regular_price: "24.99",
    sale_price: "19.99",
    description: "Latex-free surgical gloves, powder-free, sterile. Box of 100 pieces.",
    short_description: "Latex-free surgical gloves",
    stock_status: "instock",
    stock_quantity: 100,
    categories: [
      { id: 4, name: "Protective Equipment" },
      { id: 5, name: "Disposables" }
    ],
    images: [
      {
        id: 6,
        src: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
        alt: "Surgical Gloves"
      }
    ],
    attributes: [
      { name: "Material", options: ["Nitrile"] },
      { name: "Size", options: ["Small", "Medium", "Large", "XL"] }
    ]
  },
  {
    id: 6,
    name: "Medical Face Masks (Pack of 50)",
    price: "12.99",
    regular_price: "15.99",
    sale_price: "12.99",
    description: "3-layer disposable medical face masks with ear loops. Pack of 50.",
    short_description: "3-layer disposable face masks",
    stock_status: "instock",
    stock_quantity: 200,
    categories: [
      { id: 4, name: "Protective Equipment" },
      { id: 5, name: "Disposables" }
    ],
    images: [
      {
        id: 7,
        src: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
        alt: "Medical Face Masks"
      }
    ],
    attributes: [
      { name: "Type", options: ["3-Layer"] },
      { name: "Color", options: ["Blue", "White"] }
    ]
  }
];

export const mockCategories = [
  {
    id: 1,
    name: "Medical Devices",
    description: "Professional medical devices and equipment",
    count: 15,
    image: {
      src: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop"
    }
  },
  {
    id: 2,
    name: "Monitoring Equipment",
    description: "Patient monitoring and diagnostic equipment",
    count: 8,
    image: {
      src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=200&fit=crop"
    }
  },
  {
    id: 3,
    name: "Diagnostic Tools",
    description: "Tools for medical diagnosis and examination",
    count: 12,
    image: {
      src: "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=300&h=200&fit=crop"
    }
  },
  {
    id: 4,
    name: "Protective Equipment",
    description: "Personal protective equipment for healthcare",
    count: 20,
    image: {
      src: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop"
    }
  },
  {
    id: 5,
    name: "Disposables",
    description: "Single-use medical supplies and disposables",
    count: 25,
    image: {
      src: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=300&h=200&fit=crop"
    }
  }
];

// Helper functions to simulate API responses
export const getMockProducts = (params = {}) => {
  let products = [...mockProducts];
  
  // Apply category filter
  if (params.category) {
    products = products.filter(product => 
      product?.categories?.some(cat => cat?.id === parseInt(params.category))
    );
  }
  
  // Apply search filter
  if (params.search) {
    const searchTerm = params.search.toLowerCase();
    products = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm)
    );
  }
  
  // Apply pagination
  const page = parseInt(params.page) || 1;
  const perPage = parseInt(params.per_page) || 10;
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  
  return products.slice(startIndex, endIndex);
};

export const getMockProduct = (id) => {
  if (!id) return null;
  return mockProducts.find(product => product?.id === parseInt(id)) || null;
};

export const getMockCategories = (params = {}) => {
  let categories = [...mockCategories];
  
  // Apply pagination
  const page = parseInt(params.page) || 1;
  const perPage = parseInt(params.per_page) || 10;
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  
  return categories.slice(startIndex, endIndex);
};

export const getMockProductsByCategory = (categoryId, params = {}) => {
  return getMockProducts({ ...params, category: categoryId });
};