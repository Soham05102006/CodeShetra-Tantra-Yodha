import React, { createContext, useContext, useState, useEffect } from 'react';

// Comprehensive Bilingual / Trilingual dictionary for English, Hindi, and Marathi
export const translations = {
  en: {
    // Navigation & Branding
    companyName: 'Sharma Enterprises',
    aiEmployee: 'AI-EMPLOYEE',
    operationalHubSection: 'OPERATIONAL HUB',
    operationalHub: 'Operational Hub',
    ecommerce: 'E-Commerce',
    ledgerInvoices: 'Ledger & Invoices',
    vernacularCalls: 'Vernacular Calls',
    approvalQueue: 'Approval Queue',
    auditLogs: 'Audit Logs',
    partyDirectory: 'Party Directory',
    configuration: 'Configuration',
    agentOnline: 'Agent Online',
    owner: 'Owner',
    whatsappConnected: 'WhatsApp connected',

    // TopBar
    dashboard: 'Dashboard',
    voiceDispatch: 'Voice Dispatch',
    portalAutomation: 'Portal Automation',
    resetDemo: 'Reset Demo',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    language: 'Language',
    notifications: 'Notifications',
    settings: 'Settings',

    // Hub Metrics & Stepper
    runningWebAutomation: 'RUNNING WEB AUTOMATION',
    awaitingApproval: 'AWAITING APPROVAL',
    totalInvoiced: 'Total Invoiced',
    unresolvedOverdue: 'Unresolved Overdue',
    completedCalls: 'Completed Calls',
    pendingApprovals: 'Pending Approvals',
    liveBrowserAction: 'Executing Autonomous Playwright Browser Steps...',

    // E-Commerce Module
    ecommerceTitle: 'E-Commerce Operations & MSME Storefront',
    ecommerceSubtitle: 'Full-stack B2B procurement catalog, real-time inventory deduction, Razorpay checkout, and vernacular voice query AI.',
    liveAtlasSync: 'LIVE ATLAS SYNC',
    cart: 'Cart',
    sync: 'Sync',
    addProduct: 'Add Product',
    storefront: 'Storefront',
    cartCheckout: 'Cart & Checkout',
    analytics: 'Executive Analytics',
    products: 'Products',
    categories: 'Categories',
    orders: 'Orders',
    inventory: 'Inventory & Stock',
    coupons: 'Coupons',
    customers: 'Customers',
    aiAssistant: 'AI Shopping Assistant',
    searchPlaceholder: 'Search metal sheets, fasteners, switchgear, PPE...',
    inStockOnly: 'In Stock Only',
    sortBy: 'Sort:',
    allCategories: 'All Categories',
    addToCart: 'Add to Cart',
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    procurementCart: 'Procurement Cart',
    clearCart: 'Clear Cart',
    cartEmpty: 'Your Procurement Cart is Empty',
    browseStorefront: 'Browse Storefront',
    orderSummary: 'Order Financial Summary',
    cartSubtotal: 'Cart Subtotal',
    couponDiscount: 'Coupon Discount',
    gstHarmonized: 'GST (18% Harmonized)',
    freightDelivery: 'Industrial Freight / Delivery',
    totalAmountDue: 'Total Amount Due',
    shippingBilling: 'Shipping & Procurement Billing',
    buyerName: 'Company / Buyer Name',
    phone: 'Phone (WhatsApp)',
    gstin: 'GSTIN',
    streetAddress: 'Factory / Delivery Street Address',
    city: 'City',
    state: 'State',
    pincode: 'Pincode',
    confirmAndPay: 'Confirm & Pay',
    applyCoupon: 'Apply',
    createCoupon: 'Create Coupon',
    quickRestock: 'Quick Restock',
    send: 'Send',
    askAiPlaceholder: 'Ask technical specs, quotations with GST, stock, coupons, or order status...'
  },

  hi: {
    // Navigation & Branding
    companyName: 'शर्मा एंटरप्राइजेज',
    aiEmployee: 'एआई-कर्मचारी',
    operationalHubSection: 'कार्य संचालन केंद्र',
    operationalHub: 'कार्य संचालन केंद्र',
    ecommerce: 'ई-कॉमर्स स्टोर',
    ledgerInvoices: 'खाता बही एवं बिल',
    vernacularCalls: 'प्रांतीय वॉयस कॉल्स',
    approvalQueue: 'स्वीकृति कतार',
    auditLogs: 'ऑडिट लॉग्स',
    partyDirectory: 'पार्टी डायरेक्टरी',
    configuration: 'सिस्टम सेटिंग्स',
    agentOnline: 'एजेंट सक्रिय',
    owner: 'मालिक',
    whatsappConnected: 'व्हाट्सएप कनेक्टेड',

    // TopBar
    dashboard: 'डैशबोर्ड',
    voiceDispatch: 'वॉयस कॉल भेजें',
    portalAutomation: 'पोर्टल ऑटोमेशन',
    resetDemo: 'डेमो रीसेट करें',
    lightMode: 'लाइट मोड',
    darkMode: 'डार्क मोड',
    language: 'भाषा',
    notifications: 'सूचनाएं',
    settings: 'सेटिंग्स',

    // Hub Metrics & Stepper
    runningWebAutomation: 'वेब ऑटोमेशन प्रगति पर है',
    awaitingApproval: 'स्वीकृति की प्रतीक्षा है',
    totalInvoiced: 'कुल बिल राशि',
    unresolvedOverdue: 'बकाया वसूली',
    completedCalls: 'सम्पन्न वॉयस कॉल्स',
    pendingApprovals: 'लंबित स्वीकृतियां',
    liveBrowserAction: 'प्लेराइट विजुअल ऑटोमेशन चालू है...',

    // E-Commerce Module
    ecommerceTitle: 'ई-कॉमर्स संचालन एवं एमएसएमई स्टोर',
    ecommerceSubtitle: 'औद्योगिक बी2बी कैटलॉग, लाइव इन्वेंट्री, रेजरपे चेकआउट एवं प्रांतीय एआई शॉपिंग सहायक।',
    liveAtlasSync: 'मोंगोडीबी एटलस लाइव',
    cart: 'कार्ट',
    sync: 'सिंक करें',
    addProduct: 'नया उत्पाद जोड़ें',
    storefront: 'दुकान / कैटलॉग',
    cartCheckout: 'कार्ट एवं चेकआउट',
    analytics: 'बिक्री एनालिटिक्स',
    products: 'उत्पाद सूची',
    categories: 'श्रेणियां',
    orders: 'ऑर्डर्स',
    inventory: 'इन्वेंट्री एवं स्टॉक',
    coupons: 'डिस्काउंट कूपन',
    customers: 'ग्राहक सूची',
    aiAssistant: 'एआई शॉपिंग सहायक',
    searchPlaceholder: 'स्टील शीट, फास्टनर्स, स्विचगियर, पीपीई खोजें...',
    inStockOnly: 'केवल उपलब्ध स्टॉक',
    sortBy: 'क्रमबद्ध करें:',
    allCategories: 'सभी श्रेणियां',
    addToCart: 'कार्ट में जोड़ें',
    inStock: 'उपलब्ध है',
    lowStock: 'कम स्टॉक',
    outOfStock: 'स्टॉक समाप्त',
    procurementCart: 'खरीद कार्ट',
    clearCart: 'कार्ट खाली करें',
    cartEmpty: 'आपकी कार्ट वर्तमान में खाली है',
    browseStorefront: 'उत्पाद कैटलॉग देखें',
    orderSummary: 'ऑर्डर वित्तीय सारांश',
    cartSubtotal: 'कार्ट उप-योग',
    couponDiscount: 'कूपन छूट',
    gstHarmonized: 'जीएसटी (18% नियमानुसार)',
    freightDelivery: 'औद्योगिक माल ढुलाई शुल्क',
    totalAmountDue: 'कुल देय राशि',
    shippingBilling: 'डिलीवरी एवं बिलिंग विवरण',
    buyerName: 'कंपनी / खरीदार का नाम',
    phone: 'फ़ोन (व्हाट्सएप)',
    gstin: 'जीएसटीआईएन (GSTIN)',
    streetAddress: 'फैक्ट्री / डिलीवरी पता',
    city: 'शहर',
    state: 'राज्य',
    pincode: 'पिनकोड',
    confirmAndPay: 'ऑर्डर पुष्टि एवं भुगतान',
    applyCoupon: 'लागू करें',
    createCoupon: 'कूपन बनाएं',
    quickRestock: 'त्वरित स्टॉक जोड़ें',
    send: 'भेजें',
    askAiPlaceholder: 'तकनीकी जानकारी, जीएसटी कोटेशन, स्टॉक या कूपन के बारे में पूछें...'
  },

  mr: {
    // Navigation & Branding
    companyName: 'शर्मा एंटरप्रायझेस',
    aiEmployee: 'एआय-कर्मचारी',
    operationalHubSection: 'कार्य संचालन केंद्र',
    operationalHub: 'कार्य संचालन केंद्र',
    ecommerce: 'ई-कॉमर्स स्टोअर',
    ledgerInvoices: 'खातेवही आणि पावत्या',
    vernacularCalls: 'स्थानिक व्हॉइस कॉल्स',
    approvalQueue: 'मंजुरी रांग',
    auditLogs: 'ऑडिट नोंदी',
    partyDirectory: 'ग्राहक डायरेक्टरी',
    configuration: 'प्रणाली संरचना',
    agentOnline: 'एजंट ऑनलाइन',
    owner: 'मालक',
    whatsappConnected: 'व्हॉट्सअ‍ॅप जोडलेले',

    // TopBar
    dashboard: 'डॅशबोर्ड',
    voiceDispatch: 'व्हॉइस कॉल पाठवा',
    portalAutomation: 'पोर्टल ऑटोमेशन',
    resetDemo: 'डेमो रीसेट करा',
    lightMode: 'लाइट मोड',
    darkMode: 'डार्क मोड',
    language: 'भाषा',
    notifications: 'सूचना',
    settings: 'सेटिंग्ज',

    // Hub Metrics & Stepper
    runningWebAutomation: 'वेब ऑटोमेशन सुरू आहे',
    awaitingApproval: 'मंजुरीची प्रतीक्षा आहे',
    totalInvoiced: 'एकूण पावत्या रक्कम',
    unresolvedOverdue: 'थकबाकी वसुली',
    completedCalls: 'पूर्ण झालेले व्हॉइस कॉल्स',
    pendingApprovals: 'प्रलंबित मंजुऱ्या',
    liveBrowserAction: 'प्लेराइट व्हिज्युअल ऑटोमेशन कार्यरत...',

    // E-Commerce Module
    ecommerceTitle: 'ई-कॉमर्स ऑपरेशन्स आणि एमएसएमई स्टोअर',
    ecommerceSubtitle: 'औद्योगिक बी2बी कॅटलॉग, रिअल-टाइम इन्व्हेंटरी, रेझरपे चेकआउट आणि स्थानिक एआय खरेदी सहाय्यक.',
    liveAtlasSync: 'अ‍ॅटलास थेट जोडणी',
    cart: 'कार्ट',
    sync: 'सिंक करा',
    addProduct: 'उत्पादन जोडा',
    storefront: 'दुकान / कॅटलॉग',
    cartCheckout: 'कार्ट आणि चेकआउट',
    analytics: 'विक्री विश्लेषण',
    products: 'उत्पादने',
    categories: 'वर्गवारी',
    orders: 'ऑर्डर्स',
    inventory: 'स्टॉक आणि गोदाम',
    coupons: 'सूट कूपन्स',
    customers: 'ग्राहक यादी',
    aiAssistant: 'एआय खरेदी सहाय्यक',
    searchPlaceholder: 'स्टील शीट, नट-बोल्ट, स्विचगिअर, पीपीई शोधा...',
    inStockOnly: 'फक्त उपलब्ध स्टॉक',
    sortBy: 'क्रमवारी:',
    allCategories: 'सर्व वर्गवारी',
    addToCart: 'कार्टमध्ये जोडा',
    inStock: 'स्टॉक उपलब्ध',
    lowStock: 'कमी स्टॉक',
    outOfStock: 'स्टॉक संपला',
    procurementCart: 'खरेदी कार्ट',
    clearCart: 'कार्ट रिकामी करा',
    cartEmpty: 'तुमची कार्ट सध्या रिकामी आहे',
    browseStorefront: 'कॅटलॉग पाहा',
    orderSummary: 'ऑर्डर आर्थिक सारांश',
    cartSubtotal: 'कार्ट उप-एकूण',
    couponDiscount: 'कूपन सवलत',
    gstHarmonized: 'जीएसटी (18% नियमानुसार)',
    freightDelivery: 'वाहतूक / डिलिव्हरी शुल्क',
    totalAmountDue: 'एकूण देय रक्कम',
    shippingBilling: 'डिलिव्हरी आणि बिलिंग तपशील',
    buyerName: 'कंपनी / खरेदीदाराचे नाव',
    phone: 'फोन (व्हॉट्सअ‍ॅप)',
    gstin: 'जीएसटीआयएन (GSTIN)',
    streetAddress: 'फॅक्टरी / डिलिव्हरी पत्ता',
    city: 'शहर',
    state: 'राज्य',
    pincode: 'पिनकोड',
    confirmAndPay: 'पुष्टी करा आणि पैसे द्या',
    applyCoupon: 'लागू करा',
    createCoupon: 'कूपन तयार करा',
    quickRestock: 'स्टॉक वाढवा',
    send: 'पाठवा',
    askAiPlaceholder: 'तांत्रिक माहिती, जीएसटी कोटेशन, स्टॉक किंवा कूपनबद्दल विचारा...'
  }
};

