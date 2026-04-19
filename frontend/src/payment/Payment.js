import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import './Payment.css';

function PaymentResult({ orderId }) {
  const [searchParams]                     = useSearchParams();
  const cancelled                          = searchParams.get('cancelled') === 'true';
  const [status, setStatus]               = useState(cancelled ? 'cancelled' : 'loading');
  const [message, setMessage]             = useState('');
  const { getAccessTokenSilently, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (cancelled) return;
    let attempts = 0;

    async function verify() {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
          cacheMode: 'off',
        });
        const res  = await fetch(`/api/payments/verify/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        if (data.status === 'paid') { setStatus('paid'); return; }
        if (data.status === 'failed') { setStatus('failed'); return; }

        if (++attempts < 5) setTimeout(verify, 3000);
        else setStatus('pending');
      } catch (err) {
        if (err.error === 'consent_required' || err.message === 'Consent required') {
          setStatus('pending');
          return;
        }
        setStatus('failed');
        setMessage(err.message);
      }
    }
    verify();
  }, [orderId, cancelled, getAccessTokenSilently, loginWithRedirect]);

  if (status === 'loading') return (
    <div className="kd-payment-status">
      <div className="kd-payment-status-icon">⏳</div>
      <p className="kd-payment-status-title">Verifying payment…</p>
      <p className="kd-payment-status-sub">Please wait a moment.</p>
    </div>
  );

  if (status === 'pending') return (
    <div className="kd-payment-status">
      <div className="kd-payment-status-icon">⏳</div>
      <p className="kd-payment-status-title">Payment processing</p>
      <p className="kd-payment-status-sub">Your payment is being confirmed. Check your orders shortly.</p>
      <div className="kd-payment-actions">
        <Link to="/dashboard/student" className="kd-payment-action-btn primary">Go to Dashboard</Link>
      </div>
    </div>
  );

  if (status === 'paid') return (
    <div className="kd-payment-status">
      <div className="kd-payment-status-icon">✅</div>
      <p className="kd-payment-status-title success">Payment confirmed!</p>
      <p className="kd-payment-status-sub">Your vendor has been notified and is preparing your order. 🎉</p>
      <div className="kd-payment-actions">
        <Link to="/dashboard/student" className="kd-payment-action-btn primary">Track My Order →</Link>
        <Link to="/dashboard/student" className="kd-payment-action-btn secondary">Continue Browsing</Link>
      </div>
    </div>
  );

  if (status === 'cancelled') return (
    <div className="kd-payment-status">
      <div className="kd-payment-status-icon">🚫</div>
      <p className="kd-payment-status-title failed">Payment cancelled</p>
      <p className="kd-payment-status-sub">You cancelled the payment. Your order has not been placed.</p>
      <div className="kd-payment-actions">
        <Link to="/cart" className="kd-payment-action-btn primary">← Return to Cart</Link>
      </div>
    </div>
  );

  return (
    <div className="kd-payment-status">
      <div className="kd-payment-status-icon">❌</div>
      <p className="kd-payment-status-title failed">Payment unsuccessful</p>
      <p className="kd-payment-status-sub">{message || 'Your payment could not be processed. Please try again.'}</p>
      <div className="kd-payment-actions">
        <Link to={`/payment/${orderId}`} className="kd-payment-action-btn primary">Try Again</Link>
        <Link to="/cart" className="kd-payment-action-btn secondary">← Back to Cart</Link>
      </div>
    </div>
  );
}

const PaymentPage = ({ showResult = false }) => {
  const { orderId }                        = useParams();
  const { getAccessTokenSilently }         = useAuth0();
  const formRef                            = useRef(null);

  const [pfData, setPfData]               = useState(null);
  const [pfUrl, setPfUrl]                 = useState('');
  const [totalAmount, setTotalAmount]     = useState(0);
  const [loading, setLoading]             = useState(true);
  const [initError, setInitError]         = useState('');
  const [expanded, setExpanded]           = useState(false);
  const [redirecting, setRedirecting]     = useState(false);

  useEffect(() => {
    if (showResult) { setLoading(false); return; }

    async function initPayment() {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
        });

        const [intentRes, orderRes] = await Promise.all([
          fetch('/api/payments/initiate', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body:    JSON.stringify({ orderId }),
          }),
          fetch(`/api/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const intentData = await intentRes.json();
        if (!intentRes.ok) throw new Error(intentData.message);
        setPfData(intentData.pfData);
        setPfUrl(intentData.pfUrl);

        const orderData = await orderRes.json();
        setTotalAmount(orderData.order?.totalAmount ?? 0);
      } catch (err) {
        setInitError(err.message);
      } finally {
        setLoading(false);
      }
    }
    initPayment();
  }, [orderId, showResult, getAccessTokenSilently]);

  const handlePay = () => {
    setRedirecting(true);
    formRef.current?.submit();
  };

  return (
    <main className="kd-app">
      <aside
        className={`kd-sidebar ${expanded ? 'expanded' : ''}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <header className="kd-logo">{expanded ? 'KuduDash' : 'KD'}</header>
        <nav className="kd-nav">
          {[
            { icon: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/></>, label: 'Overview' },
            { icon: <path d="M4 6h16M4 12h16M4 18h16"/>, label: 'Vendors' },
            { icon: <path d="M6 2h12v20H6zM6 6h12"/>, label: 'Cart' },
            { icon: <><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/><path d="M12 8v4l3 3"/></>, label: 'Checkout', active: true },
          ].map(({ icon, label, active }) => (
            <button key={label} className={`kd-nav-item${active ? ' active' : ''}`}>
              <svg viewBox="0 0 24 24" className="kd-icon">{icon}</svg>
              {expanded && <p className="kd-nav-text">{label}</p>}
            </button>
          ))}
        </nav>
      </aside>

      <section className="kd-main">
        <header className="kd-topbar">
          <section>
            <h1 className="kd-page-title" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              {showResult ? 'Payment Result' : 'Secure Payment'}
            </h1>
            <p className="kd-page-sub">{showResult ? `Order #${orderId}` : 'Complete your order below'}</p>
          </section>
          <figure className="kd-avatar" style={{ fontFamily: "'Baloo 2', sans-serif" }}>KD</figure>
        </header>

        <div className="kd-payment-page">
          {showResult && <PaymentResult orderId={orderId} />}

          {!showResult && (
            <>
              {loading && (
                <div className="kd-payment-card">
                  <div className="kd-payment-skeleton" style={{ marginBottom: '1rem' }} />
                  <div className="kd-payment-skeleton" style={{ height: 80 }} />
                </div>
              )}

              {!loading && initError && (
                <div className="kd-payment-status">
                  <div className="kd-payment-status-icon">⚠️</div>
                  <p className="kd-payment-status-title failed">Could not load payment</p>
                  <p className="kd-payment-status-sub">{initError}</p>
                  <Link to="/cart" className="kd-payment-action-btn primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
                    ← Back to Cart
                  </Link>
                </div>
              )}

              {!loading && !initError && pfData && (
                <div className="kd-payment-card">
                  <h2 className="kd-payment-card-title">Complete Payment</h2>
                  <p className="kd-payment-amount-display">
                    Order total: <strong>R{totalAmount.toFixed(2)}</strong>
                  </p>
                  <p className="kd-payment-amount-display" style={{ marginTop: '-1rem' }}>
                    You will be redirected to PayFast to complete your payment securely.
                  </p>

                  {/* Hidden PayFast form — submitted programmatically */}
                  <form ref={formRef} action={pfUrl} method="POST" style={{ display: 'none' }}>
                    {Object.entries(pfData).map(([key, val]) => (
                      <input key={key} type="hidden" name={key} value={val} />
                    ))}
                  </form>

                  <button className="kd-pay-btn" onClick={handlePay} disabled={redirecting}>
                    {redirecting ? (
                      <><span className="kd-pay-btn-spinner" />Redirecting…</>
                    ) : (
                      `Pay R${totalAmount.toFixed(2)} with PayFast`
                    )}
                  </button>

                  <p className="kd-secure-badge">
                    <span>🔒</span> Secured by PayFast · South Africa's trusted payment gateway
                  </p>
                </div>
              )}

              <Link to="/checkout" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', color: '#64748b', fontSize: 13, textDecoration: 'none' }}>
                ← Back to Checkout
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default PaymentPage;
