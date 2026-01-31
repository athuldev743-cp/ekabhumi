import React from 'react';
import './Footer.css';

const Footer = () => {
  // Social media data with actual account links
  const socialLinks = [
    { 
      id: 1, 
      name: 'Facebook', 
      icon: 'fab fa-facebook-f', 
      url: 'https://www.facebook.com/ekabhumih' 
    },
    { 
      id: 2, 
      name: 'Twitter', 
      icon: 'fab fa-twitter', 
      url: 'https://twitter.com/ekabhumih' 
    },
    { 
      id: 3, 
      name: 'Instagram', 
      icon: 'fab fa-instagram', 
      url: 'https://www.instagram.com/ekabhumih' 
    },
    { 
      id: 4, 
      name: 'YouTube', 
      icon: 'fab fa-youtube', 
      url: 'https://www.youtube.com/c/ekabhumih' 
    },
    { 
      id: 5, 
      name: 'LinkedIn', 
      icon: 'fab fa-linkedin-in', 
      url: 'https://www.linkedin.com/company/ekabhumih' 
    },
    { 
      id: 6, 
      name: 'Pinterest', 
      icon: 'fab fa-pinterest-p', 
      url: 'https://www.pinterest.com/ekabhumih' 
    }
  ];

  // Recent posts
  const recentPosts = [
    { id: 1, title: "New Product Launch - Redensyl Pro", date: "Jan 15, 2024" },
    { id: 2, title: "Skin Care for Teen Skin", date: "Dec 20, 2023" },
    { id: 3, title: "Winter Hair Care Tips", date: "Dec 5, 2023" }
  ];

  // Recent comments
  const recentComments = [
    { id: 1, author: "Admin on", product: "Cuticle Cream" },
    { id: 2, author: "Admin on", product: "Hair Shampoo" },
    { id: 3, author: "Admin on", product: "Scalp Serum" }
  ];

  // Quick links
  const quickLinks = [
    { id: 1, name: "Home", url: "/" },
    { id: 2, name: "Products", url: "/products" },
    { id: 3, name: "About Us", url: "/about" },
    { id: 4, name: "Blog", url: "/blog" },
    { id: 5, name: "Testimonials", url: "/testimonials" },
    { id: 6, name: "Contact", url: "/contact" }
  ];

  // Twitter feeds
  const twitterFeeds = [
    { 
      id: 1, 
      text: "Check out our new hair care range! Perfect for all hair types. #HairCare #EkaBhumih", 
      link: "https://twitter.com/ekabhumih/status/1234567890" 
    },
    { 
      id: 2, 
      text: "Winter special: Get 20% off on all moisturizers! Limited time offer. #WinterSale #Skincare", 
      link: "https://twitter.com/ekabhumih/status/1234567891" 
    }
  ];

  return (
    <footer id="footer" className="footer">
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">
            
            {/* Column 1: About */}
            <div className="footer-column">
              <div className="footer-logo">
                <span className="brand">
                  eka<span>Bhumih</span>
                </span>
              </div>
             
              
                <div className="color-items">
                  
                  
                  
                
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="footer-column">
              <h3 className="footer-title">Quick Links</h3>
              <ul className="footer-links">
                {quickLinks.map(link => (
                  <li key={link.id}>
                    <a href={link.url}>{link.name}</a>
                  </li>
                ))}
              </ul>
              
              <h3 className="footer-title">Recent Comments</h3>
              <ul className="footer-comments">
                {recentComments.map(comment => (
                  <li key={comment.id}>
                    <span className="comment-author">{comment.author}</span>
                    <span className="comment-product">{comment.product}</span>
                    <div className="comment-divider"></div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Twitter & Recent Posts */}
            <div className="footer-column">
              <h3 className="footer-title">Latest Tweets</h3>
              <div className="twitter-feeds">
                {twitterFeeds.map(tweet => (
                  <div className="tweet" key={tweet.id}>
                    <div className="tweet-icon">
                      <i className="fab fa-twitter"></i>
                    </div>
                    <div className="tweet-content">
                      <p>{tweet.text}</p>
                      <a 
                        href={tweet.link} 
                        className="tweet-link"
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        View on Twitter
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="footer-title">Recent Posts</h3>
              <ul className="recent-posts">
                {recentPosts.map(post => (
                  <li key={post.id}>
                    <a href="/blog" className="post-title">{post.title}</a>
                    <span className="post-date">{post.date}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact & Social */}
            <div className="footer-column">
              <h3 className="footer-title">Contact Info</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>123 Hair Care Street, Beauty City, BC 12345</span>
                </div>
                <div className="contact-item">
                  <i className="fas fa-phone"></i>
                  <span>+1 (234) 567-8900</span>
                </div>
                <div className="contact-item">
                  <i className="fas fa-envelope"></i>
                  <span>info@ekabhumih.com</span>
                </div>
                <div className="contact-item">
                  <i className="fas fa-clock"></i>
                  <span>Mon - Fri: 9:00 AM - 6:00 PM</span>
                </div>
              </div>

              <h3 className="footer-title">Follow Us</h3>
              <div className="social-links">
                {socialLinks.map(social => (
                  <a 
                    key={social.id} 
                    href={social.url} 
                    className="social-link"
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    title={social.name}
                  >
                    <i className={social.icon}></i>
                  </a>
                ))}
              </div>

              <div className="newsletter">
                <h4>Newsletter</h4>
                <p>Subscribe for updates and offers</p>
                <div className="newsletter-form">
                  <input type="email" placeholder="Your email address" />
                  <button type="submit" aria-label="Subscribe">
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {new Date().getFullYear()} Eka Bhumih. All Rights Reserved. 
              <a href="/privacy-policy"> Terms of Use</a> and 
              <a href="/privacy-policy"> Privacy Policy</a>
            </p>
            <div className="payment-methods">
              <i className="fab fa-cc-visa"></i>
              <i className="fab fa-cc-mastercard"></i>
              <i className="fab fa-cc-paypal"></i>
              <i className="fab fa-cc-apple-pay"></i>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;