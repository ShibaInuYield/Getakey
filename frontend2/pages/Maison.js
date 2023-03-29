import React from 'react';

const Maison = (props) => {
  return (
    <div>
      <img src={props.imageSrc} alt={props.title} style={{ width: '400px' }} />
      <h2>{props.title}</h2>
      <p>{props.description}</p>
    </div>
  );
};

export default Maison;