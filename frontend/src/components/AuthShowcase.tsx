interface Feature {
  icon: string;
  title: string;
  text: string;
}

export function AuthShowcase({
  heading1,
  heading2,
  description,
  features,
  backgroundImage,
}: {
  heading1: string;
  heading2: string;
  description: string;
  features: Feature[];
  backgroundImage: string;
}) {
  return (
    <div className="auth-showcase">
      <div className="auth-showcase__content">
        <h1>
          {heading1}
          <br />
          <span className="accent">{heading2}</span>
        </h1>
        <div className="auth-showcase__divider" />
        <p className="auth-showcase__desc">{description}</p>
        <div className="auth-feature-list">
          {features.map((f) => (
            <div className="auth-feature-item" key={f.title}>
              <div className="auth-feature-item__icon">{f.icon}</div>
              <div>
                <div className="auth-feature-item__title">{f.title}</div>
                <div className="auth-feature-item__text">{f.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <img className="auth-showcase__bg" src={backgroundImage} alt="" />
    </div>
  );
}
