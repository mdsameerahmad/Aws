
import Image from 'next/image';
import { useEffect, useState } from 'react';
import api from '../../utils/api';
import styles from './Products.module.css';

const products = [
  {
    productCode: 1025,
    name: 'Neem Extract',
    dp: 350,
    mrp: 500,
    image: '/assets/images/i1.png',
  },
  {
    productCode: 8014,
    name: 'Mix Multi Berries Capsules',
    dp: 520,
    mrp: 700,
    image: '/assets/images/i2.png',
  },
  {
    productCode: 1103,
    name: 'Golden Package',
    dp: 1049,
    mrp: 2049,
    image: '/assets/images/combo.png',
  },
  {
    productCode: 2065,
    name: 'Silver Package',
    dp: 549,
    mrp: 1049,
    image: '/assets/images/silver.png',
  },
  {
    productCode: 1145,
    name: 'Gift Box',
    dp: 100,
    mrp: 200,
    image: '/assets/images/gift.jpg',
  },
  {
    productCode: 1001,
    name: 'Aloe-Vera Extract',
    dp: 350,
    mrp: 500,
    image: '/assets/images/i6.jpg',
  },
  {
    productCode: 1050,
    name: 'Softcare Sanitary Pad (30 Pcs) ',
    dp: 525,
    mrp: 900,
    image: '/assets/images/i7.jpg',
  },
  {
    productCode: 1055,
    name: 'Alkaline water bottle',
    dp: 3199,
    mrp: 5199,
    image: '/assets/images/i8.jpg',
  },
  {
    productCode: 1065,
    name: 'Combo of 7',
    dp: 5199,
    mrp: 8599,
    image: '/assets/images/i9.jpg',
  },
];

