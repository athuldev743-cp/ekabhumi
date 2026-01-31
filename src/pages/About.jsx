import React from "react";
import "./About.css";

const About = () => {
  return (
    <section
      className="about-page"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL + "/images/about.jpg"})`,
      }}
      aria-label="About"
    />
  );
};

export default About;
