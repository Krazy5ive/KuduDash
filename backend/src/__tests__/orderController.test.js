const { getOrders, getOrderById, createOrder, updateOrderStatus } = require('../controllers/orderController');

// Mock the Order model
jest.mock('../models/Order');
const Order = require('../models/Order');

// Helper to create mock req/res
const mockRes = () => {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

// ─── getOrders ───────────────────────────────────────────────────────────────

describe('getOrders', () => {
  it('should return orders for a student', async () => {
    const fakeOrders = [{ _id: '1', status: 'pending' }];

    Order.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(fakeOrders),
      }),
    });

    const req = { query: { student: 'student123' } };
    const res = mockRes();

    await getOrders(req, res);

    expect(Order.find).toHaveBeenCalledWith({ student: 'student123' });
    expect(res.json).toHaveBeenCalledWith(fakeOrders);
  });

  it('should return 500 on error', async () => {
    Order.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('DB error')),
      }),
    });

    const req = { query: { student: 'student123' } };
    const res = mockRes();

    await getOrders(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'DB error' });
  });
});

// ─── getOrderById ─────────────────────────────────────────────────────────────

describe('getOrderById', () => {
  it('should return an order by ID', async () => {
    const fakeOrder = { _id: '1', status: 'pending' };

    Order.findById.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(fakeOrder),
      }),
    });

    const req = { params: { id: '1' } };
    const res = mockRes();

    await getOrderById(req, res);

    expect(res.json).toHaveBeenCalledWith(fakeOrder);
  });

  it('should return 404 if order not found', async () => {
    Order.findById.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      }),
    });

    const req = { params: { id: 'nonexistent' } };
    const res = mockRes();

    await getOrderById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
  });

  it('should return 500 on error', async () => {
    Order.findById.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error('DB error')),
      }),
    });

    const req = { params: { id: '1' } };
    const res = mockRes();

    await getOrderById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'DB error' });
  });
});

// ─── createOrder ──────────────────────────────────────────────────────────────

describe('createOrder', () => {
  it('should create and return a new order', async () => {
    const fakeOrder = { _id: '1', status: 'pending', save: jest.fn().mockResolvedValue(true) };
    Order.mockImplementation(() => fakeOrder);

    const req = { body: { student: 'student123', vendor: 'vendor123' } };
    const res = mockRes();

    await createOrder(req, res);

    expect(fakeOrder.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeOrder);
  });

  it('should return 400 on error', async () => {
    const fakeOrder = { save: jest.fn().mockRejectedValue(new Error('Validation error')) };
    Order.mockImplementation(() => fakeOrder);

    const req = { body: {} };
    const res = mockRes();

    await createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Validation error' });
  });
});

// ─── updateOrderStatus ────────────────────────────────────────────────────────

describe('updateOrderStatus', () => {
  it('should update and return the order', async () => {
    const fakeOrder = { _id: '1', status: 'completed' };
    Order.findByIdAndUpdate.mockResolvedValue(fakeOrder);

    const req = { params: { id: '1' }, body: { status: 'completed' } };
    const res = mockRes();

    await updateOrderStatus(req, res);

    expect(Order.findByIdAndUpdate).toHaveBeenCalledWith('1', { status: 'completed' }, { new: true });
    expect(res.json).toHaveBeenCalledWith(fakeOrder);
  });

  it('should return 404 if order not found', async () => {
    Order.findByIdAndUpdate.mockResolvedValue(null);

    const req = { params: { id: 'nonexistent' }, body: { status: 'completed' } };
    const res = mockRes();

    await updateOrderStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
  });

  it('should return 500 on error', async () => {
    Order.findByIdAndUpdate.mockRejectedValue(new Error('DB error'));

    const req = { params: { id: '1' }, body: { status: 'completed' } };
    const res = mockRes();

    await updateOrderStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'DB error' });
  });
});