export default function Products({ searchQuery }) {
  const [purchaseError, setPurchaseError] = useState('');
  const [purchaseSuccess, setPurchaseSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [userName, setUserName] = useState('');

  // WhatsApp notification helper function
  const openWhatsAppNotification = (product, quantity, totalAmount) => {
    const phone = "7859086070"; // Admin's WhatsApp number
    const userDisplayName = userName || 'A valued customer';
    
    const message = `Hey Admin! ${userDisplayName} just requested to purchase ${quantity} ${product.name} (Product Code: ${product.productCode}). Total amount: ₹${totalAmount}. Please approve it so they can receive the product. 😊`;
    
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  useEffect(() => {
    const cards = document.querySelectorAll(`.${styles.productCard}`);
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
      card.classList.add(styles.fadeInUp);
    });

    // Fetch user's name from session storage
    const savedUser = localStorage.getItem('userProfileData');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.basicInfo && parsed.basicInfo.fullName) {
          setUserName(parsed.basicInfo.fullName);
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    fetchPurchaseHistory();
  }, [searchQuery]);

  const fetchPurchaseHistory = async () => {
    setLoadingHistory(true);
    try {
      // Use the user-side route for showing purchases
      const response = await api.get('/api/purchase/products/my-purchases');
      // Check if response.data is an object with purchases property
      const purchasesData = response.data?.purchases || response.data;
      setPurchaseHistory(Array.isArray(purchasesData) ? purchasesData : []);
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      // Set empty array on error and potentially show a user-friendly error message
      setPurchaseHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleBuyClick = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setIsModalOpen(true);
    setPurchaseError('');
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const handlePurchase = async () => {
    if (!selectedProduct || quantity < 1) return;

    setIsSubmitting(true);
    setPurchaseError('');
    setPurchaseSuccess('');

    try {
      let userId = null;
      const savedUser = localStorage.getItem('userProfileData');

      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed._id) userId = parsed._id;
        else if (parsed.basicInfo && parsed.basicInfo._id) userId = parsed.basicInfo._id;
      }

      if (!userId) {
        const { fetchProfile } = await import('../../utils/profileService');
        const profile = await fetchProfile();
        userId = profile?.basicInfo?._id;
      }

      if (!userId) {
        throw new Error("Could not identify your account. Please contact support.");
      }

      const totalAmount = selectedProduct.dp * quantity;

      const purchaseData = {
        productCode: selectedProduct.productCode,
        productName: selectedProduct.name,
        quantity: quantity,
        amount: totalAmount,
        note: `Purchase request for ${quantity} ${selectedProduct.name}`,
        userId: userId
      };

      const response = await api.post('/api/purchase/products/request', purchaseData);

      if (response.status === 201) {
        const successMessage = response.data?.message || 'Purchase request submitted successfully';
        setPurchaseSuccess(successMessage);
        
        // Send WhatsApp notification to admin
        openWhatsAppNotification(selectedProduct, quantity, totalAmount);
        
        await fetchPurchaseHistory();
        setTimeout(() => {
          setPurchaseSuccess('');
          setIsModalOpen(false);
        }, 3000);
      } else {
        throw new Error(response.data?.message || 'Purchase request failed');
      }
    } catch (error) {
      console.error("Purchase error:", error);
      setPurchaseError(error.response?.data?.message || error.message || 'Failed to process purchase');
      setTimeout(() => setPurchaseError(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <span className="badge bg-warning text-dark">Pending</span>;
      case 'approved':
        return <span className="badge bg-success">Approved</span>;
      case 'rejected':
        return <span className="badge bg-danger">Rejected</span>;
      case 'shipped':
        return <span className="badge bg-info">Shipped</span>;
      case 'delivered':
        return <span className="badge bg-primary">Delivered</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="container-fluid px-3 px-sm-4 px-md-5 py-4">
      <h1 className="mb-4 mb-md-5 fw-bold text-center text-md-start" style={{ color: '#0A2463', textShadow: '1px 1px 2px rgba(0, 245, 255, 0.2)' }}>
        Our Product Collection 🧴✨
      </h1>

      {(purchaseError || purchaseSuccess) && (
        <div className={`alert ${purchaseError ? 'alert-danger' : 'alert-success'} position-fixed top-0 start-0 end-0 mx-auto mt-3`}
          style={{ 
            zIndex: 2000, 
            maxWidth: '95%',
            width: 'fit-content'
          }}>
          {purchaseError || purchaseSuccess}
        </div>
      )}

      {isModalOpen && selectedProduct && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '15px', overflow: 'hidden' }}>
              <div className="modal-header" style={{ backgroundColor: '#0A2463', color: 'white' }}>
                <h5 className="modal-title">Purchase {selectedProduct.name}</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                ></button>
              </div>
              <div className="modal-body">
                <div className="d-flex flex-column flex-sm-row mb-4">
                  <div className="text-center mb-3 mb-sm-0 me-sm-3">
                    <Image
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      width={120}
                      height={120}
                      className="rounded"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="text-center text-sm-start">
                    <h5>{selectedProduct.name}</h5>
                    <p className="mb-1">
                      <strong>DP Price:</strong> ₹{selectedProduct.dp}
                    </p>
                    <p className="mb-1">
                      <strong>Product Code:</strong> {selectedProduct.productCode}
                    </p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-medium">Quantity:</label>
                  <div className="d-flex justify-content-center justify-content-sm-start align-items-center">
                    <button 
                      className="btn btn-outline-primary me-2"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1 || isSubmitting}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="form-control text-center"
                      value={quantity}
                      onChange={handleQuantityChange}
                      min="1"
                      style={{ maxWidth: '70px' }}
                      disabled={isSubmitting}
                    />
                    <button 
                      className="btn btn-outline-primary ms-2"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={isSubmitting}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="alert alert-info text-center text-sm-start">
                  <p className="mb-0">
                    <strong>Total Cost:</strong> ₹{selectedProduct.dp * quantity}
                  </p>  
                </div>
              </div>
              <div className="modal-footer d-flex flex-column flex-sm-row">
                <button 
                  type="button" 
                  className="btn btn-secondary mb-2 mb-sm-0 me-sm-2"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handlePurchase}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    'Confirm Purchase'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredProducts.length > 0 ? (
        <div className="row g-3 g-md-4">
          {filteredProducts.map((product) => (
            <div key={product.productCode} className="col-12 col-sm-6 col-lg-4">
              <div className={`card h-100 ${styles.productCard}`}
                style={{
                  backgroundColor: '#F5F5F5',
                  border: '2px solid #E0E0E0',
                  borderRadius: '15px',
                  boxShadow: '0 10px 25px rgba(58, 134, 255, 0.2)',
                }}
              >
                <div className="position-relative" style={{ height: '180px', overflow: 'hidden' }}>
                  <Image
                    src={product.image}
                    className={`${styles.productImage}`}
                    alt={product.name}
                    fill
                    style={{ 
                      objectFit: 'cover',
                      borderRadius: '15px 15px 0 0',
                    }}
                    sizes="(max-width: 576px) 100vw, (max-width: 768px) 50vw, (max-width: 992px) 33vw, 25vw"
                  />
                </div>
                <div className="card-body d-flex flex-column p-3 p-sm-4">
                  <h5 className="card-title mb-2" style={{ 
                    color: '#0A2463', 
                    fontWeight: '600',
                    fontSize: 'clamp(1rem, 1.5vw, 1.25rem)'
                  }}>
                    {product.name}
                  </h5>
                  <p className="mb-1 text-muted" style={{ fontSize: '0.8rem' }}>
                    <strong>Product Code:</strong> {product.productCode}
                  </p>
                  <p className="mb-2 text-muted" style={{ fontSize: '0.8rem' }}>
                    <strong>MRP:</strong> ₹{product.mrp} / <strong>DP:</strong> ₹{product.dp}
                  </p>

                  <button
                    onClick={() => handleBuyClick(product)}
                    className="btn mt-auto"
                    style={{
                      background: 'linear-gradient(135deg, #3A86FF 0%, #0A2463 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '600',
                      letterSpacing: '1px',
                      boxShadow: '0 4px 15px rgba(58, 134, 255, 0.4)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      padding: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.boxShadow = '0 6px 20px rgba(58, 134, 255, 0.6)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.boxShadow = '0 4px 15px rgba(58, 134, 255, 0.4)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <span style={{ position: 'relative', zIndex: '2' }}>
                      Buy Now (₹{product.dp})
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <p style={{ color: '#0A2463', fontSize: '1.1rem' }}>
            No products found matching &quot;{searchQuery}&quot;.
          </p>
        </div>
      )}

      <div className="mt-5">
        <h2 className="mb-4 fw-bold text-center text-md-start" style={{ color: '#0A2463' }}>
          Your Purchase History
        </h2>
        
        {loadingHistory ? (
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : purchaseHistory.length === 0 ? (
          <div className="alert alert-info text-center">
            You haven't made any purchases yet.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Product</th>
                  <th className="d-none d-sm-table-cell">Code</th>
                  <th>Qty</th>
                  <th className="d-none d-md-table-cell">Unit Price</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className="d-none d-lg-table-cell">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {purchaseHistory.map((purchase) => (
                  <tr key={purchase._id}>
                    <td>{purchase.productName}</td>
                    <td className="d-none d-sm-table-cell">{purchase.productCode}</td>
                    <td>{purchase.quantity}</td>
                    <td className="d-none d-md-table-cell">₹{purchase.unitPrice}</td>
                    <td>₹{purchase.totalPrice}</td>
                    <td>{getStatusBadge(purchase.status)}</td>
                    <td className="d-none d-lg-table-cell">{new Date(purchase.requestedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}