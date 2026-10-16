/**
 * Generate standard HTML invoice for printing or download
 */
const generateInvoiceHtml = (order, settings = {}) => {
  const nurseryName = settings.siteName || 'Nageswarreddy Nursery Plants';
  const nurseryAddress = settings.nurseryAddress || 'Green Valley Road, Andhra Pradesh, PIN 516001, India';
  const nurseryPhone = settings.supportPhone || '+91 94901 23456';
  const nurseryEmail = settings.supportEmail || 'support@nageswarreddyplants.com';

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const itemsRows = order.items.map((item, idx) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${idx + 1}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.name}</strong>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Invoice - ${order.orderId}</title>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; margin: 0; padding: 30px; font-size: 13px; line-height: 1.5; background: #fff; }
      .invoice-box { max-width: 800px; margin: auto; border: 1px solid #d1d5db; padding: 25px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); }
      .header-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
      .brand-title { color: #15803d; font-size: 24px; font-weight: bold; margin: 0; }
      .meta-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px; }
      .items-table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px; }
      .items-table th { background: #166534; color: #ffffff; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; }
      .summary-table { width: 45%; margin-left: auto; border-collapse: collapse; }
      .summary-table td { padding: 6px 12px; }
      .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-weight: bold; font-size: 11px; }
      .badge-success { background: #dcfce7; color: #166534; }
      .badge-pending { background: #fef3c7; color: #92400e; }
      .footer-note { text-align: center; margin-top: 30px; font-size: 11px; color: #6b7280; border-top: 1px dashed #d1d5db; padding-top: 15px; }
      @media print {
        body { padding: 0; }
        .invoice-box { border: none; box-shadow: none; }
        .no-print { display: none; }
      }
    </style>
  </head>
  <body>
    <div class="invoice-box">
      <div class="no-print" style="text-align: right; margin-bottom: 15px;">
        <button onclick="window.print()" style="background: #15803d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">
          🖨️ Print / Save PDF
        </button>
      </div>

      <table class="header-table">
        <tr>
          <td style="vertical-align: top; width: 60%;">
            <div class="brand-title">🌿 ${nurseryName}</div>
            <p style="margin: 4px 0; color: #4b5563;">Official Plant Nursery Tax & Sales Invoice</p>
            <p style="margin: 2px 0;">${nurseryAddress}</p>
            <p style="margin: 2px 0;">Phone: ${nurseryPhone} | Email: ${nurseryEmail}</p>
          </td>
          <td style="vertical-align: top; text-align: right; width: 40%;">
            <div class="meta-box">
              <p style="margin: 2px 0;"><strong>Invoice / Order ID:</strong></p>
              <p style="font-size: 16px; font-weight: bold; color: #15803d; margin: 2px 0;">${order.orderId}</p>
              <p style="margin: 2px 0;"><strong>Date:</strong> ${orderDate}</p>
              <p style="margin: 2px 0;"><strong>Status:</strong> <span class="badge badge-success">${order.orderStatus}</span></p>
              <p style="margin: 2px 0;"><strong>Payment:</strong> ${order.paymentMethod} (${order.paymentStatus})</p>
            </div>
          </td>
        </tr>
      </table>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;">

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="vertical-align: top; width: 50%; padding-right: 15px;">
            <h4 style="margin: 0 0 8px 0; color: #166534; border-bottom: 2px solid #86efac; padding-bottom: 4px;">CUSTOMER DETAILS</h4>
            <p style="margin: 2px 0;"><strong>Name:</strong> ${order.deliveryAddress.fullName || order.customerName}</p>
            <p style="margin: 2px 0;"><strong>Mobile:</strong> ${order.deliveryAddress.mobile || order.customerPhone}</p>
            <p style="margin: 2px 0;"><strong>Email:</strong> ${order.customerEmail}</p>
          </td>
          <td style="vertical-align: top; width: 50%; padding-left: 15px;">
            <h4 style="margin: 0 0 8px 0; color: #166534; border-bottom: 2px solid #86efac; padding-bottom: 4px;">DELIVERY ADDRESS</h4>
            <p style="margin: 2px 0;">Door/House: ${order.deliveryAddress.houseNumber}, ${order.deliveryAddress.street}</p>
            <p style="margin: 2px 0;">Village/Town: ${order.deliveryAddress.villageTown}, Mandal: ${order.deliveryAddress.mandal}</p>
            <p style="margin: 2px 0;">District: ${order.deliveryAddress.district}, State: ${order.deliveryAddress.state} - <strong>${order.deliveryAddress.pinCode}</strong></p>
            ${order.deliveryAddress.landmark ? `<p style="margin: 2px 0; color: #4b5563;">Landmark: ${order.deliveryAddress.landmark}</p>` : ''}
          </td>
        </tr>
      </table>

      <table class="items-table">
        <thead>
          <tr>
            <th style="text-align: center; width: 5%;">#</th>
            <th style="width: 50%;">Plant Variety & Care Pack</th>
            <th style="text-align: center; width: 15%;">Qty</th>
            <th style="text-align: right; width: 15%;">Rate</th>
            <th style="text-align: right; width: 15%;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <table class="summary-table">
        <tr>
          <td>Subtotal:</td>
          <td style="text-align: right; font-weight: bold;">₹${order.subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Packaging & Delivery:</td>
          <td style="text-align: right;">${order.deliveryCharge === 0 ? '<span style="color: #16a34a; font-weight: bold;">FREE</span>' : '₹' + order.deliveryCharge.toFixed(2)}</td>
        </tr>
        ${order.discount > 0 ? `
        <tr>
          <td>Discount Applied:</td>
          <td style="text-align: right; color: #16a34a;">-₹${order.discount.toFixed(2)}</td>
        </tr>` : ''}
        <tr style="border-top: 2px solid #15803d; border-bottom: 2px solid #15803d;">
          <td style="font-size: 15px; font-weight: bold; color: #15803d;">Grand Total:</td>
          <td style="font-size: 15px; text-align: right; font-weight: bold; color: #15803d;">₹${order.totalAmount.toFixed(2)}</td>
        </tr>
      </table>

      <div style="clear: both;"></div>

      ${order.paymentMethod === 'UPI' && order.upiDetails?.utr ? `
      <div style="margin-top: 20px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 12px;">
        <strong>UPI Transaction Verification:</strong> UTR: <code>${order.upiDetails.utr}</code> | Payer: ${order.upiDetails.payerName || 'N/A'} | Status: ${order.paymentStatus}
      </div>` : ''}

      <div class="footer-note">
        <p><strong>Thank you for choosing Nageswarreddy Nursery Plants!</strong></p>
        <p>🌱 Live Plants Handling: Open package immediately upon arrival. Water lightly and keep in partial shade for 24-48 hours before direct sunlight exposure.</p>
        <p>For botanical queries or plant care instructions, contact our nursery desk at ${nurseryEmail} or ${nurseryPhone}.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

module.exports = { generateInvoiceHtml };
