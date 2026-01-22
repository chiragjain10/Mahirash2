// import React from "react";

// export default function Refund() {
//   const policies = [
//     {
//       title: "Cancellation & Refunds",
//       desc: "Policies about cancellations, refund eligibility and timelines.",
//       icon: "fa fa-undo",
//       color: "text-warning",
//       link: "https://merchant.razorpay.com/policy/RGFFKMY5kAwFT9/refund",
//     },
//     {
//       title: "Terms & Conditions",
//       desc: "Store terms, buyer & seller obligations and legal notices.",
//       icon: "fa fa-file-contract",
//       color: "text-info",
//       link: "https://merchant.razorpay.com/policy/RGFFKMY5kAwFT9/terms",
//     },
//     {
//       title: "Shipping",
//       desc: "Information about shipping methods, timelines and costs.",
//       icon: "fa fa-shipping-fast",
//       color: "text-success",
//       link: "https://merchant.razorpay.com/policy/RGFFKMY5kAwFT9/shipping",
//     },
//     {
//       title: "Privacy",
//       desc: "How we handle customer data and privacy protections.",
//       icon: "fa fa-user-shield",
//       color: "text-primary",
//       link: "https://merchant.razorpay.com/policy/RGFFKMY5kAwFT9/privacy",
//     },
//     {
//       title: "Contact Us",
//       desc: "Contact details and support channels for your store.",
//       icon: "fa fa-envelope",
//       color: "text-secondary",
//       link: "https://merchant.razorpay.com/policy/RGFFKMY5kAwFT9/contact_us",
//     },
//   ];

//   const copyLink = (url) => {
//     navigator.clipboard.writeText(url).then(() => {
//       alert("Link copied to clipboard");
//     });
//   };

//   return (
//     <div className="container py-5">
//       <header className="mb-4">
//         <h1 className="h3 mb-1">Store Policies</h1>
//         <p className="mb-0 text-muted">
//           Quick access to your store's cancellation, shipping, privacy and terms
//           pages.
//         </p>
//       </header>

//       <div className="row g-3">
//         {policies.map((p, i) => (
//           <div className="col-12 col-md-6 col-lg-4" key={i}>
//             <div className="card h-100">
//               <div className="card-body d-flex flex-column">
//                 <div className="d-flex align-items-start mb-3">
//                   <i className={`bi ${p.icon} fs-2 ${p.color} me-3`}></i>
//                   <div>
//                     <h5 className="card-title mb-0">{p.title}</h5>
//                     <p className="small text-muted mb-0">{p.desc}</p>
//                   </div>
//                 </div>

//                 <div className="mt-auto d-flex gap-2">
//                   <a
//                     className="btn btn-primary btn-sm flex-fill"
//                     href={p.link}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                   >
//                     Open Policy
//                   </a>
//                   <button
//                     className="btn btn-outline-secondary btn-sm"
//                     onClick={() => copyLink(p.link)}
//                   >
//                     <i className="fa fa-copy"></i>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
import React from 'react'


function Refund() {
  return (
    <div>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4 p-md-5">
                <h1 className="h3 mb-4 fw-bold">Privacy Policy</h1>

                <p className="text-muted">
                  At <strong></strong> ("we", "our", or "us"), we
                  are committed to protecting your privacy. This Privacy Policy
                  outlines how we collect, use, disclose, and safeguard your
                  information when you visit our website ("Site"). By using our
                  Site, you agree to the terms outlined below.
                </p>

                <h5 className="fw-bold mt-4">1. Information We Collect</h5>
                <ul className="text-muted">
                  <li>Name, email address, phone number</li>
                  <li>Billing and shipping address (for orders)</li>
                  <li>IP address, browser type, operating system</li>
                  <li>Device identifiers and location data</li>
                  <li>Pages viewed and interaction data</li>
                </ul>

                <h5 className="fw-bold mt-4">2. How We Collect Information</h5>
                <ul className="text-muted">
                  <li>When you register on our site</li>
                  <li>When you place an order or fill out a form</li>
                  <li>Through cookies and other tracking technologies</li>
                  <li>From third-party services integrated into our Site</li>
                </ul>

                <h5 className="fw-bold mt-4">3. How We Use Your Information</h5>
                <ul className="text-muted">
                  <li>Process transactions and provide services</li>
                  <li>Send updates, promotions, and newsletters (if opted in)</li>
                  <li>Improve website functionality and user experience</li>
                  <li>Prevent fraud and secure our systems</li>
                  <li>Comply with legal obligations</li>
                </ul>

                <h5 className="fw-bold mt-4">4. Sharing of Information</h5>
                <p className="text-muted">
                  We do not sell or trade your personal data. We may share it
                  with:
                </p>
                <ul className="text-muted">
                  <li>
                    Trusted third-party service providers (e.g., payment
                    processors, hosting partners)
                  </li>
                  <li>
                    Government or regulatory authorities if required by law
                  </li>
                  <li>
                    Legal representatives in case of disputes or investigations
                  </li>
                </ul>

                <h5 className="fw-bold mt-4">5. Cookies and Tracking</h5>
                <p className="text-muted">
                  We use cookies to enhance user experience, understand visitor
                  behavior, and store session preferences. You may disable
                  cookies through your browser settings, but this may affect
                  website functionality.
                </p>

                <h5 className="fw-bold mt-4">6. Data Security</h5>
                <p className="text-muted">
                  We implement reasonable security measures including:
                </p>
                <ul className="text-muted">
                  <li>SSL encryption</li>
                  <li>Regular malware scanning</li>
                  <li>Restricted data access</li>
                </ul>
                <p className="text-muted">
                  However, no online method is 100% secure.
                </p>

                <h5 className="fw-bold mt-4">7. Third-Party Links</h5>
                <p className="text-muted">
                  Our Site may contain links to external websites. We are not
                  responsible for their content or privacy practices. We
                  recommend reviewing their policies before interacting.
                </p>

                <h5 className="fw-bold mt-4">8. Your Rights</h5>
                <p className="text-muted">
                  Depending on your location (e.g., under GDPR or CCPA), you may
                  have rights to:
                </p>
                <ul className="text-muted">
                  <li>Access or correct your personal information</li>
                  <li>Request data deletion</li>
                  <li>Withdraw consent</li>
                  <li>
                    Lodge complaints with data protection authorities
                  </li>
                </ul>
                <p className="text-muted">
                  To exercise these rights, please contact us.
                </p>

                <h5 className="fw-bold mt-4">9. Children’s Privacy</h5>
                <p className="text-muted">
                  Our website is not intended for individuals under the age of
                  13. We do not knowingly collect information from minors.
                </p>

                <h5 className="fw-bold mt-4">10. Changes to This Policy</h5>
                <p className="text-muted">
                  We may update this Privacy Policy at any time. Updates will be
                  posted on this page with a revised effective date. Continued
                  use of the Site implies acceptance of the new terms.
                </p>

                <h5 className="fw-bold mt-4">11. Contact Us</h5>
                <p className="text-muted">
                  If you have questions about this Privacy Policy or how we
                  handle your data, please contact us at:
                </p>
                <ul className="text-muted">
                  <li>
                    <strong>Email:</strong> rahul19th@gmail.com
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Refund;
