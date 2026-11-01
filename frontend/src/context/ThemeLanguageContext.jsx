import React, { createContext, useContext, useState, useEffect } from 'react';

// ============================================================================
// COMPREHENSIVE TRILINGUAL DICTIONARY (English, Hindi, Marathi)
// ============================================================================
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
    standbyReady: 'STANDBY / READY',
    monthEndCloseComplete: 'MONTH-END CLOSE COMPLETE',
    idlePaused: 'IDLE / PAUSED',
    totalInvoiced: 'Total Invoiced',
    unresolvedOverdue: 'Unresolved Overdue',
    completedCalls: 'Completed Calls',
    pendingApprovals: 'Pending Approvals',
    pendingActions: 'Requests',
    liveBrowserAction: 'Executing Autonomous Playwright Browser Steps...',
    receivablesThisCycle: 'Receivables this cycle',
    actionableDebtors: 'Actionable debtors',
    vernacularOutreach: 'Vernacular outreach',
    circuitBreakerActive: 'Circuit breaker active',
    viewQueue: 'View Queue',
    records: 'Records',
    today: 'Today',

    // Stepper Steps
    invoiceIngest: 'Invoice Ingest',
    reconcile: 'Reconcile',
    voiceFollowUp: 'Voice Follow-Up',
    gstPortalFiling: 'GST Portal Filing',
    verify: 'Verify',
    liveWorkflowMonthEnd: 'Live Workflow: Month-End Close',
    runAutonomousCycle: 'Run Autonomous Cycle',
    pauseExecution: 'Pause Execution',
    status: 'STATUS',

    // Live Computer Use
    liveAgentComputerUse: 'LIVE AGENT COMPUTER-USE',
    automatingPortal: 'AUTOMATING PORTAL',
    headlessBrowser: 'Headless Browser',
    liveStream: 'Live Stream',
    playwrightSession: 'Playwright Session',
    agentThoughtReasoning: 'Agent Thought / Reasoning',
    runBrowserTask: 'Run Browser Task',
    simulatePortalCrash: 'Simulate Portal Crash',
    executeGstChallanFiling: 'Submit Filing',
    formDetails: 'Form UI',
    liveCapture: 'Live Capture',
    openPortal: 'Open Portal',

    // Ledger Table & Receivables
    ledgerOutgoingComm: 'LEDGER & OUTGOING COMM',
    recentInvoicesReceivables: 'Recent Invoices & Receivables',
    all: 'ALL',
    overdue: 'OVERDUE',
    promised: 'PROMISED',
    paid: 'PAID',
    pending: 'PENDING',
    invoice: 'Invoice',
    partyCustomer: 'Party / Customer',
    dueDate: 'Due Date',
    amountDue: 'Amount Due',
    actions: 'Actions',
    callDebtor: 'Call',
    automate: 'Run Agent',
    filed: 'Filed',

    // Agent Audit Trails
    autonomousAgentAuditTrails: 'AGENT AUDIT TRAILS (LIVE)',
    agentAuditTrails: 'Agent Audit Trails',
    realTimeTelemetry: 'Real-Time Telemetry',
    liveTelemetry: 'LIVE TELEMETRY',
    ingest: 'INGEST',
    call: 'CALL',
    circuitBreaker: 'CIRCUIT BREAKER',
    approval: 'APPROVAL',
    browser: 'BROWSER',
    actionInterruptResolved: 'ACTION INTERRUPT - RESOLVED',

    // Circuit Breaker Approval Modal
    whatsappCircuitBreakerTriggered: 'WhatsApp Circuit Breaker Triggered',
    langGraphInterrupt: 'LangGraph Human-In-The-Loop Interrupt',
    gstSubmissionPaused: 'Statutory GST portal submission paused pending business owner authorization.',
    actionType: 'Action Type:',
    targetMsme: 'Target MSME:',
    taxLiabilityAmount: 'Tax Liability Amount:',
    twilioGate: 'Twilio WhatsApp Sandbox Gate',
    rejectAbort: 'Reject & Abort',
    authorizeWhatsappGate: 'Authorize via WhatsApp Gate',
    approveExecute: 'Approve & Execute',
    cancel: 'Cancel',

    // Ledger & Invoices page
    uploadInvoice: 'Upload Invoice',
    batchVoiceDispatch: 'Batch Voice Dispatch',
    filterByStatus: 'Filter by Status',
    searchInvoicePlaceholder: 'Search invoice number, party name, or GSTIN...',
    reconcileSelected: 'Reconcile Selected',
    downloadGstrReport: 'Download GSTR Report',
    invoiceDetails: 'Invoice Details',
    triggerVoiceCall: 'Trigger Voice Call',
    rerunOcr: 'Re-run Gemini OCR',

    // Vernacular Calls page
    vernacularVoiceCommunications: 'Vernacular AI Voice Communications',
    dispatchAiCall: 'Dispatch AI Call',
    selectPartyDebtor: 'Select Party / Debtor',
    dialectLanguage: 'Dialect / Language',
    callNow: 'Call Now',
    callHistory: 'Call History',
    promisedDate: 'Promised Date',
    transcript: 'Transcript',
    recording: 'Recording',

    // Approval Queue page
    circuitBreakerApprovalQueue: 'Circuit Breaker Approval Queue',
    pendingActionsTitle: 'Pending Actions',
    actionDetails: 'Action Details',
    approvedHistory: 'Approved History',
    approve: 'Approve',
    reject: 'Reject',

    // Party Directory page
    partyDirectoryCreditLedger: 'Party Directory & Credit Ledger',
    addNewParty: 'Add New Party',
    totalEntities: 'Total Entities',
    verifiedGstins: 'Verified GSTINs',
    avgPaymentDelay: 'Avg Payment Delay',
    activeDialects: 'Active Dialects',
    creditScore: 'Credit Score',
    paymentRisk: 'Payment Risk',
    preferredDialect: 'Preferred Dialect',
    totalOutstanding: 'Total Outstanding',
    lowRisk: 'Low Risk',
    moderateRisk: 'Moderate Risk',
    highRisk: 'High Risk',

    // Configuration page
    systemConfigSafetyGuardrails: 'System Configuration & Safety Guardrails',
    overview: 'Overview',
    safetyGuardrails: 'Safety Guardrails',
    voiceDialects: 'Voice & Dialects',
    systemPrompts: 'System Prompts',
    financialPayoutLimit: 'Financial Payout Limit (₹)',
    requireGstPortalApproval: 'Require GST Portal Approval',
    emergencyKillSwitch: 'Emergency Kill Switch',
    saveConfiguration: 'Save Configuration',
    savedSuccessfully: 'Saved successfully',

    // Audit Logs page
    systemAuditLogs: 'System Audit Logs',
    filterBySeverity: 'Filter by Severity',
    exportLogs: 'Export Logs',
    eventType: 'Event Type',
    timestamp: 'Timestamp',
    severity: 'Severity',
    info: 'INFO',
    warning: 'WARNING',
    critical: 'CRITICAL',

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
    standbyReady: 'तैयार / स्टैंडबाय',
    monthEndCloseComplete: 'माह-अंत प्रक्रिया पूर्ण',
    idlePaused: 'रुका हुआ / निष्क्रिय',
    totalInvoiced: 'कुल बिल राशि',
    unresolvedOverdue: 'बकाया वसूली',
    completedCalls: 'सम्पन्न वॉयस कॉल्स',
    pendingApprovals: 'लंबित स्वीकृतियां',
    pendingActions: 'अनुरोध',
    liveBrowserAction: 'प्लेराइट विजुअल ऑटोमेशन चालू है...',
    receivablesThisCycle: 'इस चक्र की वसूली',
    actionableDebtors: 'कार्रवाई योग्य देनदार',
    vernacularOutreach: 'प्रांतीय संपर्क',
    circuitBreakerActive: 'सुरक्षा प्रणाली सक्रिय',
    viewQueue: 'कतार देखें',
    records: 'रिकॉर्ड',
    today: 'आज',

    // Stepper Steps
    invoiceIngest: 'बिल अपलोड',
    reconcile: 'खाता मिलान',
    voiceFollowUp: 'वॉयस कॉल फॉलो-अप',
    gstPortalFiling: 'जीएसटी पोर्टल फाइलिंग',
    verify: 'सत्यापन',
    liveWorkflowMonthEnd: 'लाइव वर्कफ़्लो: माह-अंत समापन',
    runAutonomousCycle: 'ऑटोनॉमस चक्र चलाएं',
    pauseExecution: 'कार्य रोकें',
    status: 'स्थिति',

    // Live Computer Use
    liveAgentComputerUse: 'लाइव एआई एजेंट कंप्यूटर संचालन',
    automatingPortal: 'पोर्टल पर कार्य प्रगति पर',
    headlessBrowser: 'हेडलेस ब्राउज़र',
    liveStream: 'लाइव स्ट्रीम',
    playwrightSession: 'प्लेराइट सत्र',
    agentThoughtReasoning: 'एआई एजेंट विचार / तर्क',
    runBrowserTask: 'ब्राउज़र कार्य चलाएं',
    simulatePortalCrash: 'पोर्टल क्रैश सिम्युलेट करें',
    executeGstChallanFiling: 'फॉर्म जमा करें',
    formDetails: 'फॉर्म विवरण',
    liveCapture: 'लाइव कैप्चर',
    openPortal: 'पोर्टल खोलें',

    // Ledger Table & Receivables
    ledgerOutgoingComm: 'खाता बही एवं वॉयस संचार',
    recentInvoicesReceivables: 'हाल के बिल एवं प्राप्य राशि',
    all: 'सभी',
    overdue: 'बकाया',
    promised: 'वचनबद्ध',
    paid: 'भुगतान पूर्ण',
    pending: 'लंबित',
    invoice: 'बिल संख्या',
    partyCustomer: 'पार्टी / ग्राहक',
    dueDate: 'देय तिथि',
    amountDue: 'देय राशि',
    actions: 'कार्रवाई',
    callDebtor: 'कॉल करें',
    automate: 'ऑटोमेट करें',
    filed: 'फाइल हो गया',

    // Agent Audit Trails
    autonomousAgentAuditTrails: 'ऑटोनॉमस एजेंट ऑडिट ट्रेल',
    agentAuditTrails: 'एजेंट ऑडिट ट्रेल्स',
    realTimeTelemetry: 'लाइव टेलीमेट्री',
    liveTelemetry: 'लाइव टेलीमेट्री',
    ingest: 'डाटा इनपुट',
    call: 'वॉयस कॉल',
    circuitBreaker: 'सर्किट ब्रेकर',
    approval: 'स्वीकृति',
    browser: 'ब्राउज़र',
    actionInterruptResolved: 'कार्रवाई अवरोध - समाधान हुआ',

    // Circuit Breaker Approval Modal
    whatsappCircuitBreakerTriggered: 'व्हाट्सएप सर्किट ब्रेकर सक्रिय हुआ',
    langGraphInterrupt: 'मानवीय स्वीकृति सुरक्षा पड़ाव',
    gstSubmissionPaused: 'जीएसटी पोर्टल पर फाइलिंग व्यापार मालिक की अनुमति हेतु रोकी गई है।',
    actionType: 'कार्रवाई प्रकार:',
    targetMsme: 'लक्षित एमएसएमई:',
    taxLiabilityAmount: 'कर देयता राशि:',
    twilioGate: 'ट्विलियो व्हाट्सएप सैंडबॉक्स गेटवे',
    rejectAbort: 'अस्वीकार एवं रद्द करें',
    authorizeWhatsappGate: 'व्हाट्सएप से स्वीकृति दें',
    approveExecute: 'स्वीकृत एवं निष्पादित करें',
    cancel: 'रद्द करें',

    // Ledger & Invoices page
    uploadInvoice: 'बिल अपलोड करें',
    batchVoiceDispatch: 'एकसाथ वॉयस कॉल्स भेजें',
    filterByStatus: 'स्थिति अनुसार फ़िल्टर',
    searchInvoicePlaceholder: 'बिल नंबर, पार्टी का नाम या जीएसटी नंबर खोजें...',
    reconcileSelected: 'चयनित का मिलान करें',
    downloadGstrReport: 'जीएसटीआर रिपोर्ट डाउनलोड करें',
    invoiceDetails: 'बिल विवरण',
    triggerVoiceCall: 'वॉयस कॉल करें',
    rerunOcr: 'जेमिनी ओसीआर पुनः चलाएं',

    // Vernacular Calls page
    vernacularVoiceCommunications: 'प्रांतीय वॉयस संचार केंद्र',
    dispatchAiCall: 'एआई वॉयस कॉल भेजें',
    selectPartyDebtor: 'पार्टी / देनदार चुनें',
    dialectLanguage: 'बोली / भाषा',
    callNow: 'अभी कॉल करें',
    callHistory: 'कॉल इतिहास',
    promisedDate: 'वचनबद्ध तिथि',
    transcript: 'वार्तालाप प्रतिलिपि',
    recording: 'रिकॉर्डिंग',

    // Approval Queue page
    circuitBreakerApprovalQueue: 'सर्किट ब्रेकर कतार',
    pendingActionsTitle: 'लंबित कार्रवाइयां',
    actionDetails: 'कार्रवाई विवरण',
    approvedHistory: 'स्वीकृत इतिहास',
    approve: 'स्वीकृत करें',
    reject: 'अस्वीकार करें',

    // Party Directory page
    partyDirectoryCreditLedger: 'पार्टी डायरेक्टरी एवं क्रेडिट लेजर',
    addNewParty: 'नई पार्टी जोड़ें',
    totalEntities: 'कुल पार्टियां',
    verifiedGstins: 'सत्यापित जीएसटी',
    avgPaymentDelay: 'औसत भुगतान विलंब',
    activeDialects: 'सक्रिय बोलियां',
    creditScore: 'क्रेडिट स्कोर',
    paymentRisk: 'भुगतान जोखिम',
    preferredDialect: 'पसंदीदा बोली',
    totalOutstanding: 'कुल बकाया',
    lowRisk: 'कम जोखिम',
    moderateRisk: 'मध्यम जोखिम',
    highRisk: 'उच्च जोखिम',

    // Configuration page
    systemConfigSafetyGuardrails: 'सिस्टम सेटिंग्स एवं सुरक्षा गार्डरेल्स',
    overview: 'सिंहावलोकन',
    safetyGuardrails: 'सुरक्षा नियम',
    voiceDialects: 'वॉयस एवं भाषाएं',
    systemPrompts: 'सिस्टम प्रॉमप्ट्स',
    financialPayoutLimit: 'वित्तीय भुगतान सीमा (₹)',
    requireGstPortalApproval: 'जीएसटी पोर्टल फाइलिंग पूर्व स्वीकृति आवश्यक',
    emergencyKillSwitch: 'आपातकालीन किल स्विच',
    saveConfiguration: 'सेटिंग्स सुरक्षित करें',
    savedSuccessfully: 'सफलतापूर्वक सुरक्षित किया गया',

    // Audit Logs page
    systemAuditLogs: 'सिस्टम ऑडिट लॉग्स',
    filterBySeverity: 'गंभीरता अनुसार फ़िल्टर',
    exportLogs: 'लॉग्स डाउनलोड करें',
    eventType: 'इवेंट प्रकार',
    timestamp: 'समय',
    severity: 'गंभीरता',
    info: 'सूचना',
    warning: 'चेतावनी',
    critical: 'अति गंभीर',

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
    standbyReady: 'सज्ज / स्टँडबाय',
    monthEndCloseComplete: 'महिना-अखेर प्रक्रिया पूर्ण',
    idlePaused: 'थांबलेले / निष्क्रिय',
    totalInvoiced: 'एकूण पावत्या रक्कम',
    unresolvedOverdue: 'थकबाकी वसुली',
    completedCalls: 'पूर्ण झालेले व्हॉइस कॉल्स',
    pendingApprovals: 'प्रलंबित मंजुऱ्या',
    pendingActions: 'विनंत्या',
    liveBrowserAction: 'प्लेराइट व्हिज्युअल ऑटोमेशन कार्यरत...',
    receivablesThisCycle: 'या चक्रातील येणे बाकी',
    actionableDebtors: 'कारवाईयोग्य थकबाकीदार',
    vernacularOutreach: 'स्थानिक भाषा संवाद',
    circuitBreakerActive: 'सुरक्षा प्रणाली सक्रिय',
    viewQueue: 'रांग पाहा',
    records: 'नोंदी',
    today: 'आज',

    // Stepper Steps
    invoiceIngest: 'पावती नोंदणी',
    reconcile: 'खाते जुळणी',
    voiceFollowUp: 'व्हॉइस कॉल पाठपुरावा',
    gstPortalFiling: 'जीएसटी पोर्टल भरणे',
    verify: 'पडताळणी',
    liveWorkflowMonthEnd: 'थेट वर्कफ्लो: महिना-अखेर पूर्णता',
    runAutonomousCycle: 'स्वयंचलित चक्र चालवा',
    pauseExecution: 'कार्य थांबवा',
    status: 'स्थिती',

    // Live Computer Use
    liveAgentComputerUse: 'थेट एआय एजंट संगणक वापर',
    automatingPortal: 'पोर्टलवर काम सुरू आहे',
    headlessBrowser: 'हेडलेस ब्राउझर',
    liveStream: 'थेट प्रवाह',
    playwrightSession: 'प्लेराइट सत्र',
    agentThoughtReasoning: 'एआय एजंट विचार / तर्क',
    runBrowserTask: 'ब्राउझर कार्य चालवा',
    simulatePortalCrash: 'पोर्टल क्रॅश सिम्युलेट करा',
    executeGstChallanFiling: 'फॉर्म दाखल करा',
    formDetails: 'फॉर्म तपशील',
    liveCapture: 'थेट कॅप्चर',
    openPortal: 'पोर्टल उघडा',

    // Ledger Table & Receivables
    ledgerOutgoingComm: 'खातेवही आणि व्हॉइस संवाद',
    recentInvoicesReceivables: 'नुकतीच झालेली बिले आणि येणे बाकी',
    all: 'सर्व',
    overdue: 'थकबाकी',
    promised: 'वचनबद्ध',
    paid: 'पैसे भरले',
    pending: 'प्रलंबित',
    invoice: 'पावती क्रमांक',
    partyCustomer: 'ग्राहक / व्यापारी',
    dueDate: 'देय तारीख',
    amountDue: 'देय रक्कम',
    actions: 'कृती',
    callDebtor: 'कॉल करा',
    automate: 'स्वयंचलित करा',
    filed: 'दाखल झाले',

    // Agent Audit Trails
    autonomousAgentAuditTrails: 'स्वयंचलित एजंट ऑडिट नोंदी',
    agentAuditTrails: 'एजंट ऑडिट नोंदी',
    realTimeTelemetry: 'थेट टेलीमेट्री',
    liveTelemetry: 'थेट टेलीमेट्री',
    ingest: 'माहिती नोंद',
    call: 'व्हॉइस कॉल',
    circuitBreaker: 'सर्किट ब्रेकर',
    approval: 'मंजुरी',
    browser: 'ब्राउझर',
    actionInterruptResolved: 'कार्रवाई व्यत्यय - निवारण झाले',

    // Circuit Breaker Approval Modal
    whatsappCircuitBreakerTriggered: 'व्हॉट्सअ‍ॅप सर्किट ब्रेकर सक्रिय झाला',
    langGraphInterrupt: 'मानवी मंजुरी सुरक्षा टप्पा',
    gstSubmissionPaused: 'जीएसटी पोर्टलवरील फाइलिंग व्यवसाय मालकाच्या परवानगीसाठी थांबवली आहे.',
    actionType: 'कृती प्रकार:',
    targetMsme: 'लक्षित एमएसएमई:',
    taxLiabilityAmount: 'कर देयता रक्कम:',
    twilioGate: 'ट्विलिओ व्हॉट्सअ‍ॅप सँडबॉक्स गेटवे',
    rejectAbort: 'नाकारा आणि रद्द करा',
    authorizeWhatsappGate: 'व्हॉट्सअ‍ॅपद्वारे मंजुरी द्या',
    approveExecute: 'मंजूर आणि अमलात आणा',
    cancel: 'रद्द करा',

    // Ledger & Invoices page
    uploadInvoice: 'पावती अपलोड करा',
    batchVoiceDispatch: 'एकत्रित व्हॉइस कॉल्स पाठवा',
    filterByStatus: 'स्थितीनुसार फिल्टर',
    searchInvoicePlaceholder: 'पावती क्रमांक, ग्राहकाचे नाव किंवा जीएसटी क्रमांक शोधा...',
    reconcileSelected: 'निवडलेली बिले जुळवा',
    downloadGstrReport: 'जीएसटीआर अहवाल डाऊनलोड करा',
    invoiceDetails: 'पावती तपशील',
    triggerVoiceCall: 'व्हॉइस कॉल करा',
    rerunOcr: 'जेमिनी ओसीआर पुन्हा चालवा',

    // Vernacular Calls page
    vernacularVoiceCommunications: 'स्थानिक व्हॉइस संवाद केंद्र',
    dispatchAiCall: 'एआय व्हॉइस कॉल पाठवा',
    selectPartyDebtor: 'ग्राहक / थकबाकीदार निवडा',
    dialectLanguage: 'स्थानिक भाषा',
    callNow: 'आता कॉल करा',
    callHistory: 'कॉल इतिहास',
    promisedDate: 'वचनबद्ध तारीख',
    transcript: 'संभाषण उतारा',
    recording: 'रेकॉर्डिंग',

    // Approval Queue page
    circuitBreakerApprovalQueue: 'सर्किट ब्रेकर रांग',
    pendingActionsTitle: 'प्रलंबित कृती',
    actionDetails: 'कृती तपशील',
    approvedHistory: 'मंजूर इतिहास',
    approve: 'मंजूर करा',
    reject: 'नाकारा',

    // Party Directory page
    partyDirectoryCreditLedger: 'ग्राहक डायरेक्टरी आणि क्रेडिट खातेवही',
    addNewParty: 'नवीन ग्राहक जोडा',
    totalEntities: 'एकूण ग्राहक',
    verifiedGstins: 'पडताळलेले जीएसटी',
    avgPaymentDelay: 'सरासरी पेमेंट उशीर',
    activeDialects: 'सक्रिय भाषा',
    creditScore: 'क्रेडिट स्कोअर',
    paymentRisk: 'पैसे भरण्याचा धोका',
    preferredDialect: 'पसंतीची भाषा',
    totalOutstanding: 'एकूण थकबाकी',
    lowRisk: 'कमी धोका',
    moderateRisk: 'मध्यम धोका',
    highRisk: 'जास्त धोका',

    // Configuration page
    systemConfigSafetyGuardrails: 'प्रणाली संरचना आणि सुरक्षा नियम',
    overview: 'आढावा',
    safetyGuardrails: 'सुरक्षा नियम',
    voiceDialects: 'व्हॉइस आणि भाषा',
    systemPrompts: 'सिस्टम सूचना',
    financialPayoutLimit: 'वित्तीय पेमेंट मर्यादा (₹)',
    requireGstPortalApproval: 'जीएसटी पोर्टल फाइलिंगसाठी पूर्व मंजुरी आवश्यक',
    emergencyKillSwitch: 'तातडीचे किल स्विच',
    saveConfiguration: 'सेटिंग्ज जतन करा',
    savedSuccessfully: 'यशस्वीरित्या जतन केले',

    // Audit Logs page
    systemAuditLogs: 'प्रणाली ऑडिट नोंदी',
    filterBySeverity: 'तीव्रतेनुसार फिल्टर',
    exportLogs: 'नोंदी डाऊनलोड करा',
    eventType: 'घटना प्रकार',
    timestamp: 'वेळ',
    severity: 'तीव्रता',
    info: 'माहिती',
    warning: 'इशारा',
    critical: 'अति गंभीर',

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

