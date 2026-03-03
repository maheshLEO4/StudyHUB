import React from 'react';

const EmptyState = ({ emoji = '📭', title, description, action }) => (
  <div className="empty-state">
    <div className="empty-emoji">{emoji}</div>
    <h3>{title}</h3>
    {description && <p>{description}</p>}
    {action}
  </div>
);

export default EmptyState;
