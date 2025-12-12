import { MongoClient, Db, Collection, ObjectId } from "mongodb";
import { 
  type Property, type InsertProperty,
  type User, type InsertUser,
  type ContactMessage, type InsertContactMessage,
  type Testimonial, type InsertTestimonial,
  type PropertySearch
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Property methods
  getAllProperties(): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  getPropertyByCode(code: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<boolean>;
  searchProperties(search: PropertySearch): Promise<Property[]>;
  getFeaturedProperties(limit?: number): Promise<Property[]>;
  
  // Contact methods
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getAllContactMessages(): Promise<ContactMessage[]>;
  getContactMessage(id: string): Promise<ContactMessage | undefined>;
  markContactMessageAsRead(id: string): Promise<boolean>;
  
  // Testimonial methods
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  getApprovedTestimonials(): Promise<Testimonial[]>;
  getAllTestimonials(): Promise<Testimonial[]>;
  approveTestimonial(id: string): Promise<boolean>;
}

export class MongoStorage implements IStorage {
  private client: MongoClient;
  private db: Db | null = null;
  private usersCollection: Collection<User> | null = null;
  private propertiesCollection: Collection<Property> | null = null;
  private contactMessagesCollection: Collection<ContactMessage> | null = null;
  private testimonialsCollection: Collection<Testimonial> | null = null;
  private initialized = false;

  constructor(uri: string) {
    this.client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.client.connect();
      this.db = this.client.db("real_estate");
      
      this.usersCollection = this.db.collection<User>("users");
      this.propertiesCollection = this.db.collection<Property>("properties");
      this.contactMessagesCollection = this.db.collection<ContactMessage>("contact_messages");
      this.testimonialsCollection = this.db.collection<Testimonial>("testimonials");

      // Create indexes for better performance
      await this.usersCollection.createIndex({ username: 1 }, { unique: true });
      await this.usersCollection.createIndex({ email: 1 }, { unique: true });
      await this.propertiesCollection.createIndex({ propertyCode: 1 }, { unique: true });
      await this.propertiesCollection.createIndex({ city: 1, neighborhood: 1 });
      await this.propertiesCollection.createIndex({ type: 1 });
      await this.propertiesCollection.createIndex({ price: 1 });
      await this.propertiesCollection.createIndex({ size: 1 });

      // Initialize with default data if collections are empty
      const userCount = await this.usersCollection.countDocuments();
      if (userCount === 0) {
        await this.seedData();
      }

      this.initialized = true;
      console.log("✅ MongoDB connected successfully");
    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      throw error;
    }
  }

  private async seedData(): Promise<void> {
    // Create default admin user
    await this.createUser({
      username: "aqarpanel",
      password: "Mm345",
      name: "مدير النظام",
      role: "admin",
      email: "admin@altakhim.com",
      phone: "+966500000000"
    });

    // Sample properties
    const sampleProperties: InsertProperty[] = [
      {
        title: "فيلا فاخرة مع مسبح",
        description: "فيلا فخمة تتميز بتصميم عصري وإطلالة رائعة على المدينة. تحتوي على مسبح خاص وحديقة واسعة.",
        type: "villa",
        price: 2800000,
        currency: "SAR",
        isRental: false,
        city: "الرياض",
        area: "شمال الرياض",
        neighborhood: "حي الملقا",
        address: "شارع العليا، حي الملقا، الرياض",
        bedrooms: 5,
        bathrooms: 4,
        size: 450,
        features: ["مسبح", "حديقة", "مطبخ مفتوح", "موقف سيارات", "غرفة خادمة"],
        images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80"],
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
        area: "شمال جدة",
        neighborhood: "حي الشاطئ",
        address: "كورنيش جدة، حي الشاطئ",
        bedrooms: 3,
        bathrooms: 2,
        size: 180,
        features: ["إطلالة بحرية", "مكيفات مركزية", "مطبخ حديث", "بلكونة"],
        images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80"],
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
        area: "الدمام الغربية",
        neighborhood: "حي الشاطئ الغربي",
        address: "حي الشاطئ الغربي، الدمام",
        size: 750,
        features: ["شارع 20م", "مستوية", "منطقة خدمات متكاملة"],
        images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80"],
        status: "available",
        propertyCode: "SA-12347"
      }
    ];

    for (const property of sampleProperties) {
      await this.createProperty(property);
    }

    // Sample testimonials
    const sampleTestimonials: InsertTestimonial[] = [
      {
        name: "محمد السعيد",
        location: "الرياض",
        message: "كانت تجربتي مع الطخيم العالمية ممتازة، ساعدوني في العثور على المنزل المناسب لعائلتي بسعر مناسب وخدمة احترافية.",
        rating: 5
      },
      {
        name: "سارة الأحمدي",
        location: "جدة",
        message: "استثمرت في عقار بمساعدة فريق الطخيم العالمية، وقدموا لي استشارات قيمة ساعدتني في اتخاذ قرار استثماري صائب.",
        rating: 4
      }
    ];

    for (const testimonial of sampleTestimonials) {
      const created = await this.createTestimonial(testimonial);
      await this.approveTestimonial(created._id!.toString());
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    if (!this.usersCollection) throw new Error("Database not initialized");
    const user = await this.usersCollection.findOne({ _id: new ObjectId(id) } as any);
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!this.usersCollection) throw new Error("Database not initialized");
    const user = await this.usersCollection.findOne({ username });
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!this.usersCollection) throw new Error("Database not initialized");
    const user: User = { 
      ...insertUser, 
      createdAt: new Date()
    };
    const result = await this.usersCollection.insertOne(user as any);
    return { ...user, _id: result.insertedId.toString() };
  }
  
  // Property methods
  async getAllProperties(): Promise<Property[]> {
    if (!this.propertiesCollection) throw new Error("Database not initialized");
    return await this.propertiesCollection.find().sort({ createdAt: -1 }).toArray();
  }
  
  async getProperty(id: string): Promise<Property | undefined> {
    if (!this.propertiesCollection) throw new Error("Database not initialized");
    const property = await this.propertiesCollection.findOne({ _id: new ObjectId(id) } as any);
    return property || undefined;
  }
  
  async getPropertyByCode(code: string): Promise<Property | undefined> {
    if (!this.propertiesCollection) throw new Error("Database not initialized");
    const property = await this.propertiesCollection.findOne({ propertyCode: code });
    return property || undefined;
  }
  
  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    if (!this.propertiesCollection) throw new Error("Database not initialized");
    const property: Property = {
      ...insertProperty,
      createdAt: new Date()
    };
    const result = await this.propertiesCollection.insertOne(property as any);
    return { ...property, _id: result.insertedId.toString() };
  }
  
  async updateProperty(id: string, updateData: Partial<InsertProperty>): Promise<Property | undefined> {
    if (!this.propertiesCollection) throw new Error("Database not initialized");
    const result = await this.propertiesCollection.findOneAndUpdate(
      { _id: new ObjectId(id) } as any,
      { $set: updateData },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }
  
  async deleteProperty(id: string): Promise<boolean> {
    if (!this.propertiesCollection) throw new Error("Database not initialized");
    const result = await this.propertiesCollection.deleteOne({ _id: new ObjectId(id) } as any);
    return result.deletedCount > 0;
  }
  
  async searchProperties(search: PropertySearch): Promise<Property[]> {
    if (!this.propertiesCollection) throw new Error("Database not initialized");
    
    const filter: any = {};
    
    if (search.city) filter.city = search.city;
    if (search.area) filter.area = search.area;
    if (search.neighborhood) filter.neighborhood = search.neighborhood;
    if (search.type) filter.type = search.type;
    if (search.isRental !== undefined) filter.isRental = search.isRental;
    
    if (search.minPrice !== undefined || search.maxPrice !== undefined) {
      filter.price = {};
      if (search.minPrice !== undefined) filter.price.$gte = search.minPrice;
      if (search.maxPrice !== undefined) filter.price.$lte = search.maxPrice;
    }
    
    if (search.minSize !== undefined || search.maxSize !== undefined) {
      filter.size = {};
      if (search.minSize !== undefined) filter.size.$gte = search.minSize;
      if (search.maxSize !== undefined) filter.size.$lte = search.maxSize;
    }
    
    if (search.bedrooms) {
      filter.bedrooms = { $gte: search.bedrooms };
    }
    
    return await this.propertiesCollection.find(filter).sort({ createdAt: -1 }).toArray();
  }
  
  async getFeaturedProperties(limit: number = 6): Promise<Property[]> {
    if (!this.propertiesCollection) throw new Error("Database not initialized");
    return await this.propertiesCollection.find({ status: "available" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }
  
  // Contact methods
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    if (!this.contactMessagesCollection) throw new Error("Database not initialized");
    const contactMessage: ContactMessage = {
      ...message,
      createdAt: new Date(),
      isRead: false
    };
    const result = await this.contactMessagesCollection.insertOne(contactMessage as any);
    return { ...contactMessage, _id: result.insertedId.toString() };
  }
  
  async getAllContactMessages(): Promise<ContactMessage[]> {
    if (!this.contactMessagesCollection) throw new Error("Database not initialized");
    return await this.contactMessagesCollection.find().sort({ createdAt: -1 }).toArray();
  }
  
  async getContactMessage(id: string): Promise<ContactMessage | undefined> {
    if (!this.contactMessagesCollection) throw new Error("Database not initialized");
    const message = await this.contactMessagesCollection.findOne({ _id: new ObjectId(id) } as any);
    return message || undefined;
  }
  
  async markContactMessageAsRead(id: string): Promise<boolean> {
    if (!this.contactMessagesCollection) throw new Error("Database not initialized");
    const result = await this.contactMessagesCollection.updateOne(
      { _id: new ObjectId(id) } as any,
      { $set: { isRead: true } }
    );
    return result.modifiedCount > 0;
  }
  
  // Testimonial methods
  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    if (!this.testimonialsCollection) throw new Error("Database not initialized");
    const newTestimonial: Testimonial = {
      ...testimonial,
      createdAt: new Date(),
      isApproved: false
    };
    const result = await this.testimonialsCollection.insertOne(newTestimonial as any);
    return { ...newTestimonial, _id: result.insertedId.toString() };
  }
  
  async getApprovedTestimonials(): Promise<Testimonial[]> {
    if (!this.testimonialsCollection) throw new Error("Database not initialized");
    return await this.testimonialsCollection.find({ isApproved: true }).toArray();
  }
  
  async getAllTestimonials(): Promise<Testimonial[]> {
    if (!this.testimonialsCollection) throw new Error("Database not initialized");
    return await this.testimonialsCollection.find().sort({ createdAt: -1 }).toArray();
  }
  
  async approveTestimonial(id: string): Promise<boolean> {
    if (!this.testimonialsCollection) throw new Error("Database not initialized");
    const result = await this.testimonialsCollection.updateOne(
      { _id: new ObjectId(id) } as any,
      { $set: { isApproved: true } }
    );
    return result.modifiedCount > 0;
  }
}

// Create and export the storage instance
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error("MONGODB_URI environment variable is not set");
}

export const storage = new MongoStorage(mongoUri);