const ThemeLanguageContext = createContext(null);

export function ThemeLanguageProvider({ children }) {
  // Theme state: 'dark' | 'light'
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('ai01_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Language state: 'en' | 'hi' | 'mr'
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('ai01_lang') || 'en';
    } catch {
      return 'en';
    }
  });

  // Synchronize theme to document body
  useEffect(() => {
    try {
      localStorage.setItem('ai01_theme', theme);
      if (theme === 'light') {
        document.body.classList.add('light-theme');
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.body.classList.remove('light-theme');
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
    } catch (e) {
      console.warn('Failed to save theme', e);
    }
  }, [theme]);

  // Synchronize language to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ai01_lang', language);
    } catch (e) {
      console.warn('Failed to save language', e);
    }
  }, [language]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Translation helper function
  const t = (key, fallback = '') => {
    const langDict = translations[language] || translations.en;
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    const defaultDict = translations.en;
    if (defaultDict && defaultDict[key] !== undefined) {
      return defaultDict[key];
    }
    return fallback || key;
  };

  return (
    <ThemeLanguageContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        language,
        setLanguage,
        t
      }}
    >
      {children}
    </ThemeLanguageContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useAppTheme must be used within ThemeLanguageProvider');
  }
  return {
    theme: context.theme,
    setTheme: context.setTheme,
    toggleTheme: context.toggleTheme,
    isDark: context.theme === 'dark'
  };
}

export function useAppLanguage() {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useAppLanguage must be used within ThemeLanguageProvider');
  }
  return {
    language: context.language,
    setLanguage: context.setLanguage,
    t: context.t
  };
}
