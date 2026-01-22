import React from 'react';

function Shipping() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4 p-md-5">
              <h1 className="h3 mb-4 fw-bold">Shipping Information</h1>
              <p className="text-muted mb-4">Premium delivery options tailored for you.</p>
              <ul className="list-unstyled small mb-0">
                <li className="mb-3"><strong>Standard:</strong> 3-6 business days</li>
                <li className="mb-3"><strong>Express:</strong> 1-2 business days</li>
                <li className="mb-3"><strong>International:</strong> 5-10 business days</li>
                <li className="mb-3"><strong>Order Processing:</strong> 24-48 hours on business days</li>
                <li className="mb-0"><strong>Tracking:</strong> A tracking link will be emailed once shipped</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Shipping;



