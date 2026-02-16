// i18n/index.js
import { createI18n } from 'vue-i18n';

const messages = {
  en: {
    dashboard: {
      title: 'Seller Dashboard',
      welcome: 'Welcome back, {name}! Here\'s what\'s happening with your store.',
      seller: 'Seller',
      stats: {
        totalOxen: 'Total Oxen',
        ordersReceived: 'Orders Received',
        totalRevenue: 'Total Revenue',
        activeListings: 'Active Listings',
        thisMonth: '+{count} this month',
        thisWeek: '+{count} this week'
      },
      quickActions: {
        add: {
          title: 'Add New Ox',
          description: 'List a new ox for sale'
        },
        orders: {
          title: 'View Orders',
          description: '{count} pending orders | {count} pending order | {count} pending orders'
        },
        analytics: {
          title: 'Analytics',
          description: 'View performance metrics'
        },
        messages: {
          title: 'Messages',
          description: 'Check buyer inquiries'
        }
      },
      recentOrders: {
        title: 'Recent Orders',
        viewAll: 'View All',
        buyer: 'Buyer'
      },
      performance: {
        title: 'Performance Metrics',
        responseRate: 'Response Rate',
        avgResponseTime: 'Avg. Response Time',
        completionRate: 'Completion Rate',
        rating: 'Seller Rating',
        basedOnReviews: 'Based on {count} reviews'
      },
      topOxen: {
        title: 'Top Performing Oxen',
        columns: {
          name: 'Ox Name',
          views: 'Views',
          inquiries: 'Inquiries',
          sold: 'Sold',
          revenue: 'Revenue',
          conversion: 'Conversion'
        }
      }
    },
    order: {
      status: {
        pending: 'Pending',
        confirmed: 'Confirmed',
        processing: 'Processing',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled'
      },
  title: 'Orders Received',
  subtitle: 'Manage and track orders from buyers',
  orderId: 'Order',
  placedOn: 'Placed on',
  buyerInfo: 'Buyer Information',
  name: 'Name',
  phone: 'Phone',
  location: 'Location',
  delivery: 'Delivery',
  items: 'Items',
  qty: 'Qty',
  summary: 'Summary',
  paymentMethod: 'Payment Method',
  estimatedDelivery: 'Est. Delivery',
  total: 'Total',
  noteFromBuyer: 'Note from buyer',
  yourNote: 'Your note',
  deliveryAddress: 'Delivery Address',
  totalAmount: 'Total Amount',
  specialInstructions: 'Special Instructions',
  tabs: {
    all: 'All',
  },
  status: {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  },
  payment: {
    paid: 'Paid',
    pending: 'Pending',
    failed: 'Failed',
    refunded: 'Refunded'
  },
  stats: {
    total: 'Total Orders',
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    revenue: 'Revenue (ETB)'
  },
  actions: {
    contact: 'Contact Buyer',
    invoice: 'Invoice',
    details: 'Details',
    updateStatus: 'Update Status',
    manageOxen: 'Manage Your Oxen'
  },
  empty: {
    title: 'No orders found',
    noStatus: 'You haven\'t received any {status} orders yet',
    noOrders: 'You haven\'t received any orders yet'
  },
  modal: {
    details: 'Order Details',
    orderStatus: 'Order Status',
    paymentStatus: 'Payment Status',
    buyerInfo: 'Buyer Information',
    itemsOrdered: 'Items Ordered',
    paymentInfo: 'Payment Information',
    deliveryInfo: 'Delivery Information',
    updateTitle: 'Update Order Status',
    newStatus: 'New Status',
    addNote: 'Add Note (Optional)',
    notePlaceholder: 'Add any notes about this order...'
  },
  messages: {
    loadError: 'Failed to load orders',
    updateSuccess: 'Order #{id} updated to {status}',
    updateError: 'Failed to update order',
    printInvoice: 'Printing invoice...'
  }
},

    defaultUser: 'Birhane Araya',
    defaultRole: 'Marketing Administrator',
    defaultTitle: 'Dashboard',
    goBack: 'Go back',
    notifications: 'Notifications',
    messages: 'Messages',
    bire: 'Bire',
    userMenu: 'User menu',
    userAvatar: 'User avatar',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    closeMenu: 'Close menu',
    language: {
      en: 'English',
      am: 'Amharic'
    },
    common: {
      loading: 'Loading...',
      refresh: 'Refresh',
      confirm: 'Confirm',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      back: 'Back',
      saving: 'Saving...'
    },
    oxen: {
      title: 'My Oxen',
      subtitle: 'Manage your livestock listings',
      currency: 'ETB',
      loading: 'Loading your listings...',
      addedDate: 'Added',
      filters: {
        searchPlaceholder: 'Search by name or breed...',
        allStatus: 'All Status'
      },
      status: {
        active: 'Active',
        sold: 'Sold',
        draft: 'Draft',
        pending: 'Pending',
        inactive: 'Inactive'
      },
      stats: {
        views: 'Views',
        inquiries: 'Inquiries',
        price: 'Price'
      },
      actions: {
        add: 'Add New Ox',
        addFirst: 'Add Your First Ox',
        view: 'View',
        edit: 'Edit',
        delete: 'Delete'
      },
      empty: {
        title: 'No oxen found',
        adjustFilters: 'Try adjusting your filters',
        noListings: 'You haven\'t added any listings yet'
      },
      messages: {
        loadError: 'Failed to load your listings',
        deleteConfirm: 'Are you sure you want to delete this listing?',
        deleteSuccess: 'Ox deleted successfully',
        deleteError: 'Failed to delete ox'
      },
      breeds: {
        borana: 'Borana',
        sahiwal: 'Sahiwal',
        ogaden: 'Ogaden',
        horro: 'Horro',
        fogera: 'Fogera',
        sheko: 'Sheko',
        other: 'Other'
      },
      locations: {
        oromia: 'Oromia',
        somali: 'Somali',
        amhara: 'Amhara',
        tigray: 'Tigray',
        sidama: 'Sidama',
        snnpr: 'SNNPR',
        other: 'Other'
      },
      bodyConditions: {
        excellent: 'Excellent',
        good: 'Good',
        average: 'Average',
        fair: 'Fair'
      },
      form: {
        addTitle: 'Add New Ox',
        addSubtitle: 'List a new ox for sale',
        editTitle: 'Edit Ox',
        editSubtitle: 'Update your ox listing',
        addButton: 'List Ox',
        updateButton: 'Update Ox',
        sections: {
          basic: 'Basic Information',
          health: 'Health Information',
          description: 'Description',
          images: 'Images'
        },
        fields: {
          name: 'Name',
          breed: 'Breed',
          age: 'Age',
          weight: 'Weight',
          height: 'Height',
          color: 'Color',
          price: 'Price (ETB)',
          bodyCondition: 'Body Condition',
          location: 'Location'
        },
        placeholders: {
          name: 'Enter ox name',
          age: 'e.g., 3 years',
          weight: 'e.g., 450 kg',
          height: 'e.g., 145 cm',
          color: 'e.g., Brown with white patches',
          price: 'Enter price in ETB',
          description: 'Describe your ox in detail...'
        },
        selectPlaceholder: 'Select an option',
        health: {
          healthCertified: 'Health Certified',
          vaccinated: 'Vaccinated',
          dewormed: 'Dewormed'
        },
        images: {
          uploadText: 'Click to upload images',
          uploadHint: 'PNG, JPG up to 5MB',
          previewAlt: 'Preview image'
        },
        validation: {
          required: 'Please fill all required fields.'
        }
      }
    }
  },
  
  am: {
    dashboard: {
      title: 'ሻጭ ዳሽቦርድ',
      welcome: 'እንኳን ደህና መጡ፣ {name}! በመደብርዎ ውስጥ ያለው እንቅስቃሴ ይህ ነው።',
      seller: 'ሻጭ',
      stats: {
        totalOxen: 'ጠቅላላ በሬዎች',
        ordersReceived: 'የደረሱ ትዕዛዞች',
        totalRevenue: 'ጠቅላላ ገቢ',
        activeListings: 'ንቁ ዝርዝሮች',
        thisMonth: '+{count} በዚህ ወር',
        thisWeek: '+{count} በዚህ ሳምንት'
      },
      quickActions: {
        add: {
          title: 'አዲስ በሬ ጨምር',
          description: 'አዲስ በሬ ለሽያጭ ይዘርዝሩ'
        },
        orders: {
          title: 'ትዕዛዞችን ይመልከቱ',
          description: '{count} በመጠባበቅ ላይ ያሉ ትዕዛዞች'
        },
        analytics: {
          title: 'ትንታኔ',
          description: 'የአፈጻጸም መለኪያዎችን ይመልከቱ'
        },
        messages: {
          title: 'መልዕክቶች',
          description: 'የገዢዎችን ጥያቄዎች ይመልከቱ'
        }
      },
      recentOrders: {
        title: 'የቅርብ ጊዜ ትዕዛዞች',
        viewAll: 'ሁሉንም ይመልከቱ',
        buyer: 'ገዢ'
      },
      performance: {
        title: 'የአፈጻጸም መለኪያዎች',
        responseRate: 'ምላሽ መስጫ መጠን',
        avgResponseTime: 'አማካይ የምላሽ ጊዜ',
        completionRate: 'የማጠናቀቂያ መጠን',
        rating: 'የሻጭ ደረጃ',
        basedOnReviews: 'በ{count} ግምገማዎች ላይ የተመሠረተ'
      },
      topOxen: {
        title: 'ከፍተኛ አፈጻጸም ያላቸው በሬዎች',
        columns: {
          name: 'የበሬ ስም',
          views: 'ትይታዎች',
          inquiries: 'ጥያቄዎች',
          sold: 'የተሸጡ',
          revenue: 'ገቢ',
          conversion: 'ልወጣ'
        }
      }
    },
    order: {
          title: 'የደረሱ ትዕዛዞች',
  subtitle: 'ከገዢዎች የሚመጡ ትዕዛዞችን ያስተዳድሩ እና ይከታተሉ',
  orderId: 'ትዕዛዝ',
  placedOn: 'የተቀመጠበት ቀን',
  buyerInfo: 'የገዢ መረጃ',
  name: 'ስም',
  phone: 'ስልክ',
  location: 'አካባቢ',
  delivery: 'አቅርቦት',
  items: 'እቃዎች',
  qty: 'ብዛት',
  summary: 'ማጠቃለያ',
  paymentMethod: 'የክፍያ ዘዴ',
  estimatedDelivery: 'የተገመተ አቅርቦት',
  total: 'ጠቅላላ',
  noteFromBuyer: 'ከገዢ ማስታወሻ',
  yourNote: 'የእርስዎ ማስታወሻ',
  deliveryAddress: 'የአቅርቦት አድራሻ',
  totalAmount: 'ጠቅላላ መጠን',
  specialInstructions: 'ልዩ መመሪያዎች',
  tabs: {
    all: 'ሁሉም',
  },
  status: {
    pending: 'በመጠባበቅ ላይ',
    confirmed: 'ተረጋግጧል',
    processing: 'በሂደት ላይ',
    shipped: 'ተልኳል',
    delivered: 'ደርሷል',
    cancelled: 'ተሰርዟል'
  },
  payment: {
    paid: 'ተከፍሏል',
    pending: 'በመጠባበቅ ላይ',
    failed: 'አልተሳካም',
    refunded: 'ተመላሽ ተደርጓል'
  },
  stats: {
    total: 'ጠቅላላ ትዕዛዞች',
    pending: 'በመጠባበቅ ላይ',
    processing: 'በሂደት ላይ',
    completed: 'የተጠናቀቁ',
    revenue: 'ገቢ (ብር)'
  },
  actions: {
    contact: 'ገዢውን ያግኙ',
    invoice: 'ኢንቮይስ',
    details: 'ዝርዝሮች',
    updateStatus: 'ሁኔታ አዘምን',
    manageOxen: 'በሬዎችዎን ያስተዳድሩ'
  },
  empty: {
    title: 'ምንም ትዕዛዞች አልተገኙም',
    noStatus: 'እስካሁን {status} ትዕዛዞችን አልተቀበሉም',
    noOrders: 'እስካሁን ምንም ትዕዛዞችን አልተቀበሉም'
  },
  modal: {
    details: 'የትዕዛዝ ዝርዝሮች',
    orderStatus: 'የትዕዛዝ ሁኔታ',
    paymentStatus: 'የክፍያ ሁኔታ',
    buyerInfo: 'የገዢ መረጃ',
    itemsOrdered: 'የታዘዙ እቃዎች',
    paymentInfo: 'የክፍያ መረጃ',
    deliveryInfo: 'የአቅርቦት መረጃ',
    updateTitle: 'የትዕዛዝ ሁኔታ አዘምን',
    newStatus: 'አዲስ ሁኔታ',
    addNote: 'ማስታወሻ ጨምር (አማራጭ)',
    notePlaceholder: 'ስለዚህ ትዕዛዝ ማስታወሻዎችን ያስገቡ...'
  },
  messages: {
    loadError: 'ትዕዛዞችን መጫን አልተሳካም',
    updateSuccess: 'ትዕዛዝ #{id} ወደ {status} ተዘምኗል',
    updateError: 'ትዕዛዝን ማዘመን አልተሳካም',
    printInvoice: 'ኢንቮይስ በማተም ላይ...'
  }
,
      status: {
        pending: 'በመጠባበቅ ላይ',
        confirmed: 'ተረጋግጧል',
        processing: 'በሂደት ላይ',
        shipped: 'ተልኳል',
        delivered: 'ደርሷል',
        cancelled: 'ተሰርዟል'
      }
    },
    defaultUser: 'ብርሃነ አራያ',
    defaultRole: 'የግብይት አስተዳዳሪ',
    defaultTitle: 'ዳሽቦርድ',
    goBack: 'ተመለስ',
    notifications: 'ማሳወቂያዎች',
    messages: 'መልዕክቶች',
    bire: 'ብር',
    userMenu: 'የተጠቃሚ ምናሌ',
    userAvatar: 'የተጠቃሚ ፎቶ',
    profile: 'መገለጫ',
    settings: 'ቅንብሮች',
    logout: 'ውጣ',
    closeMenu: 'ምናሌ ዝጋ',
    language: {
      en: 'እንግሊዝኛ',
      am: 'አማርኛ'
    },
    common: {
      loading: 'በመጫን ላይ...',
      refresh: 'አድስ',
      confirm: 'አረጋግጥ',
      cancel: 'ሰርዝ',
      save: 'አስቀምጥ',
      delete: 'ሰርዝ',
      edit: 'አርትዕ',
      view: 'ተመልከት',
      back: 'ተመለስ',
      saving: 'በማስቀመጥ ላይ...'
    },
    oxen: {
      title: 'የእኔ በሬዎች',
      subtitle: 'የእንስሳት ዝርዝሮችዎን ያስተዳድሩ',
      currency: 'ብር',
      loading: 'ዝርዝሮችዎን በመጫን ላይ...',
      addedDate: 'የተጨመረበት ቀን',
      filters: {
        searchPlaceholder: 'በስም ወይም በዘር ይፈልጉ...',
        allStatus: 'ሁሉም ሁኔታ'
      },
      status: {
        active: 'ንቁ',
        sold: 'የተሸጠ',
        draft: 'ረቂቅ',
        pending: 'በመጠባበቅ ላይ',
        inactive: 'ንቁ ያልሆነ'
      },
      stats: {
        views: 'ትይታዎች',
        inquiries: 'ጥያቄዎች',
        price: 'ዋጋ'
      },
      actions: {
        add: 'አዲስ በሬ ጨምር',
        addFirst: 'የመጀመሪያ በሬዎን ይጨምሩ',
        view: 'ተመልከት',
        edit: 'አርትዕ',
        delete: 'ሰርዝ'
      },
      empty: {
        title: 'ምንም በሬ አልተገኘም',
        adjustFilters: 'እባክዎ ማጣሪያዎችዎን ያስተካክሉ',
        noListings: 'እስካሁን ምንም ዝርዝሮችን አልጨመሩም'
      },
      messages: {
        loadError: 'ዝርዝሮችዎን መጫን አልተሳካም',
        deleteConfirm: 'ይህን ዝርዝር መሰረዝ መሆኑን እርግጠኛ ነዎት?',
        deleteSuccess: 'በሬ በተሳካ ሁኔታ ተሰርዟል',
        deleteError: 'በሬን መሰረዝ አልተሳካም'
      },
      breeds: {
        borana: 'ቦራና',
        sahiwal: 'ሳሂዋል',
        ogaden: 'ኦጋዴን',
        horro: 'ሆሮ',
        fogera: 'ፎገራ',
        sheko: 'ሸኮ',
        other: 'ሌላ'
      },
      locations: {
        oromia: 'ኦሮሚያ',
        somali: 'ሶማሌ',
        amhara: 'አማራ',
        tigray: 'ትግራይ',
        sidama: 'ሲዳማ',
        snnpr: 'ደቡብ',
        other: 'ሌላ'
      },
      bodyConditions: {
        excellent: 'እጅግ በጣም ጥሩ',
        good: 'ጥሩ',
        average: 'መካከለኛ',
        fair: 'አጥጋቢ'
      },
      form: {
        addTitle: 'አዲስ በሬ ጨምር',
        addSubtitle: 'አዲስ በሬ ለሽያጭ ይዘርዝሩ',
        editTitle: 'በሬ አርትዕ',
        editSubtitle: 'የበሬ ዝርዝርዎን ያዘምኑ',
        addButton: 'በሬ ዝርዝር',
        updateButton: 'አዘምን',
        sections: {
          basic: 'መሠረታዊ መረጃ',
          health: 'የጤና መረጃ',
          description: 'ገለጻ',
          images: 'ምስሎች'
        },
        fields: {
          name: 'ስም',
          breed: 'ዘር',
          age: 'ዕድሜ',
          weight: 'ክብደት',
          height: 'ቁመት',
          color: 'ቀለም',
          price: 'ዋጋ (ብር)',
          bodyCondition: 'የሰውነት ሁኔታ',
          location: 'አካባቢ'
        },
        placeholders: {
          name: 'የበሬ ስም ያስገቡ',
          age: 'ለምሳሌ፡ 3 ዓመት',
          weight: 'ለምሳሌ፡ 450 ኪሎ',
          height: 'ለምሳሌ፡ 145 ሳ.ሜ',
          color: 'ለምሳሌ፡ ቡኒ ከነጭ ነጠብጣብ',
          price: 'ዋጋ በብር ያስገቡ',
          description: 'በሬዎን በዝርዝር ይግለጹ...'
        },
        selectPlaceholder: 'አማራጭ ይምረጡ',
        health: {
          healthCertified: 'የጤና ማረጋገጫ ያለው',
          vaccinated: 'ክትባት የተሰጠው',
          dewormed: 'ትል የተገደለለት'
        },
        images: {
          uploadText: 'ምስሎችን ለመጫን ጠቅ ያድርጉ',
          uploadHint: 'ፒኤንጂ፣ ጄፒጂ እስከ 5ሜባ',
          previewAlt: 'ቅድመ እይታ ምስል'
        },
        validation: {
          required: 'እባክዎ ሁሉንም አስፈላጊ መስኮች ይሙሉ።'
        }
      }
    }
  }
};

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'en',
  fallbackLocale: 'en',
  messages,
});

export default i18n;