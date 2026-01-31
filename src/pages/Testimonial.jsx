import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Testimonial.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Testimonial = () => {
  const testimonials = useMemo(
    () => [
      { id: 1, name: "Priya Sharma", role: "Using for 6 months", text: "After struggling with hair fall for years, Redensyl has been a game-changer.", rating: 5, image: "testimonial1.jpg" },
      { id: 2, name: "Rahul Mehta", role: "Customer for 1 year", text: "Natural ingredients and visible results within weeks. Highly recommended!", rating: 5, image: "testimonial2.jpg" },
      { id: 3, name: "Anjali Patel", role: "Professional Stylist", text: "I recommend Eka Bhumih products to all my clients.", rating: 4, image: "testimonial3.jpg" },
      { id: 4, name: "Sanjay Kumar", role: "Using for 8 months", text: "Finally found a solution for my dandruff problem.", rating: 5, image: "testimonial4.jpg" },
      { id: 5, name: "Meera Nair", role: "Customer for 2 years", text: "From hair loss to healthy growth - incredible transformation.", rating: 5, image: "testimonial5.jpg" },
      { id: 6, name: "Vikram Singh", role: "First-time user", text: "Impressed with the results in just 3 months.", rating: 4, image: "testimonial6.jpg" },
    ],
    []
  );

  const trackRef = useRef(null);

  // enable/disable arrows based on scroll position
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateButtons = () => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft < maxScroll - 2);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    updateButtons();

    const onScroll = () => updateButtons();
    const onResize = () => updateButtons();

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const scrollByOneCard = (dir) => {
    const el = trackRef.current;
    if (!el) return;

    const card = el.querySelector(".testimonial-card");
    const gap = 16;

    const step = card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.9;
    el.scrollBy({ left: dir === "next" ? step : -step, behavior: "smooth" });
  };

  const handleAvatarError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/120x120/EEE/31343C?text=User";
  };

  return (
    <section className="testimonial-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">Real stories from real people</p>
        </div>

        <div className="testimonial-shell">
          <button
            className="testimonial-arrow prev"
            onClick={() => scrollByOneCard("prev")}
            disabled={!canPrev}
            type="button"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="testimonial-track" ref={trackRef}>
            {testimonials.map((t) => (
              <article className="testimonial-card" key={t.id}>
                <div className="testimonial-content">
                  <div className="quote-icon">"</div>
                  <p className="testimonial-text">{t.text}</p>
                </div>

                <div className="testimonial-author">
                  <div className="author-image">
                    <img
                      src={`${process.env.PUBLIC_URL}/images/${t.image}`}
                      alt={t.name}
                      onError={handleAvatarError}
                      loading="lazy"
                    />
                  </div>
                  <div className="author-info">
                    <h4 className="author-name">{t.name}</h4>
                    <p className="author-role">{t.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <button
            className="testimonial-arrow next"
            onClick={() => scrollByOneCard("next")}
            disabled={!canNext}
            type="button"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
