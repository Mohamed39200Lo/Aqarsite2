import { 
  properties, type Property, type InsertProperty,
  users, type User, type InsertUser,
  contactMessages, type ContactMessage, type InsertContactMessage,
  testimonials, type Testimonial, type InsertTestimonial,
  PropertySearch
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Property methods
  getAllProperties(): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  getPropertyByCode(code: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;
  searchProperties(search: PropertySearch): Promise<Property[]>;
  getFeaturedProperties(limit?: number): Promise<Property[]>;
  
  // Contact methods
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getAllContactMessages(): Promise<ContactMessage[]>;
  getContactMessage(id: number): Promise<ContactMessage | undefined>;
  markContactMessageAsRead(id: number): Promise<boolean>;
  
  // Testimonial methods
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  getApprovedTestimonials(): Promise<Testimonial[]>;
  getAllTestimonials(): Promise<Testimonial[]>;
  approveTestimonial(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private contactMessages: Map<number, ContactMessage>;
  private testimonials: Map<number, Testimonial>;
  
  private userId: number;
  private propertyId: number;
  private messageId: number;
  private testimonialId: number;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.contactMessages = new Map();
    this.testimonials = new Map();
    
    this.userId = 1;
    this.propertyId = 1;
    this.messageId = 1;
    this.testimonialId = 1;
    
    // Add default admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      name: "مدير النظام",
      role: "admin",
      email: "admin@aldar.com",
      phone: "+966500000000"
    });
    
    // Add sample properties
    this.seedProperties();
    
    // Add sample testimonials
    this.seedTestimonials();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  // Property methods
  async getAllProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }
  
  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }
  
  async getPropertyByCode(code: string): Promise<Property | undefined> {
    return Array.from(this.properties.values()).find(
      (property) => property.propertyCode === code
    );
  }
  
  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.propertyId++;
    const property: Property = {
      ...insertProperty,
      id,
      createdAt: new Date()
    };
    this.properties.set(id, property);
    return property;
  }
  
  async updateProperty(id: number, updateData: Partial<InsertProperty>): Promise<Property | undefined> {
    const property = this.properties.get(id);
    if (!property) return undefined;
    
    const updatedProperty: Property = {
      ...property,
      ...updateData
    };
    
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }
  
  async deleteProperty(id: number): Promise<boolean> {
    return this.properties.delete(id);
  }
  
  async searchProperties(search: PropertySearch): Promise<Property[]> {
    let filtered = Array.from(this.properties.values());
    
    if (search.city) {
      filtered = filtered.filter(p => p.city === search.city);
    }
    
    if (search.type) {
      filtered = filtered.filter(p => p.type === search.type);
    }
    
    if (search.isRental !== undefined) {
      filtered = filtered.filter(p => p.isRental === search.isRental);
    }
    
    if (search.priceRange) {
      const [min, max] = search.priceRange.split('-').map(Number);
      if (min && !max) {
        // More than min
        filtered = filtered.filter(p => p.price >= min);
      } else if (!min && max) {
        // Less than max
        filtered = filtered.filter(p => p.price <= max);
      } else if (min && max) {
        // Between min and max
        filtered = filtered.filter(p => p.price >= min && p.price <= max);
      }
    }
    
    if (search.bedrooms) {
      filtered = filtered.filter(p => p.bedrooms && p.bedrooms >= search.bedrooms);
    }
    
    if (search.area) {
      filtered = filtered.filter(p => p.area >= search.area);
    }
    
    return filtered;
  }
  
  async getFeaturedProperties(limit: number = 6): Promise<Property[]> {
    const allProperties = Array.from(this.properties.values());
    const shuffled = [...allProperties].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }
  
  // Contact methods
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const id = this.messageId++;
    const contactMessage: ContactMessage = {
      ...message,
      id,
      createdAt: new Date(),
      isRead: false
    };
    this.contactMessages.set(id, contactMessage);
    return contactMessage;
  }
  
  async getAllContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values());
  }
  
  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    return this.contactMessages.get(id);
  }
  
  async markContactMessageAsRead(id: number): Promise<boolean> {
    const message = this.contactMessages.get(id);
    if (!message) return false;
    
    message.isRead = true;
    this.contactMessages.set(id, message);
    return true;
  }
  
  // Testimonial methods
  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialId++;
    const newTestimonial: Testimonial = {
      ...testimonial,
      id,
      createdAt: new Date(),
      isApproved: false
    };
    this.testimonials.set(id, newTestimonial);
    return newTestimonial;
  }
  
  async getApprovedTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values()).filter(t => t.isApproved);
  }
  
  async getAllTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }
  
  async approveTestimonial(id: number): Promise<boolean> {
    const testimonial = this.testimonials.get(id);
    if (!testimonial) return false;
    
    testimonial.isApproved = true;
    this.testimonials.set(id, testimonial);
    return true;
  }
  
  // Helper methods to seed initial data
  private seedProperties() {
    const sampleProperties: InsertProperty[] = [
      {
        title: "فيلا فاخرة مع مسبح",
        description: "فيلا فخمة تتميز بتصميم عصري وإطلالة رائعة على المدينة. تحتوي على مسبح خاص وحديقة واسعة.",
        type: "villa",
        price: 2800000,
        currency: "SAR",
        isRental: false,
        city: "الرياض",
        neighborhood: "حي الملقا",
        address: "شارع العليا، حي الملقا، الرياض",
        bedrooms: 5,
        bathrooms: 4,
        area: 450,
        features: ["مسبح", "حديقة", "مطبخ مفتوح", "موقف سيارات", "غرفة خادمة"],
        images: [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80"
        ],
        status: "available",
        propertyCode: "SA-12345"
      },
      {
        title: "شقة فاخرة بإطلالة بحرية",
        description: "شقة حديثة مع إطلالة بانورامية على البحر. تقع في أفضل أحياء جدة وتتميز بالتشطيبات الراقية.",
        type: "apartment",
        price: 85000,
        currency: "SAR",
        isRental: true,
        rentalPeriod: "yearly",
        city: "جدة",
        neighborhood: "حي الشاطئ",
        address: "كورنيش جدة، حي الشاطئ",
        bedrooms: 3,
        bathrooms: 2,
        area: 180,
        features: ["إطلالة بحرية", "مكيفات مركزية", "مطبخ حديث", "بلكونة"],
        images: [
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80"
        ],
        status: "available",
        propertyCode: "SA-12346"
      },
      {
        title: "أرض سكنية استثمارية",
        description: "أرض سكنية استثمارية في موقع استراتيجي بالدمام، مناسبة لبناء فلل أو مجمع سكني.",
        type: "land",
        price: 1200000,
        currency: "SAR",
        isRental: false,
        city: "الدمام",
        neighborhood: "حي الشاطئ الغربي",
        address: "حي الشاطئ الغربي، الدمام",
        area: 750,
        features: ["شارع 20م", "مستوية", "منطقة خدمات متكاملة"],
        images: [
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80"
        ],
        status: "available",
        propertyCode: "SA-12347"
      },
      {
        title: "فيلا عصرية بتصميم فريد",
        description: "فيلا عصرية بتصميم معماري فريد، تتميز بالمساحات الواسعة والإضاءة الطبيعية الوفيرة.",
        type: "villa",
        price: 3500000,
        currency: "SAR",
        isRental: false,
        city: "الخبر",
        neighborhood: "حي اليرموك",
        address: "شارع الأمير سلطان، حي اليرموك، الخبر",
        bedrooms: 6,
        bathrooms: 5,
        area: 520,
        features: ["حمام سباحة", "مصعد داخلي", "نظام أمان متطور", "حديقة خلفية"],
        images: [
          "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80"
        ],
        status: "available",
        propertyCode: "SA-12348"
      },
      {
        title: "شقة قريبة من الحرم",
        description: "شقة فاخرة على بعد دقائق من الحرم المكي، مؤثثة بالكامل ومجهزة بأحدث التقنيات.",
        type: "apartment",
        price: 95000,
        currency: "SAR",
        isRental: true,
        rentalPeriod: "yearly",
        city: "مكة المكرمة",
        neighborhood: "العزيزية",
        address: "حي العزيزية، مكة المكرمة",
        bedrooms: 3,
        bathrooms: 2,
        area: 160,
        features: ["قريبة من الحرم", "أثاث كامل", "تكييف مركزي", "مطبخ مجهز"],
        images: [
          "https://images.unsplash.com/photo-1592595896616-c37162298647?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80"
        ],
        status: "available",
        propertyCode: "SA-12349"
      },
      {
        title: "عمارة استثمارية",
        description: "عمارة استثمارية في موقع حيوي بالمدينة المنورة، مكونة من 12 شقة و4 محلات تجارية.",
        type: "commercial",
        price: 4500000,
        currency: "SAR",
        isRental: false,
        city: "المدينة المنورة",
        neighborhood: "المنطقة المركزية",
        address: "المنطقة المركزية، بالقرب من الحرم النبوي",
        area: 800,
        features: ["12 شقة", "4 محلات تجارية", "مصعد", "مواقف سيارات"],
        images: [
          "https://images.unsplash.com/photo-1546213290-e1b492ab3eee?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80"
        ],
        status: "available",
        propertyCode: "SA-12350"
      }
    ];
    
    sampleProperties.forEach(property => {
      this.createProperty(property);
    });
  }
  
  private seedTestimonials() {
    const sampleTestimonials: InsertTestimonial[] = [
      {
        name: "محمد السعيد",
        location: "الرياض",
        message: "كانت تجربتي مع الدار العقارية ممتازة، ساعدوني في العثور على المنزل المناسب لعائلتي بسعر مناسب وخدمة احترافية.",
        rating: 5
      },
      {
        name: "سارة الأحمدي",
        location: "جدة",
        message: "استثمرت في عقار بمساعدة فريق الدار العقارية، وقدموا لي استشارات قيمة ساعدتني في اتخاذ قرار استثماري صائب.",
        rating: 4
      },
      {
        name: "عبدالله الشمري",
        location: "الدمام",
        message: "أشكر فريق الدار العقارية على احترافيتهم في إدارة عقاراتي وتسهيل عملية تأجيرها وصيانتها دون أي متاعب.",
        rating: 5
      }
    ];
    
    sampleTestimonials.forEach(async testimonial => {
      const newTestimonial = await this.createTestimonial(testimonial);
      // Approve all sample testimonials
      this.approveTestimonial(newTestimonial.id);
    });
  }
}

// Create and export the appropriate storage implementation
// If DATABASE_URL is available, use PostgreSQL storage (would need to be implemented)
// Otherwise, fall back to in-memory storage
export const storage = new MemStorage();
