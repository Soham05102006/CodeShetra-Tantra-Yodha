import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Package, 
  Layers, 
  ClipboardList, 
  TrendingUp, 
  Search, 
  Plus, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Tag, 
  Percent, 
  Truck, 
  ShieldCheck, 
  CreditCard, 
  IndianRupee, 
  Trash2, 
  Edit3, 
  Eye, 
  Heart, 
  RefreshCw, 
  X, 
  PhoneCall, 
  Sparkles, 
  Check, 
  ChevronRight, 
  ArrowRight, 
  Users, 
  ExternalLink,
  Sliders,
  DollarSign,
  Send,
  Boxes,
  HelpCircle,
  BarChart3,
  Bot,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api/ecommerce';

export default function EcommerceModule({ onTriggerVoice }) {
  // Navigation sub-tabs: 'storefront' | 'cart' | 'dashboard' | 'products' | 'categories' | 'orders' | 'inventory' | 'coupons' | 'customers' | 'ai-assistant'
  const [activeTab, setActiveTab] = useState('storefront');

  // Core Data States synced with MongoDB Atlas
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Cart & Wishlist state (persisted in localStorage)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('ai01_ecommerce_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('ai01_ecommerce_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Storefront Filter States
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Checkout & Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [customerForm, setCustomerForm] = useState({
    name: 'Sharma Metal Works',
    phone: '+91 98765 43210',
    email: 'procurement@sharmametals.com',
    gstin: '27AABCS1429B1Z',
    street: 'Plot 42, MIDC Industrial Area, Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400093',
    paymentMethod: 'Razorpay',
    notes: 'Gate entry clearance required. Deliver to Bay 3 dispatch.'
  });

  // Razorpay Test Payment Modal State
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [razorpayPayload, setRazorpayPayload] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderSuccessModal, setOrderSuccessModal] = useState(null);

  // Modals for CRUD operations
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // AI Shopping Assistant chat state
  const [aiQuery, setAiQuery] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState([
    {
      role: 'assistant',
      text: 'Namaste! Main Sharma Enterprises ka AI Shopping Assistant hoon. Aap mujhse kisi bhi product ka price, stock availability, ya order track karwa sakte hain.',
      time: 'Just now'
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Product Form state for Add/Edit
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category: '',
    subcategory: '',
    description: '',
    price: '',
    discount_percent: 0,
    stock: 20,
    low_stock_threshold: 5,
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    specifications: ''
  });

  // Category Form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: 'Layers',
    subcategories: ''
  });

  // Coupon Form state
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'PERCENTAGE',
    discount_value: 10,
    min_order_amount: 5000,
    max_discount: 2000,
    expiry_date: '2026-12-31',
    description: ''
  });

  // Synchronize cart & wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ai01_ecommerce_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('ai01_ecommerce_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist]);

  // Helper for notification toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Data Fetchers
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes, dashRes, ordRes, coupRes, custRes] = await Promise.all([
        fetch(`${API_BASE}/products?limit=100`),
        fetch(`${API_BASE}/categories`),
        fetch(`${API_BASE}/dashboard`),
        fetch(`${API_BASE}/orders?limit=100`),
        fetch(`${API_BASE}/coupons`),
        fetch(`${API_BASE}/customers`)
      ]);

      if (prodRes.ok) {
        const data = await prodRes.json();
        setProducts(data.products || []);
      }
      if (catRes.ok) {
        const data = await catRes.json();
        setCategories(data.categories || []);
      }
      if (dashRes.ok) {
        const data = await dashRes.json();
        setDashboardData(data);
      }
      if (ordRes.ok) {
        const data = await ordRes.json();
        setOrders(data.orders || []);
      }
      if (coupRes.ok) {
        const data = await coupRes.json();
        setCoupons(data.coupons || []);
      }
      if (custRes.ok) {
        const data = await custRes.json();
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error('Error fetching E-Commerce data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filtered & Sorted Products for Storefront
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStock = !inStockOnly || p.stock > 0;
    return matchesCat && matchesSearch && matchesStock;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'stock') return b.stock - a.stock;
    return 0; // default newest
  });

  // Cart operations
  const addToCart = (product, qty = 1) => {
    if (product.stock <= 0) {
      showToast(`'${product.name}' is out of stock!`, 'error');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product._id || item.name === product.name);
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, product.stock);
        if (newQty === existing.quantity) {
          showToast(`Maximum available stock (${product.stock}) reached for ${product.name}`, 'warning');
          return prev;
        }
        showToast(`Updated '${product.name}' quantity to ${newQty} in cart`, 'success');
        return prev.map((item) =>
          item.product_id === product._id || item.name === product.name
            ? { ...item, quantity: newQty }
            : item
        );
      } else {
        const discountedPrice = Math.round(product.price * (1 - (product.discount_percent || 0) / 100));
        showToast(`Added '${product.name}' to cart!`, 'success');
        return [
          ...prev,
          {
            product_id: product._id,
            name: product.name,
            sku: product.sku,
            price: discountedPrice,
            original_price: product.price,
            quantity: qty,
            image_url: product.image_url,
            max_stock: product.stock,
            category: product.category
          }
        ];
      }
    });
  };

  const updateCartQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.max_stock) {
              showToast(`Only ${item.max_stock} units available in inventory!`, 'warning');
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  // Toggle Wishlist
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p._id === product._id);
      if (exists) {
        showToast(`Removed '${product.name}' from wishlist`, 'info');
        return prev.filter((p) => p._id !== product._id);
      } else {
        showToast(`Saved '${product.name}' to wishlist!`, 'success');
        return [...prev, product];
      }
    });
  };

  // Calculations for Checkout
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = cartSubtotal === 0 ? 0 : cartSubtotal > 10000 ? 0 : 350;
  const taxableAmount = Math.max(0, cartSubtotal - couponDiscount);
  const gstAmount = Math.round(taxableAmount * 0.18 * 100) / 100;
  const grandTotal = Math.round((taxableAmount + gstAmount + deliveryCharge) * 100) / 100;

  // Coupon Validation
  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;

    if (cartSubtotal <= 0) {
      showToast('Add products to cart before applying coupon.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: cartSubtotal })
      });

      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon(data);
        setCouponDiscount(data.discount_amount);
        showToast(`Coupon '${data.code}' applied! You saved ₹${data.discount_amount.toLocaleString('en-IN')}`, 'success');
      } else {
        showToast(data.detail || 'Invalid or ineligible coupon code.', 'error');
      }
    } catch (e) {
      showToast('Failed to validate coupon.', 'error');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponInput('');
    showToast('Coupon removed', 'info');
  };

  // Place Order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Your cart is empty!', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const orderPayload = {
        customer_name: customerForm.name,
        customer_phone: customerForm.phone,
        customer_email: customerForm.email,
        gstin: customerForm.gstin,
        delivery_address: {
          street: customerForm.street,
          city: customerForm.city,
          state: customerForm.state,
          pincode: customerForm.pincode
        },
        items: cart.map((it) => ({
          product_id: it.product_id,
          product_name: it.name,
          sku: it.sku,
          price: it.price,
          quantity: it.quantity,
          image_url: it.image_url
        })),
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        payment_method: customerForm.paymentMethod,
        notes: customerForm.notes
      };

      const res = await fetch(`${API_BASE}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to place order');
      }

      setCurrentOrder(data.order);

      // If Razorpay test mode, open payment modal
      if (customerForm.paymentMethod === 'Razorpay') {
        setRazorpayPayload(data.razorpay_payload);
        setRazorpayModalOpen(true);
      } else {
        // Direct order success for NEFT/COD
        setOrderSuccessModal(data.order);
        clearCart();
        fetchAllData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify Razorpay Test Mode Payment
  const handleVerifyRazorpayPayment = async () => {
    if (!currentOrder || !razorpayPayload) return;
    setIsProcessingPayment(true);

    try {
      const verifyRes = await fetch(`${API_BASE}/orders/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: currentOrder.order_id,
          razorpay_order_id: razorpayPayload.order_id,
          razorpay_payment_id: `pay_test_${Math.floor(100000 + Math.random() * 900000)}_success`,
          razorpay_signature: 'sig_test_msme_verified'
        })
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok) {
        setRazorpayModalOpen(false);
        setOrderSuccessModal(verifyData.order);
        clearCart();
        showToast('Payment verified successfully via Razorpay Test Mode!', 'success');
        fetchAllData();
      } else {
        showToast('Payment verification failed.', 'error');
      }
    } catch (e) {
      showToast('Error verifying Razorpay payment', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Order Status Update & Cancellation
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: newStatus })
      });
      if (res.ok) {
        showToast(`Order status updated to ${newStatus}`, 'success');
        fetchAllData();
      }
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to cancel order ${orderId}? Reserved inventory will be restored automatically.`)) return;

    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        fetchAllData();
        if (selectedOrderDetails && selectedOrderDetails.order_id === orderId) {
          setSelectedOrderDetails(data.order);
        }
      } else {
        showToast(data.detail || 'Could not cancel order', 'error');
      }
    } catch {
      showToast('Error cancelling order', 'error');
    }
  };

  // Product CRUD
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      let specsObj = {};
      if (productForm.specifications) {
        try {
          specsObj = JSON.parse(productForm.specifications);
        } catch {
          // split lines by colon
          productForm.specifications.split('\n').forEach((line) => {
            const [k, v] = line.split(':');
            if (k && v) specsObj[k.trim()] = v.trim();
          });
        }
      }

      const payload = {
        name: productForm.name,
        sku: productForm.sku || undefined,
        description: productForm.description,
        price: parseFloat(productForm.price),
        discount_percent: parseFloat(productForm.discount_percent || 0),
        category: productForm.category || (categories[0] ? categories[0].name : 'Raw Metals & Alloy Sheets'),
        subcategory: productForm.subcategory,
        stock: parseInt(productForm.stock, 10),
        low_stock_threshold: parseInt(productForm.low_stock_threshold, 10) || 5,
        image_url: productForm.image_url,
        is_active: true,
        specifications: specsObj
      };

      let res;
      if (editingProduct) {
        res = await fetch(`${API_BASE}/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_BASE}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        showToast(editingProduct ? 'Product updated successfully!' : 'New product created in MongoDB Atlas!', 'success');
        setProductModalOpen(false);
        setEditingProduct(null);
        fetchAllData();
      } else {
        const errData = await res.json();
        showToast(errData.detail || 'Error saving product', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('Product removed from catalog', 'info');
        fetchAllData();
      }
    } catch {
      showToast('Failed to delete product', 'error');
    }
  };

  // Category CRUD
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const subcats = categoryForm.subcategories
        ? categoryForm.subcategories.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryForm.name,
          description: categoryForm.description,
          icon: categoryForm.icon || 'Layers',
          subcategories: subcats
        })
      });

      if (res.ok) {
        showToast(`Category '${categoryForm.name}' added to catalog!`, 'success');
        setCategoryModalOpen(false);
        setCategoryForm({ name: '', description: '', icon: 'Layers', subcategories: '' });
        fetchAllData();
      } else {
        const d = await res.json();
        showToast(d.detail || 'Failed to add category', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      const res = await fetch(`${API_BASE}/categories/${catId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Category deleted', 'info');
        fetchAllData();
      }
    } catch {
      showToast('Failed to delete category', 'error');
    }
  };

  // Inline Stock Adjustment
  const handleUpdateStock = async (productId, newStock, threshold) => {
    try {
      const res = await fetch(`${API_BASE}/inventory/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: parseInt(newStock, 10), low_stock_threshold: parseInt(threshold, 10) })
      });
      if (res.ok) {
        showToast('Inventory stock updated in MongoDB!', 'success');
        fetchAllData();
      }
    } catch {
      showToast('Error updating inventory', 'error');
    }
  };

  // Coupon Creation
  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponForm.code,
          discount_type: couponForm.discount_type,
          discount_value: parseFloat(couponForm.discount_value),
          min_order_amount: parseFloat(couponForm.min_order_amount || 0),
          max_discount: parseFloat(couponForm.max_discount || 1000),
          expiry_date: couponForm.expiry_date,
          usage_limit: 500,
          description: couponForm.description
        })
      });

      if (res.ok) {
        showToast(`Coupon '${couponForm.code.toUpperCase()}' created!`, 'success');
        setCouponModalOpen(false);
        setCouponForm({
          code: '',
          discount_type: 'PERCENTAGE',
          discount_value: 10,
          min_order_amount: 5000,
          max_discount: 2000,
          expiry_date: '2026-12-31',
          description: ''
        });
        fetchAllData();
      } else {
        const d = await res.json();
        showToast(d.detail || 'Failed to create coupon', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // AI Voice Input Recognition (Web Speech API)
  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Speech recognition not supported in this browser. Please type your query.', 'warning');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; // Recognizes Hindi / Hinglish and English
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        showToast('Listening... Speak now (Hindi or English)', 'info');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        setAiQuery(transcript);
        handleSendAiQuery(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // AI Voice Speech Synthesis
  const playAiVoice = (text) => {
    if (!window.speechSynthesis) {
      showToast('Speech synthesis not supported in this browser', 'warning');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Action Execution Bonding (Direct 1-Click Operations)
  const executeAiAction = (action) => {
    if (!action) return;
    if (action.type === 'ADD_TO_CART') {
      const targetProd = products.find((p) => p._id === action.product_id || p.name === action.product_name) || {
        _id: action.product_id,
        name: action.product_name,
        price: action.price,
        stock: 50,
        sku: 'MSME-ITEM',
        image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
      };
      addToCart(targetProd, action.quantity || 1);
      setActiveTab('cart');
    } else if (action.type === 'APPLY_COUPON') {
      handleApplyCoupon(action.code);
      setActiveTab('cart');
    } else if (action.type === 'VIEW_ORDER') {
      const ord = orders.find((o) => o.order_id === action.order_id);
      if (ord) setSelectedOrderDetails(ord);
      setActiveTab('orders');
    } else if (action.type === 'TRIGGER_CALL') {
      if (onTriggerVoice) {
        onTriggerVoice({
          entity_name: action.customer_name || customerForm.name,
          phone_number: action.phone_number || customerForm.phone,
          invoice_number: 'ECOM-INQUIRY',
          amount_due: 0
        });
      } else {
        showToast(`Vernacular Voice Call initiated to ${action.phone_number}!`, 'info');
      }
    }
  };

  // AI Assistant Query Handler
  const handleSendAiQuery = async (queryText = aiQuery) => {
    const text = (queryText || '').trim();
    if (!text) return;

    setAiChatHistory((prev) => [
      ...prev,
      { role: 'user', text, time: 'Just now' }
    ]);
    setAiQuery('');
    setIsAiLoading(true);

    try {
      const res = await fetch(`${API_BASE}/ai/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          phone_number: customerForm.phone,
          customer_name: customerForm.name
        })
      });

      const data = await res.json();
      if (res.ok) {
        setAiChatHistory((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data.speech_response,
            intent: data.intent,
            payload: data.data,
            action: data.action,
            time: 'Just now'
          }
        ]);
      } else {
        setAiChatHistory((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: 'Maaf kijiye, abhi server se query process nahi ho payi. Kripya dubara koshish karein.',
            time: 'Just now'
          }
        ]);
      }
    } catch {
      setAiChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Network error: could not connect to AI endpoint.',
          time: 'Just now'
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none text-slate-100">
      {/* Toast Notification Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-xs font-medium backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                : toast.type === 'warning'
                ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
                : toast.type === 'info'
                ? 'bg-sky-950/80 border-sky-500/50 text-sky-200'
                : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top E-Commerce Header & Navigation Bar */}
      <div className="bg-[#111726] border border-[#1e273c] rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-l from-sky-500/10 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  E-Commerce Operations & MSME Storefront
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE ATLAS SYNC
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Full-stack B2B procurement catalog, real-time inventory deduction, Razorpay checkout, and vernacular voice query AI.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('cart')}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#172136] hover:bg-[#1d2a45] border border-sky-500/30 text-sky-400 text-xs font-semibold transition-all shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Cart</span>
              {cart.length > 0 && (
                <span className="bg-sky-500 text-white font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>

            <button
              onClick={fetchAllData}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#172136] hover:bg-[#1d2a45] border border-[#23314f] text-slate-300 text-xs font-medium transition-all"
              title="Refresh from MongoDB Atlas"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
              <span>Sync</span>
            </button>

            <button
              onClick={() => {
                setEditingProduct(null);
                setProductForm({
                  name: '',
                  sku: '',
                  category: categories[0]?.name || 'Raw Metals & Alloy Sheets',
                  subcategory: '',
                  description: '',
                  price: '',
                  discount_percent: 0,
                  stock: 25,
                  low_stock_threshold: 5,
                  image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
                  specifications: 'Standard: IS 2062\nGrade: E250BR'
                });
                setProductModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-sky-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-1.5 mt-5 pt-4 border-t border-[#1e273c]/70 overflow-x-auto no-scrollbar">
          {[
            { id: 'storefront', label: 'Storefront', icon: ShoppingBag },
            { id: 'cart', label: `Cart & Checkout (${cart.length})`, icon: ShoppingCart },
            { id: 'dashboard', label: 'Executive Analytics', icon: BarChart3 },
            { id: 'products', label: `Products (${products.length})`, icon: Package },
            { id: 'categories', label: `Categories (${categories.length})`, icon: Layers },
            { id: 'orders', label: `Orders (${orders.length})`, icon: ClipboardList },
            { id: 'inventory', label: 'Inventory & Stock', icon: Boxes },
            { id: 'coupons', label: `Coupons (${coupons.length})`, icon: Tag },
            { id: 'customers', label: `Customers (${customers.length})`, icon: Users },
            { id: 'ai-assistant', label: 'AI Shopping Assistant', icon: Bot, badge: 'VAPI' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/40 shadow-sm shadow-sky-500/10 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151c2e]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          TAB 1: STOREFRONT / CUSTOMER SHOPPING INTERFACE
          ======================================================== */}
      {activeTab === 'storefront' && (
        <div className="space-y-6">
          {/* Search, Category Filters, Price Sorting */}
          <div className="bg-[#111726] border border-[#1e273c] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search metal sheets, fasteners, switchgear, PPE..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#161e31] border border-[#222e47] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-slate-700 text-sky-500 focus:ring-0 bg-[#161e31]"
                />
                <span>In Stock Only</span>
              </label>

              <div className="flex items-center gap-1.5 text-slate-400">
                <Sliders className="w-3.5 h-3.5" />
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#161e31] border border-[#222e47] text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="newest">Featured / Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="stock">Stock Available</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-[#131a2b] hover:bg-[#182136] text-slate-400 border border-[#1e273c]'
              }`}
            >
              All Categories ({products.length})
            </button>
            {categories.map((c) => {
              const isSelected = selectedCategory === c.name;
              return (
                <button
                  key={c.slug || c._id}
                  onClick={() => setSelectedCategory(c.name)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                      : 'bg-[#131a2b] hover:bg-[#182136] text-slate-400 border border-[#1e273c]'
                  }`}
                >
                  <span>{c.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-sky-600 text-white' : 'bg-[#1a233a] text-slate-400'}`}>
                    {c.product_count !== undefined ? c.product_count : products.filter((p) => p.category === c.name).length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-[#111726] border border-[#1e273c] rounded-2xl p-12 text-center space-y-3">
              <Package className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="text-base font-semibold text-slate-200">No products match your filter criteria</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try searching for a different keyword or switch to "All Categories".
              </p>
              <button
                onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); setInStockOnly(false); }}
                className="px-4 py-2 bg-sky-500/20 border border-sky-500/40 text-sky-400 rounded-xl text-xs font-medium hover:bg-sky-500/30"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
              {filteredProducts.map((p) => {
                const isWishlisted = wishlist.some((w) => w._id === p._id);
                const discountedPrice = Math.round(p.price * (1 - (p.discount_percent || 0) / 100));
                const isLowStock = p.stock > 0 && p.stock <= (p.low_stock_threshold || 5);
                const isOutOfStock = p.stock <= 0;

                return (
                  <motion.div
                    key={p._id || p.sku}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group bg-[#111726] border border-[#1e273c] hover:border-sky-500/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 shadow-md hover:shadow-sky-500/5"
                  >
                    <div>
                      {/* Product Image & Badges */}
                      <div className="relative aspect-video w-full bg-[#161e31] overflow-hidden">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
                          }}
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                          {p.discount_percent > 0 && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500 text-white shadow-md">
                              {p.discount_percent}% OFF
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#0c1017]/80 backdrop-blur-sm text-slate-300 border border-slate-700">
                            {p.category}
                          </span>
                        </div>

                        {/* Wishlist Button */}
                        <button
                          onClick={() => toggleWishlist(p)}
                          className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur-md transition-all ${
                            isWishlisted
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : 'bg-[#0c1017]/70 text-slate-400 hover:text-white border border-slate-700'
                          }`}
                          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        >
                          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-400' : ''}`} />
                        </button>
                      </div>

                      {/* Product Body */}
                      <div className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-mono text-slate-500">{p.sku}</span>
                          <div className="flex items-center gap-1 text-amber-400">
                            <span>★</span>
                            <span className="font-semibold text-slate-200">{p.rating || 4.8}</span>
                            <span className="text-slate-500 text-[10px]">({p.review_count || 12})</span>
                          </div>
                        </div>

                        <h3 className="font-semibold text-sm text-slate-100 group-hover:text-sky-400 transition-colors line-clamp-2">
                          {p.name}
                        </h3>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>

                        {/* Stock Status Badge */}
                        <div className="pt-1">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              <AlertTriangle className="w-3 h-3" /> Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              <AlertTriangle className="w-3 h-3" /> Low Stock: {p.stock} units left
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <Check className="w-3 h-3" /> In Stock ({p.stock} units)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Pricing & Actions */}
                    <div className="p-4 pt-3 border-t border-[#1e273c]/70 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-bold text-slate-100">
                            ₹{discountedPrice.toLocaleString('en-IN')}
                          </span>
                          {p.discount_percent > 0 && (
                            <span className="text-xs text-slate-500 line-through">
                              ₹{p.price.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">+18% GST Applicable</div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setQuickViewProduct(p)}
                          className="p-2 rounded-xl bg-[#161e31] hover:bg-[#1c2740] border border-[#23314f] text-slate-300 transition-colors"
                          title="Quick View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => addToCart(p)}
                          disabled={isOutOfStock}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shadow-md transition-all ${
                            isOutOfStock
                              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                              : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20'
                          }`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: SHOPPING CART & RAZORPAY CHECKOUT
          ======================================================== */}
      {activeTab === 'cart' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Cart Items (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#111726] border border-[#1e273c] rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between pb-4 border-b border-[#1e273c]">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-sky-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Procurement Cart ({cart.reduce((s, i) => s + i.quantity, 0)} Items)
                  </h2>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Cart</span>
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
                  <div className="text-sm font-semibold text-slate-300">Your Procurement Cart is Empty</div>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Browse our MSME raw metals, industrial fasteners, and electrical supplies catalog.
                  </p>
                  <button
                    onClick={() => setActiveTab('storefront')}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-all inline-flex items-center gap-2"
                  >
                    <span>Browse Storefront</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#1e273c]">
                  {cart.map((item) => (
                    <div key={item.product_id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover bg-[#161e31] shrink-0 border border-[#1e273c]"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono text-slate-500">{item.sku}</span>
                          <h4 className="text-xs font-semibold text-slate-100 truncate">{item.name}</h4>
                          <div className="text-xs font-bold text-sky-400 mt-0.5">
                            ₹{item.price.toLocaleString('en-IN')}{' '}
                            <span className="text-[10px] text-slate-500 font-normal">/ unit</span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controller & Total */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="flex items-center border border-[#23314f] bg-[#161e31] rounded-xl overflow-hidden">
                          <button
                            onClick={() => updateCartQty(item.product_id, -1)}
                            className="px-2.5 py-1 text-slate-400 hover:text-white hover:bg-[#1f2b45] text-xs transition-colors"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-xs font-mono font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQty(item.product_id, 1)}
                            className="px-2.5 py-1 text-slate-400 hover:text-white hover:bg-[#1f2b45] text-xs transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right w-24">
                          <div className="text-xs font-bold text-slate-100">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-[10px] text-rose-400 hover:text-rose-300 mt-0.5"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Coupons Strip */}
            <div className="bg-[#111726] border border-[#1e273c] rounded-2xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  <span>Available MSME Coupons & Rebates</span>
                </div>
                {appliedCoupon && (
                  <button
                    onClick={removeCoupon}
                    className="text-[11px] text-rose-400 hover:underline"
                  >
                    Remove ({appliedCoupon.code})
                  </button>
                )}
              </div>

              {/* Coupon Input Form */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g. MSME10, SHARMA500)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#161e31] border border-[#222e47] text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleApplyCoupon()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
                >
                  Apply
                </button>
              </div>

              {/* Quick Promo Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {coupons.map((cp) => (
                  <button
                    key={cp.code}
                    onClick={() => {
                      setCouponInput(cp.code);
                      handleApplyCoupon(cp.code);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-all ${
                      appliedCoupon?.code === cp.code
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                        : 'bg-[#161e31] text-slate-300 border-[#222e47] hover:border-emerald-500/50'
                    }`}
                  >
                    {cp.code}: {cp.discount_type === 'PERCENTAGE' ? `${cp.discount_value}% OFF` : `₹${cp.discount_value} OFF`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Form & Order Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Price Summary Card */}
            <div className="bg-[#111726] border border-[#1e273c] rounded-2xl p-5 shadow-lg space-y-3.5">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-[#1e273c] pb-3">
                Order Financial Summary
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Cart Subtotal</span>
                  <span className="font-mono text-slate-200">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Coupon Discount ({appliedCoupon?.code})</span>
                    <span className="font-mono">-₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400">
                  <span>GST (18% Harmonized)</span>
                  <span className="font-mono text-slate-200">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Industrial Freight / Delivery</span>
                  <span className="font-mono text-slate-200">
                    {deliveryCharge === 0 ? (
                      <span className="text-emerald-400 font-semibold">FREE (&gt; ₹10k)</span>
                    ) : (
                      `₹${deliveryCharge}`
                    )}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#1e273c] flex justify-between text-sm font-bold text-white">
                  <span>Total Amount Due</span>
                  <span className="font-mono text-sky-400">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* B2B Delivery & Payment Form */}
            <form onSubmit={handlePlaceOrder} className="bg-[#111726] border border-[#1e273c] rounded-2xl p-5 shadow-lg space-y-3.5">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-[#1e273c] pb-3">
                Shipping & Procurement Billing
              </h3>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Company / Buyer Name</label>
                  <input
                    type="text"
                    required
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Phone (WhatsApp)</label>
                    <input
                      type="text"
                      required
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">GSTIN</label>
                    <input
                      type="text"
                      value={customerForm.gstin}
                      onChange={(e) => setCustomerForm({ ...customerForm, gstin: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-xs text-white focus:outline-none focus:border-sky-500 font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Factory / Delivery Street Address</label>
                  <input
                    type="text"
                    required
                    value={customerForm.street}
                    onChange={(e) => setCustomerForm({ ...customerForm, street: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">City</label>
                    <input
                      type="text"
                      required
                      value={customerForm.city}
                      onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">State</label>
                    <input
                      type="text"
                      required
                      value={customerForm.state}
                      onChange={(e) => setCustomerForm({ ...customerForm, state: e.target.value })}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Pincode</label>
                    <input
                      type="text"
                      required
                      value={customerForm.pincode}
                      onChange={(e) => setCustomerForm({ ...customerForm, pincode: e.target.value })}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>

                {/* Payment Gateway Options */}
                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1.5">
                    Select Payment Gateway
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: 'Razorpay', label: 'Razorpay PG (UPI / Cards / NetBanking)', badge: 'TEST MODE' },
                      { id: 'NEFT', label: 'Direct Corporate NEFT / RTGS Transfer', badge: 'INSTANT' },
                      { id: 'COD', label: 'Cash / Cheque on Delivery (Verified Accounts)', badge: 'COD' }
                    ].map((m) => (
                      <label
                        key={m.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                          customerForm.paymentMethod === m.id
                            ? 'bg-sky-500/10 border-sky-500 text-sky-300'
                            : 'bg-[#161e31] border-[#222e47] text-slate-300 hover:bg-[#1a243a]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={customerForm.paymentMethod === m.id}
                            onChange={() => setCustomerForm({ ...customerForm, paymentMethod: m.id })}
                            className="text-sky-500 focus:ring-0"
                          />
                          <span className="text-xs font-medium">{m.label}</span>
                        </div>
                        <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#1f2b45] text-slate-300">
                          {m.badge}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={cart.length === 0 || isLoading}
                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all ${
                  cart.length === 0 || isLoading
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-sky-600/30'
                }`}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Confirm & Pay ₹{grandTotal.toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: EXECUTIVE E-COMMERCE ANALYTICS
          ======================================================== */}
      {activeTab === 'dashboard' && dashboardData && (
        <div className="space-y-6">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111726] border border-[#1e273c] rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Sales Revenue</span>
                <IndianRupee className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white mt-2">
                {dashboardData.metrics?.total_revenue_formatted || '₹57,825.60'}
              </div>
              <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>+18.4% from last billing cycle</span>
              </div>
            </div>

            <div className="bg-[#111726] border border-[#1e273c] rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
                <ClipboardList className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-bold text-white mt-2">
                {dashboardData.metrics?.total_orders || 0}
              </div>
              <div className="text-[11px] text-amber-400 font-medium mt-1">
                {dashboardData.metrics?.pending_orders || 0} pending fulfillment
              </div>
            </div>

            <div className="bg-[#111726] border border-[#1e273c] rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Catalog Products</span>
                <Package className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white mt-2">
                {dashboardData.metrics?.total_products || 0}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">
                Across {categories.length} active MSME categories
              </div>
            </div>

            <div className="bg-[#111726] border border-[#1e273c] rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Inventory Health</span>
                <Boxes className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white mt-2">
                {dashboardData.metrics?.low_stock_count || 0}
              </div>
              <div className="text-[11px] text-amber-400 font-medium mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Items near reorder threshold</span>
              </div>
            </div>
          </div>

          {/* Sales Chart & Bestsellers Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Sales Trend Bar Chart (7 cols) */}
            <div className="lg:col-span-7 bg-[#111726] border border-[#1e273c] rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Monthly Procurement Volume (₹ INR)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Gross order volume registered across verified industrial enterprises
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  FY 2026-Q3
                </span>
              </div>

              {/* Bar Chart Visualizer */}
              <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-[#1e273c]">
                {(dashboardData.sales_trend || []).map((bar) => {
                  const maxSale = 60000;
                  const heightPct = Math.min(100, Math.max(15, (bar.sales / maxSale) * 100));
                  return (
                    <div key={bar.month} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        ₹{(bar.sales / 1000).toFixed(0)}k
                      </div>
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full max-w-[42px] rounded-t-lg bg-gradient-to-t from-sky-600 to-indigo-500 group-hover:from-sky-500 group-hover:to-indigo-400 transition-all shadow-md shadow-sky-500/10"
                      />
                      <span className="text-[10px] font-medium text-slate-400">{bar.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bestseller Leaderboard (5 cols) */}
            <div className="lg:col-span-5 bg-[#111726] border border-[#1e273c] rounded-2xl p-5 shadow-lg space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Top Bestselling Industrial Products
              </h3>

              <div className="space-y-3">
                {(dashboardData.bestsellers || []).map((p, idx) => (
                  <div
                    key={p._id || idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#161e31] border border-[#222e47]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 font-mono text-xs font-bold flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-200 truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-400">Stock: {p.stock} units</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-slate-100">₹{p.price.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-amber-400">★ {p.rating || 4.8}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-[#111726] border border-[#1e273c] rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Recent Customer Orders Stream
              </h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
              >
                <span>View All Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1e273c] text-slate-400">
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Enterprise / Customer</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Payment Status</th>
                    <th className="pb-3 font-semibold">Fulfillment Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e273c]">
                  {(dashboardData.recent_orders || []).map((o) => (
                    <tr key={o.order_id} className="hover:bg-[#151c2e]">
                      <td className="py-3 font-mono font-bold text-sky-400">{o.order_id}</td>
                      <td className="py-3">
                        <div className="font-semibold text-slate-200">{o.customer_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{o.customer_phone}</div>
                      </td>
                      <td className="py-3 font-mono font-bold text-slate-100">
                        ₹{o.total_amount?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                          o.payment_status === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {o.payment_status}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                          o.order_status === 'DELIVERED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : o.order_status === 'SHIPPED'
                            ? 'bg-sky-500/20 text-sky-400'
                            : o.order_status === 'CANCELLED'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {o.order_status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrderDetails(o);
                            setActiveTab('orders');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#1a233a] hover:bg-[#202c48] text-slate-300 font-medium text-[11px]"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: PRODUCT MANAGEMENT (CRUD)
          ======================================================== */}
      {activeTab === 'products' && (
        <div className="bg-[#111726] border border-[#1e273c] rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e273c]">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Industrial Catalog Management ({products.length} Products)
              </h2>
              <p className="text-xs text-slate-400">
                Create, update pricing, manage discount offers, technical specs, and stock quantities.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingProduct(null);
                setProductForm({
                  name: '',
                  sku: '',
                  category: categories[0]?.name || 'Raw Metals & Alloy Sheets',
                  subcategory: '',
                  description: '',
                  price: '',
                  discount_percent: 0,
                  stock: 20,
                  low_stock_threshold: 5,
                  image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
                  specifications: 'Standard: IS 2062\nGrade: E250BR'
                });
                setProductModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/25 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Table of Products */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e273c] text-slate-400">
                  <th className="pb-3 font-semibold">Product</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Price (₹)</th>
                  <th className="pb-3 font-semibold">Discount</th>
                  <th className="pb-3 font-semibold">Stock</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e273c]">
                {products.map((p) => (
                  <tr key={p._id || p.sku} className="hover:bg-[#151c2e]">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-[#161e31] shrink-0 border border-[#1e273c]"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div>
                          <div className="font-semibold text-slate-100">{p.name}</div>
                          <div className="text-[10px] font-mono text-slate-500">{p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-slate-300">{p.category}</td>
                    <td className="py-3 font-mono font-bold text-slate-100">
                      ₹{p.price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3">
                      {p.discount_percent > 0 ? (
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          {p.discount_percent}% OFF
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">None</span>
                      )}
                    </td>
                    <td className="py-3 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        p.stock <= 0
                          ? 'bg-rose-500/20 text-rose-400'
                          : p.stock <= (p.low_stock_threshold || 5)
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setProductForm({
                              name: p.name,
                              sku: p.sku || '',
                              category: p.category || '',
                              subcategory: p.subcategory || '',
                              description: p.description || '',
                              price: p.price,
                              discount_percent: p.discount_percent || 0,
                              stock: p.stock,
                              low_stock_threshold: p.low_stock_threshold || 5,
                              image_url: p.image_url || '',
                              specifications: p.specifications ? JSON.stringify(p.specifications, null, 2) : ''
                            });
                            setProductModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-[#161e31] hover:bg-[#1f2b45] text-slate-300"
                          title="Edit Product"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p._id)}
                          className="p-1.5 rounded-lg bg-[#161e31] hover:bg-rose-950/40 text-rose-400"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: CATEGORIES MANAGEMENT
          ======================================================== */}
      {activeTab === 'categories' && (
        <div className="bg-[#111726] border border-[#1e273c] rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e273c]">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Industrial Product Categories ({categories.length})
              </h2>
              <p className="text-xs text-slate-400">
                Organize MSME supply lines with subcategories and live product associations.
              </p>
            </div>
            <button
              onClick={() => setCategoryModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((c) => (
              <div
                key={c._id || c.slug}
                className="p-4 rounded-xl bg-[#161e31] border border-[#222e47] space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{c.name}</h4>
                        <span className="text-[10px] font-mono text-slate-500">{c.slug}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#1f2b45] text-sky-300 font-semibold border border-[#2c3d61]">
                      {c.product_count !== undefined ? `${c.product_count} Products` : 'Active'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                    {c.description}
                  </p>

                  {/* Subcategories */}
                  {c.subcategories && c.subcategories.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {c.subcategories.map((sub, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] bg-[#1a233a] text-slate-300 border border-[#263352]"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#222e47] flex justify-between items-center text-xs">
                  <button
                    onClick={() => {
                      setSelectedCategory(c.name);
                      setActiveTab('storefront');
                    }}
                    className="text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
                  >
                    <span>Browse Products</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(c._id)}
                    className="text-rose-400 hover:text-rose-300 text-[11px]"
                  >
                    Delete Category
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 6: ORDER MANAGEMENT
          ======================================================== */}
      {activeTab === 'orders' && (
        <div className="bg-[#111726] border border-[#1e273c] rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e273c]">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                MSME Orders & Procurement Fulfillment ({orders.length})
              </h2>
              <p className="text-xs text-slate-400">
                Track order lifecycle, transition delivery states, or cancel orders with automatic inventory restoration.
              </p>
            </div>
            <button
              onClick={fetchAllData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161e31] hover:bg-[#1d2a45] text-slate-300 text-xs border border-[#222e47]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Orders</span>
            </button>
          </div>

          <div className="space-y-3">
            {orders.map((o) => (
              <div
                key={o.order_id}
                className="p-4 rounded-xl bg-[#161e31] border border-[#222e47] hover:border-[#2e3e5f] transition-all space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sky-400 text-sm">
                      {o.order_id}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString() : 'Recent'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                      o.order_status === 'DELIVERED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : o.order_status === 'SHIPPED'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : o.order_status === 'CANCELLED'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    }`}>
                      {o.order_status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Status Update:</span>
                    <select
                      value={o.order_status}
                      onChange={(e) => handleUpdateOrderStatus(o.order_id, e.target.value)}
                      disabled={o.order_status === 'CANCELLED'}
                      className="bg-[#111726] border border-[#222e47] text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-sky-500"
                    >
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                    </select>

                    {o.can_cancel && (
                      <button
                        onClick={() => handleCancelOrder(o.order_id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-medium"
                      >
                        Cancel & Restock
                      </button>
                    )}
                  </div>
                </div>

                {/* Customer Details & Items summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2 border-t border-[#222e47]">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Customer & Delivery</div>
                    <div className="font-semibold text-slate-200 mt-0.5">{o.customer_name}</div>
                    <div className="text-slate-400 text-[11px] font-mono">{o.customer_phone}</div>
                    <div className="text-slate-400 text-[11px] truncate">
                      {o.delivery_address?.city}, {o.delivery_address?.state} ({o.delivery_address?.pincode})
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Financials & Payment</div>
                    <div className="font-bold text-sky-400 text-sm mt-0.5">
                      ₹{o.total_amount?.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Method: {o.payment_method} ({o.payment_status})
                    </div>
                    {o.coupon_code && (
                      <div className="text-[11px] text-emerald-400 font-mono">
                        Coupon Applied: {o.coupon_code} (-₹{o.discount})
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Line Items ({o.items?.length || 0})</div>
                    <div className="mt-1 space-y-1">
                      {(o.items || []).slice(0, 2).map((item, idx) => (
                        <div key={idx} className="text-[11px] text-slate-300 truncate">
                          • {item.quantity}x {item.product_name}
                        </div>
                      ))}
                      {(o.items?.length || 0) > 2 && (
                        <div className="text-[10px] text-slate-500">
                          +{o.items.length - 2} more items
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 7: INVENTORY & STOCK MANAGEMENT
          ======================================================== */}
      {activeTab === 'inventory' && (
        <div className="bg-[#111726] border border-[#1e273c] rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e273c]">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Industrial Stock & Warehouse Inventory
              </h2>
              <p className="text-xs text-slate-400">
                Track low-stock items, adjust on-hand inventory levels, and configure reorder thresholds.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Low Stock Alerts: {products.filter((p) => p.stock <= (p.low_stock_threshold || 5)).length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e273c] text-slate-400">
                  <th className="pb-3 font-semibold">SKU & Product</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Current Stock</th>
                  <th className="pb-3 font-semibold">Reorder Threshold</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e273c]">
                {products.map((p) => {
                  const isLow = p.stock <= (p.low_stock_threshold || 5);
                  return (
                    <tr key={p._id || p.sku} className="hover:bg-[#151c2e]">
                      <td className="py-3">
                        <div className="font-semibold text-slate-100">{p.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">{p.sku}</div>
                      </td>
                      <td className="py-3 text-slate-300">{p.category}</td>
                      <td className="py-3 font-mono font-bold text-slate-100">{p.stock} units</td>
                      <td className="py-3 font-mono text-slate-400">{p.low_stock_threshold || 5} units</td>
                      <td className="py-3">
                        {isLow ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            LOW STOCK
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            OPTIMAL
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdateStock(p._id, p.stock + 10, p.low_stock_threshold)}
                            className="px-2.5 py-1 rounded-lg bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 text-xs font-semibold border border-sky-500/40 transition-colors"
                          >
                            +10 Units
                          </button>
                          <button
                            onClick={() => handleUpdateStock(p._id, p.stock + 50, p.low_stock_threshold)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-semibold border border-indigo-500/40 transition-colors"
                          >
                            +50 Batch
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 8: COUPONS & DISCOUNTS
          ======================================================== */}
      {activeTab === 'coupons' && (
        <div className="bg-[#111726] border border-[#1e273c] rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e273c]">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Discount Coupons & Promo Engine ({coupons.length})
              </h2>
              <p className="text-xs text-slate-400">
                Manage promotional discount codes for MSME customers and bulk orders.
              </p>
            </div>
            <button
              onClick={() => setCouponModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coupons.map((cp) => (
              <div
                key={cp.code}
                className="p-4 rounded-xl bg-[#161e31] border border-[#222e47] space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-400 text-base tracking-wider">
                    {cp.code}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ACTIVE
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-200">
                  {cp.discount_type === 'PERCENTAGE' ? `${cp.discount_value}% Discount` : `Flat ₹${cp.discount_value} OFF`}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {cp.description || 'Applicable on verified MSME orders.'}
                </p>

                <div className="text-[11px] text-slate-500 space-y-1 font-mono pt-2 border-t border-[#222e47]">
                  <div>Min Order: ₹{cp.min_order_amount?.toLocaleString('en-IN') || 0}</div>
                  <div>Max Discount: ₹{cp.max_discount?.toLocaleString('en-IN') || 1000}</div>
                  <div>Times Used: {cp.used_count || 0} / {cp.usage_limit || 100}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 9: CUSTOMER MANAGEMENT
          ======================================================== */}
      {activeTab === 'customers' && (
        <div className="bg-[#111726] border border-[#1e273c] rounded-2xl p-5 shadow-lg space-y-4">
          <div className="pb-3 border-b border-[#1e273c]">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              MSME Customer Accounts & Purchase History ({customers.length})
            </h2>
            <p className="text-xs text-slate-400">
              Aggregated procurement accounts, lifetime spend, order volume, and contact directory.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e273c] text-slate-400">
                  <th className="pb-3 font-semibold">Enterprise / Contact</th>
                  <th className="pb-3 font-semibold">Phone (WhatsApp)</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Total Orders</th>
                  <th className="pb-3 font-semibold">Lifetime Spend</th>
                  <th className="pb-3 font-semibold text-right">Quick Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e273c]">
                {customers.map((c) => (
                  <tr key={c._id || c.phone_number} className="hover:bg-[#151c2e]">
                    <td className="py-3 font-semibold text-slate-100">
                      {c.customer_name || 'Industrial Buyer'}
                    </td>
                    <td className="py-3 font-mono text-slate-300">
                      {c.phone_number || c._id}
                    </td>
                    <td className="py-3 text-slate-400">{c.customer_email || '—'}</td>
                    <td className="py-3 font-mono font-bold text-sky-400">{c.total_orders} Orders</td>
                    <td className="py-3 font-mono font-bold text-emerald-400">
                      ₹{c.total_spend?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          if (onTriggerVoice) {
                            onTriggerVoice({
                              entity_name: c.customer_name,
                              phone_number: c.phone_number || c._id
                            });
                          } else {
                            showToast(`Calling ${c.customer_name} via Vapi AI Assistant...`, 'info');
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold inline-flex items-center gap-1.5"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Voice Dispatch</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 10: VAPI AI SHOPPING ASSISTANT INTEGRATION
          ======================================================== */}
      {activeTab === 'ai-assistant' && (
        <div className="bg-[#111726] border border-[#1e273c] rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e273c]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Vernacular AI Shopping & Order Inquiries (Vapi Compatible)
                </h2>
                <p className="text-xs text-slate-400">
                  Ask product questions, inquiry rates, check stock levels, or track order states in Hindi / English.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
              VAPI /speech-synthesized
            </span>
          </div>

          {/* Quick Preset Queries */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { q: "What is the tensile strength of Grade 304 Steel Sheet?", label: "Tensile Strength (304 Sheet)", icon: "🔩" },
              { q: "Calculate price for 10 units of 3-Phase Contactor with GST", label: "Quotation: 10x Contactors + GST", icon: "📦" },
              { q: "Which discount coupons can I use right now?", label: "Available MSME Coupons", icon: "🎟️" },
              { q: "Track order ORD-2026-8001", label: "Track ORD-2026-8001", icon: "🚚" },
              { q: "Call me on phone to discuss bulk order", label: "Request Phone Callback", icon: "📞" },
              { q: "Bhai welding helmet ka shade aur stock kitna hai?", label: "Welding Helmet Specs (Hindi)", icon: "🇮🇳" }
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAiQuery(chip.q);
                  handleSendAiQuery(chip.q);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161e31] hover:bg-[#1e2942] border border-[#222e47] text-slate-300 text-xs transition-colors"
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Chat Window */}
          <div className="h-96 overflow-y-auto space-y-3.5 p-4 rounded-xl bg-[#0c1017] border border-[#1e273c]">
            {aiChatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-purple-600/30 text-purple-300 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed space-y-2.5 ${
                    msg.role === 'user'
                      ? 'bg-sky-600 text-white rounded-br-none shadow-md shadow-sky-600/20'
                      : 'bg-[#161e31] text-slate-200 border border-[#222e47] rounded-bl-none shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="leading-relaxed">{msg.text}</p>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => playAiVoice(msg.text)}
                        className="text-purple-400 hover:text-purple-300 p-1 rounded-md hover:bg-[#1e2840] shrink-0"
                        title="Listen to Vernacular Speech Output"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Direct Bonded Action Button */}
                  {msg.action && (
                    <div className="pt-2 border-t border-[#23314f]">
                      <button
                        onClick={() => executeAiAction(msg.action)}
                        className={`w-full py-2 px-3 rounded-xl font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 ${
                          msg.action.type === 'ADD_TO_CART'
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                            : msg.action.type === 'APPLY_COUPON'
                            ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20'
                            : msg.action.type === 'TRIGGER_CALL'
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        {msg.action.type === 'ADD_TO_CART' ? (
                          <ShoppingCart className="w-3.5 h-3.5" />
                        ) : msg.action.type === 'APPLY_COUPON' ? (
                          <Tag className="w-3.5 h-3.5" />
                        ) : msg.action.type === 'TRIGGER_CALL' ? (
                          <PhoneCall className="w-3.5 h-3.5" />
                        ) : (
                          <ExternalLink className="w-3.5 h-3.5" />
                        )}
                        <span>{msg.action.label || 'Take Action'}</span>
                      </button>
                    </div>
                  )}

                  {/* Product Preview Cards */}
                  {msg.payload && Array.isArray(msg.payload) && msg.payload.length > 0 && (
                    <div className="pt-2 border-t border-slate-700/60 space-y-1.5">
                      {msg.payload.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-[#0c1017] border border-[#1e273c] flex justify-between items-center gap-3"
                        >
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-100 truncate">{item.name}</div>
                            <div className="text-[10px] text-slate-400">
                              Stock: <span className="text-emerald-400 font-mono">{item.stock} units</span> • SKU: {item.sku}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-mono font-bold text-sky-400">
                              ₹{item.price?.toLocaleString('en-IN')}
                            </div>
                            <button
                              onClick={() => {
                                addToCart(item, 1);
                                showToast(`Added '${item.name}' to cart!`, 'success');
                              }}
                              className="text-[10px] text-emerald-400 hover:underline mt-0.5"
                            >
                              + Add to Cart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <span className="text-[9px] text-slate-400 block mt-1 opacity-70 text-right">
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
            {isAiLoading && (
              <div className="flex items-center gap-2 text-xs text-purple-400 p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>AI is searching technical specs in MongoDB and synthesizing response...</span>
              </div>
            )}
          </div>

          {/* Chat Input with Speech Microphone & Keyboard Send */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendAiQuery();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={isListening ? "Listening to voice input..." : "Ask technical specs, quotations with GST, stock, coupons, or order status..."}
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl bg-[#161e31] border text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
                  isListening
                    ? 'border-purple-500 ring-2 ring-purple-500/30'
                    : 'border-[#222e47] focus:border-purple-500'
                }`}
              />
            </div>

            {/* Voice Input Mic Button */}
            <button
              type="button"
              onClick={startVoiceInput}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                  : 'bg-[#161e31] hover:bg-[#1f2b45] text-purple-400 border-[#222e47]'
              }`}
              title="Speak Query (Voice-to-Text in Hindi / English)"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="submit"
              disabled={isAiLoading || !aiQuery.trim()}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/25 transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* ========================================================
          MODAL 1: RAZORPAY TEST PAYMENT GATEWAY SIMULATION
          ======================================================== */}
      {razorpayModalOpen && razorpayPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0f172a] border border-sky-500/40 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            {/* Razorpay Brand Header */}
            <div className="bg-[#0c2340] p-5 text-white flex items-center justify-between border-b border-sky-900/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center font-bold text-white shadow-md">
                  R
                </div>
                <div>
                  <div className="font-bold text-xs uppercase tracking-wider text-sky-300">
                    Razorpay Standard Checkout
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {razorpayPayload.name}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setRazorpayModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Amount Banner */}
            <div className="p-4 bg-[#142036] border-b border-[#1e2e4a] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Amount Payable</span>
                <div className="text-xl font-bold font-mono text-white">
                  ₹{(razorpayPayload.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                TEST MODE
              </span>
            </div>

            {/* Payment Simulation Form */}
            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-[#1e293b]/70 border border-[#334155] space-y-1">
                <div className="text-slate-300 font-semibold">Test Mode Instructions:</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Clicking "Simulate Successful Payment" will securely hit the FastAPI backend route{' '}
                  <code className="text-sky-400 font-mono">/api/ecommerce/orders/verify-payment</code> to transition the order to <strong>CONFIRMED</strong> with payment status <strong>PAID</strong> in MongoDB Atlas.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-slate-400">Pre-filled Buyer Contact</label>
                <div className="p-2.5 rounded-lg bg-[#111c2e] border border-[#213047] text-slate-300 font-mono text-xs">
                  {razorpayPayload.prefill?.name} • {razorpayPayload.prefill?.contact}
                </div>
              </div>

              <button
                onClick={handleVerifyRazorpayPayment}
                disabled={isProcessingPayment}
                className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all"
              >
                {isProcessingPayment ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Simulate Successful Payment (₹{(razorpayPayload.amount / 100).toLocaleString('en-IN')})</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setRazorpayModalOpen(false)}
                className="w-full py-2 text-center text-slate-400 hover:text-slate-200 text-xs"
              >
                Cancel Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: ORDER SUCCESS RECEIPT CONFIRMATION
          ======================================================== */}
      {orderSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111726] border border-emerald-500/50 rounded-2xl max-w-md w-full shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Order Confirmed!</h2>
              <p className="text-xs text-slate-400">
                Order <strong className="font-mono text-sky-400">{orderSuccessModal.order_id}</strong> has been created and synced with MongoDB Atlas.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161e31] border border-[#222e47] text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Amount:</span>
                <span className="font-mono font-bold text-white">
                  ₹{orderSuccessModal.total_amount?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Status:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {orderSuccessModal.payment_status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Delivery To:</span>
                <span className="text-slate-300">
                  {orderSuccessModal.delivery_address?.city}, {orderSuccessModal.delivery_address?.state}
                </span>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  setOrderSuccessModal(null);
                  setActiveTab('orders');
                }}
                className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all shadow-md"
              >
                Track in Orders
              </button>
              <button
                onClick={() => {
                  setOrderSuccessModal(null);
                  setActiveTab('storefront');
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#161e31] hover:bg-[#1e2a44] text-slate-300 font-semibold text-xs border border-[#222e47] transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: PRODUCT QUICK VIEW MODAL
          ======================================================== */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111726] border border-[#1e273c] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col md:flex-row">
            <div className="md:w-1/2 aspect-square bg-[#161e31] relative">
              <img
                src={quickViewProduct.image_url}
                alt={quickViewProduct.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded font-mono text-[10px] bg-sky-500 text-white font-bold">
                {quickViewProduct.category}
              </span>
            </div>

            <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-500">{quickViewProduct.sku}</span>
                  <button
                    onClick={() => setQuickViewProduct(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-white mt-1">
                  {quickViewProduct.name}
                </h3>

                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-xl font-bold font-mono text-sky-400">
                    ₹{Math.round(quickViewProduct.price * (1 - (quickViewProduct.discount_percent || 0) / 100)).toLocaleString('en-IN')}
                  </span>
                  {quickViewProduct.discount_percent > 0 && (
                    <span className="text-xs text-slate-500 line-through">
                      ₹{quickViewProduct.price.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  {quickViewProduct.description}
                </p>

                {/* Specs */}
                {quickViewProduct.specifications && (
                  <div className="mt-3 pt-3 border-t border-[#1e273c] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Technical Specifications:
                    </span>
                    {Object.entries(quickViewProduct.specifications).map(([k, v]) => (
                      <div key={k} className="text-[11px] text-slate-300 flex justify-between">
                        <span className="text-slate-400">{k}:</span>
                        <span className="font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#1e273c] flex gap-2">
                <button
                  onClick={() => {
                    addToCart(quickViewProduct);
                    setQuickViewProduct(null);
                  }}
                  disabled={quickViewProduct.stock <= 0}
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={() => toggleWishlist(quickViewProduct)}
                  className="p-2.5 rounded-xl bg-[#161e31] hover:bg-[#1e2a44] text-slate-300 border border-[#222e47]"
                  title="Wishlist"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: ADD / EDIT PRODUCT MODAL
          ======================================================== */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-[#111726] border border-[#1e273c] rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#1e273c] pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Product to MongoDB'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Product Name *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Cold Rolled Mild Steel Strip 3mm"
                  className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 font-medium">SKU (Optional)</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="e.g. MTL-CR-3MM"
                    className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-white focus:outline-none focus:border-sky-500"
                  >
                    {categories.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Technical application, material grade, industrial compliance..."
                  className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Discount (%)</label>
                  <input
                    type="number"
                    value={productForm.discount_percent}
                    onChange={(e) => setProductForm({ ...productForm, discount_percent: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Initial Stock Quantity</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    value={productForm.low_stock_threshold}
                    onChange={(e) => setProductForm({ ...productForm, low_stock_threshold: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium">Image URL</label>
                <input
                  type="url"
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-white focus:outline-none focus:border-sky-500 font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#161e31] hover:bg-[#1e2a44] text-slate-400 text-xs border border-[#222e47]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 5: CREATE CATEGORY MODAL
          ======================================================== */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111726] border border-[#1e273c] rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e273c] pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Create New Category
              </h3>
              <button onClick={() => setCategoryModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Hydraulics & Pneumatics"
                  className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Brief description of supply line items..."
                  className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium">Subcategories (Comma Separated)</label>
                <input
                  type="text"
                  value={categoryForm.subcategories}
                  onChange={(e) => setCategoryForm({ ...categoryForm, subcategories: e.target.value })}
                  placeholder="Hoses, Valves, Cylinders, Fittings"
                  className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  Create Category
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#161e31] hover:bg-[#1e2a44] text-slate-400 text-xs border border-[#222e47]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 6: CREATE COUPON MODAL
          ======================================================== */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111726] border border-[#1e273c] rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e273c] pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Create Discount Promo Code
              </h3>
              <button onClick={() => setCouponModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FACTORY20"
                  className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-white focus:outline-none focus:border-emerald-500 font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Type</label>
                  <select
                    value={couponForm.discount_type}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-white focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={couponForm.discount_value}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Min Order (₹)</label>
                  <input
                    type="number"
                    value={couponForm.min_order_amount}
                    onChange={(e) => setCouponForm({ ...couponForm, min_order_amount: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Max Discount (₹)</label>
                  <input
                    type="number"
                    value={couponForm.max_discount}
                    onChange={(e) => setCouponForm({ ...couponForm, max_discount: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium">Description</label>
                <input
                  type="text"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  placeholder="e.g. 20% discount on orders above ₹15,000"
                  className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#161e31] border border-[#222e47] text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  Create Coupon
                </button>
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#161e31] hover:bg-[#1e2a44] text-slate-400 text-xs border border-[#222e47]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

