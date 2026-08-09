import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.products.list.path, async (req, res) => {
    try {
      const prods = await storage.getProducts();
      res.json(prods);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.gallery.list.path, async (req, res) => {
    try {
      const images = await storage.getGalleryImages();
      res.json(images);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed data function
  async function seedDatabase() {
    try {
      const existingProducts = await storage.getProducts();
      if (existingProducts.length === 0) {
        // Row 1
        await storage.createProduct({ name: "Butterscotch Cake", description: "Smooth butterscotch flavored sponge with crunchy praline topping and creamy frosting.", imageUrl: "Butterscotch-og-cake.jpeg", category: "Butterscotch Cake" });
        await storage.createProduct({ name: "Truffle Cake", description: "Ultimate chocolate indulgence with premium dark chocolate ganache and truffle finish.", imageUrl: "Truffle_Cake.jpeg", category: "Truffle Cake" });
        await storage.createProduct({ name: "Strawberry Cake", description: "Fresh strawberry sponge cake with real strawberry compote and whipped cream.", imageUrl: "Strawberry Cake.jpeg", category: "Strawberry Cake" });
        await storage.createProduct({ name: "Cupcakes", description: "Soft eggless cupcakes in 6 flavors: Chocolate, Vanilla, and Strawberry Frostings. Perfect for parties!", imageUrl: "cup-cake2.jpeg", category: "Cupcake" });
        // Row 2
        await storage.createProduct({ name: "Vanilla Cake", description: "Classic soft and fluffy eggless vanilla sponge with rich cream frosting.", imageUrl: "Vanilla-Cake.jpeg", category: "Vanilla Cake" });
        await storage.createProduct({ name: "Chocolate Cake", description: "Decadent eggless chocolate cake with layers of rich chocolate ganache.", imageUrl: "Chocolate_Cake.png", category: "Chocolate Cake" });
        await storage.createProduct({ name: "Rasmalai Cake", description: "Unique fusion cake inspired by the classic Rasmalai, topped with pistachios and saffron cream.", imageUrl: "Rasmalai-Cake.jpeg", category: "Rasmalai Cake" });
        await storage.createProduct({ name: "Black Forest Cake", description: "Layers of chocolate sponge, cherry filling, whipped cream, and chocolate shavings.", imageUrl: "Black-forest-Cake.jpeg", category: "Black Forest Cake" });
        // Row 3 - Specialty
        await storage.createProduct({ name: "Glass Cake", description: "Elegant layered cake served in a glass — a beautiful and delicious treat.", imageUrl: "Glass-Cake.jpeg", category: "Specialty" });
        await storage.createProduct({ name: "Candy Bites", description: "Irresistible chocolate candy bites — perfect for gifting and snacking.", imageUrl: "Chocolate Candy Bites.jpeg", category: "Specialty" });
        await storage.createProduct({ name: "Muffins", description: "Soft and fluffy eggless muffins bursting with real mango flavor.", imageUrl: "Muffins.jpg", category: "Specialty" });
      }

      const existingGallery = await storage.getGalleryImages();
      if (existingGallery.length === 0) {
        await storage.createGalleryImage({ imageUrl: "ButterScotch-cake (2).jpeg", altText: "Chocolate Drip Cake" });
        await storage.createGalleryImage({ imageUrl: "Chocolate_Muffins.png", altText: "Chocolate Chip Muffins" });
        await storage.createGalleryImage({ imageUrl: "Birthday_Cake.png", altText: "Birthday Cake Celebration" });
        await storage.createGalleryImage({ imageUrl: "Rasmalai_Cake.png", altText: "Rasmalai Cake" });
        await storage.createGalleryImage({ imageUrl: "Oreo_Cake.png", altText: "Oreo Birthday Cake" });
        await storage.createGalleryImage({ imageUrl: "Jar_Cake.png", altText: "Glass Cake" });
        await storage.createGalleryImage({ imageUrl: "Strawberry_Jar_Cake.png", altText: "Strawberry Jar Cake" });
        await storage.createGalleryImage({ imageUrl: "Candy_Lollipop.png", altText: "Candy Bites" });
        await storage.createGalleryImage({ imageUrl: "Black_Forest_Cake.png", altText: "Black Forest Cake" });
        await storage.createGalleryImage({ imageUrl: "Truffle_Cake.png", altText: "Truffle Cake" });
        await storage.createGalleryImage({ imageUrl: "Butterscotch_Cake.png", altText: "Butterscotch Cake" });
      }
    } catch (e) {
      console.error("Failed to seed database:", e);
    }
  }

  // Seed on startup
  seedDatabase();

  return httpServer;
}