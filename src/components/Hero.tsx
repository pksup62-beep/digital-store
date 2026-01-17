export default function Hero() {
    return (
        <section className="hero-section">
            <div className="hero-glow glow-left" />
            <div className="hero-glow glow-right" />

            <div className="container">
                <h1>
                    Elevate Your Skills with <br />
                    <span className="gradient-text">Premium Content</span>
                </h1>

                <p style={{ maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                    Access high-quality coding courses, PDF guides, and exclusive digital assets.
                    Curated for developers who want to stay ahead.
                </p>

                <div>
                    <a href="#courses" className="btn-primary">
                        Explore Courses
                    </a>
                </div>
            </div>
        </section>
    );
}
