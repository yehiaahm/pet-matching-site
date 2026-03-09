// Backend API routes for Instapay payment system
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/payments/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'), false);
    }
  }
});

// In-memory storage for demo (use database in production)
let paymentOrders = [];
let orderIdCounter = 1000;

// POST /api/payments/instapay - Submit Instapay payment
router.post('/instapay', upload.single('screenshot'), async (req, res) => {
  try {
    const { amount, plan_id, customer_name, customer_email } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Payment screenshot is required' });
    }

    const orderId = `Order-${Date.now()}`;
    const paymentOrder = {
      id: orderIdCounter++,
      order_id: orderId,
      customer_name: customer_name || 'Guest User',
      customer_email: customer_email || 'guest@example.com',
      amount: parseFloat(amount),
      plan_id: plan_id,
      payment_method: 'instapay',
      payment_status: 'pending_review',
      order_status: 'pending_payment',
      uploaded_screenshot: req.file.filename,
      receiver_name: 'Yehia Ahmed',
      receiver_account: '01128779577',
      time: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    paymentOrders.push(paymentOrder);

    res.status(201).json({
      success: true,
      message: 'Payment uploaded successfully. Your order is under review.',
      order: paymentOrder
    });

  } catch (error) {
    console.error('Instapay payment error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// GET /api/admin/payments - Get all payments for admin
router.get('/admin/payments', (req, res) => {
  try {
    const { status, search } = req.query;
    
    let filteredOrders = paymentOrders;
    
    if (status && status !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.payment_status === status);
    }
    
    if (search) {
      filteredOrders = filteredOrders.filter(order => 
        order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        order.order_id.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json({
      success: true,
      orders: filteredOrders,
      stats: {
        total: paymentOrders.length,
        pending: paymentOrders.filter(o => o.payment_status === 'pending_review').length,
        confirmed: paymentOrders.filter(o => o.payment_status === 'paid').length,
        rejected: paymentOrders.filter(o => o.payment_status === 'rejected').length
      }
    });

  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// POST /api/admin/payments/:id/confirm - Confirm payment
router.post('/admin/payments/:id/confirm', (req, res) => {
  try {
    const { id } = req.params;
    const orderIndex = paymentOrders.findIndex(order => order.id == id);
    
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    paymentOrders[orderIndex].payment_status = 'paid';
    paymentOrders[orderIndex].order_status = 'confirmed';
    paymentOrders[orderIndex].confirmed_at = new Date().toISOString();

    // TODO: Send notification to user
    console.log(`Payment confirmed for order ${paymentOrders[orderIndex].order_id}`);

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      order: paymentOrders[orderIndex]
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// POST /api/admin/payments/:id/reject - Reject payment
router.post('/admin/payments/:id/reject', (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const orderIndex = paymentOrders.findIndex(order => order.id == id);
    
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    paymentOrders[orderIndex].payment_status = 'rejected';
    paymentOrders[orderIndex].order_status = 'failed';
    paymentOrders[orderIndex].rejected_at = new Date().toISOString();
    paymentOrders[orderIndex].rejection_reason = reason || 'Payment verification failed';

    // TODO: Send notification to user
    console.log(`Payment rejected for order ${paymentOrders[orderIndex].order_id}`);

    res.json({
      success: true,
      message: 'Payment rejected',
      order: paymentOrders[orderIndex]
    });

  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({ error: 'Failed to reject payment' });
  }
});

// GET /api/payments/:id/screenshot - Get payment screenshot
router.get('/:id/screenshot', (req, res) => {
  try {
    const { id } = req.params;
    const order = paymentOrders.find(order => order.id == id);
    
    if (!order || !order.uploaded_screenshot) {
      return res.status(404).json({ error: 'Screenshot not found' });
    }

    const filePath = path.join(__dirname, '../../uploads/payments', order.uploaded_screenshot);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'File not found' });
    }

  } catch (error) {
    console.error('Get screenshot error:', error);
    res.status(500).json({ error: 'Failed to get screenshot' });
  }
});

// DELETE /api/payments/:id - Delete payment
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const orderIndex = paymentOrders.findIndex(order => order.id == id);
    
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = paymentOrders[orderIndex];
    
    // Delete screenshot file if exists
    if (order.uploaded_screenshot) {
      const filePath = path.join(__dirname, '../../uploads/payments', order.uploaded_screenshot);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    paymentOrders.splice(orderIndex, 1);

    res.json({
      success: true,
      message: 'Payment deleted successfully'
    });

  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

module.exports = router;
