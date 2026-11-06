import Link from 'next/link';
import { services } from '@/features/services/service-data';

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Comercio exterior con claridad</p>
            <h1>Tu aliado para operar en mercados internacionales</h1>
            <p>
              Acompañamos a personas y empresas en sus operaciones de comercio exterior,
              con asesoría experta y procesos fáciles de entender.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/contacto">Solicitar asesoría</Link>
            </div>
          </div>
          <div aria-label="ColComex, soluciones para comercio internacional" className="hero-visual">
            <div aria-hidden="true" className="globe">C</div>
            <div className="hero-stat">
              <strong>Operaciones internacionales</strong>
              <span>Información y acompañamiento para tomar mejores decisiones.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="servicios">
        <div className="section-container">
          <div className="section-heading">
            <p className="eyebrow">Nuestros servicios</p>
            <h2>Soluciones para cada operación</h2>
            <p>Encuentra orientación para tus necesidades de comercio exterior y consulta numerales vigentes en el catálogo.</p>
          </div>
          <div className="service-grid">
            {services.map((service) => (
              <Link className="service-card" href={`/servicios/${service.slug}`} key={service.code}>
                <span className="service-icon">{service.code}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-muted" id="nosotros">
        <div className="section-container about-panel">
          <div>
            <p className="eyebrow">¿Por qué ColComex?</p>
            <h2>Orientación cercana para decisiones globales</h2>
            <p>
              Te ayudamos a entender tus obligaciones, organizar tus soportes y avanzar
              en cada etapa de una operación internacional con mayor confianza.
            </p>
            <Link className="button" href="/contacto">Hablemos de tu caso</Link>
          </div>
          <div className="stats-grid">
            <div className="stat-card"><strong>1:1</strong><span>Asesoría según cada caso</span></div>
            <div className="stat-card"><strong>24/7</strong><span>Acceso a tus solicitudes</span></div>
            <div className="stat-card"><strong>100%</strong><span>Atención personalizada</span></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-container cta-panel">
          <div>
            <h2>¿Tienes una operación en mente?</h2>
            <p>Cuéntanos brevemente tu caso y te orientaremos sobre los siguientes pasos.</p>
          </div>
          <Link className="button" href="/contacto">Contáctenos</Link>
        </div>
      </section>
    </>
  );
}
