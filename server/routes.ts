import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactMessageSchema, insertPropertySchema, insertTestimonialSchema, loginSchema, propertySearchSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import { log } from "./vite";

const Session = MemoryStore(session);

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize MongoDB storage
  await storage.initialize();

  // Trust proxy for Render deployment
  if (process.env.NODE_ENV === "production") {
    app.set('trust proxy', 1);
  }

  // Set up session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || "altakhim-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 86400000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax'
    },
    store: new Session({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));

  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.session && req.session.userId) {
      return next();
    }
    res.status(401).json({ message: "غير مصرح بالدخول" });
  };

  const isAdmin = async (req: Request, res: Response, next: Function) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "غير مصرح بالدخول" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "ليس لديك صلاحية للوصول" });
    }

    next();
  };

  // Authentication routes
  app.post("/api/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(data.username);
      
      if (!user || user.password !== data.password) {
        return res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }
      
      req.session.userId = user._id!.toString();
      res.json({
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الخروج" });
      }
      res.json({ message: "تم تسجيل الخروج بنجاح" });
    });
  });

  app.get("/api/user", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      
      res.json({
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone
      });
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء جلب بيانات المستخدم" });
    }
  });

  // Property routes
  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await storage.getAllProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء جلب العقارات" });
    }
  });

  app.get("/api/properties/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const properties = await storage.getFeaturedProperties(limit);
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء جلب العقارات المميزة" });
    }
  });

  app.get("/api/properties/search", async (req, res) => {
    try {
      const searchParams: Record<string, any> = {};
      
      if (req.query.city) searchParams.city = req.query.city as string;
      if (req.query.area) searchParams.area = req.query.area as string;
      if (req.query.neighborhood) searchParams.neighborhood = req.query.neighborhood as string;
      if (req.query.type) searchParams.type = req.query.type as string;
      if (req.query.minPrice) searchParams.minPrice = parseFloat(req.query.minPrice as string);
      if (req.query.maxPrice) searchParams.maxPrice = parseFloat(req.query.maxPrice as string);
      if (req.query.minSize) searchParams.minSize = parseFloat(req.query.minSize as string);
      if (req.query.maxSize) searchParams.maxSize = parseFloat(req.query.maxSize as string);
      if (req.query.isRental) searchParams.isRental = req.query.isRental === "true";
      if (req.query.bedrooms) searchParams.bedrooms = parseInt(req.query.bedrooms as string);
      
      const search = propertySearchSchema.parse(searchParams);
      const properties = await storage.searchProperties(search);
      res.json(properties);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "حدث خطأ أثناء البحث عن العقارات" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      
      if (!property) {
        return res.status(404).json({ message: "العقار غير موجود" });
      }
      
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء جلب تفاصيل العقار" });
    }
  });

  app.get("/api/properties/code/:code", async (req, res) => {
    try {
      const property = await storage.getPropertyByCode(req.params.code);
      
      if (!property) {
        return res.status(404).json({ message: "العقار غير موجود" });
      }
      
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء جلب تفاصيل العقار" });
    }
  });

  app.post("/api/properties", isAdmin, async (req, res) => {
    try {
      log(`Creating property, user session: ${req.session?.userId}`);
      const propertyData = insertPropertySchema.parse(req.body);
      
      // Generate a unique property code if not provided
      if (!propertyData.propertyCode) {
        propertyData.propertyCode = `SA-${Math.floor(10000 + Math.random() * 90000)}`;
      }
      
      const property = await storage.createProperty(propertyData);
      log(`Property created successfully: ${property._id}`);
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        log(`Property validation error: ${error.errors[0].message}`);
        return res.status(400).json({ message: error.errors[0].message });
      }
      log(`Property creation error: ${(error as Error).message}`);
      res.status(500).json({ message: "حدث خطأ أثناء إنشاء العقار" });
    }
  });

  app.put("/api/properties/:id", isAdmin, async (req, res) => {
    try {
      const propertyData = insertPropertySchema.partial().parse(req.body);
      
      const updated = await storage.updateProperty(req.params.id, propertyData);
      
      if (!updated) {
        return res.status(404).json({ message: "العقار غير موجود" });
      }
      
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "حدث خطأ أثناء تحديث العقار" });
    }
  });

  app.delete("/api/properties/:id", isAdmin, async (req, res) => {
    try {
      const success = await storage.deleteProperty(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: "العقار غير موجود" });
      }
      
      res.json({ message: "تم حذف العقار بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء حذف العقار" });
    }
  });

  // Contact form routes
  app.post("/api/contact", async (req, res) => {
    try {
      const messageData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(messageData);
      res.status(201).json({ message: "تم إرسال رسالتك بنجاح" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "حدث خطأ أثناء إرسال الرسالة" });
    }
  });

  app.get("/api/contact", isAdmin, async (req, res) => {
    try {
      const messages = await storage.getAllContactMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء جلب الرسائل" });
    }
  });

  app.post("/api/contact/:id/read", isAdmin, async (req, res) => {
    try {
      const success = await storage.markContactMessageAsRead(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: "الرسالة غير موجودة" });
      }
      
      res.json({ message: "تم تحديث حالة الرسالة بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء تحديث حالة الرسالة" });
    }
  });

  // Testimonial routes
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getApprovedTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء جلب التقييمات" });
    }
  });

  app.post("/api/testimonials", async (req, res) => {
    try {
      const testimonialData = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(testimonialData);
      res.status(201).json({ message: "تم إرسال التقييم بنجاح، سيتم مراجعته قريباً" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "حدث خطأ أثناء إرسال التقييم" });
    }
  });

  app.get("/api/admin/testimonials", isAdmin, async (req, res) => {
    try {
      const testimonials = await storage.getAllTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء جلب التقييمات" });
    }
  });

  app.post("/api/admin/testimonials/:id/approve", isAdmin, async (req, res) => {
    try {
      const success = await storage.approveTestimonial(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: "التقييم غير موجود" });
      }
      
      res.json({ message: "تم اعتماد التقييم بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء اعتماد التقييم" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
