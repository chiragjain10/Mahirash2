import React from 'react';

function PrivacyPolicy() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4 p-md-5">
              <h1 className="h3 mb-4 fw-bold">Privacy Policy</h1>
              <p className="text-muted mb-4">We respect your privacy and protect your data.</p>
              <div className="small text-muted">
                <p><strong>Data Collection:</strong> We collect information needed to process your orders and improve your experience.</p>
                <p><strong>Cookies:</strong> Used to personalize content and remember your preferences.</p>
                <p><strong>Security:</strong> We use industry-standard measures to safeguard personal data.</p>
                <p><strong>Your Rights:</strong> You can request access, correction, or deletion of your data at any time.</p>
                <p className="mb-0"><strong>Contact:</strong> Reach us at <a href="mailto:support@mahirash.com">support@mahirash.com</a> for any concerns.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;



