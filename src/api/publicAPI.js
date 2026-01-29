// src/api/publicAPI.js - CORRECTED VERSION
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Helper function to get URL
const getUrl = (endpoint) => {
  return API_BASE + endpoint;
};

/**
 * Get all products (Home page) - CORRECTED (No mock data)
 */
export async function fetchProducts() {
  const url = getUrl('/products');
  
  try {
    console.log("Fetching products from:", url);
    
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      mode: 'cors',
      credentials: 'omit'
    });
    
    console.log("Response status:", res.status);
    
    if (!res.ok) {
      console.error("Fetch products failed with status:", res.status);
      // Return empty array instead of throwing error
      return [];
    }
    
    const data = await res.json();
    console.log("Fetched products data:", data);
    
    // Process image URLs - handle mixed slashes and prepend backend URL if needed
    const processedData = data.map(product => {
      let imageUrl = product.image_url;
      
      // If no image URL, return as is
      if (!imageUrl) {
        return product;
      }
      
      // Fix mixed slashes
      imageUrl = imageUrl.replace(/\\/g, '/');
      
      // If it's already a full URL (Cloudinary or external), keep it
      if (imageUrl.startsWith('http')) {
        return {
          ...product,
          image_url: imageUrl
        };
      }
      
      // If it's a local path, prepend backend URL
      // Ensure it has a leading slash
      if (!imageUrl.startsWith('/')) {
        imageUrl = '/' + imageUrl;
      }
      
      // Check if it's a Cloudinary-like URL without http prefix
      if (imageUrl.includes('res.cloudinary.com')) {
        return {
          ...product,
          image_url: `https:${imageUrl}`
        };
      }
      
      // For local uploaded images
      return {
        ...product,
        image_url: `${API_BASE}${imageUrl}`
      };
    });
    
    return processedData;
    
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty array - NO MOCK DATA
    return [];
  }
}

// ... rest of the functions remain the same ...
/**
 * Get single product by ID (Product details page)
 */
export async function fetchProductById(id) {
  const url = getUrl(`/products/${id}`);
  
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Product not found');
      }
      throw new Error(`Failed to fetch product: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

/**
 * Create order (Checkout page) - REQUIRED EXPORT
 */
export async function createOrder(orderData) {
  const url = getUrl('/orders');
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Create order error:", errorText);
      throw new Error(errorText || 'Failed to create order');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Get order by ID (Order confirmation page) - REQUIRED EXPORT
 */
export async function fetchOrderById(id) {
  const url = getUrl(`/orders/${id}`);
  
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Order not found');
      }
      throw new Error(`Failed to fetch order: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

/**
 * Get products by category (optional)
 */
export async function fetchProductsByCategory(category) {
  const url = getUrl(`/products?category=${encodeURIComponent(category)}`);
  
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch products by category: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

/**
 * Search products (optional)
 */
export async function searchProducts(query) {
  const url = getUrl(`/products/search?q=${encodeURIComponent(query)}`);
  
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to search products: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

/**
 * Contact form submission (optional)
 */
export async function submitContactForm(contactData) {
  const url = getUrl('/contact');
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(contactData),
    });

    if (!res.ok) {
      throw new Error(`Failed to submit contact form: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw error;
  }
}

/**
 * Test backend connection (for debugging)
 */
export async function testBackendConnection() {
  try {
    const res = await fetch(getUrl('/'), {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    } else {
      return { success: false, status: res.status };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get homepage featured product (optional)
 */
export async function fetchHomepageProduct() {
  const url = getUrl('/products/homepage/');
  
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch homepage product: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching homepage product:', error);
    return null;
  }
}