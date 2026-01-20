import React from 'react';
import './HomePage.css';

interface HomePageProps {
  onGetStarted: () => void;
}

export default function HomePage({ onGetStarted }: HomePageProps) {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2; // Normalize to -1 to 1
      const y = (e.clientY / window.innerHeight - 0.5) * 2; // Normalize to -1 to 1
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getCardTransform = (index: number) => {
    const baseRotationY = index === 0 ? -5 : index === 2 ? 5 : 0;
    const baseRotationX = index === 1 ? -2 : 2;
    const baseScale = index === 1 ? 1.05 : 1;
    
    const parallaxStrength = 15;
    const rotationY = baseRotationY + mousePosition.x * parallaxStrength;
    const rotationX = baseRotationX - mousePosition.y * parallaxStrength;
    
    return `scale(${baseScale}) rotateY(${rotationY}deg) rotateX(${rotationX}deg)`;
  };
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="highlight">BatchCook Premium</span>
              <br />
              Votre chef à domicile
            </h1>
            <p className="hero-subtitle">
              Libérez-vous de la cuisine quotidienne avec notre service de batch cooking professionnel. 
              Des repas savoureux, équilibrés et préparés avec passion, directement chez vous.
            </p>
            <div className="hero-features">
              <div className="feature-badge">
                <span className="icon">⏱️</span>
                <span>Gain de temps garanti</span>
              </div>
              <div className="feature-badge">
                <span className="icon">👨‍🍳</span>
                <span>Chef professionnel</span>
              </div>
              <div className="feature-badge">
                <span className="icon">🥗</span>
                <span>Repas équilibrés</span>
              </div>
            </div>
            <div className="hero-actions">
              <button className="cta-button primary" onClick={onGetStarted}>
                Commencer maintenant
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="chef-illustration">
              <span className="chef-emoji">👨‍🍳</span>
              <div className="cooking-items">
                <span className="cooking-item">🥕</span>
                <span className="cooking-item">🥦</span>
                <span className="cooking-item">🍗</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="value-proposition">
        <div className="container">
          <h2 className="section-title">Pourquoi choisir BatchCook Premium ?</h2>
          <div className="value-grid">
            <div 
              className="value-card"
              style={{ transform: getCardTransform(0) }}
            >
              <div className="value-icon">💰</div>
              <h3>Prix compétitifs</h3>
              <p>À partir de <strong>8€ par repas</strong>, moins cher qu'un restaurant, plus savoureux qu'un plat préparé.</p>
              <div className="price-highlight">
                <span className="price">8€</span>
                <span className="price-unit">/repas</span>
              </div>
            </div>
            <div 
              className="value-card"
              style={{ transform: getCardTransform(1) }}
            >
              <div className="value-icon">⏰</div>
              <h3>Gain de temps</h3>
              <p>Économisez <strong>5h par semaine</strong>. Plus de courses, de préparation ou de vaisselle. Juste le plaisir de déguster.</p>
            </div>
            <div 
              className="value-card"
              style={{ transform: getCardTransform(2) }}
            >
              <div className="value-icon">🏆</div>
              <h3>Qualité garantie</h3>
              <p>Ingrédients frais et locaux, recettes équilibrées créées par notre chef diplômé avec 10 ans d'expérience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">Comment ça marche ?</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Choisissez vos menus</h3>
                <p>Sélectionnez parmi nos 20+ recettes renouvelées chaque semaine</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Nous venons chez vous</h3>
                <p>Notre chef se déplace avec tous les ingrédients et ustensiles nécessaires</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Préparation en 2-3h</h3>
                <p>Pendant que vous vaquez à vos occupations, nous préparons 8-12 repas</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Savourez toute la semaine</h3>
                <p>Réchauffez et dégustez des repas faits maison sans effort</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing">
        <div className="container">
          <h2 className="section-title">Nos formules</h2>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Découverte</h3>
              <div className="price-tag">
                <span className="price">89€</span>
                <span className="price-period">/session</span>
              </div>
              <ul className="features-list">
                <li>✅ 6 repas pour 2 personnes</li>
                <li>✅ 3 recettes différentes</li>
                <li>✅ Courses incluses</li>
                <li>✅ Nettoyage complet</li>
                <li>✅ Contenants fournis</li>
              </ul>
              <button className="pricing-button">Choisir</button>
            </div>
            <div className="pricing-card featured">
              <div className="popular-badge">Plus populaire</div>
              <h3>Famille</h3>
              <div className="price-tag">
                <span className="price">149€</span>
                <span className="price-period">/session</span>
              </div>
              <ul className="features-list">
                <li>✅ 12 repas pour 2-4 personnes</li>
                <li>✅ 4 recettes + 2 accompagnements</li>
                <li>✅ Courses premium incluses</li>
                <li>✅ Nettoyage complet</li>
                <li>✅ Contenants haute qualité</li>
                <li>✅ Étiquetage et conseils conservation</li>
              </ul>
              <button className="pricing-button primary">Choisir</button>
            </div>
            <div className="pricing-card">
              <h3>Premium</h3>
              <div className="price-tag">
                <span className="price">199€</span>
                <span className="price-period">/session</span>
              </div>
              <ul className="features-list">
                <li>✅ 16 repas pour 2-6 personnes</li>
                <li>✅ 6 recettes + 3 accompagnements</li>
                <li>✅ Ingrédients bio et locaux</li>
                <li>✅ Menu personnalisé</li>
                <li>✅ Suivi nutritionnel</li>
                <li>✅ Support WhatsApp 7j/7</li>
              </ul>
              <button className="pricing-button">Choisir</button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="trust-signals">
        <div className="container">
          <h2 className="section-title">Nos garanties</h2>
          <div className="guarantees-grid">
            <div className="guarantee-card">
              <div className="guarantee-icon">🛡️</div>
              <h3>Satisfaction garantie</h3>
              <p>Pas satisfait ? Nous revenons gratuitement ou vous remboursons</p>
            </div>
            <div className="guarantee-card">
              <div className="guarantee-icon">🚀</div>
              <h3>Ponctualité assurée</h3>
              <p>Retard de plus de 15 min ? Votre prochaine session est offerte</p>
            </div>
            <div className="guarantee-card">
              <div className="guarantee-icon">🧼</div>
              <h3>Propreté irréprochable</h3>
              <p>Cuisine rendue plus propre qu'à notre arrivée, garanti</p>
            </div>
            <div className="guarantee-card">
              <div className="guarantee-icon">📞</div>
              <h3>Support réactif</h3>
              <p>Une question ? Réponse en moins de 2h, 7 jours sur 7</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Prêt à transformer vos repas ?</h2>
            <p>Découvrez le plaisir de manger sainement sans contrainte</p>
            <button className="cta-button primary large" onClick={onGetStarted}>
              Réserver ma première session - 89€
            </button>
            <p className="cta-note">
              🎁 <strong>Offre de lancement :</strong> -20€ sur votre première commande avec le code BIENVENUE20
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}