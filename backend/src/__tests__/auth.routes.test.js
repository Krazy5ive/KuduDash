jest.mock("../models/Student");
jest.mock("../models/Vendor");
jest.mock("../models/Admin");

const Student = require("../models/Student");
const Vendor  = require("../models/Vendor");
const Admin   = require("../models/Admin");

const authRouter = require("../routes/auth.routes");

// Helper to extract route handler from router
function getHandler(path) {
  const route = authRouter.stack.find(
    layer => layer.route && layer.route.path === path
  );
  if (!route) throw new Error(`Route not found: ${path}`);
  return route.route.stack[0].handle;
}

// mock req/res
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

const mockReq = (body = {}) => ({ body });

const baseProfile = {
  sub: "auth0|abc123",
  email: "Test@Example.com",
  given_name: "Jane",
  family_name: "Doe",
  picture: "https://example.com/pic.jpg",
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.ADMIN_SECRET_CODE = "secret123";
});

// tests for sync
describe("POST /sync", () => {

  const handle = getHandler("/sync"); // FIXED: removed () =>

  it("returns existing student", async () => {
    Student.findOne.mockResolvedValue({ _id: "s1", firstName: "Jane", lastName: "Doe" });
    Vendor.findOne.mockResolvedValue(null);
    Admin.findOne.mockResolvedValue(null);

    const res = mockRes();
    await handle(mockReq(baseProfile), res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        isNewUser: false,
        role: "student",
        userId: "s1",
      })
    );
  });

  it("returns new user", async () => {
    Student.findOne.mockResolvedValue(null);
    Vendor.findOne.mockResolvedValue(null);
    Admin.findOne.mockResolvedValue(null);

    const res = mockRes();
    await handle(mockReq(baseProfile), res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        isNewUser: true,
        role: null,
      })
    );
  });

  it("handles DB error", async () => {
    Student.findOne.mockRejectedValue(new Error("DB error"));

    const res = mockRes();
    await handle(mockReq(baseProfile), res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// test for student registration
describe("POST /register/student", () => {

  const handle = getHandler("/register/student"); // FIXED: removed () =>

  it("creates student", async () => {
    Student.findOne.mockResolvedValue(null);
    Student.create.mockResolvedValue({ _id: "s1" });

    const res = mockRes();
    await handle(mockReq(baseProfile), res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("409 if exists", async () => {
    Student.findOne.mockResolvedValue({ _id: "s1" });

    const res = mockRes();
    await handle(mockReq(baseProfile), res);

    expect(res.status).toHaveBeenCalledWith(409);
  });
});

// test for vendor registration
describe("POST /register/vendor", () => {

  const handle = getHandler("/register/vendor"); // FIXED: removed () =>

  it("requires business name", async () => {
    const res = mockRes();
    await handle(mockReq({ ...baseProfile }), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("creates vendor", async () => {
    Vendor.findOne.mockResolvedValue(null);
    Vendor.create.mockResolvedValue({
      _id: "v1",
      status: "pending",
      ownerFirstName: "Jane",
      ownerLastName: "Doe",
    });

    const res = mockRes();
    await handle(
      mockReq({ ...baseProfile, businessName: "Food" }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(201);
  });
});

// test for admin registration
describe("POST /register/admin", () => {

  const handle = getHandler("/register/admin"); // FIXED: removed () =>

  it("rejects wrong code", async () => {
    const res = mockRes();

    await handle(
      mockReq({ ...baseProfile, adminCode: "wrong" }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("creates admin", async () => {
    Admin.findOne.mockResolvedValue(null);
    Admin.create.mockResolvedValue({ _id: "a1" });

    const res = mockRes();

    await handle(
      mockReq({ ...baseProfile, adminCode: "secret123" }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(201);
  });
});

// ── POST /sync (additional branches) ─────────────────────────────────────────

describe("POST /sync (additional branches)", () => {
  const handle = getHandler("/sync");

  it("returns existing vendor with vendor fields", async () => {
    Student.findOne.mockResolvedValue(null);
    Vendor.findOne.mockResolvedValue({
      _id: "v1",
      authProviderId: "auth0|abc123",
      status: "active",
      ownerFirstName: "Jane",
      ownerLastName: "Doe",
    });
    Admin.findOne.mockResolvedValue(null);

    const res = mockRes();
    await handle(mockReq(baseProfile), res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        isNewUser: false,
        role: "vendor",
        vendorStatus: "active",
        ownerFirstName: "Jane",
        ownerLastName: "Doe",
      })
    );
  });

  it("returns existing admin with admin fields", async () => {
    Student.findOne.mockResolvedValue(null);
    Vendor.findOne.mockResolvedValue(null);
    Admin.findOne.mockResolvedValue({
      _id: "a1",
      authProviderId: "auth0|abc123",
      firstName: "Jane",
      lastName: "Doe",
    });

    const res = mockRes();
    await handle(mockReq(baseProfile), res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        isNewUser: false,
        role: "admin",
        firstName: "Jane",
        lastName: "Doe",
      })
    );
  });

  it("backfills authProviderId when matched by email but sub differs", async () => {
    const findByIdAndUpdate = jest.fn().mockResolvedValue({});
    Student.findOne.mockResolvedValue({
      _id: "s1",
      authProviderId: "old|sub",
      firstName: "Jane",
      lastName: "Doe",
    });
    Student.findByIdAndUpdate = findByIdAndUpdate;
    Vendor.findOne.mockResolvedValue(null);
    Admin.findOne.mockResolvedValue(null);

    const res = mockRes();
    await handle(mockReq(baseProfile), res);

    expect(findByIdAndUpdate).toHaveBeenCalledWith("s1", {
      authProviderId: "auth0|abc123",
    });
  });
});

// ── POST /register/student (additional branches) ──────────────────────────────

describe("POST /register/student (additional branches)", () => {
  const handle = getHandler("/register/student");

  it("returns 409 on duplicate key error", async () => {
    Student.findOne.mockResolvedValue(null);
    const dupError = new Error("Duplicate");
    dupError.code = 11000;
    Student.create.mockRejectedValue(dupError);

    const res = mockRes();
    await handle(mockReq(baseProfile), res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "Email already registered" });
  });

  it("returns 500 on unexpected error", async () => {
    Student.findOne.mockResolvedValue(null);
    Student.create.mockRejectedValue(new Error("Unexpected"));

    const res = mockRes();
    await handle(mockReq(baseProfile), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to register student" });
  });
});

// ── POST /register/vendor (additional branches) ───────────────────────────────

describe("POST /register/vendor (additional branches)", () => {
  const handle = getHandler("/register/vendor");

  it("returns 409 if vendor already exists", async () => {
    Vendor.findOne.mockResolvedValue({ _id: "v1" });

    const res = mockRes();
    await handle(mockReq({ ...baseProfile, businessName: "Food" }), res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "Vendor already registered" });
  });

  it("returns 409 on duplicate key error", async () => {
    Vendor.findOne.mockResolvedValue(null);
    const dupError = new Error("Duplicate");
    dupError.code = 11000;
    Vendor.create.mockRejectedValue(dupError);

    const res = mockRes();
    await handle(mockReq({ ...baseProfile, businessName: "Food" }), res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "Email already registered" });
  });

  it("returns 500 on unexpected error", async () => {
    Vendor.findOne.mockResolvedValue(null);
    Vendor.create.mockRejectedValue(new Error("Unexpected"));

    const res = mockRes();
    await handle(mockReq({ ...baseProfile, businessName: "Food" }), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to register vendor" });
  });
});

// ── POST /register/admin (additional branches) ────────────────────────────────

describe("POST /register/admin (additional branches)", () => {
  const handle = getHandler("/register/admin");

  it("returns 400 if adminCode is missing", async () => {
    const res = mockRes();
    await handle(mockReq({ ...baseProfile }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Admin code is required" });
  });

  it("returns 409 if admin already exists", async () => {
    Admin.findOne.mockResolvedValue({ _id: "a1" });

    const res = mockRes();
    await handle(mockReq({ ...baseProfile, adminCode: "secret123" }), res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "Admin already registered" });
  });

  it("returns 409 on duplicate key error", async () => {
    Admin.findOne.mockResolvedValue(null);
    const dupError = new Error("Duplicate");
    dupError.code = 11000;
    Admin.create.mockRejectedValue(dupError);

    const res = mockRes();
    await handle(mockReq({ ...baseProfile, adminCode: "secret123" }), res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "Email already registered" });
  });

  it("returns 500 on unexpected error", async () => {
    Admin.findOne.mockResolvedValue(null);
    Admin.create.mockRejectedValue(new Error("Unexpected"));

    const res = mockRes();
    await handle(mockReq({ ...baseProfile, adminCode: "secret123" }), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to register admin" });
  });
});