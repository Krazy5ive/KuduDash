const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  setMenuItemApproval,
} = require("../controllers/menuItemController");

const MenuItem = require("../models/MenuItem");

// Mock the MenuItem model
jest.mock("../models/MenuItem");

// Helper to mock res object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("MenuItem Controller", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {};
    res = mockResponse();
    jest.clearAllMocks();
  });

  /* =======================
     getMenuItems
  ======================= */
  describe("getMenuItems", () => {
    it("returns available approved menu items for a vendor", async () => {
      req.query = { vendor: "vendor123" };
      const items = [{ name: "Burger" }];

      MenuItem.find.mockResolvedValue(items);

      await getMenuItems(req, res);

      expect(MenuItem.find).toHaveBeenCalledWith({
        vendor: "vendor123",
        $or: [{ approvalStatus: "approved" }, { approvalStatus: { $exists: false } }],
        isAvailable: true,
      });
      expect(res.json).toHaveBeenCalledWith(items);
    });

    it("returns all menu items when status is all", async () => {
      req.query = { vendor: "vendor123", status: "all" };
      const items = [{ name: "Burger" }, { name: "Salad" }];

      MenuItem.find.mockResolvedValue(items);

      await getMenuItems(req, res);

      expect(MenuItem.find).toHaveBeenCalledWith({ vendor: "vendor123" });
      expect(res.json).toHaveBeenCalledWith(items);
    });

    it("returns 500 on database error", async () => {
      req.query = { vendor: "vendor123" };
      MenuItem.find.mockRejectedValue(new Error("DB error"));

      await getMenuItems(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  /* =======================
     getMenuItemById
  ======================= */
  describe("getMenuItemById", () => {
    it("returns a menu item when found", async () => {
      req.params = { id: "item123" };
      const item = { name: "Pizza" };

      MenuItem.findById.mockResolvedValue(item);

      await getMenuItemById(req, res);

      expect(res.json).toHaveBeenCalledWith(item);
    });

    it("returns 404 if item not found", async () => {
      req.params = { id: "item123" };

      MenuItem.findById.mockResolvedValue(null);

      await getMenuItemById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Menu item not found",
      });
    });

    it("returns 500 on database error", async () => {
      req.params = { id: "item123" };
      MenuItem.findById.mockRejectedValue(new Error("DB error"));

      await getMenuItemById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  /* =======================
     createMenuItem
  ======================= */
  describe("createMenuItem", () => {
    it("creates a menu item when no duplicate exists", async () => {
      req.body = { vendor: "v1", name: "Burger" };

      MenuItem.findOne.mockResolvedValue(null);
      MenuItem.prototype.save = jest.fn().mockResolvedValue(req.body);

      await createMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("returns 409 if duplicate name exists (case-insensitive)", async () => {
      req.body = { vendor: "v1", name: "Burger" };

      MenuItem.findOne.mockResolvedValue({ name: "burger" });

      await createMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'A menu item called "Burger" already exists',
      });
    });

    it("returns 409 on Mongo duplicate key error", async () => {
      req.body = { vendor: "v1", name: "Burger" };

      MenuItem.findOne.mockResolvedValue(null);
      MenuItem.prototype.save = jest.fn().mockRejectedValue({ code: 11000 });

      await createMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    it("returns 400 on validation error", async () => {
      req.body = { vendor: "v1", name: "Burger" };
      MenuItem.findOne.mockResolvedValue(null);
      MenuItem.prototype.save = jest.fn().mockRejectedValue(
        new Error("Validation error")
      );

      await createMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  /* =======================
     updateMenuItem
  ======================= */
  describe("updateMenuItem", () => {
    it("updates menu item successfully", async () => {
      req.params = { id: "item123" };
      req.body = { name: "Updated Burger" };

      MenuItem.findById.mockResolvedValue({ vendor: "v1" });
      MenuItem.findOne.mockResolvedValue(null);
      MenuItem.findByIdAndUpdate.mockResolvedValue(req.body);

      await updateMenuItem(req, res);

      expect(res.json).toHaveBeenCalledWith(req.body);
    });

    it("returns 404 if item does not exist before update", async () => {
      req.params = { id: "item123" };
      req.body = { name: "Burger" };

      MenuItem.findById.mockResolvedValue(null);

      await updateMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("returns 409 if duplicate name exists", async () => {
      req.params = { id: "item123" };
      req.body = { name: "Burger" };

      MenuItem.findById.mockResolvedValue({ vendor: "v1" });
      MenuItem.findOne.mockResolvedValue({ name: "Burger" });

      await updateMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    // covers line 74 - findByIdAndUpdate returns null when no name in body
    it("returns 404 if item not found during update (no name in body)", async () => {
      req.params = { id: "item123" };
      req.body = { price: 99 }; // no name, skips the findById/duplicate check

      MenuItem.findByIdAndUpdate.mockResolvedValue(null);

      await updateMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Menu item not found" });
    });

    it("returns 500 on database error", async () => {
      req.params = { id: "item123" };
      req.body = { price: 99 }; // no name, goes straight to findByIdAndUpdate
      MenuItem.findByIdAndUpdate.mockRejectedValue(new Error("DB error"));

      await updateMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  /* =======================
     setMenuItemApproval
  ======================= */
  describe("setMenuItemApproval", () => {
    it("approves a menu item", async () => {
      req.params = { id: "item123" };
      req.body = { approvalStatus: "approved" };
      req.admin = { _id: "admin1" };
      const updatedItem = { name: "Burger", approvalStatus: "approved" };
      MenuItem.findByIdAndUpdate.mockResolvedValue(updatedItem);

      await setMenuItemApproval(req, res);

      expect(MenuItem.findByIdAndUpdate).toHaveBeenCalledWith(
        "item123",
        expect.objectContaining({ approvalStatus: "approved", approvedBy: "admin1" }),
        expect.any(Object)
      );
      expect(res.json).toHaveBeenCalledWith(updatedItem);
    });

    it("rejects a menu item with reason", async () => {
      req.params = { id: "item123" };
      req.body = { approvalStatus: "rejected", approvalReason: "Too many allergens" };
      req.admin = { _id: "admin1" };
      const updatedItem = { name: "Burger", approvalStatus: "rejected", approvalReason: "Too many allergens" };
      MenuItem.findByIdAndUpdate.mockResolvedValue(updatedItem);

      await setMenuItemApproval(req, res);

      expect(MenuItem.findByIdAndUpdate).toHaveBeenCalledWith(
        "item123",
        expect.objectContaining({ approvalStatus: "rejected", approvalReason: "Too many allergens" }),
        expect.any(Object)
      );
      expect(res.json).toHaveBeenCalledWith(updatedItem);
    });

    it("returns 400 when rejecting without reason", async () => {
      req.params = { id: "item123" };
      req.body = { approvalStatus: "rejected", approvalReason: "" };
      await setMenuItemApproval(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  /* =======================
     deleteMenuItem
  ======================= */
  describe("deleteMenuItem", () => {
    it("deletes menu item successfully", async () => {
      req.params = { id: "item123" };

      MenuItem.findByIdAndDelete.mockResolvedValue({});

      await deleteMenuItem(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Menu item deleted",
      });
    });

    // fix: req.params must be set so findByIdAndDelete returns null, not throws
    it("returns 404 if item not found", async () => {
      req.params = { id: "item123" };

      MenuItem.findByIdAndDelete.mockResolvedValue(null);

      await deleteMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Menu item not found" });
    });

    it("returns 500 on database error", async () => {
      req.params = { id: "item123" };
      MenuItem.findByIdAndDelete.mockRejectedValue(new Error("DB error"));

      await deleteMenuItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});