// Build sorted phrase list for high-performance sub-string replacement
const sortedPhrasePairs = {
  hi: [],
  mr: []
};

['hi', 'mr'].forEach((lang) => {
  const pairs = [];
  Object.keys(translations.en).forEach((key) => {
    const enVal = translations.en[key];
    const targetVal = translations[lang][key];
    if (enVal && targetVal && enVal !== targetVal) {
      pairs.push([enVal, targetVal]);
    }
  });

  // Sort by longest English phrase first so compound phrases replace before single words
  pairs.sort((a, b) => b[0].length - a[0].length);
  sortedPhrasePairs[lang] = pairs;
});

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

  // Synchronize language to localStorage and trigger DOM-level auto translation
  useEffect(() => {
    try {
      localStorage.setItem('ai01_lang', language);
    } catch (e) {
      console.warn('Failed to save language', e);
    }

    // Auto-translate rendered DOM text nodes for 100% comprehensive language coverage
    const handleDomTranslation = () => {
      if (typeof document === 'undefined') return;

      const pairs = sortedPhrasePairs[language];

      const walkTextNodes = (node) => {
        if (!node) return;
        
        // Skip code, script, style
        if (['SCRIPT', 'STYLE', 'CODE', 'PRE'].includes(node.nodeName)) return;

        if (node.nodeType === Node.TEXT_NODE) {
          const raw = node.nodeValue;
          if (!raw) return;
          const trimmed = raw.trim();
          if (!trimmed || trimmed.length < 2) return;

          // Store original English text if not already stored
          if (node.__originalText === undefined) {
            node.__originalText = raw;
          }

          if (language === 'en') {
            if (node.__originalText !== undefined && node.nodeValue !== node.__originalText) {
              node.nodeValue = node.__originalText;
            }
            return;
          }

          if (pairs && pairs.length > 0) {
            let replaced = node.__originalText;
            let matched = false;
            for (let i = 0; i < pairs.length; i++) {
              const [enPhrase, targetPhrase] = pairs[i];
              if (replaced.includes(enPhrase)) {
                replaced = replaced.replaceAll(enPhrase, targetPhrase);
                matched = true;
              }
            }
            if (matched && node.nodeValue !== replaced) {
              node.nodeValue = replaced;
            }
          }
        } else {
          // Check placeholder on inputs and textareas
          if (node.nodeName === 'INPUT' || node.nodeName === 'TEXTAREA') {
            if (node.placeholder) {
              if (node.__originalPlaceholder === undefined) {
                node.__originalPlaceholder = node.placeholder;
              }
              if (language === 'en') {
                if (node.__originalPlaceholder) node.placeholder = node.__originalPlaceholder;
              } else if (pairs && pairs.length > 0) {
                let replaced = node.__originalPlaceholder || node.placeholder;
                for (let i = 0; i < pairs.length; i++) {
                  const [enPhrase, targetPhrase] = pairs[i];
                  if (replaced.includes(enPhrase)) {
                    replaced = replaced.replaceAll(enPhrase, targetPhrase);
                  }
                }
                if (node.placeholder !== replaced) {
                  node.placeholder = replaced;
                }
              }
            }
          }

          // Traverse children
          for (let child = node.firstChild; child; child = child.nextSibling) {
            walkTextNodes(child);
          }
        }
      };

      walkTextNodes(document.body);
    };

    // Run immediately and after small render ticks
    handleDomTranslation();
    const tId1 = setTimeout(handleDomTranslation, 50);
    const tId2 = setTimeout(handleDomTranslation, 300);

    // Observe DOM mutations to translate dynamically loaded records and elements
    const observer = new MutationObserver(() => {
      handleDomTranslation();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: false
    });

    return () => {
      clearTimeout(tId1);
      clearTimeout(tId2);
      observer.disconnect();
    };
  }, [language]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Translation helper function
  const t = (keyOrPhrase, fallback = '') => {
    if (!keyOrPhrase) return fallback;

    const langDict = translations[language] || translations.en;
    // 1. Direct key match (e.g. t('operationalHub'))
    if (langDict && langDict[keyOrPhrase] !== undefined) {
      return langDict[keyOrPhrase];
    }
    
    // 2. Phrase lookup in dictionary values
    const pairs = sortedPhrasePairs[language];
    if (pairs) {
      const trimmed = String(keyOrPhrase).trim();
      for (let i = 0; i < pairs.length; i++) {
        if (pairs[i][0] === trimmed) {
          return pairs[i][1];
        }
      }
    }

    // 3. English default key match
    const defaultDict = translations.en;
    if (defaultDict && defaultDict[keyOrPhrase] !== undefined) {
      return defaultDict[keyOrPhrase];
    }

    return fallback || keyOrPhrase;
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
