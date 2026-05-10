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