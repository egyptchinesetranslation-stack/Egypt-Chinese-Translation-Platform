function InfoBox({ icon, label, value }) {
  return (
    <div className="rr-info-box">
      <div className="rr-info-box__icon">{icon}</div>
      <div className="rr-info-box__text">
        <span className="rr-info-box__label">{label}</span>
        <span className="rr-info-box__value">{value}</span>
      </div>
    </div>
  );
}

export default InfoBox;
