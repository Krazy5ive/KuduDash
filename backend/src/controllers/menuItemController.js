const MenuItem = require("../models/MenuItem");

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getMenuItems = async (req, res) => {
  try {
    const query = {};
    if (req.query.vendor) query.vendor = req.query.vendor;

    const status = req.query.status;
    if (status === "all") {
      // return every menu item for the vendor or across vendors
    } else if (status) {
      query.approvalStatus = status;
      if (status === "approved") {
        query.isAvailable = true;
      }
    } else {
      query.$or = [{ approvalStatus: "approved" }, { approvalStatus: { $exists: false } }];
      query.isAvailable = true;
    }

    const items = await MenuItem.find(query).populate("vendor", "businessName");
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createMenuItem = async (req, res) => {
  try {
    const { vendor, name } = req.body;

    const duplicate = await MenuItem.findOne({
      vendor,
      name: { $regex: new RegExp(`^${escapeRegex(name.trim())}$`, "i") },
    });

    if (duplicate) {
      return res.status(409).json({ message: `A menu item called "${name}" already exists` });
    }

    const item = new MenuItem(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "A menu item with that name already exists" });
    }
    res.status(400).json({ message: err.message });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const { name } = req.body;

    if (name) {
      // Fetch the existing item to reliably get the vendor,
      // in case vendor is not included in the update payload
      const existing = await MenuItem.findById(req.params.id);
      if (!existing) return res.status(404).json({ message: "Menu item not found" });

      const duplicate = await MenuItem.findOne({
        _id: { $ne: req.params.id },
        vendor: existing.vendor,
        name: { $regex: new RegExp(`^${escapeRegex(name.trim())}$`, "i") },
      });

      if (duplicate) {
        return res.status(409).json({ message: `A menu item called "${name}" already exists` });
      }
    }

    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: "Menu item not found" });
    res.json(item);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "A menu item with that name already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });
    res.json({ message: "Menu item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const setMenuItemApproval = async (req, res) => {
  try {
    const { approvalStatus, approvalReason } = req.body;

    if (!["approved", "rejected"].includes(approvalStatus)) {
      return res.status(400).json({ message: "Approval status must be 'approved' or 'rejected'" });
    }

    if (approvalStatus === "rejected" && !approvalReason?.trim()) {
      return res.status(400).json({ message: "Approval reason is required for rejected items" });
    }

    const update = {
      approvalStatus,
      approvalReason: approvalStatus === "rejected" ? approvalReason.trim() : "",
      approvedAt: new Date(),
      approvedBy: req.admin?._id,
    };

    const item = await MenuItem.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!item) return res.status(404).json({ message: "Menu item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMenuItems, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem, setMenuItemApproval };