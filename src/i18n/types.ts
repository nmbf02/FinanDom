export interface TranslationKeys {
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    edit: string;
    delete: string;
    confirm: string;
    back: string;
    next: string;
    done: string;
    close: string;
    yes: string;
    no: string;
    ok: string;
  };
  navigation: {
    dashboard: string;
    profile: string;
    settings: string;
    loans: string;
    clients: string;
    payments: string;
    assistant: string;
  };
  auth: {
    greeting: string;
    subtitle: string;
    login: string;
    register: string;
    logout: string;
    email: string;
    password: string;
    confirmPassword: string;
    forgotPassword: string;
    rememberMe: string;
    noAccount: string;
    haveAccount: string;
    loginSuccess: string;
    registerSuccess: string;
    invalidCredentials: string;
    passwordMismatch: string;
    requiredFields: string;
  };
  dashboard: {
    greeting: {
      morning: string;
      afternoon: string;
      evening: string;
    };
    metrics: {
      totalLoaned: string;
      totalRecovered: string;
      totalOverdue: string;
      activeLoans: string;
      overdueLoans: string;
      activeClients: string;
    };
    quickActions: {
      createLoan: string;
      addClient: string;
      recordPayment: string;
      viewOverdue: string;
    };
  };
  profile: {
    title: string;
    editProfile: string;
    currency: string;
    settings: string;
    help: string;
    logout: string;
    logoutConfirm: string;
    photoEdit: string;
  };
  settings: {
    title: string;
    theme: string;
    language: string;
    themeOptions: {
      light: string;
      dark: string;
      system: string;
    };
    languageOptions: {
      es: string;
      en: string;
      system: string;
    };
    connectionStatus: string;
    syncButton: string;
    syncMessage: string;
  };
  loans: {
    create: string;
    details: string;
    list: string;
    amount: string;
    installments: string;
    interestRate: string;
    frequency: string;
    startDate: string;
    totalWithInterest: string;
    clientName: string;
    clientIdentification: string;
    frequencies: {
      weekly: string;
      biweekly: string;
      monthly: string;
    };
  };
  clients: {
    add: string;
    list: string;
    name: string;
    identification: string;
    phone: string;
    email: string;
    documentType: string;
  };
  payments: {
    record: string;
    list: string;
    amount: string;
    date: string;
    method: string;
    success: string;
  };
  currency: {
    title: string;
    subtitle: string;
    DOP: string;
    USD: string;
    EUR: string;
  };
  assistant: {
    title: string;
    reminders: string;
    thanks: string;
    search: string;
    sendMessage: string;
    editMessage: string;
    messageSent: string;
  };
  errors: {
    networkError: string;
    serverError: string;
    unknownError: string;
    tryAgain: string;
  };
  splash: {
    title: string;
    subtitle: string;
    author: string;
    authorName: string;
  };
  contract: {
    title: string;
    subtitle: string;
    signaturePlaceholder: string;
    clearText: string;
    confirmText: string;
    acceptButton: string;
  };
  register: {
    title: string;
    subtitle: string;
    userId: string;
    identification: string;
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
    createAccount: string;
    incompleteFields: string;
    incompleteFieldsMessage: string;
    passwordMismatch: string;
    passwordMismatchMessage: string;
    success: string;
    successMessage: string;
    error: string;
    errorMessage: string;
    serverError: string;
  };
  payment: {
    title: string;
    loanInfo: string;
    client: string;
    loanNumber: string;
    status: string;
    startDate: string;
    loanAmount: string;
    paidAmount: string;
    totalInstallments: string;
    missingInstallments: string;
    paymentSection: string;
    paymentDate: string;
    selectInstallments: string;
    amountToPay: string;
    paymentMethod: string;
    selectMethod: string;
    reference: string;
    generatePDF: string;
    confirmPayment: string;
    paymentMethodModal: string;
    search: string;
    noResults: string;
    close: string;
    pdfMessage: string;
    error: string;
    amountError: string;
    paymentError: string;
    connectionError: string;
    loadingInstallments: string;
    loadingPayments: string;
    loadingPaymentMethods: string;
  };
  paymentSuccess: {
    congratulations: string;
    paymentRegistered: string;
  };
  overduePayments: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    client: string;
    loanNumber: string;
    amount: string;
    date: string;
    method: string;
    status: string;
    noPayments: string;
    tryFilters: string;
    loadingError: string;
    cancelPayment: string;
    cancelConfirmation: string;
    yesCancel: string;
    cancelReason: string;
    paymentCancelled: string;
    cancelError: string;
    generateReceipt: string;
    receiptConfirmation: string;
    generate: string;
    receiptGenerated: string;
    receiptDetails: string;
    downloadPDF: string;
    download: string;
    downloadPending: string;
    receiptError: string;
    filters: string;
    paymentStatus: string;
    paymentMethod: string;
    all: string;
    overdue: string;
    paid: string;
    cash: string;
    transfer: string;
    applyFilters: string;
  };
  loanList: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    loanNumber: string;
    client: string;
    clientId: string;
    amount: string;
    interest: string;
    installments: string;
    totalToPay: string;
    status: string;
    fetchError: string;
    connectionError: string;
    retry: string;
    cancelLoan: string;
    cancelConfirmation: string;
    yesCancel: string;
    loanCancelled: string;
    cancelError: string;
    serverError: string;
    filters: string;
    active: string;
    cancelled: string;
    paid: string;
    overdue: string;
  };
  installmentList: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    client: string;
    installmentNumber: string;
    amount: string;
    dueDate: string;
    status: string;
    loadingError: string;
  };
  loanDetails: {
    title: string;
    successTitle: string;
    subtitle: string;
    loanAmount: string;
    installments: string;
    totalAmount: string;
    client: string;
    identification: string;
    startDate: string;
    frequency: string;
    interest: string;
    signedContract: string;
    viewContract: string;
    recordPayment: string;
    viewPaymentCalendar: string;
    contractTitle: string;
    contractDescription: string;
    contractFileName: string;
    pdfGenerationError: string;
    pdfOpenError: string;
  };
  helpCenter: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    faq: string;
    contactUs: string;
    noResults: string;
    categories: {
      populartopic: string;
      general: string;
      services: string;
    };
    faq: {
      loanRequest: {
        question: string;
        answer: string;
      };
      requirements: {
        question: string;
        answer: string;
      };
      payment: {
        question: string;
        answer: string;
      };
      advancePayment: {
        question: string;
        answer: string;
      };
      latePayment: {
        question: string;
        answer: string;
      };
    };
    contact: {
      customerService: string;
      website: string;
      whatsapp: string;
      facebook: string;
      instagram: string;
    };
  };
  forgotPassword: {
    recoverPassword: string;
    enterEmailForCode: string;
    verifyCode: string;
    enterCodeFromEmail: string;
    newPassword: string;
    enterNewPassword: string;
    sixDigitCode: string;
    newPasswordPlaceholder: string;
    confirmNewPassword: string;
    sendCode: string;
    sending: string;
    updating: string;
    updatePassword: string;
    changeEmail: string;
    error: string;
    success: string;
    enterEmail: string;
    enterCode: string;
    completeFields: string;
    passwordMismatch: string;
    codeSent: string;
    checkEmail: string;
    passwordUpdated: string;
    sendCodeError: string;
    updatePasswordError: string;
    serverError: string;
  };
} 