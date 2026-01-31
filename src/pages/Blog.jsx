import React from "react";
import "./Blog.css";

const Blog = () => {
  // Blog data with Unsplash image URLs (UNCHANGED)
  const blogPosts = [
    {
      id: 1,
      title: "The Science Behind Hair Growth",
      excerpt: "Learn how Redensyl stimulates hair follicles for natural growth.",
      date: "Mar 15, 2024",
      category: "Science",
      readTime: "5 min read",
      imageUrl:
        "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=800&q=80",
      // ✅ href to studies/search page (edit anytime)
      href: "https://pubmed.ncbi.nlm.nih.gov/?term=hair+follicle+growth",
    },
    {
      id: 2,
      title: "5 Natural Ingredients for Healthy Hair",
      excerpt: "Discover the power of natural botanicals in hair care.",
      date: "Feb 28, 2024",
      category: "Tips",
      readTime: "4 min read",
      imageUrl:
        "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
      href: "https://pubmed.ncbi.nlm.nih.gov/?term=natural+ingredients+hair",
    },
    {
      id: 3,
      title: "Daily Hair Care Routine for 2024",
      excerpt: "Optimize your hair care routine with our expert recommendations.",
      date: "Feb 10, 2024",
      category: "Routine",
      readTime: "6 min read",
      imageUrl:
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
      href: "https://pubmed.ncbi.nlm.nih.gov/?term=hair+care+routine",
    },
    {
      id: 4,
      title: "Understanding Hair Loss Causes",
      excerpt:
        "A comprehensive guide to common hair loss factors and solutions.",
      date: "Jan 25, 2024",
      category: "Education",
      readTime: "7 min read",
      imageUrl:
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
      href: "https://pubmed.ncbi.nlm.nih.gov/?term=causes+of+hair+loss",
    },
  ];

  return (
    <section id="blog" className="blog-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Blog & Articles</h2>
          <p className="section-subtitle">
            Latest insights on hair care and wellness
          </p>
        </div>

        <div className="blog-grid">
          {blogPosts.map((post) => (
            <article className="blog-card" key={post.id}>
              {/* ✅ Make image clickable too (optional) */}
              <a
                className="blog-image"
                href={post.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open article: ${post.title}`}
              >
                <img src={post.imageUrl} alt={post.title} loading="lazy" />
                <span className="blog-category">{post.category}</span>
              </a>

              <div className="blog-content">
                <div className="blog-meta">
                  <span className="blog-date">{post.date}</span>
                  <span className="blog-read-time">{post.readTime}</span>
                </div>

                <h3 className="blog-title">{post.title}</h3>
                <p className="blog-excerpt">{post.excerpt}</p>

                {/* ✅ Replaced button with anchor href */}
                <a
                  className="blog-read-more"
                  href={post.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read More
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="blog-cta">
          {/* ✅ View All as href */}
          <a
            className="view-all-btn"
            href="https://pubmed.ncbi.nlm.nih.gov/?term=hair+care"
            target="_blank"
            rel="noopener noreferrer"
          >
            View All Articles
          </a>
        </div>
      </div>
    </section>
  );
};

export default Blog;
